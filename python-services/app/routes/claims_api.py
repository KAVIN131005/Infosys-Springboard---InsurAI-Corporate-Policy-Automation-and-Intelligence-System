from fastapi import APIRouter, Body
from app.services.fraud_service import detect_fraud

router = APIRouter()

@router.post("/validate")
def validate(claim_text: str = Body(...)):
    is_fraud = detect_fraud(claim_text)
    return {"is_fraud": is_fraud}