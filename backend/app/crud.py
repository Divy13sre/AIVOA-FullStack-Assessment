from uuid import uuid4

from sqlalchemy.orm import Session

from app import models, schemas
from app.langgraph_workflow import graph


def create_complaint_with_ai(
    db: Session,
    complaint: schemas.ComplaintCreate,
):
    # Run AI analysis using LangGraph
    result = graph.invoke(
        {
            "complaint": complaint.complaint_description or "",
            "ai_result": {},
        }
    )

    ai = result.get("ai_result", {})

    db_complaint = models.Complaint(
        complaint_id=f"CMP-{uuid4().hex[:8].upper()}",

        complaint_source=complaint.complaint_source,
        customer_name=complaint.customer_name,
        product_name=complaint.product_name,
        product_strength=complaint.product_strength,
        batch_number=complaint.batch_number,
        affected_quantity=complaint.affected_quantity,
        manufacturing_date=complaint.manufacturing_date,
        expiry_date=complaint.expiry_date,
        originating_site_block=complaint.originating_site_block,
        impacted_npm=complaint.impacted_npm,
        complaint_category=complaint.complaint_category,
        complaint_description=complaint.complaint_description,
        severity=complaint.severity,
        status=complaint.status,

        ai_summary=ai.get("summary", ""),
        risk_level=ai.get("risk_level", "Medium"),
        root_cause=ai.get("root_cause", ""),
        capa_recommendation=ai.get("capa", ""),
        duplicate_complaint=ai.get("duplicate", "No"),
        confidence_score=ai.get("confidence", "90%"),
    )

    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    return db_complaint


def get_complaints(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Complaint)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_complaint_by_id(db: Session, complaint_id: int):
    return (
        db.query(models.Complaint)
        .filter(models.Complaint.id == complaint_id)
        .first()
    )


def update_complaint(
    db: Session,
    complaint_id: int,
    complaint: schemas.ComplaintUpdate,
):
    db_complaint = (
        db.query(models.Complaint)
        .filter(models.Complaint.id == complaint_id)
        .first()
    )

    if not db_complaint:
        return None

    update_data = complaint.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_complaint, key, value)

    db.commit()
    db.refresh(db_complaint)

    return db_complaint


def delete_complaint(db: Session, complaint_id: int):
    db_complaint = (
        db.query(models.Complaint)
        .filter(models.Complaint.id == complaint_id)
        .first()
    )

    if not db_complaint:
        return None

    db.delete(db_complaint)
    db.commit()

    return db_complaint