from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(String(50), unique=True, nullable=False, index=True)

    complaint_source = Column(String(100), nullable=False)

    customer_name = Column(String(255), nullable=False)

    product_name = Column(String(255), nullable=False)

    product_strength = Column(String(100))

    batch_number = Column(String(100), index=True)

    affected_quantity = Column(String(100))

    manufacturing_date = Column(String(100))

    expiry_date = Column(String(100))

    originating_site_block = Column(String(255))

    impacted_npm = Column(String(255))

    complaint_category = Column(String(255))

    complaint_description = Column(Text)

    severity = Column(String(50))

    status = Column(String(50), default="Pending")

    ai_summary = Column(Text)

    risk_level = Column(String(50))

    root_cause = Column(Text)

    capa_recommendation = Column(Text)

    duplicate_complaint = Column(String(20), default="No")

    confidence_score = Column(String(20))

    uploaded_file = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )