from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from routes.complete_chat_api import router as complete_chat_router
from routes.document_api import router as document_router
from routes.nlp_api import router as nlp_router
from routes.risk_api import router as risk_router
from routes.claims_api import router as claims_router
from routes.chat_api import router as chat_router
from config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="InsurAI AI Services",
    description="Comprehensive AI services for insurance automation including risk assessment, claims analysis, document processing, and chatbot integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "*"],  # Frontend and Backend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )

# Include routers with prefixes
app.include_router(complete_chat_router, prefix="/api/chat", tags=["Gemini Chatbot"])
app.include_router(document_router, prefix="/api/document", tags=["Document Processing"])
app.include_router(nlp_router, prefix="/api/nlp", tags=["Natural Language Processing"])
app.include_router(risk_router, prefix="/api/risk", tags=["Risk Assessment"])
app.include_router(claims_router, prefix="/api/claims", tags=["Claims Analysis"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chatbot"])

@app.get("/", tags=["Health Check"])
async def read_root():
    return {
        "message": "InsurAI AI Services Running",
        "version": "1.0.0",
        "status": "healthy",
        "services": [
            "Document Processing",
            "Risk Assessment", 
            "Claims Analysis",
            "NLP Services",
            "Chatbot Integration"
        ]
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-09-01T00:00:00Z",
        "services": {
            "document_processing": "available",
            "risk_assessment": "available",
            "claims_analysis": "available",
            "nlp_services": "available",
            "chatbot": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )