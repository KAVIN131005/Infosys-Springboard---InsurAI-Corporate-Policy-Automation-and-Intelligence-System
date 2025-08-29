def assess_risk(text):
    # Simple rule-based risk assessment
    if "high risk" in text.lower():
        return "High"
    return "Low"