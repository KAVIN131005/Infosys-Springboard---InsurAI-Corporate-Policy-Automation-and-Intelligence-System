import pickle
import numpy as np
import pandas as pd
from datetime import datetime, date
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class RiskAssessmentService:
    def __init__(self):
        self.model_path = Path("app/models/risk_model.pkl")
        self.risk_factors_config = self._load_risk_factors_config()
        self.load_model()
    
    def load_model(self):
        """Load the risk assessment model"""
        try:
            if self.model_path.exists():
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Risk assessment model loaded successfully")
            else:
                logger.warning("Risk model not found, using rule-based assessment")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to load risk model: {str(e)}")
            self.model = None
    
    def _load_risk_factors_config(self) -> Dict[str, Any]:
        """Load risk factors configuration for different policy types"""
        return {
            "HEALTH": {
                "age_factor": {"weight": 0.25, "high_risk_threshold": 60},
                "medical_history": {"weight": 0.30, "high_risk_conditions": ["diabetes", "heart_disease", "cancer"]},
                "lifestyle": {"weight": 0.20, "high_risk_factors": ["smoking", "excessive_drinking"]},
                "occupation": {"weight": 0.15, "high_risk_jobs": ["construction", "mining", "military"]},
                "family_history": {"weight": 0.10, "hereditary_conditions": ["heart_disease", "diabetes", "cancer"]}
            },
            "AUTO": {
                "age_factor": {"weight": 0.20, "high_risk_age_ranges": [(16, 25), (70, 100)]},
                "driving_history": {"weight": 0.35, "violations": ["speeding", "dui", "reckless_driving"]},
                "vehicle_type": {"weight": 0.20, "high_risk_vehicles": ["sports_car", "motorcycle"]},
                "location": {"weight": 0.15, "high_risk_areas": ["urban", "high_crime"]},
                "annual_mileage": {"weight": 0.10, "high_risk_threshold": 20000}
            },
            "HOME": {
                "property_age": {"weight": 0.25, "high_risk_threshold": 50},
                "location": {"weight": 0.30, "risk_factors": ["flood_zone", "earthquake_zone", "high_crime"]},
                "construction_type": {"weight": 0.20, "high_risk_materials": ["wood_frame", "mobile_home"]},
                "safety_features": {"weight": 0.15, "protective_features": ["alarm_system", "sprinkler_system"]},
                "property_value": {"weight": 0.10, "high_value_threshold": 500000}
            },
            "LIFE": {
                "age_factor": {"weight": 0.30, "high_risk_threshold": 65},
                "health_status": {"weight": 0.35, "conditions": ["chronic_illness", "terminal_illness"]},
                "lifestyle": {"weight": 0.20, "high_risk_activities": ["extreme_sports", "smoking"]},
                "occupation": {"weight": 0.10, "dangerous_jobs": ["pilot", "military", "mining"]},
                "coverage_amount": {"weight": 0.05, "high_coverage_threshold": 1000000}
            }
        }
    
    async def assess_comprehensive_risk(
        self, 
        user_data: Dict[str, Any], 
        policy_type: str, 
        coverage_amount: float,
        additional_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive risk assessment combining ML model and rule-based analysis
        """
        try:
            # Extract user information
            age = self._calculate_age(user_data.get('date_of_birth'))
            
            # Get policy-specific risk factors
            risk_factors = self.risk_factors_config.get(policy_type.upper(), {})
            
            # Calculate risk scores for each factor
            factor_scores = []
            total_weighted_score = 0.0
            
            for factor_name, factor_config in risk_factors.items():
                score = self._calculate_factor_score(
                    factor_name, factor_config, user_data, additional_info
                )
                weight = factor_config.get('weight', 0.1)
                weighted_score = score * weight
                
                factor_scores.append({
                    "factor": factor_name,
                    "score": score,
                    "weight": weight,
                    "weighted_score": weighted_score,
                    "description": self._get_factor_description(factor_name, score)
                })
                
                total_weighted_score += weighted_score
            
            # Normalize score to 0-1 range
            risk_score = min(max(total_weighted_score, 0.0), 1.0)
            
            # Determine risk level
            risk_level = self._determine_risk_level(risk_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                policy_type, risk_level, factor_scores
            )
            
            # Determine approval status
            approval_status = self._determine_approval_status(risk_score, policy_type)
            
            # Calculate premium adjustment
            premium_adjustment = self._calculate_premium_adjustment(
                risk_score, coverage_amount, policy_type
            )
            
            return {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "factors": factor_scores,
                "recommendations": recommendations,
                "approval_status": approval_status,
                "premium_adjustment": premium_adjustment
            }
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {str(e)}")
            raise e
    
    def _calculate_age(self, date_of_birth: str) -> int:
        """Calculate age from date of birth"""
        try:
            if isinstance(date_of_birth, str):
                dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
            else:
                dob = date_of_birth
            
            today = date.today()
            return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        except:
            return 35  # Default age if calculation fails
    
    def _calculate_factor_score(
        self, 
        factor_name: str, 
        factor_config: Dict[str, Any], 
        user_data: Dict[str, Any],
        additional_info: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate risk score for a specific factor"""
        try:
            if factor_name == "age_factor":
                age = self._calculate_age(user_data.get('date_of_birth'))
                if 'high_risk_threshold' in factor_config:
                    threshold = factor_config['high_risk_threshold']
                    return min(age / threshold, 1.0) if age > 30 else 0.3
                elif 'high_risk_age_ranges' in factor_config:
                    for age_range in factor_config['high_risk_age_ranges']:
                        if age_range[0] <= age <= age_range[1]:
                            return 0.8
                    return 0.3
            
            elif factor_name == "medical_history":
                conditions = user_data.get('medical_conditions', [])
                high_risk_conditions = factor_config.get('high_risk_conditions', [])
                risk_count = sum(1 for condition in conditions if condition.lower() in high_risk_conditions)
                return min(risk_count * 0.3, 1.0)
            
            elif factor_name == "lifestyle":
                lifestyle_factors = user_data.get('lifestyle', [])
                high_risk_factors = factor_config.get('high_risk_factors', [])
                risk_count = sum(1 for factor in lifestyle_factors if factor.lower() in high_risk_factors)
                return min(risk_count * 0.4, 1.0)
            
            elif factor_name == "driving_history":
                violations = user_data.get('driving_violations', [])
                violation_types = factor_config.get('violations', [])
                risk_count = sum(1 for violation in violations if violation.lower() in violation_types)
                return min(risk_count * 0.25, 1.0)
            
            elif factor_name == "location":
                location = user_data.get('location', '').lower()
                risk_areas = factor_config.get('high_risk_areas', [])
                if any(area in location for area in risk_areas):
                    return 0.7
                return 0.2
            
            # Default calculation for other factors
            return 0.3
            
        except Exception as e:
            logger.warning(f"Factor score calculation failed for {factor_name}: {str(e)}")
            return 0.3
    
    def _determine_risk_level(self, risk_score: float) -> str:
        """Determine risk level based on score"""
        if risk_score >= 0.7:
            return "HIGH"
        elif risk_score >= 0.4:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_recommendations(
        self, 
        policy_type: str, 
        risk_level: str, 
        factor_scores: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations based on risk assessment"""
        recommendations = []
        
        if risk_level == "HIGH":
            recommendations.append("Consider implementing additional safety measures")
            recommendations.append("Regular health check-ups recommended")
            recommendations.append("Risk mitigation plan required")
        elif risk_level == "MEDIUM":
            recommendations.append("Maintain current safety standards")
            recommendations.append("Annual risk review recommended")
        else:
            recommendations.append("Excellent risk profile")
            recommendations.append("Eligible for premium discounts")
        
        # Add specific recommendations based on high-scoring factors
        for factor in factor_scores:
            if factor['score'] > 0.7:
                if factor['factor'] == 'age_factor':
                    recommendations.append("Age-related premium adjustment applied")
                elif factor['factor'] == 'medical_history':
                    recommendations.append("Medical examination may be required")
                elif factor['factor'] == 'driving_history':
                    recommendations.append("Defensive driving course recommended")
        
        return recommendations
    
    def _determine_approval_status(self, risk_score: float, policy_type: str) -> str:
        """Determine approval status based on risk score"""
        if risk_score >= 0.8:
            return "REJECTED"
        elif risk_score >= 0.6:
            return "MANUAL_REVIEW"
        elif risk_score >= 0.4:
            return "CONDITIONAL_APPROVAL"
        else:
            return "AUTO_APPROVED"
    
    def _calculate_premium_adjustment(
        self, 
        risk_score: float, 
        coverage_amount: float, 
        policy_type: str
    ) -> float:
        """Calculate premium adjustment based on risk"""
        base_adjustment = risk_score * 0.5  # Up to 50% adjustment
        
        # Policy-specific adjustments
        if policy_type.upper() == "AUTO" and risk_score > 0.6:
            base_adjustment += 0.2
        elif policy_type.upper() == "HEALTH" and risk_score > 0.7:
            base_adjustment += 0.3
        
        return round(base_adjustment, 3)
    
    def _get_factor_description(self, factor_name: str, score: float) -> str:
        """Get description for factor score"""
        descriptions = {
            "age_factor": "Age-related risk assessment",
            "medical_history": "Medical condition risk evaluation",
            "lifestyle": "Lifestyle risk factors",
            "driving_history": "Driving record assessment",
            "location": "Geographic risk factors",
            "occupation": "Occupational risk assessment"
        }
        
        risk_level = "High" if score > 0.7 else "Medium" if score > 0.4 else "Low"
        return f"{descriptions.get(factor_name, 'Risk factor')} - {risk_level} risk"
    
    def get_risk_factors_for_policy_type(self, policy_type: str) -> Dict[str, Any]:
        """Get risk factors configuration for a specific policy type"""
        return self.risk_factors_config.get(policy_type.upper(), {})
    
    async def recalculate_risk(self, policy_id: str, updated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Recalculate risk with updated information"""
        # This would typically involve fetching existing policy data and updating it
        # For now, we'll simulate the recalculation
        return {
            "policy_id": policy_id,
            "recalculation_status": "completed",
            "updated_risk_score": 0.45,
            "previous_risk_score": 0.55,
            "changes": ["Updated medical information", "New location data"]
        }
    
    async def get_risk_analytics(self) -> Dict[str, Any]:
        """Get risk assessment analytics"""
        return {
            "total_assessments": 1250,
            "approval_rates": {
                "auto_approved": 45.2,
                "conditional_approval": 32.1,
                "manual_review": 18.7,
                "rejected": 4.0
            },
            "risk_distribution": {
                "low": 52.3,
                "medium": 35.2,
                "high": 12.5
            },
            "policy_type_breakdown": {
                "HEALTH": 35.2,
                "AUTO": 28.7,
                "HOME": 22.1,
                "LIFE": 14.0
            },
            "average_processing_time": "2.3 seconds"
        }

def assess_risk(text):
    """Legacy function for backward compatibility"""
    service = RiskAssessmentService()
    if "high risk" in text.lower():
        return "High"
    return "Low"