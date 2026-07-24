from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app import models, schemas, crud

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIVOA QMS API",
    version="1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Create Complaint
# -----------------------------
@app.post(
    "/api/complaints/",
    response_model=schemas.ComplaintResponse
)
def create_complaint(
    complaint: schemas.ComplaintCreate,
    db: Session = Depends(get_db)
):
    return crud.create_complaint_with_ai(
        db=db,
        complaint=complaint
    )


# -----------------------------
# Get All Complaints
# -----------------------------
@app.get(
    "/api/complaints/",
    response_model=list[schemas.ComplaintResponse]
)
def read_complaints(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_complaints(
        db,
        skip=skip,
        limit=limit
    )


# -----------------------------
# Get Complaint By ID
# -----------------------------
@app.get(
    "/api/complaints/{complaint_id}",
    response_model=schemas.ComplaintResponse
)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db)
):
    complaint = crud.get_complaint_by_id(db, complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint


# -----------------------------
# Update Complaint
# -----------------------------
@app.put(
    "/api/complaints/{complaint_id}",
    response_model=schemas.ComplaintResponse
)
def update_complaint(
    complaint_id: int,
    complaint: schemas.ComplaintUpdate,
    db: Session = Depends(get_db)
):
    updated = crud.update_complaint(
        db,
        complaint_id,
        complaint
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return updated


# -----------------------------
# Delete Complaint
# -----------------------------
@app.delete("/api/complaints/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db)
):
    deleted = crud.delete_complaint(
        db,
        complaint_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return {
        "message": "Complaint deleted successfully"
    }


# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "AIVOA QMS Backend Running"
    }