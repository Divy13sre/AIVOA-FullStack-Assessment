from fastapi import APIRouter

router = APIRouter()

@router.post("/generate-summary")
async def generate_summary(data: dict):

    complaint = data.get("complaint", "")

    summary = f"""
Complaint Summary

{complaint}

Recommended for QA investigation.
"""

    return {"summary": summary}