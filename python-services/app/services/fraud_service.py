def detect_fraud(claim_text):
    # Simple rule-based
    if "fraud" in claim_text.lower():
        return True
    return False