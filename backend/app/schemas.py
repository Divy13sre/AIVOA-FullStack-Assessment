from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ComplaintBase(BaseModel):
    complaint_source: str
    customer_name: str
    product_name: str
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "Pending"


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    ai_summary: Optional[str] = None
    risk_level: Optional[str] = None
    root_cause: Optional[str] = None
    capa_recommendation: Optional[str] = None
    duplicate_complaint: Optional[str] = None
    confidence_score: Optional[str] = None


class ComplaintResponse(ComplaintBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_id: str

    ai_summary: Optional[str] = None
    risk_level: Optional[str] = None
    root_cause: Optional[str] = None
    capa_recommendation: Optional[str] = None
    duplicate_complaint: Optional[str] = None
    confidence_score: Optional[str] = None

    uploaded_file: Optional[str] = None

    created_at: datetime
    updated_at: datetime