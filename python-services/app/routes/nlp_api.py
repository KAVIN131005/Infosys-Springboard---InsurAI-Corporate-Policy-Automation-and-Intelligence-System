from fastapi import APIRouter, Body
from app.services.nlp_service import extract_entities

router = APIRouter()

@router.post("/analyze")
def analyze(text: str = Body(...)):
    entities = extract_entities(text)
    return {"entities": entities}