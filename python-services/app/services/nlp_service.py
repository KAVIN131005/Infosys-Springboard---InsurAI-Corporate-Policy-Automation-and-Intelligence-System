import spacy
import re
from typing import Dict, List, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
import numpy as np
import logging
from textblob import TextBlob
from collections import Counter

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        self.load_models()
        self.entity_patterns = self._load_entity_patterns()
        self.sentiment_categories = self._load_sentiment_categories()
    
    def load_models(self):
        """Load NLP models"""
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
            
            # Load sentence transformer for embeddings
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load NLP models: {str(e)}")
            self.nlp = None
            self.sentence_model = None
    
    def _load_entity_patterns(self) -> Dict[str, List[str]]:
        """Load patterns for entity extraction"""
        return {
            "policy_numbers": [
                r"[A-Z]{2,4}\d{6,10}",
                r"POL-\d{6,8}",
                r"INS\d{8,10}"
            ],
            "claim_numbers": [
                r"CLM-\d{6,8}",
                r"CLAIM\d{8,10}",
                r"C\d{10,12}"
            ],
            "amounts": [
                r"\$[\d,]+\.?\d*",
                r"USD\s*[\d,]+\.?\d*",
                r"[\d,]+\.?\d*\s*dollars?"
            ],
            "dates": [
                r"\d{1,2}[/-]\d{1,2}[/-]\d{4}",
                r"\d{4}-\d{2}-\d{2}",
                r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}"
            ],
            "phone_numbers": [
                r"\(\d{3}\)\s*\d{3}-\d{4}",
                r"\d{3}-\d{3}-\d{4}",
                r"\+\d{1,3}\s*\d{3}\s*\d{3}\s*\d{4}"
            ]
        }
    
    def _load_sentiment_categories(self) -> Dict[str, List[str]]:
        """Load sentiment analysis categories"""
        return {
            "urgency_indicators": [
                "urgent", "emergency", "immediately", "asap", "critical",
                "time-sensitive", "deadline", "rush", "priority"
            ],
            "emotional_indicators": [
                "devastated", "traumatic", "shocking", "overwhelming",
                "distressed", "anguished", "heartbroken", "furious"
            ],
            "confidence_indicators": [
                "certain", "confident", "sure", "positive", "absolutely",
                "definitely", "clearly", "obviously", "undoubtedly"
            ],
            "uncertainty_indicators": [
                "maybe", "possibly", "perhaps", "unsure", "unclear",
                "confused", "don't know", "not sure", "uncertain"
            ]
        }
    
    async def analyze_claim_text(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive NLP analysis of claim text
        """
        try:
            if not text:
                return {"error": "No text provided for analysis"}
            
            # Basic text statistics
            text_stats = self._get_text_statistics(text)
            
            # Sentiment analysis
            sentiment_analysis = self._analyze_sentiment(text)
            
            # Entity extraction
            entities = await self._extract_entities(text)
            
            # Keyword analysis
            keywords = self._extract_keywords(text)
            
            # Language complexity analysis
            complexity = self._analyze_complexity(text)
            
            # Coherence analysis
            coherence_score = self._analyze_coherence(text)
            
            # Risk indicators based on language patterns
            risk_indicators = self._detect_language_risk_indicators(text)
            
            return {
                "text_statistics": text_stats,
                "sentiment_analysis": sentiment_analysis,
                "entities": entities,
                "keywords": keywords,
                "complexity_analysis": complexity,
                "coherence_score": coherence_score,
                "risk_indicators": risk_indicators,
                "overall_score": self._calculate_overall_nlp_score(
                    sentiment_analysis, complexity, coherence_score, risk_indicators
                )
            }
            
        except Exception as e:
            logger.error(f"NLP analysis failed: {str(e)}")
            return {"error": f"Analysis failed: {str(e)}"}
    
    async def analyze_document_content(
        self, 
        text: str, 
        document_type: str
    ) -> Dict[str, Any]:
        """
        Analyze extracted document content with type-specific processing
        """
        try:
            # General text analysis
            general_analysis = await self.analyze_claim_text(text)
            
            # Document type specific analysis
            type_specific = self._analyze_by_document_type(text, document_type)
            
            # Content validation
            validation_results = self._validate_document_content(text, document_type)
            
            return {
                "general_analysis": general_analysis,
                "type_specific_analysis": type_specific,
                "content_validation": validation_results,
                "document_authenticity_indicators": self._check_authenticity_indicators(text)
            }
            
        except Exception as e:
            logger.error(f"Document content analysis failed: {str(e)}")
            return {"error": f"Document analysis failed: {str(e)}"}
    
    def _get_text_statistics(self, text: str) -> Dict[str, Any]:
        """Get basic text statistics"""
        words = text.split()
        sentences = text.split('.')
        
        return {
            "character_count": len(text),
            "word_count": len(words),
            "sentence_count": len([s for s in sentences if s.strip()]),
            "average_word_length": np.mean([len(word) for word in words]) if words else 0,
            "average_sentence_length": len(words) / len(sentences) if sentences else 0,
            "unique_words": len(set(word.lower() for word in words)),
            "lexical_diversity": len(set(word.lower() for word in words)) / len(words) if words else 0
        }
    
    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment and emotional indicators"""
        try:
            # Use TextBlob for basic sentiment
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Custom sentiment indicators
            text_lower = text.lower()
            
            urgency_score = sum(1 for indicator in self.sentiment_categories["urgency_indicators"] 
                              if indicator in text_lower) / len(self.sentiment_categories["urgency_indicators"])
            
            emotional_score = sum(1 for indicator in self.sentiment_categories["emotional_indicators"] 
                                if indicator in text_lower) / len(self.sentiment_categories["emotional_indicators"])
            
            confidence_score = sum(1 for indicator in self.sentiment_categories["confidence_indicators"] 
                                 if indicator in text_lower) / len(self.sentiment_categories["confidence_indicators"])
            
            uncertainty_score = sum(1 for indicator in self.sentiment_categories["uncertainty_indicators"] 
                                  if indicator in text_lower) / len(self.sentiment_categories["uncertainty_indicators"])
            
            # Overall sentiment score
            sentiment_score = (polarity + 1) / 2  # Normalize to 0-1
            
            return {
                "polarity": polarity,
                "subjectivity": subjectivity,
                "sentiment_score": sentiment_score,
                "sentiment_label": self._get_sentiment_label(polarity),
                "urgency_score": urgency_score,
                "emotional_intensity": emotional_score,
                "confidence_level": confidence_score,
                "uncertainty_level": uncertainty_score
            }
            
        except Exception as e:
            logger.warning(f"Sentiment analysis failed: {str(e)}")
            return {"sentiment_score": 0.5, "error": str(e)}
    
    async def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities and structured information"""
        entities = {
            "persons": [],
            "organizations": [],
            "locations": [],
            "dates": [],
            "amounts": [],
            "policy_numbers": [],
            "claim_numbers": [],
            "phone_numbers": []
        }
        
        try:
            # Use spaCy for NER
            if self.nlp:
                doc = self.nlp(text)
                
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        entities["persons"].append(ent.text)
                    elif ent.label_ == "ORG":
                        entities["organizations"].append(ent.text)
                    elif ent.label_ == "GPE" or ent.label_ == "LOC":
                        entities["locations"].append(ent.text)
                    elif ent.label_ == "DATE":
                        entities["dates"].append(ent.text)
                    elif ent.label_ == "MONEY":
                        entities["amounts"].append(ent.text)
            
            # Use regex patterns for structured data
            for entity_type, patterns in self.entity_patterns.items():
                for pattern in patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    if matches and entity_type in entities:
                        entities[entity_type].extend(matches)
            
            # Remove duplicates
            for key in entities:
                entities[key] = list(set(entities[key]))
            
        except Exception as e:
            logger.warning(f"Entity extraction failed: {str(e)}")
        
        return entities
    
    def _extract_keywords(self, text: str) -> Dict[str, Any]:
        """Extract important keywords and phrases"""
        try:
            if not self.nlp:
                return {"keywords": [], "error": "NLP model not available"}
            
            doc = self.nlp(text)
            
            # Extract meaningful tokens (no stopwords, punctuation)
            keywords = [token.lemma_.lower() for token in doc 
                       if not token.is_stop and not token.is_punct 
                       and len(token.text) > 2 and token.is_alpha]
            
            # Get frequency distribution
            keyword_freq = Counter(keywords)
            
            # Extract noun phrases
            noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks 
                           if len(chunk.text.split()) > 1]
            
            return {
                "top_keywords": keyword_freq.most_common(10),
                "noun_phrases": list(set(noun_phrases))[:10],
                "total_unique_keywords": len(set(keywords))
            }
            
        except Exception as e:
            logger.warning(f"Keyword extraction failed: {str(e)}")
            return {"keywords": [], "error": str(e)}
    
    def _analyze_complexity(self, text: str) -> Dict[str, Any]:
        """Analyze language complexity"""
        try:
            words = text.split()
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            
            # Average word length
            avg_word_length = np.mean([len(word) for word in words]) if words else 0
            
            # Average sentence length
            avg_sentence_length = len(words) / len(sentences) if sentences else 0
            
            # Syllable count (approximation)
            syllable_count = sum(self._count_syllables(word) for word in words)
            
            # Flesch Reading Ease (approximation)
            if sentences and words:
                flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * (syllable_count / len(words)))
            else:
                flesch_score = 0
            
            # Complexity indicators
            long_words = len([word for word in words if len(word) > 6])
            complex_sentences = len([s for s in sentences if len(s.split()) > 20])
            
            return {
                "average_word_length": avg_word_length,
                "average_sentence_length": avg_sentence_length,
                "flesch_reading_ease": max(0, min(100, flesch_score)),
                "long_words_percentage": (long_words / len(words) * 100) if words else 0,
                "complex_sentences_percentage": (complex_sentences / len(sentences) * 100) if sentences else 0,
                "readability_level": self._get_readability_level(flesch_score)
            }
            
        except Exception as e:
            logger.warning(f"Complexity analysis failed: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_coherence(self, text: str) -> float:
        """Analyze text coherence using sentence embeddings"""
        try:
            if not self.sentence_model:
                return 0.5
            
            sentences = [s.strip() for s in text.split('.') if s.strip() and len(s.split()) > 3]
            
            if len(sentences) < 2:
                return 0.8  # Single sentence is coherent by default
            
            # Get sentence embeddings
            embeddings = self.sentence_model.encode(sentences)
            
            # Calculate pairwise cosine similarities
            similarities = []
            for i in range(len(embeddings) - 1):
                similarity = np.dot(embeddings[i], embeddings[i + 1]) / (
                    np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[i + 1])
                )
                similarities.append(similarity)
            
            # Average similarity as coherence score
            coherence_score = np.mean(similarities) if similarities else 0.5
            
            return max(0, min(1, coherence_score))
            
        except Exception as e:
            logger.warning(f"Coherence analysis failed: {str(e)}")
            return 0.5
    
    def _detect_language_risk_indicators(self, text: str) -> List[Dict[str, Any]]:
        """Detect language patterns that might indicate risk"""
        indicators = []
        text_lower = text.lower()
        
        # Check for evasive language
        evasive_patterns = ["i think", "maybe", "not sure", "can't remember", "unclear"]
        evasive_count = sum(1 for pattern in evasive_patterns if pattern in text_lower)
        if evasive_count > 2:
            indicators.append({
                "type": "evasive_language",
                "description": "Multiple instances of uncertain or evasive language",
                "severity": "medium",
                "count": evasive_count
            })
        
        # Check for overly dramatic language
        dramatic_patterns = ["devastating", "catastrophic", "unbelievable", "worst ever", "completely destroyed"]
        dramatic_count = sum(1 for pattern in dramatic_patterns if pattern in text_lower)
        if dramatic_count > 1:
            indicators.append({
                "type": "dramatic_language",
                "description": "Overly dramatic or emotional language",
                "severity": "low",
                "count": dramatic_count
            })
        
        # Check for inconsistent tense usage
        past_tense_markers = ["was", "were", "had", "did", "went"]
        present_tense_markers = ["is", "are", "have", "do", "go"]
        past_count = sum(1 for marker in past_tense_markers if marker in text_lower)
        present_count = sum(1 for marker in present_tense_markers if marker in text_lower)
        
        if past_count > 0 and present_count > 0 and abs(past_count - present_count) < 2:
            indicators.append({
                "type": "tense_inconsistency",
                "description": "Inconsistent tense usage might indicate fabrication",
                "severity": "low"
            })
        
        return indicators
    
    def _analyze_by_document_type(self, text: str, document_type: str) -> Dict[str, Any]:
        """Perform document type specific analysis"""
        analysis = {}
        
        if document_type.lower() in ["police_report", "incident_report"]:
            analysis.update(self._analyze_police_report(text))
        elif document_type.lower() in ["medical_report", "medical_certificate"]:
            analysis.update(self._analyze_medical_report(text))
        elif document_type.lower() in ["invoice", "receipt", "bill"]:
            analysis.update(self._analyze_invoice(text))
        elif document_type.lower() in ["estimate", "quote"]:
            analysis.update(self._analyze_estimate(text))
        
        return analysis
    
    def _analyze_police_report(self, text: str) -> Dict[str, Any]:
        """Analyze police report specific content"""
        required_elements = [
            "officer", "badge", "report number", "date", "time", 
            "location", "incident", "witness", "statement"
        ]
        
        found_elements = [elem for elem in required_elements 
                         if elem.lower() in text.lower()]
        
        return {
            "document_type": "police_report",
            "completeness_score": len(found_elements) / len(required_elements),
            "found_elements": found_elements,
            "missing_elements": [elem for elem in required_elements if elem not in found_elements]
        }
    
    def _analyze_medical_report(self, text: str) -> Dict[str, Any]:
        """Analyze medical report specific content"""
        medical_terms = [
            "diagnosis", "treatment", "physician", "patient", "medical",
            "examination", "symptoms", "condition", "prognosis"
        ]
        
        found_terms = [term for term in medical_terms 
                      if term.lower() in text.lower()]
        
        return {
            "document_type": "medical_report",
            "medical_terminology_score": len(found_terms) / len(medical_terms),
            "found_medical_terms": found_terms
        }
    
    def _analyze_invoice(self, text: str) -> Dict[str, Any]:
        """Analyze invoice/receipt specific content"""
        invoice_elements = [
            "amount", "total", "tax", "date", "invoice", "receipt",
            "item", "quantity", "price", "subtotal"
        ]
        
        found_elements = [elem for elem in invoice_elements 
                         if elem.lower() in text.lower()]
        
        # Look for amount patterns
        amounts = re.findall(r'\$[\d,]+\.?\d*', text)
        
        return {
            "document_type": "invoice",
            "structure_score": len(found_elements) / len(invoice_elements),
            "found_elements": found_elements,
            "amounts_found": amounts,
            "has_proper_formatting": len(amounts) > 0 and "total" in text.lower()
        }
    
    def _analyze_estimate(self, text: str) -> Dict[str, Any]:
        """Analyze repair estimate specific content"""
        estimate_elements = [
            "estimate", "repair", "parts", "labor", "total", "cost",
            "damage", "replacement", "service", "work"
        ]
        
        found_elements = [elem for elem in estimate_elements 
                         if elem.lower() in text.lower()]
        
        return {
            "document_type": "estimate",
            "estimate_completeness": len(found_elements) / len(estimate_elements),
            "found_elements": found_elements
        }
    
    def _validate_document_content(self, text: str, document_type: str) -> Dict[str, Any]:
        """Validate document content for authenticity"""
        validation_score = 0.0
        checks = []
        
        # Check for proper date format
        date_patterns = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{4}', text)
        if date_patterns:
            validation_score += 0.2
            checks.append("Date format found")
        
        # Check for reference numbers
        ref_patterns = re.findall(r'[A-Z]{2,}\d{4,}', text)
        if ref_patterns:
            validation_score += 0.2
            checks.append("Reference numbers found")
        
        # Check for contact information
        contact_patterns = re.findall(r'\(\d{3}\)\s*\d{3}-\d{4}', text)
        if contact_patterns:
            validation_score += 0.2
            checks.append("Contact information found")
        
        # Check for professional language
        professional_terms = ["hereby", "certify", "attest", "witness", "undersigned", "official"]
        if any(term in text.lower() for term in professional_terms):
            validation_score += 0.2
            checks.append("Professional language detected")
        
        # Check for proper structure
        if len(text.split('\n')) > 5:  # Multi-line document
            validation_score += 0.2
            checks.append("Proper document structure")
        
        return {
            "validation_score": min(validation_score, 1.0),
            "passed_checks": checks,
            "authenticity_level": self._get_authenticity_level(validation_score)
        }
    
    def _check_authenticity_indicators(self, text: str) -> Dict[str, Any]:
        """Check for document authenticity indicators"""
        indicators = {
            "watermarks": "watermark" in text.lower(),
            "official_seals": any(term in text.lower() for term in ["seal", "stamp", "certified"]),
            "signatures": "signature" in text.lower() or "signed" in text.lower(),
            "letterhead": any(term in text.lower() for term in ["letterhead", "official", "department"]),
            "authorization": any(term in text.lower() for term in ["authorized", "approved", "verified"])
        }
        
        authenticity_score = sum(indicators.values()) / len(indicators)
        
        return {
            "indicators": indicators,
            "authenticity_score": authenticity_score,
            "likely_authentic": authenticity_score > 0.5
        }
    
    # Helper methods
    def _get_sentiment_label(self, polarity: float) -> str:
        """Get sentiment label from polarity score"""
        if polarity > 0.1:
            return "positive"
        elif polarity < -0.1:
            return "negative"
        else:
            return "neutral"
    
    def _count_syllables(self, word: str) -> int:
        """Approximate syllable count for a word"""
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        if word[0] in vowels:
            count += 1
        for index in range(1, len(word)):
            if word[index] in vowels and word[index - 1] not in vowels:
                count += 1
        if word.endswith("e"):
            count -= 1
        if count == 0:
            count += 1
        return count
    
    def _get_readability_level(self, flesch_score: float) -> str:
        """Get readability level from Flesch score"""
        if flesch_score >= 90:
            return "very_easy"
        elif flesch_score >= 80:
            return "easy"
        elif flesch_score >= 70:
            return "fairly_easy"
        elif flesch_score >= 60:
            return "standard"
        elif flesch_score >= 50:
            return "fairly_difficult"
        elif flesch_score >= 30:
            return "difficult"
        else:
            return "very_difficult"
    
    def _get_authenticity_level(self, validation_score: float) -> str:
        """Get authenticity level from validation score"""
        if validation_score >= 0.8:
            return "high"
        elif validation_score >= 0.6:
            return "medium"
        elif validation_score >= 0.4:
            return "low"
        else:
            return "very_low"
    
    def _calculate_overall_nlp_score(
        self, 
        sentiment_analysis: Dict[str, Any], 
        complexity: Dict[str, Any], 
        coherence_score: float, 
        risk_indicators: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate overall NLP analysis score"""
        try:
            # Base score from coherence
            base_score = coherence_score
            
            # Adjust for sentiment factors
            sentiment_score = sentiment_analysis.get('sentiment_score', 0.5)
            uncertainty = sentiment_analysis.get('uncertainty_level', 0)
            
            # Adjust for complexity (moderate complexity is good)
            readability = complexity.get('flesch_reading_ease', 50) / 100
            complexity_adjustment = 1 - abs(readability - 0.7)  # Prefer moderate complexity
            
            # Adjust for risk indicators
            risk_penalty = len(risk_indicators) * 0.1
            
            # Calculate final score
            final_score = (base_score * 0.4 + 
                          sentiment_score * 0.3 + 
                          complexity_adjustment * 0.2 + 
                          (1 - uncertainty) * 0.1 - 
                          risk_penalty)
            
            final_score = max(0, min(1, final_score))
            
            return {
                "overall_score": round(final_score, 3),
                "confidence_level": self._get_confidence_level(final_score),
                "analysis_quality": "high" if final_score > 0.7 else "medium" if final_score > 0.4 else "low"
            }
            
        except Exception as e:
            logger.warning(f"Overall score calculation failed: {str(e)}")
            return {"overall_score": 0.5, "confidence_level": "medium", "error": str(e)}
    
    def _get_confidence_level(self, score: float) -> str:
        """Get confidence level from score"""
        if score >= 0.8:
            return "very_high"
        elif score >= 0.6:
            return "high"
        elif score >= 0.4:
            return "medium"
        elif score >= 0.2:
            return "low"
        else:
            return "very_low"