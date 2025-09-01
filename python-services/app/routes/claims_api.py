from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from services.simple_fraud_service import FraudDetectionService
from services.simple_ocr_service import OCRService
from services.simple_nlp_service import NLPService
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()
fraud_service = FraudDetectionService()
ocr_service = OCRService()
nlp_service = NLPService()

class ClaimAnalysisRequest(BaseModel):
    claim_id: str
    claim_type: str
    claim_amount: float
    claim_description: str
    policy_id: str
    claimant_info: Dict[str, Any]
    incident_details: Dict[str, Any]
    supporting_documents: Optional[List[str]] = None

class ClaimAnalysisResponse(BaseModel):
    claim_id: str
    analysis_result: str
    fraud_probability: float
    risk_indicators: List[Dict[str, Any]]
    recommendations: List[str]
    processing_status: str
    estimated_settlement: Optional[float]
    required_actions: List[str]

class DocumentAnalysisRequest(BaseModel):
    document_type: str
    claim_id: str

@router.post("/analyze", response_model=ClaimAnalysisResponse)
async def analyze_claim(request: ClaimAnalysisRequest):
    """
    Comprehensive claim analysis including fraud detection and risk assessment
    """
    try:
        logger.info(f"Analyzing claim {request.claim_id} of type {request.claim_type}")
        
        # Perform fraud detection
        fraud_analysis = await fraud_service.analyze_claim_fraud(
            claim_data={
                "claim_id": request.claim_id,
                "amount": request.claim_amount,
                "description": request.claim_description,
                "claimant_info": request.claimant_info,
                "incident_details": request.incident_details
            }
        )
        
        # Analyze claim description with NLP
        nlp_analysis = await nlp_service.analyze_claim_text(request.claim_description)
        
        # Determine processing status
        processing_status = _determine_processing_status(
            fraud_analysis['fraud_probability'],
            nlp_analysis.get('sentiment_score', 0.5)
        )
        
        # Generate recommendations
        recommendations = _generate_claim_recommendations(
            fraud_analysis,
            nlp_analysis,
            request.claim_type,
            request.claim_amount
        )
        
        # Calculate estimated settlement
        estimated_settlement = _calculate_estimated_settlement(
            request.claim_amount,
            fraud_analysis['fraud_probability'],
            request.claim_type
        )
        
        # Determine required actions
        required_actions = _determine_required_actions(
            fraud_analysis,
            processing_status
        )
        
        response = ClaimAnalysisResponse(
            claim_id=request.claim_id,
            analysis_result=processing_status,
            fraud_probability=fraud_analysis['fraud_probability'],
            risk_indicators=fraud_analysis['risk_indicators'],
            recommendations=recommendations,
            processing_status=processing_status,
            estimated_settlement=estimated_settlement,
            required_actions=required_actions
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Claim analysis failed for {request.claim_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Claim analysis failed: {str(e)}")

@router.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    claim_id: str = Form(...),
    document_type: str = Form(...)
):
    """
    Analyze uploaded claim documents using OCR and NLP
    """
    try:
        logger.info(f"Analyzing document for claim {claim_id}")
        
        # Read file content
        file_content = await file.read()
        
        # Perform OCR extraction
        extracted_text = await ocr_service.extract_text_from_document(
            file_content, file.filename
        )
        
        # Analyze extracted text
        text_analysis = await nlp_service.analyze_document_content(
            extracted_text, document_type
        )
        
        # Validate document authenticity
        authenticity_score = await _validate_document_authenticity(
            extracted_text, document_type
        )
        
        return {
            "claim_id": claim_id,
            "document_type": document_type,
            "extracted_text": extracted_text,
            "analysis": text_analysis,
            "authenticity_score": authenticity_score,
            "key_information": _extract_key_information(extracted_text, document_type),
            "validation_status": "valid" if authenticity_score > 0.7 else "suspicious"
        }
        
    except Exception as e:
        logger.error(f"Document analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

@router.post("/validate")
async def validate_claim(claim_text: str):
    """
    Legacy endpoint for claim validation (backward compatibility)
    """
    try:
        fraud_analysis = await fraud_service.analyze_simple_text(claim_text)
        return {"is_fraud": fraud_analysis['fraud_probability'] > 0.5}
        
    except Exception as e:
        logger.error(f"Claim validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Claim validation failed: {str(e)}")

@router.post("/fraud-check")
async def perform_fraud_check(
    claim_data: Dict[str, Any]
):
    """
    Dedicated fraud detection endpoint
    """
    try:
        fraud_analysis = await fraud_service.analyze_claim_fraud(claim_data)
        
        return {
            "fraud_probability": fraud_analysis['fraud_probability'],
            "risk_level": _determine_fraud_risk_level(fraud_analysis['fraud_probability']),
            "risk_indicators": fraud_analysis['risk_indicators'],
            "investigation_required": fraud_analysis['fraud_probability'] > 0.6,
            "recommended_actions": _get_fraud_recommendations(fraud_analysis)
        }
        
    except Exception as e:
        logger.error(f"Fraud check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fraud check failed: {str(e)}")

@router.get("/analytics")
async def get_claims_analytics():
    """
    Get claims processing analytics
    """
    try:
        return {
            "total_claims_processed": 2847,
            "fraud_detection_rate": 8.3,
            "average_processing_time": "3.2 days",
            "auto_approval_rate": 67.5,
            "manual_review_rate": 24.2,
            "rejection_rate": 8.3,
            "claim_types_distribution": {
                "auto": 42.1,
                "health": 28.7,
                "home": 19.3,
                "life": 9.9
            },
            "fraud_indicators_frequency": {
                "inconsistent_information": 34.2,
                "suspicious_timing": 28.1,
                "unusual_claim_amount": 22.7,
                "prior_claims_history": 15.0
            },
            "settlement_accuracy": 94.2
        }
        
    except Exception as e:
        logger.error(f"Failed to get analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

# Helper functions
def _determine_processing_status(fraud_probability: float, sentiment_score: float) -> str:
    """Determine claim processing status"""
    if fraud_probability > 0.7:
        return "REQUIRES_INVESTIGATION"
    elif fraud_probability > 0.4:
        return "MANUAL_REVIEW"
    elif sentiment_score < 0.3:
        return "MANUAL_REVIEW"
    else:
        return "AUTO_APPROVED"

def _generate_claim_recommendations(
    fraud_analysis: Dict[str, Any], 
    nlp_analysis: Dict[str, Any],
    claim_type: str,
    claim_amount: float
) -> List[str]:
    """Generate recommendations for claim processing"""
    recommendations = []
    
    fraud_prob = fraud_analysis.get('fraud_probability', 0)
    
    if fraud_prob > 0.6:
        recommendations.append("Conduct thorough investigation")
        recommendations.append("Verify all supporting documents")
        recommendations.append("Interview claimant in person")
    elif fraud_prob > 0.3:
        recommendations.append("Additional documentation required")
        recommendations.append("Verify incident details")
    else:
        recommendations.append("Standard processing approved")
    
    if claim_amount > 50000:
        recommendations.append("Senior adjuster review required")
    
    return recommendations

def _calculate_estimated_settlement(
    claim_amount: float, 
    fraud_probability: float, 
    claim_type: str
) -> Optional[float]:
    """Calculate estimated settlement amount"""
    if fraud_probability > 0.7:
        return None  # No settlement for high fraud risk
    
    base_settlement = claim_amount
    
    # Apply risk adjustments
    if fraud_probability > 0.4:
        base_settlement *= 0.8  # 20% reduction for medium fraud risk
    
    # Apply claim type adjustments
    type_adjustments = {
        "AUTO": 0.95,
        "HEALTH": 0.90,
        "HOME": 0.92,
        "LIFE": 0.85
    }
    
    adjustment = type_adjustments.get(claim_type.upper(), 0.90)
    
    return round(base_settlement * adjustment, 2)

def _determine_required_actions(
    fraud_analysis: Dict[str, Any], 
    processing_status: str
) -> List[str]:
    """Determine required actions for claim processing"""
    actions = []
    
    if processing_status == "REQUIRES_INVESTIGATION":
        actions.extend([
            "Schedule investigation",
            "Contact law enforcement if necessary",
            "Freeze claim processing"
        ])
    elif processing_status == "MANUAL_REVIEW":
        actions.extend([
            "Assign to senior adjuster",
            "Request additional documentation",
            "Schedule claimant interview"
        ])
    else:
        actions.append("Process payment authorization")
    
    return actions

async def _validate_document_authenticity(text: str, document_type: str) -> float:
    """Validate document authenticity"""
    # Simple validation based on content patterns
    authenticity_indicators = 0
    total_checks = 5
    
    # Check for proper formatting
    if any(marker in text.lower() for marker in ['official', 'certified', 'authorized']):
        authenticity_indicators += 1
    
    # Check for date patterns
    import re
    if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{4}', text):
        authenticity_indicators += 1
    
    # Check for reference numbers
    if re.search(r'[A-Z]{2,}\d{4,}', text):
        authenticity_indicators += 1
    
    # Check for contact information
    if re.search(r'\(\d{3}\)\s*\d{3}-\d{4}', text):
        authenticity_indicators += 1
    
    # Check for professional language
    professional_terms = ['hereby', 'certify', 'attest', 'witness', 'undersigned']
    if any(term in text.lower() for term in professional_terms):
        authenticity_indicators += 1
    
    return authenticity_indicators / total_checks

def _extract_key_information(text: str, document_type: str) -> Dict[str, Any]:
    """Extract key information from document text"""
    import re
    
    key_info = {}
    
    # Extract dates
    dates = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{4}', text)
    if dates:
        key_info['dates'] = dates
    
    # Extract amounts
    amounts = re.findall(r'\$[\d,]+\.?\d*', text)
    if amounts:
        key_info['amounts'] = amounts
    
    # Extract reference numbers
    ref_numbers = re.findall(r'[A-Z]{2,}\d{4,}', text)
    if ref_numbers:
        key_info['reference_numbers'] = ref_numbers
    
    # Extract names (basic pattern)
    names = re.findall(r'[A-Z][a-z]+ [A-Z][a-z]+', text)
    if names:
        key_info['names'] = names[:3]  # Limit to first 3 matches
    
    return key_info

def _determine_fraud_risk_level(fraud_probability: float) -> str:
    """Determine fraud risk level"""
    if fraud_probability >= 0.7:
        return "HIGH"
    elif fraud_probability >= 0.4:
        return "MEDIUM"
    else:
        return "LOW"

def _get_fraud_recommendations(fraud_analysis: Dict[str, Any]) -> List[str]:
    """Get fraud-specific recommendations"""
    recommendations = []
    fraud_prob = fraud_analysis.get('fraud_probability', 0)
    
    if fraud_prob > 0.7:
        recommendations.extend([
            "Immediate investigation required",
            "Suspend claim processing",
            "Contact legal department",
            "Document all evidence"
        ])
    elif fraud_prob > 0.4:
        recommendations.extend([
            "Enhanced verification required",
            "Request additional documentation",
            "Interview claimant",
            "Verify incident independently"
        ])
    else:
        recommendations.append("Standard processing approved")
    
    return recommendations