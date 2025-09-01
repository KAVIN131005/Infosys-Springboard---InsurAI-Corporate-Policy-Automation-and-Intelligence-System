import logging
from typing import Dict, List, Any, Optional
import re
import datetime
import random

logger = logging.getLogger(__name__)

class FraudDetectionService:
    """
    Simplified fraud detection service
    """
    
    def __init__(self):
        logger.info("Simple Fraud Detection Service initialized")
        
        # Fraud indicators
        self.suspicious_keywords = [
            "fake", "false", "lie", "fabricated", "made up", "not true",
            "exaggerated", "inflated", "staged", "intentional"
        ]
        
        self.suspicious_patterns = [
            r"exactly \$\d+\.00",  # Round amounts
            r"total loss",  # Total loss claims
            r"no witnesses",  # No witnesses
            r"cash only",  # Cash transactions
        ]
    
    async def analyze_claim_for_fraud(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze claim for fraud indicators
        """
        try:
            claim_text = claim_data.get("description", "")
            claim_amount = claim_data.get("amount", 0)
            claim_date = claim_data.get("date", "")
            claimant_id = claim_data.get("claimant_id", "")
            
            # Initialize fraud score
            fraud_score = 0.0
            fraud_indicators = []
            
            # Check for suspicious text
            text_score, text_indicators = self._analyze_text_for_fraud(claim_text)
            fraud_score += text_score
            fraud_indicators.extend(text_indicators)
            
            # Check for suspicious amounts
            amount_score, amount_indicators = self._analyze_amount_patterns(claim_amount)
            fraud_score += amount_score
            fraud_indicators.extend(amount_indicators)
            
            # Check for timing patterns
            timing_score, timing_indicators = self._analyze_timing_patterns(claim_date)
            fraud_score += timing_score
            fraud_indicators.extend(timing_indicators)
            
            # Check for duplicate patterns (simplified)
            duplicate_score, duplicate_indicators = self._check_duplicate_patterns(claim_data)
            fraud_score += duplicate_score
            fraud_indicators.extend(duplicate_indicators)
            
            # Normalize fraud score (0-1)
            fraud_score = min(fraud_score / 4.0, 1.0)
            
            # Determine fraud risk level
            if fraud_score < 0.3:
                risk_level = "low"
            elif fraud_score < 0.6:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            return {
                "fraud_score": round(fraud_score, 3),
                "risk_level": risk_level,
                "fraud_indicators": fraud_indicators,
                "analysis_details": {
                    "text_analysis_score": round(text_score, 3),
                    "amount_analysis_score": round(amount_score, 3),
                    "timing_analysis_score": round(timing_score, 3),
                    "duplicate_analysis_score": round(duplicate_score, 3)
                },
                "recommendations": self._get_fraud_recommendations(risk_level, fraud_score),
                "confidence": 0.8,
                "analysis_date": datetime.datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Fraud analysis failed: {str(e)}")
            return self._get_default_fraud_analysis()
    
    async def batch_analyze_claims(self, claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze multiple claims for fraud
        """
        try:
            results = []
            for i, claim in enumerate(claims):
                try:
                    analysis = await self.analyze_claim_for_fraud(claim)
                    analysis["claim_index"] = i
                    results.append(analysis)
                except Exception as e:
                    results.append({
                        "claim_index": i,
                        "error": str(e),
                        "fraud_score": 0.5,
                        "risk_level": "unknown"
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Batch fraud analysis failed: {str(e)}")
            return []
    
    def _analyze_text_for_fraud(self, text: str) -> tuple[float, List[str]]:
        """Analyze text for fraud indicators"""
        if not text:
            return 0.0, []
        
        text_lower = text.lower()
        score = 0.0
        indicators = []
        
        # Check for suspicious keywords
        for keyword in self.suspicious_keywords:
            if keyword in text_lower:
                score += 0.2
                indicators.append(f"Suspicious keyword found: '{keyword}'")
        
        # Check for suspicious patterns
        for pattern in self.suspicious_patterns:
            if re.search(pattern, text_lower):
                score += 0.3
                indicators.append(f"Suspicious pattern detected: {pattern}")
        
        # Check for inconsistencies (simplified)
        if "no damage" in text_lower and "total loss" in text_lower:
            score += 0.4
            indicators.append("Contradictory statements detected")
        
        # Check for excessive detail (potential over-explanation)
        word_count = len(text.split())
        if word_count > 500:
            score += 0.1
            indicators.append("Unusually detailed description")
        
        return min(score, 1.0), indicators
    
    def _analyze_amount_patterns(self, amount: float) -> tuple[float, List[str]]:
        """Analyze claim amount for suspicious patterns"""
        score = 0.0
        indicators = []
        
        if amount <= 0:
            return 0.0, []
        
        # Check for round numbers
        if amount % 1000 == 0:
            score += 0.2
            indicators.append("Round thousand amount (suspicious)")
        elif amount % 100 == 0:
            score += 0.1
            indicators.append("Round hundred amount")
        
        # Check for amounts just under policy limits (common fraud pattern)
        common_limits = [5000, 10000, 25000, 50000, 100000]
        for limit in common_limits:
            if limit - 500 <= amount <= limit - 50:
                score += 0.3
                indicators.append(f"Amount suspiciously close to policy limit: ${limit}")
        
        # Check for unusually high amounts
        if amount > 100000:
            score += 0.2
            indicators.append("Unusually high claim amount")
        
        return min(score, 1.0), indicators
    
    def _analyze_timing_patterns(self, claim_date: str) -> tuple[float, List[str]]:
        """Analyze timing patterns for fraud indicators"""
        score = 0.0
        indicators = []
        
        try:
            # Parse date (simplified)
            if claim_date:
                # Check for weekend claims (slightly more suspicious)
                if "saturday" in claim_date.lower() or "sunday" in claim_date.lower():
                    score += 0.1
                    indicators.append("Claim occurred on weekend")
                
                # Check for holiday claims
                holidays = ["christmas", "new year", "thanksgiving", "july 4"]
                for holiday in holidays:
                    if holiday in claim_date.lower():
                        score += 0.1
                        indicators.append("Claim occurred on holiday")
        
        except Exception:
            pass
        
        return min(score, 1.0), indicators
    
    def _check_duplicate_patterns(self, claim_data: Dict[str, Any]) -> tuple[float, List[str]]:
        """Check for duplicate or similar claims (simplified)"""
        score = 0.0
        indicators = []
        
        # This would normally check against a database
        # For now, simulate some basic checks
        
        description = claim_data.get("description", "").lower()
        
        # Check for template-like language
        template_phrases = [
            "i am writing to file a claim",
            "i would like to report",
            "please process my claim",
            "as per your request"
        ]
        
        for phrase in template_phrases:
            if phrase in description:
                score += 0.1
                indicators.append("Template-like language detected")
        
        return min(score, 1.0), indicators
    
    def _get_fraud_recommendations(self, risk_level: str, fraud_score: float) -> List[str]:
        """Get recommendations based on fraud risk"""
        recommendations = []
        
        if risk_level == "low":
            recommendations.extend([
                "Process claim normally",
                "Standard documentation required",
                "Routine verification sufficient"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Enhanced verification recommended",
                "Request additional documentation",
                "Consider investigator review",
                "Verify claimant identity"
            ])
        else:  # high risk
            recommendations.extend([
                "Hold claim for investigation",
                "Assign to fraud investigation unit",
                "Request comprehensive documentation",
                "Conduct field investigation",
                "Verify all provided information",
                "Consider law enforcement involvement if warranted"
            ])
        
        return recommendations
    
    def _get_default_fraud_analysis(self) -> Dict[str, Any]:
        """Get default fraud analysis when processing fails"""
        return {
            "fraud_score": 0.5,
            "risk_level": "medium",
            "fraud_indicators": ["Analysis failed - manual review required"],
            "analysis_details": {
                "text_analysis_score": 0.5,
                "amount_analysis_score": 0.5,
                "timing_analysis_score": 0.5,
                "duplicate_analysis_score": 0.5
            },
            "recommendations": ["Manual fraud review required due to analysis failure"],
            "confidence": 0.3,
            "analysis_date": datetime.datetime.now().isoformat(),
            "error": "Fraud analysis failed, using default values"
        }
