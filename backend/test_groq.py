from app.groq_service import analyze_complaint

try:
    result = analyze_complaint(
        "Customer reported damaged blister pack for Paracetamol tablets."
    )

    print("SUCCESS")
    print(result)

except Exception as e:
    import traceback
    traceback.print_exc()