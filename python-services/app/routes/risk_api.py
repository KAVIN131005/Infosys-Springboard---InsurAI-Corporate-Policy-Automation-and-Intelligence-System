from fastapi import APIRouter, Body
from app.services.risk_service import assess_risk

router = APIRouter()

@router.post("/assess")
def assess(text: str = Body(...)):
    risk_level = assess_risk(text)
    return {"risk_level": risk_level}