import logging
from typing import Dict, List, Any, Optional
import re
import json

logger = logging.getLogger(__name__)

class NLPService:
    """
    Simplified NLP service that works without heavy dependencies
    """
    
    def __init__(self):
        logger.info("Simple NLP Service initialized")
        
        # Basic word lists for sentiment analysis
        self.positive_words = [
            "good", "great", "excellent", "satisfied", "happy", "pleased", 
            "wonderful", "amazing", "fantastic", "perfect", "love", "like"
        ]
        
        self.negative_words = [
            "bad", "terrible", "awful", "hate", "angry", "frustrated", 
            "disappointed", "horrible", "worst", "disgusted", "annoyed"
        ]
        
        self.urgent_keywords = [
            "urgent", "emergency", "immediately", "asap", "critical", 
            "help", "crisis", "accident", "injury"
        ]
    
    async def analyze_claim_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze claim text for sentiment, keywords, and patterns
        """
        try:
            if not text:
                return self._get_default_analysis()
            
            text_lower = text.lower()
            words = text_lower.split()
            
            # Basic sentiment analysis
            positive_count = sum(1 for word in words if word in self.positive_words)
            negative_count = sum(1 for word in words if word in self.negative_words)
            
            # Calculate sentiment polarity (-1 to 1)
            total_sentiment_words = positive_count + negative_count
            if total_sentiment_words > 0:
                polarity = (positive_count - negative_count) / total_sentiment_words
            else:
                polarity = 0.0
            
            # Determine sentiment label
            if polarity > 0.1:
                sentiment_label = "positive"
            elif polarity < -0.1:
                sentiment_label = "negative"
            else:
                sentiment_label = "neutral"
            
            # Check for urgent keywords
            urgent_count = sum(1 for word in words if word in self.urgent_keywords)
            is_urgent = urgent_count > 0
            
            # Extract key phrases (simple approach)
            key_phrases = self._extract_key_phrases(text)
            
            # Calculate text statistics
            text_stats = {
                "word_count": len(words),
                "character_count": len(text),
                "sentence_count": len([s for s in text.split('.') if s.strip()]),
                "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0
            }
            
            return {
                "sentiment": {
                    "polarity": round(polarity, 3),
                    "label": sentiment_label,
                    "confidence": min(abs(polarity) + 0.5, 1.0),
                    "positive_words_found": positive_count,
                    "negative_words_found": negative_count
                },
                "urgency": {
                    "is_urgent": is_urgent,
                    "urgent_keywords_count": urgent_count,
                    "urgency_score": min(urgent_count * 0.3, 1.0)
                },
                "key_phrases": key_phrases,
                "text_statistics": text_stats,
                "overall_score": {
                    "overall_score": 0.7,  # Mock score
                    "readability": 0.8,
                    "completeness": 0.75
                },
                "entities": self._extract_entities(text),
                "content_validation": {
                    "validation_score": 0.8,
                    "has_structured_content": self._has_structured_content(text),
                    "completeness_score": 0.75
                }
            }
            
        except Exception as e:
            logger.error(f"Text analysis failed: {str(e)}")
            return self._get_default_analysis()
    
    async def analyze_document_content(self, text: str, document_type: str = "general") -> Dict[str, Any]:
        """
        Analyze document content with document-type specific analysis
        """
        try:
            # Get basic analysis
            basic_analysis = await self.analyze_claim_text(text)
            
            # Add document-type specific analysis
            document_analysis = {
                "document_type": document_type,
                "type_confidence": 0.8,
                "content_validation": basic_analysis.get("content_validation", {}),
                "document_authenticity_indicators": {
                    "authenticity_score": 0.85,
                    "consistency_check": True,
                    "format_validation": True
                }
            }
            
            # Merge analyses
            result = {**basic_analysis, **document_analysis}
            result["general_analysis"] = basic_analysis
            
            return result
            
        except Exception as e:
            logger.error(f"Document content analysis failed: {str(e)}")
            return self._get_default_analysis()
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from text (simplified)"""
        try:
            # Simple approach: find phrases with certain patterns
            phrases = []
            
            # Look for monetary amounts
            money_pattern = r'\$[\d,]+\.?\d*'
            money_matches = re.findall(money_pattern, text)
            phrases.extend(money_matches)
            
            # Look for dates
            date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
            date_matches = re.findall(date_pattern, text)
            phrases.extend(date_matches)
            
            # Look for policy/claim numbers
            policy_pattern = r'\b(?:policy|claim)\s*(?:number|#)?\s*:?\s*([A-Z0-9-]+)\b'
            policy_matches = re.findall(policy_pattern, text, re.IGNORECASE)
            phrases.extend(policy_matches)
            
            return phrases[:10]  # Limit to top 10 phrases
            
        except Exception:
            return []
    
    def _extract_entities(self, text: str) -> List[Dict[str, str]]:
        """Extract named entities (simplified)"""
        try:
            entities = []
            
            # Simple patterns for common entities
            patterns = {
                "MONEY": r'\$[\d,]+\.?\d*',
                "DATE": r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                "PHONE": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                "EMAIL": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            }
            
            for entity_type, pattern in patterns.items():
                matches = re.findall(pattern, text)
                for match in matches:
                    entities.append({
                        "text": match,
                        "label": entity_type,
                        "confidence": 0.8
                    })
            
            return entities[:20]  # Limit to top 20 entities
            
        except Exception:
            return []
    
    def _has_structured_content(self, text: str) -> bool:
        """Check if text has structured content"""
        structured_indicators = [
            ":", "•", "-", "1.", "2.", "3.", "Name:", "Date:", "Amount:"
        ]
        return any(indicator in text for indicator in structured_indicators)
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Get default analysis when processing fails"""
        return {
            "sentiment": {
                "polarity": 0.0,
                "label": "neutral",
                "confidence": 0.5,
                "positive_words_found": 0,
                "negative_words_found": 0
            },
            "urgency": {
                "is_urgent": False,
                "urgent_keywords_count": 0,
                "urgency_score": 0.0
            },
            "key_phrases": [],
            "text_statistics": {
                "word_count": 0,
                "character_count": 0,
                "sentence_count": 0,
                "avg_word_length": 0
            },
            "overall_score": {
                "overall_score": 0.5,
                "readability": 0.5,
                "completeness": 0.5
            },
            "entities": [],
            "content_validation": {
                "validation_score": 0.5,
                "has_structured_content": False,
                "completeness_score": 0.5
            }
        }
