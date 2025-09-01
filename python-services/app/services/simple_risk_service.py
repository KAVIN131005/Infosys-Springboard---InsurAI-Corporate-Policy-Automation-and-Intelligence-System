import logging
from typing import Dict, List, Any, Optional
import random
import datetime

logger = logging.getLogger(__name__)

class RiskAssessmentService:
    """
    Simplified risk assessment service
    """
    
    def __init__(self):
        logger.info("Simple Risk Assessment Service initialized")
        
        # Risk factors and weights
        self.risk_factors = {
            "age": {"weight": 0.2, "high_risk_threshold": 65},
            "location": {"weight": 0.15, "high_risk_areas": ["flood_zone", "earthquake_zone"]},
            "claim_history": {"weight": 0.3, "high_risk_threshold": 3},
            "policy_type": {"weight": 0.1, "high_risk_types": ["comprehensive", "full_coverage"]},
            "coverage_amount": {"weight": 0.25, "high_risk_threshold": 100000}
        }
    
    async def assess_risk(self, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess risk for a policy
        """
        try:
            # Extract relevant data
            age = policy_data.get("age", 35)
            location = policy_data.get("location", "").lower()
            claim_history = policy_data.get("claim_history", 0)
            policy_type = policy_data.get("policy_type", "basic").lower()
            coverage_amount = policy_data.get("coverage_amount", 50000)
            
            # Calculate individual risk scores
            age_risk = self._calculate_age_risk(age)
            location_risk = self._calculate_location_risk(location)
            history_risk = self._calculate_history_risk(claim_history)
            type_risk = self._calculate_type_risk(policy_type)
            amount_risk = self._calculate_amount_risk(coverage_amount)
            
            # Calculate weighted overall risk
            overall_risk = (
                age_risk * self.risk_factors["age"]["weight"] +
                location_risk * self.risk_factors["location"]["weight"] +
                history_risk * self.risk_factors["claim_history"]["weight"] +
                type_risk * self.risk_factors["policy_type"]["weight"] +
                amount_risk * self.risk_factors["coverage_amount"]["weight"]
            )
            
            # Determine risk level
            if overall_risk <= 0.3:
                risk_level = "low"
            elif overall_risk <= 0.6:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            # Calculate premium adjustment
            premium_multiplier = 1.0 + (overall_risk * 0.5)  # 0% to 50% increase
            
            return {
                "overall_risk_score": round(overall_risk, 3),
                "risk_level": risk_level,
                "premium_multiplier": round(premium_multiplier, 3),
                "risk_factors": {
                    "age_risk": round(age_risk, 3),
                    "location_risk": round(location_risk, 3),
                    "claim_history_risk": round(history_risk, 3),
                    "policy_type_risk": round(type_risk, 3),
                    "coverage_amount_risk": round(amount_risk, 3)
                },
                "recommendations": self._get_recommendations(risk_level, overall_risk),
                "assessment_date": datetime.datetime.now().isoformat(),
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {str(e)}")
            return self._get_default_assessment()
    
    async def batch_assess_risk(self, policies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Assess risk for multiple policies
        """
        try:
            results = []
            for i, policy in enumerate(policies):
                try:
                    assessment = await self.assess_risk(policy)
                    assessment["policy_index"] = i
                    results.append(assessment)
                except Exception as e:
                    results.append({
                        "policy_index": i,
                        "error": str(e),
                        "overall_risk_score": 0.5,
                        "risk_level": "unknown"
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Batch risk assessment failed: {str(e)}")
            return []
    
    async def get_risk_analytics(self, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get detailed risk analytics
        """
        try:
            basic_assessment = await self.assess_risk(policy_data)
            
            # Add detailed analytics
            analytics = {
                "risk_distribution": {
                    "age_factor": basic_assessment["risk_factors"]["age_risk"] * 100,
                    "location_factor": basic_assessment["risk_factors"]["location_risk"] * 100,
                    "history_factor": basic_assessment["risk_factors"]["claim_history_risk"] * 100,
                    "type_factor": basic_assessment["risk_factors"]["policy_type_risk"] * 100,
                    "amount_factor": basic_assessment["risk_factors"]["coverage_amount_risk"] * 100
                },
                "industry_comparison": {
                    "percentile": random.randint(25, 95),
                    "compared_to_similar": "average" if basic_assessment["risk_level"] == "medium" else basic_assessment["risk_level"]
                },
                "trend_analysis": {
                    "risk_trend": "stable",
                    "projected_change": random.uniform(-0.1, 0.1)
                }
            }
            
            return {**basic_assessment, "analytics": analytics}
            
        except Exception as e:
            logger.error(f"Risk analytics failed: {str(e)}")
            return self._get_default_assessment()
    
    def _calculate_age_risk(self, age: int) -> float:
        """Calculate risk based on age"""
        if age < 25:
            return 0.7  # Young drivers/high risk
        elif age < 65:
            return 0.3  # Low risk
        else:
            return 0.6  # Senior citizens, moderate risk
    
    def _calculate_location_risk(self, location: str) -> float:
        """Calculate risk based on location"""
        high_risk_keywords = ["flood", "earthquake", "hurricane", "tornado", "high_crime"]
        
        for keyword in high_risk_keywords:
            if keyword in location:
                return 0.8
        
        return 0.2  # Default low risk
    
    def _calculate_history_risk(self, claim_count: int) -> float:
        """Calculate risk based on claim history"""
        if claim_count == 0:
            return 0.1
        elif claim_count <= 2:
            return 0.4
        elif claim_count <= 5:
            return 0.7
        else:
            return 0.9
    
    def _calculate_type_risk(self, policy_type: str) -> float:
        """Calculate risk based on policy type"""
        high_risk_types = ["comprehensive", "full_coverage", "premium"]
        
        if policy_type in high_risk_types:
            return 0.6
        else:
            return 0.3
    
    def _calculate_amount_risk(self, coverage_amount: float) -> float:
        """Calculate risk based on coverage amount"""
        if coverage_amount < 25000:
            return 0.2
        elif coverage_amount < 100000:
            return 0.4
        elif coverage_amount < 500000:
            return 0.6
        else:
            return 0.8
    
    def _get_recommendations(self, risk_level: str, risk_score: float) -> List[str]:
        """Get recommendations based on risk level"""
        recommendations = []
        
        if risk_level == "low":
            recommendations.extend([
                "Consider offering premium discounts",
                "Standard processing recommended",
                "Low monitoring required"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Standard premium rates applicable",
                "Regular monitoring recommended",
                "Consider additional documentation"
            ])
        else:  # high risk
            recommendations.extend([
                "Premium surcharge recommended",
                "Enhanced underwriting required",
                "Frequent monitoring necessary",
                "Consider additional security measures"
            ])
        
        return recommendations
    
    def _get_default_assessment(self) -> Dict[str, Any]:
        """Get default assessment when processing fails"""
        return {
            "overall_risk_score": 0.5,
            "risk_level": "medium",
            "premium_multiplier": 1.0,
            "risk_factors": {
                "age_risk": 0.5,
                "location_risk": 0.5,
                "claim_history_risk": 0.5,
                "policy_type_risk": 0.5,
                "coverage_amount_risk": 0.5
            },
            "recommendations": ["Default assessment - manual review required"],
            "assessment_date": datetime.datetime.now().isoformat(),
            "confidence": 0.3,
            "error": "Assessment failed, using default values"
        }
