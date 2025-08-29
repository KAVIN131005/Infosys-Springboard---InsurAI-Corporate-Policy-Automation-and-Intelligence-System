from fastapi import APIRouter, UploadFile, File
from app.services.ocr_service import extract_text_from_document

router = APIRouter()

@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_document(content, file.filename)
    return {"text": text}