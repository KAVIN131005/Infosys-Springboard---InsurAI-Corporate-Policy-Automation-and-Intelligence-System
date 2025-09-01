import pickle
import re
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FraudDetectionService:
    def __init__(self):
        self.model_path = Path("app/models/fraud_model.pkl")
        self.fraud_patterns = self._load_fraud_patterns()
        self.load_model()
    
    def load_model(self):
        """Load the fraud detection model"""
        try:
            if self.model_path.exists():
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Fraud detection model loaded successfully")
            else:
                logger.warning("Fraud model not found, using rule-based detection")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to load fraud model: {str(e)}")
            self.model = None
    
    def _load_fraud_patterns(self) -> Dict[str, List[str]]:
        """Load fraud detection patterns and keywords"""
        return {
            "suspicious_keywords": [
                "total loss", "complete destruction", "stolen immediately",
                "brand new", "just purchased", "no witnesses",
                "hit and run", "uninsured driver", "vandalism",
                "mysterious circumstances", "suddenly appeared",
                "perfect storm", "worst case scenario"
            ],
            "timing_patterns": [
                "same day", "immediately after", "right after purchase",
                "day before expiry", "just renewed", "emergency situation"
            ],
            "amount_indicators": [
                "exact amount", "round number", "maximum coverage",
                "total policy limit", "coincidentally", "precisely"
            ],
            "behavioral_flags": [
                "very emotional", "overly detailed", "inconsistent story",
                "avoided questions", "defensive", "rushed settlement",
                "multiple claims", "pattern of losses"
            ]
        }
    
    async def analyze_claim_fraud(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive fraud analysis of a claim
        """
        try:
            fraud_score = 0.0
            risk_indicators = []
            
            # Text analysis of claim description
            description = claim_data.get('description', '')
            text_score, text_indicators = self._analyze_claim_text(description)
            fraud_score += text_score * 0.3
            risk_indicators.extend(text_indicators)
            
            # Amount analysis
            amount = claim_data.get('amount', 0)
            amount_score, amount_indicators = self._analyze_claim_amount(amount, claim_data)
            fraud_score += amount_score * 0.25
            risk_indicators.extend(amount_indicators)
            
            # Timing analysis
            timing_score, timing_indicators = self._analyze_timing_patterns(claim_data)
            fraud_score += timing_score * 0.2
            risk_indicators.extend(timing_indicators)
            
            # Claimant history analysis
            claimant_info = claim_data.get('claimant_info', {})
            history_score, history_indicators = self._analyze_claimant_history(claimant_info)
            fraud_score += history_score * 0.15
            risk_indicators.extend(history_indicators)
            
            # Incident details analysis
            incident_details = claim_data.get('incident_details', {})
            incident_score, incident_indicators = self._analyze_incident_details(incident_details)
            fraud_score += incident_score * 0.1
            risk_indicators.extend(incident_indicators)
            
            # Normalize fraud score to 0-1 range
            fraud_probability = min(max(fraud_score, 0.0), 1.0)
            
            return {
                "fraud_probability": round(fraud_probability, 3),
                "risk_indicators": risk_indicators,
                "analysis_details": {
                    "text_analysis_score": text_score,
                    "amount_analysis_score": amount_score,
                    "timing_analysis_score": timing_score,
                    "history_analysis_score": history_score,
                    "incident_analysis_score": incident_score
                }
            }
            
        except Exception as e:
            logger.error(f"Fraud analysis failed: {str(e)}")
            return {
                "fraud_probability": 0.5,
                "risk_indicators": [{"type": "error", "description": "Analysis failed"}],
                "analysis_details": {}
            }
    
    def _analyze_claim_text(self, description: str) -> tuple[float, List[Dict[str, Any]]]:
        """Analyze claim description text for fraud indicators"""
        indicators = []
        score = 0.0
        
        description_lower = description.lower()
        
        # Check for suspicious keywords
        suspicious_count = 0
        for keyword in self.fraud_patterns["suspicious_keywords"]:
            if keyword in description_lower:
                suspicious_count += 1
                indicators.append({
                    "type": "suspicious_language",
                    "description": f"Contains suspicious phrase: '{keyword}'",
                    "severity": "medium"
                })
        
        if suspicious_count > 0:
            score += min(suspicious_count * 0.15, 0.6)
        
        # Check for timing-related fraud indicators
        timing_count = 0
        for pattern in self.fraud_patterns["timing_patterns"]:
            if pattern in description_lower:
                timing_count += 1
                indicators.append({
                    "type": "suspicious_timing",
                    "description": f"Suspicious timing indicator: '{pattern}'",
                    "severity": "high"
                })
        
        if timing_count > 0:
            score += min(timing_count * 0.2, 0.8)
        
        # Check for amount-related indicators
        amount_pattern_count = 0
        for pattern in self.fraud_patterns["amount_indicators"]:
            if pattern in description_lower:
                amount_pattern_count += 1
                indicators.append({
                    "type": "amount_suspicion",
                    "description": f"Suspicious amount reference: '{pattern}'",
                    "severity": "medium"
                })
        
        if amount_pattern_count > 0:
            score += min(amount_pattern_count * 0.1, 0.4)
        
        # Analyze text complexity and coherence
        if len(description.split()) < 10:
            score += 0.1
            indicators.append({
                "type": "insufficient_detail",
                "description": "Claim description lacks sufficient detail",
                "severity": "low"
            })
        
        # Check for excessive detail (could indicate fabrication)
        if len(description.split()) > 200:
            score += 0.15
            indicators.append({
                "type": "excessive_detail",
                "description": "Unusually detailed description may indicate fabrication",
                "severity": "medium"
            })
        
        return score, indicators
    
    def _analyze_claim_amount(self, amount: float, claim_data: Dict[str, Any]) -> tuple[float, List[Dict[str, Any]]]:
        """Analyze claim amount for fraud indicators"""
        indicators = []
        score = 0.0
        
        # Check for round numbers (potential red flag)
        if amount % 1000 == 0 and amount > 5000:
            score += 0.2
            indicators.append({
                "type": "round_amount",
                "description": f"Claim amount is a round number: ${amount:,.2f}",
                "severity": "medium"
            })
        
        # Check for unusually high amounts
        if amount > 100000:
            score += 0.3
            indicators.append({
                "type": "high_amount",
                "description": f"Unusually high claim amount: ${amount:,.2f}",
                "severity": "high"
            })
        
        # Check for amounts just under policy limits (if available)
        # This would require policy information from claim_data
        policy_limit = claim_data.get('policy_limit')
        if policy_limit and amount > policy_limit * 0.95:
            score += 0.4
            indicators.append({
                "type": "near_policy_limit",
                "description": f"Claim amount very close to policy limit",
                "severity": "high"
            })
        
        # Check for very small amounts (nuisance claims)
        if 0 < amount < 500:
            score += 0.1
            indicators.append({
                "type": "small_amount",
                "description": f"Very small claim amount: ${amount:,.2f}",
                "severity": "low"
            })
        
        return score, indicators
    
    def _analyze_timing_patterns(self, claim_data: Dict[str, Any]) -> tuple[float, List[Dict[str, Any]]]:
        """Analyze timing patterns for fraud indicators"""
        indicators = []
        score = 0.0
        
        # Check if claim was filed very quickly after incident
        incident_date = claim_data.get('incident_date')
        claim_date = claim_data.get('claim_date')
        
        if incident_date and claim_date:
            try:
                incident_dt = datetime.strptime(incident_date, '%Y-%m-%d')
                claim_dt = datetime.strptime(claim_date, '%Y-%m-%d')
                
                time_diff = (claim_dt - incident_dt).days
                
                if time_diff < 1:
                    score += 0.2
                    indicators.append({
                        "type": "quick_filing",
                        "description": "Claim filed very quickly after incident",
                        "severity": "medium"
                    })
                elif time_diff > 30:
                    score += 0.1
                    indicators.append({
                        "type": "delayed_filing",
                        "description": f"Claim filed {time_diff} days after incident",
                        "severity": "low"
                    })
            except:
                pass
        
        # Check for claims filed near policy expiry
        policy_expiry = claim_data.get('policy_expiry_date')
        if policy_expiry and claim_date:
            try:
                expiry_dt = datetime.strptime(policy_expiry, '%Y-%m-%d')
                claim_dt = datetime.strptime(claim_date, '%Y-%m-%d')
                
                days_to_expiry = (expiry_dt - claim_dt).days
                
                if 0 <= days_to_expiry <= 30:
                    score += 0.3
                    indicators.append({
                        "type": "near_expiry_claim",
                        "description": f"Claim filed {days_to_expiry} days before policy expiry",
                        "severity": "high"
                    })
            except:
                pass
        
        return score, indicators
    
    def _analyze_claimant_history(self, claimant_info: Dict[str, Any]) -> tuple[float, List[Dict[str, Any]]]:
        """Analyze claimant's claim history for patterns"""
        indicators = []
        score = 0.0
        
        # Check number of previous claims
        previous_claims = claimant_info.get('previous_claims_count', 0)
        
        if previous_claims > 3:
            score += 0.3
            indicators.append({
                "type": "frequent_claimant",
                "description": f"Claimant has {previous_claims} previous claims",
                "severity": "high"
            })
        elif previous_claims > 1:
            score += 0.1
            indicators.append({
                "type": "multiple_claims",
                "description": f"Claimant has {previous_claims} previous claims",
                "severity": "medium"
            })
        
        # Check for recent claims
        last_claim_date = claimant_info.get('last_claim_date')
        if last_claim_date:
            try:
                last_claim_dt = datetime.strptime(last_claim_date, '%Y-%m-%d')
                days_since_last = (datetime.now() - last_claim_dt).days
                
                if days_since_last < 90:
                    score += 0.2
                    indicators.append({
                        "type": "recent_previous_claim",
                        "description": f"Previous claim filed {days_since_last} days ago",
                        "severity": "medium"
                    })
            except:
                pass
        
        # Check claimant credit score (if available)
        credit_score = claimant_info.get('credit_score')
        if credit_score and credit_score < 600:
            score += 0.1
            indicators.append({
                "type": "poor_credit",
                "description": "Claimant has poor credit score",
                "severity": "low"
            })
        
        return score, indicators
    
    def _analyze_incident_details(self, incident_details: Dict[str, Any]) -> tuple[float, List[Dict[str, Any]]]:
        """Analyze incident details for inconsistencies"""
        indicators = []
        score = 0.0
        
        # Check for incidents in high-crime areas
        location = incident_details.get('location', '').lower()
        if any(keyword in location for keyword in ['parking lot', 'isolated', 'remote', 'unlit']):
            score += 0.1
            indicators.append({
                "type": "suspicious_location",
                "description": "Incident occurred in potentially high-risk location",
                "severity": "low"
            })
        
        # Check for lack of witnesses
        witnesses = incident_details.get('witnesses', [])
        if not witnesses:
            score += 0.2
            indicators.append({
                "type": "no_witnesses",
                "description": "No witnesses reported for the incident",
                "severity": "medium"
            })
        
        # Check for police report
        police_report = incident_details.get('police_report_number')
        if not police_report and incident_details.get('severity', '').lower() in ['major', 'severe']:
            score += 0.15
            indicators.append({
                "type": "no_police_report",
                "description": "No police report for major incident",
                "severity": "medium"
            })
        
        return score, indicators
    
    async def analyze_simple_text(self, text: str) -> Dict[str, Any]:
        """Simple text analysis for backward compatibility"""
        score, indicators = self._analyze_claim_text(text)
        return {
            "fraud_probability": score,
            "risk_indicators": indicators
        }

def detect_fraud(claim_text):
    """Legacy function for backward compatibility"""
    if "fraud" in claim_text.lower():
        return True
    return False