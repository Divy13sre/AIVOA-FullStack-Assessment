from typing import TypedDict
from langgraph.graph import StateGraph, END
from app.groq_service import analyze_complaint


class ComplaintState(TypedDict):
    complaint: str
    ai_result: dict


def ai_analysis(state: ComplaintState):
    result = analyze_complaint(state["complaint"])

    return {
        "complaint": state["complaint"],
        "ai_result": result
    }


builder = StateGraph(ComplaintState)

builder.add_node("AI Analysis", ai_analysis)

builder.set_entry_point("AI Analysis")

builder.add_edge("AI Analysis", END)

graph = builder.compile()