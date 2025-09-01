from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from services.simple_risk_service import RiskAssessmentService
import logging

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

router = APIRouter()
risk_service = RiskAssessmentService()

class RiskAssessmentRequest(BaseModel):
    user_data: Dict[str, Any]
    policy_type: str
    coverage_amount: float
    additional_info: Optional[Dict[str, Any]] = None

class RiskAssessmentResponse(BaseModel):
    risk_level: str
    risk_score: float
    factors: List[Dict[str, Any]]
    recommendations: List[str]
    approval_status: str
    premium_adjustment: float

class BulkRiskAssessmentRequest(BaseModel):
    assessments: List[RiskAssessmentRequest]

@router.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Comprehensive risk assessment for insurance applications
    """
    try:
        logger.info(f"Processing risk assessment for policy type: {request.policy_type}")
        
        result = await risk_service.assess_comprehensive_risk(
            user_data=request.user_data,
            policy_type=request.policy_type,
            coverage_amount=request.coverage_amount,
            additional_info=request.additional_info
        )
        
        return RiskAssessmentResponse(**result)
        
    except Exception as e:
        logger.error(f"Risk assessment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")

@router.post("/assess-bulk")
async def assess_bulk_risk(request: BulkRiskAssessmentRequest):
    """
    Bulk risk assessment for multiple applications
    """
    try:
        results = []
        for assessment in request.assessments:
            result = await risk_service.assess_comprehensive_risk(
                user_data=assessment.user_data,
                policy_type=assessment.policy_type,
                coverage_amount=assessment.coverage_amount,
                additional_info=assessment.additional_info
            )
            results.append(result)
        
        return {"assessments": results, "total_processed": len(results)}
        
    except Exception as e:
        logger.error(f"Bulk risk assessment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk risk assessment failed: {str(e)}")

@router.get("/factors/{policy_type}")
async def get_risk_factors(policy_type: str):
    """
    Get risk factors for a specific policy type
    """
    try:
        factors = risk_service.get_risk_factors_for_policy_type(policy_type)
        return {"policy_type": policy_type, "risk_factors": factors}
        
    except Exception as e:
        logger.error(f"Failed to get risk factors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get risk factors: {str(e)}")

@router.post("/recalculate")
async def recalculate_risk(
    policy_id: str = Body(...),
    updated_data: Dict[str, Any] = Body(...)
):
    """
    Recalculate risk assessment with updated information
    """
    try:
        result = await risk_service.recalculate_risk(policy_id, updated_data)
        return result
        
    except Exception as e:
        logger.error(f"Risk recalculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk recalculation failed: {str(e)}")

@router.get("/analytics")
async def get_risk_analytics():
    """
    Get risk assessment analytics and insights
    """
    try:
        analytics = await risk_service.get_risk_analytics()
        return analytics
        
    except Exception as e:
        logger.error(f"Failed to get risk analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get risk analytics: {str(e)}")