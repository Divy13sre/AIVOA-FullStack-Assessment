import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_complaint(text: str):

    prompt = f"""
You are an AI assistant for a Pharmaceutical Quality Management System (QMS).

Analyze the following customer complaint.

Complaint:
{text}

Return ONLY valid JSON in this exact format.

{{
    "summary": "",
    "risk_level": "",
    "root_cause": "",
    "capa": "",
    "duplicate": "No",
    "confidence": "95%"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)

    except Exception:
        return {
            "summary": content,
            "risk_level": "Medium",
            "root_cause": "Unable to determine",
            "capa": "Manual review required",
            "duplicate": "No",
            "confidence": "80%"
        }