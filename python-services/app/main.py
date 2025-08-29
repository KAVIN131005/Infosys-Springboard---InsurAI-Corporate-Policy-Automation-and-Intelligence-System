from fastapi import FastAPI
from app.routes.document_api import router as document_router
from app.routes.nlp_api import router as nlp_router
from app.routes.risk_api import router as risk_router
from app.routes.claims_api import router as claims_router
from app.routes.chat_api import router as chat_router

app = FastAPI(title="InsurAI AI Service")

app.include_router(document_router, prefix="/document")
app.include_router(nlp_router, prefix="/nlp")
app.include_router(risk_router, prefix="/risk")
app.include_router(claims_router, prefix="/claims")
app.include_router(chat_router, prefix="/chat")

@app.get("/")
def read_root():
    return {"message": "AI Service Running"}