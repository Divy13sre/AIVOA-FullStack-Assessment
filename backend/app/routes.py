from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from weasyprint import HTML

from .database import get_db
from .models import Complaint
from .langgraph_workflow import graph

router = APIRouter()


class CapaApprovalSchema(BaseModel):
    final_capa: str
    approved_by: str


# -------------------------------
# GET ALL COMPLAINTS
# -------------------------------
@router.get("/complaints")
def get_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()

    return [
        {
            "id": c.id,
            "complaint_id": c.complaint_id,
            "customer_name": c.customer_name,
            "customer_email": c.customer_email,
            "product_name": c.product_name,
            "batch_number": c.batch_number,
            "manufacturing_site": c.manufacturing_site,
            "complaint_category": c.complaint_category,
            "priority": c.priority,
            "description": c.description,
            "suggested_capa": getattr(c, "suggested_capa", None),
            "capa_status": getattr(c, "capa_status", "Pending Approval"),
            "approved_by": getattr(c, "approved_by", None),
            "status": c.status,
        }
        for c in complaints
    ]


# -------------------------------
# CREATE COMPLAINT (WITH LANGGRAPH AI & DUPLICATE CHECK)
# -------------------------------
@router.post("/complaints")
async def create_complaint(
    complaint_id: str = Form(...),
    customer_name: str = Form(...),
    customer_email: str = Form(...),
    product_name: str = Form(...),
    batch_number: str = Form(...),
    manufacturing_site: str = Form(...),
    complaint_category: str = Form(...),
    priority: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # 1. Duplicate Detection based on batch number
    existing_complaint = db.query(Complaint).filter(Complaint.batch_number == batch_number).first()
    
    # 2. Run LangGraph AI analysis
    try:
        result = graph.invoke({
            "complaint": description
        })
        ai_result = result["result"]
    except Exception as e:
        print("AI ERROR:", e)
        ai_result = {
            "summary": "AI analysis failed.",
            "risk": "Unknown",
            "rootCause": str(e),
            "capa": "Please check AI backend.",
        }

    extracted_capa = ai_result.get("capa", "Review manufacturing logs and inspect batch integrity.")

    # 3. Handle Duplicate Warning Payload
    if existing_complaint:
        return {
            "status": "warning",
            "message": f"Duplicate detected: A complaint for Batch #{batch_number} already exists.",
            "existing_id": existing_complaint.complaint_id,
            "ai_result": ai_result
        }

    # 4. Save New Complaint Record
    new_complaint = Complaint(
        complaint_id=complaint_id,
        customer_name=customer_name,
        customer_email=customer_email,
        product_name=product_name,
        batch_number=batch_number,
        manufacturing_site=manufacturing_site,
        complaint_category=complaint_category,
        priority=priority,
        description=description,
        suggested_capa=extracted_capa,
        capa_status="Pending Approval",
        status="Open",
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "status": "success",
        "message": "Complaint saved successfully with automated CAPA recommendation.",
        "complaint": {
            "id": new_complaint.id,
            "complaint_id": new_complaint.complaint_id,
            "suggested_capa": new_complaint.suggested_capa,
            "capa_status": new_complaint.capa_status,
            "status": "Open",
        },
        "ai_result": ai_result,
    }


# -------------------------------
# QA APPROVAL & EDIT CAPA WORKFLOW
# -------------------------------
@router.put("/complaints/{complaint_id}/approve-capa")
def approve_capa(
    complaint_id: str, 
    approval_data: CapaApprovalSchema, 
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Complaint with ID {complaint_id} not found."
        )
    
    complaint.suggested_capa = approval_data.final_capa
    complaint.capa_status = "Approved"
    complaint.approved_by = approval_data.approved_by
    
    db.commit()
    db.refresh(complaint)
    
    return {
        "status": "success",
        "message": "CAPA successfully approved and locked.",
        "complaint_id": complaint.complaint_id,
        "capa_status": complaint.capa_status,
        "approved_by": complaint.approved_by,
        "final_capa": complaint.suggested_capa
    }


# -------------------------------
# PDF COMPLIANCE REPORT EXPORT
# -------------------------------
@router.get("/complaints/{complaint_id}/export-pdf")
def export_complaint_pdf(complaint_id: str, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
        @page {{
            size: A4;
            margin: 15mm 12mm;
            background-color: #f8fafc;
            @bottom-right {{
                content: "Page " counter(page) " of " counter(pages);
                font-size: 8pt; color: #64748b; font-family: Helvetica, Arial, sans-serif;
            }}
            @bottom-left {{
                content: "CONFIDENTIAL - AIVOA Quality Management System";
                font-size: 8pt; color: #64748b; font-family: Helvetica, Arial, sans-serif;
            }}
        }}
        *, *::before, *::after {{ box-sizing: border-box; }}
        body {{
            margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif;
            color: #1e293b; background-color: #f8fafc; line-height: 1.5; font-size: 10.5pt;
        }}
        .header-banner {{
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
            color: #ffffff; margin: -15mm -12mm 20px -12mm; padding: 25px 20px;
            border-bottom: 4px solid #3b82f6;
        }}
        .header-banner h1 {{ margin: 0 0 5px 0; font-size: 20pt; font-weight: 700; }}
        .header-banner p {{ margin: 0; font-size: 10pt; color: #94a3b8; }}
        .meta-badge {{
            display: inline-block; background-color: #3b82f6; color: white;
            padding: 3px 10px; border-radius: 4px; font-size: 8.5pt; font-weight: bold; margin-top: 8px;
        }}
        .section-title {{
            font-size: 13pt; font-weight: bold; color: #1e3a8a;
            margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #3b82f6; padding-left: 8px;
        }}
        .card {{
            background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;
            padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }}
        .grid-2 {{ display: table; width: 100%; table-layout: fixed; margin-bottom: 10px; }}
        .col {{ display: table-cell; width: 50%; vertical-align: top; padding-right: 10px; }}
        .col:last-child {{ padding-right: 0; padding-left: 10px; }}
        .field-label {{ font-size: 8.5pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }}
        .field-value {{ font-size: 10pt; color: #0f172a; margin-bottom: 12px; }}
        .status-badge {{
            display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: bold;
            background-color: {"#d1fae5" if c.capa_status == "Approved" else "#fef3c7"};
            color: {"#059669" if c.capa_status == "Approved" else "#d97706"};
        }}
        .footer-signatures {{ margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; }}
    </style>
    </head>
    <body>
    <div class="header-banner">
        <h1>Corrective & Preventive Action (CAPA) Report</h1>
        <p>AIVOA Pharmaceutical Quality Management System &bull; Official Compliance Audit Documentation</p>
        <div class="meta-badge">ID: {c.complaint_id}</div>
    </div>

    <div class="section-title">1. Complaint Overview & Metadata</div>
    <div class="card">
        <div class="grid-2">
            <div class="col">
                <div class="field-label">Customer Name</div>
                <div class="field-value">{c.customer_name}</div>
                <div class="field-label">Product Name</div>
                <div class="field-value">{c.product_name}</div>
                <div class="field-label">Manufacturing Site</div>
                <div class="field-value">{c.manufacturing_site}</div>
            </div>
            <div class="col">
                <div class="field-label">Batch Number</div>
                <div class="field-value">#{c.batch_number}</div>
                <div class="field-label">Complaint Category</div>
                <div class="field-value">{c.complaint_category}</div>
                <div class="field-label">Priority Level</div>
                <div class="field-value" style="color: #dc2626; font-weight: bold;">{c.priority}</div>
            </div>
        </div>
        <div class="field-label" style="margin-top: 10px;">Customer Description</div>
        <div class="field-value" style="margin-bottom: 0; background: #f1f5f9; padding: 10px; border-radius: 4px; border-left: 3px solid #64748b;">
            "{c.description}"
        </div>
    </div>

    <div class="section-title">2. AI-Driven Quality Analysis & Risk Assessment</div>
    <div class="card">
        <div class="grid-2">
            <div class="col">
                <div class="field-label">Primary Department</div>
                <div class="field-value">Quality Assurance & Regulatory Compliance</div>
            </div>
            <div class="col">
                <div class="field-label">Current Status</div>
                <div class="field-value"><span class="status-badge">{c.capa_status}</span></div>
            </div>
        </div>
    </div>

    <div class="section-title">3. Corrective & Preventive Action (CAPA) Plan</div>
    <div class="card" style="border-left: 4px solid #059669; background-color: #f0fdf4;">
        <div class="field-label" style="color: #047857;">Approved CAPA Action Protocol</div>
        <div class="field-value" style="font-size: 10.5pt; font-weight: 500; color: #065f46; margin-bottom: 12px;">
            {getattr(c, 'suggested_capa', 'No CAPA recommendation recorded.')}
        </div>
        <div class="grid-2" style="border-top: 1px solid #bbf7d0; padding-top: 10px; margin-top: 10px;">
            <div class="col">
                <div class="field-label" style="color: #047857;">Approved By (QA Manager)</div>
                <div class="field-value" style="margin-bottom: 0; font-weight: bold;">{getattr(c, 'approved_by', 'Pending Sign-off')}</div>
            </div>
            <div class="col">
                <div class="field-label" style="color: #047857;">Compliance Engine</div>
                <div class="field-value" style="margin-bottom: 0; font-weight: bold;">AIVOA Automated QA Pipeline</div>
            </div>
        </div>
    </div>

    <div class="footer-signatures">
        <table style="width: 100%; font-size: 9pt; color: #64748b;">
            <tr>
                <td>AIVOA Compliance Engine &bull; Generated via FastAPI Backend</td>
                <td style="text-align: right;">Document Verification Hash: #SHA256-{c.complaint_id}AIVOA</td>
            </tr>
        </table>
    </div>
    </body>
    </html>
    """
    
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=CAPA_Report_{c.complaint_id}.pdf"}
    )