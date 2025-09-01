from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from services.simple_nlp_service import NLPService
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()
nlp_service = NLPService()

class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: Optional[str] = "comprehensive"

@router.post("/analyze")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text for sentiment, entities, and other NLP features
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        analysis = await nlp_service.analyze_claim_text(request.text)
        
        return {
            "text": request.text,
            "analysis": analysis,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/extract-entities")
async def extract_entities(text: str = Body(...)):
    """
    Extract named entities from text
    """
    try:
        analysis = await nlp_service.analyze_claim_text(text)
        entities = analysis.get("entities", [])
        
        return {
            "text": text,
            "entities": entities,
            "entity_count": len(entities)
        }
        
    except Exception as e:
        logger.error(f"Entity extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")

@router.post("/sentiment")
async def analyze_sentiment(text: str = Body(...)):
    """
    Analyze sentiment of text
    """
    try:
        analysis = await nlp_service.analyze_claim_text(text)
        sentiment = analysis.get("sentiment", {})
        
        return {
            "text": text,
            "sentiment": sentiment
        }
        
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Check NLP service health
    """
    return {
        "status": "healthy",
        "service": "NLP Service",
        "features": ["sentiment_analysis", "entity_extraction", "text_analysis"]
    }