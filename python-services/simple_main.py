from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="InsurAI - AI Services",
    description="Comprehensive AI services for insurance automation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
async def read_root():
    return {
        "message": "InsurAI AI Services Running",
        "version": "1.0.0",
        "status": "healthy",
        "services": [
            "Risk Assessment", 
            "Claims Analysis",
            "NLP Processing",
            "Chatbot"
        ],
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "risk": "/api/risk/*",
            "claims": "/api/claims/*",
            "nlp": "/api/nlp/*",
            "chat": "/api/chat/*"
        }
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-09-01T10:00:00Z",
        "services": {
            "risk_assessment": "operational",
            "fraud_detection": "operational", 
            "nlp_service": "operational",
            "chatbot": "operational"
        }
    }

# Simple API endpoints for testing
@app.post("/api/risk/assess", tags=["Risk Assessment"])
async def assess_risk(data: dict):
    """Simple risk assessment endpoint"""
    try:
        # Mock risk assessment
        risk_score = 0.3 if data.get("age", 30) < 65 else 0.6
        
        return {
            "risk_score": risk_score,
            "risk_level": "low" if risk_score < 0.4 else "medium",
            "recommendations": ["Standard processing recommended"],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/claims/analyze", tags=["Claims Analysis"])
async def analyze_claim(data: dict):
    """Simple claims analysis endpoint"""
    try:
        # Mock fraud detection
        fraud_score = 0.2 if len(data.get("description", "")) < 100 else 0.5
        
        return {
            "fraud_score": fraud_score,
            "risk_level": "low" if fraud_score < 0.4 else "medium",
            "indicators": ["Standard claim pattern"],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/nlp/analyze", tags=["NLP Processing"])
async def analyze_text(data: dict):
    """Simple text analysis endpoint"""
    try:
        text = data.get("text", "")
        word_count = len(text.split())
        
        # Mock sentiment analysis
        sentiment = "positive" if "good" in text.lower() else "neutral"
        
        return {
            "sentiment": sentiment,
            "word_count": word_count,
            "entities": [],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/chat/query", tags=["Chatbot"])
async def chat_query(data: dict):
    """Simple chatbot endpoint"""
    try:
        message = data.get("message", "")
        
        # Simple response logic
        if "claim" in message.lower():
            response = "I can help you with your claim. Please provide your claim number."
        elif "policy" in message.lower():
            response = "I can assist with policy questions. What would you like to know?"
        else:
            response = "Hello! How can I help you today?"
        
        return {
            "response": response,
            "intent": "general",
            "confidence": 0.8,
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
