from fastapi import APIRouter, Body

router = APIRouter()

@router.post("/query")
def chat_query(question: str = Body(...)):
    # Placeholder for chat logic
    return {"response": "This is a placeholder response for: " + question}