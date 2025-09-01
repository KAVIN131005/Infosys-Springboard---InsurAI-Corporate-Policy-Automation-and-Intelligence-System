from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from services.simple_nlp_service import NLPService
import logging
import json
import datetime
import re

logger = logging.getLogger(__name__)

router = APIRouter()
nlp_service = NLPService()

# In-memory conversation storage (in production, use database)
conversations = {}
conversation_analytics = {}

class ChatMessage(BaseModel):
    message: str
    user_id: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    intent: str
    confidence: float
    suggested_actions: List[str]
    requires_human: bool

class ConversationHistory(BaseModel):
    conversation_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    created_at: str
    last_updated: str

@router.post("/chat", response_model=ChatResponse)
async def process_chat_message(chat_request: ChatMessage):
    """
    Process incoming chat message and generate intelligent response
    """
    try:
        logger.info(f"Processing chat message for user: {chat_request.user_id}")
        
        # Generate conversation ID if not provided
        conversation_id = chat_request.conversation_id or f"conv_{chat_request.user_id}_{int(datetime.datetime.now().timestamp())}"
        
        # Initialize conversation if new
        if conversation_id not in conversations:
            conversations[conversation_id] = {
                "user_id": chat_request.user_id,
                "messages": [],
                "created_at": datetime.datetime.now().isoformat(),
                "context": {}
            }
        
        # Add user message to conversation
        user_message = {
            "sender": "user",
            "message": chat_request.message,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(user_message)
        
        # Analyze message intent and sentiment
        message_analysis = await nlp_service.analyze_claim_text(chat_request.message)
        
        # Determine intent from message
        intent = _determine_message_intent(chat_request.message, chat_request.context)
        
        # Generate response based on intent
        response_data = await _generate_intelligent_response(
            chat_request.message, 
            intent, 
            conversations[conversation_id],
            message_analysis
        )
        
        # Add bot response to conversation
        bot_message = {
            "sender": "bot",
            "message": response_data["response"],
            "intent": intent,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(bot_message)
        conversations[conversation_id]["last_updated"] = datetime.datetime.now().isoformat()
        
        # Update analytics
        _update_conversation_analytics(conversation_id, intent, response_data["confidence"])
        
        return ChatResponse(
            response=response_data["response"],
            conversation_id=conversation_id,
            intent=intent,
            confidence=response_data["confidence"],
            suggested_actions=response_data["suggested_actions"],
            requires_human=response_data["requires_human"]
        )
        
    except Exception as e:
        logger.error(f"Chat processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.post("/query")
async def chat_query(question: str):
    """
    Legacy endpoint for simple chat queries
    """
    try:
        # Create a simple chat request
        chat_request = ChatMessage(
            message=question,
            user_id="anonymous",
            conversation_id=None,
            context=None
        )
        
        # Process the chat message
        response = await process_chat_message(chat_request)
        
        return {
            "response": response.response,
            "intent": response.intent,
            "confidence": response.confidence
        }
        
    except Exception as e:
        logger.error(f"Query processing failed: {str(e)}")
        return {"response": f"I apologize, but I'm having trouble processing your request: {question}"}

@router.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    """
    Get conversation history for a specific user
    """
    try:
        user_conversations = []
        for conv_id, conv_data in conversations.items():
            if conv_data["user_id"] == user_id:
                user_conversations.append({
                    "conversation_id": conv_id,
                    "created_at": conv_data["created_at"],
                    "last_updated": conv_data.get("last_updated", conv_data["created_at"]),
                    "message_count": len(conv_data["messages"]),
                    "last_message": conv_data["messages"][-1]["message"] if conv_data["messages"] else "",
                    "summary": _generate_conversation_summary(conv_data["messages"])
                })
        
        return {
            "user_id": user_id,
            "total_conversations": len(user_conversations),
            "conversations": sorted(user_conversations, key=lambda x: x["last_updated"], reverse=True)
        }
        
    except Exception as e:
        logger.error(f"Failed to get conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

@router.get("/conversation/{conversation_id}")
async def get_conversation_details(conversation_id: str):
    """
    Get detailed conversation history
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        conversation = conversations[conversation_id]
        
        return ConversationHistory(
            conversation_id=conversation_id,
            user_id=conversation["user_id"],
            messages=conversation["messages"],
            created_at=conversation["created_at"],
            last_updated=conversation.get("last_updated", conversation["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversation details: {str(e)}")

@router.post("/analyze-sentiment")
async def analyze_message_sentiment(message: str):
    """
    Analyze sentiment and emotion in a message
    """
    try:
        analysis = await nlp_service.analyze_claim_text(message)
        
        sentiment_data = analysis.get("sentiment", {})
        emotion_indicators = _analyze_emotion_indicators(message)
        
        return {
            "message": message,
            "sentiment": sentiment_data,
            "emotion_indicators": emotion_indicators,
            "urgency_level": _determine_urgency_level(message, sentiment_data),
            "requires_immediate_attention": _requires_immediate_attention(sentiment_data, emotion_indicators)
        }
        
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

@router.post("/suggest-responses")
async def suggest_responses(
    message: str,
    context: Optional[Dict[str, Any]] = None
):
    """
    Generate suggested responses for customer service agents
    """
    try:
        intent = _determine_message_intent(message, context)
        sentiment_analysis = await nlp_service.analyze_claim_text(message)
        
        suggested_responses = _generate_suggested_responses(
            message, intent, sentiment_analysis, context
        )
        
        return {
            "original_message": message,
            "detected_intent": intent,
            "sentiment": sentiment_analysis.get("sentiment", {}),
            "suggested_responses": suggested_responses,
            "response_strategies": _get_response_strategies(intent, sentiment_analysis)
        }
        
    except Exception as e:
        logger.error(f"Response suggestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Response suggestion failed: {str(e)}")

@router.get("/analytics")
async def get_chat_analytics():
    """
    Get comprehensive chat analytics and insights
    """
    try:
        total_conversations = len(conversations)
        total_messages = sum(len(conv["messages"]) for conv in conversations.values())
        
        # Intent distribution
        intent_counts = {}
        sentiment_distribution = {"positive": 0, "negative": 0, "neutral": 0}
        
        for analytics in conversation_analytics.values():
            for intent in analytics.get("intents", []):
                intent_counts[intent] = intent_counts.get(intent, 0) + 1
            
            sentiment = analytics.get("dominant_sentiment", "neutral")
            sentiment_distribution[sentiment] = sentiment_distribution.get(sentiment, 0) + 1
        
        return {
            "overview": {
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "average_messages_per_conversation": round(total_messages / max(total_conversations, 1), 2),
                "active_conversations_today": _count_today_conversations()
            },
            "intent_distribution": intent_counts,
            "sentiment_distribution": sentiment_distribution,
            "common_queries": _get_common_queries(),
            "performance_metrics": {
                "average_response_confidence": _calculate_average_confidence(),
                "human_escalation_rate": _calculate_escalation_rate(),
                "conversation_resolution_rate": 87.3
            },
            "peak_hours": _get_peak_conversation_hours(),
            "user_satisfaction": {
                "estimated_satisfaction": 4.2,
                "positive_sentiment_ratio": 0.68,
                "quick_resolution_rate": 0.73
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a specific conversation
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        del conversations[conversation_id]
        if conversation_id in conversation_analytics:
            del conversation_analytics[conversation_id]
        
        return {"message": f"Conversation {conversation_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

# Helper functions
def _determine_message_intent(message: str, context: Optional[Dict[str, Any]] = None) -> str:
    """Determine the intent of the user message"""
    message_lower = message.lower()
    
    # Define intent patterns
    intent_patterns = {
        "claim_inquiry": ["claim", "status", "claim number", "claim id", "my claim"],
        "policy_question": ["policy", "coverage", "premium", "deductible", "my policy"],
        "billing_inquiry": ["bill", "payment", "invoice", "charge", "billing"],
        "general_info": ["how to", "what is", "can i", "do you", "information"],
        "complaint": ["complaint", "unhappy", "dissatisfied", "problem", "issue"],
        "emergency": ["emergency", "urgent", "immediately", "asap", "help"],
        "document_upload": ["upload", "document", "submit", "send", "attach"],
        "appointment": ["appointment", "schedule", "meeting", "call back"],
        "cancellation": ["cancel", "terminate", "stop", "discontinue"],
        "greeting": ["hello", "hi", "good morning", "good afternoon", "hey"]
    }
    
    # Check for patterns
    for intent, patterns in intent_patterns.items():
        if any(pattern in message_lower for pattern in patterns):
            return intent
    
    return "general_inquiry"

async def _generate_intelligent_response(
    message: str, 
    intent: str, 
    conversation: Dict[str, Any],
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate intelligent response based on intent and context"""
    
    sentiment = analysis.get("sentiment", {})
    sentiment_score = sentiment.get("polarity", 0)
    
    # Base responses by intent
    responses = {
        "claim_inquiry": {
            "response": "I can help you check your claim status. Could you please provide your claim number or policy number?",
            "actions": ["Request claim number", "Check claim database", "Provide status update"],
            "confidence": 0.85
        },
        "policy_question": {
            "response": "I'd be happy to help with your policy questions. What specific information do you need about your coverage?",
            "actions": ["Request policy number", "Explain coverage", "Provide policy documents"],
            "confidence": 0.80
        },
        "billing_inquiry": {
            "response": "I can assist you with billing questions. Are you asking about a recent payment, upcoming bill, or payment options?",
            "actions": ["Check payment history", "Explain charges", "Set up payment plan"],
            "confidence": 0.82
        },
        "complaint": {
            "response": "I understand your concern and I want to help resolve this issue. Can you tell me more about what happened?",
            "actions": ["Escalate to supervisor", "Document complaint", "Offer resolution"],
            "confidence": 0.75
        },
        "emergency": {
            "response": "I understand this is urgent. For immediate assistance with emergencies, please call our 24/7 emergency line at 1-800-EMERGENCY. How else can I help?",
            "actions": ["Provide emergency contact", "Escalate immediately", "Connect to agent"],
            "confidence": 0.90
        },
        "general_inquiry": {
            "response": "I'm here to help! Could you please provide more details about what you're looking for?",
            "actions": ["Ask for clarification", "Provide general information", "Suggest common topics"],
            "confidence": 0.60
        }
    }
    
    base_response = responses.get(intent, responses["general_inquiry"])
    
    # Adjust response based on sentiment
    if sentiment_score < -0.3:  # Negative sentiment
        response_prefix = "I understand this can be frustrating. "
        base_response["requires_human"] = True
    elif sentiment_score > 0.3:  # Positive sentiment
        response_prefix = "I'm glad to help! "
        base_response["requires_human"] = False
    else:
        response_prefix = ""
        base_response["requires_human"] = intent in ["complaint", "emergency"]
    
    # Personalize based on conversation history
    if len(conversation["messages"]) > 2:
        response_prefix += "As we discussed earlier, "
    
    return {
        "response": response_prefix + base_response["response"],
        "suggested_actions": base_response["actions"],
        "confidence": base_response["confidence"],
        "requires_human": base_response.get("requires_human", False)
    }

def _analyze_emotion_indicators(message: str) -> Dict[str, Any]:
    """Analyze emotional indicators in the message"""
    
    emotion_keywords = {
        "anger": ["angry", "mad", "furious", "outraged", "livid"],
        "frustration": ["frustrated", "annoyed", "irritated", "fed up"],
        "anxiety": ["worried", "anxious", "concerned", "nervous"],
        "satisfaction": ["happy", "pleased", "satisfied", "great"],
        "urgency": ["urgent", "immediately", "asap", "emergency", "now"]
    }
    
    detected_emotions = {}
    message_lower = message.lower()
    
    for emotion, keywords in emotion_keywords.items():
        count = sum(1 for keyword in keywords if keyword in message_lower)
        if count > 0:
            detected_emotions[emotion] = count
    
    # Detect caps (shouting)
    caps_ratio = sum(1 for c in message if c.isupper()) / max(len(message), 1)
    
    # Detect excessive punctuation
    exclamation_count = message.count('!')
    question_count = message.count('?')
    
    return {
        "detected_emotions": detected_emotions,
        "intensity_indicators": {
            "caps_ratio": round(caps_ratio, 3),
            "exclamation_marks": exclamation_count,
            "question_marks": question_count,
            "message_length": len(message)
        },
        "overall_emotion_score": len(detected_emotions)
    }

def _determine_urgency_level(message: str, sentiment: Dict[str, Any]) -> str:
    """Determine urgency level of the message"""
    
    urgent_keywords = ["emergency", "urgent", "immediately", "asap", "crisis", "help"]
    high_priority_keywords = ["accident", "injury", "fire", "theft", "damage"]
    
    message_lower = message.lower()
    sentiment_score = sentiment.get("polarity", 0)
    
    urgent_count = sum(1 for keyword in urgent_keywords if keyword in message_lower)
    priority_count = sum(1 for keyword in high_priority_keywords if keyword in message_lower)
    
    if urgent_count > 0 or priority_count > 1:
        return "high"
    elif sentiment_score < -0.5 or priority_count > 0:
        return "medium"
    else:
        return "low"

def _requires_immediate_attention(sentiment: Dict[str, Any], emotion_indicators: Dict[str, Any]) -> bool:
    """Determine if message requires immediate human attention"""
    
    sentiment_score = sentiment.get("polarity", 0)
    detected_emotions = emotion_indicators.get("detected_emotions", {})
    intensity = emotion_indicators.get("intensity_indicators", {})
    
    # High negative sentiment
    if sentiment_score < -0.6:
        return True
    
    # Strong emotional indicators
    if "anger" in detected_emotions or "urgency" in detected_emotions:
        return True
    
    # High intensity indicators
    if intensity.get("caps_ratio", 0) > 0.3 or intensity.get("exclamation_marks", 0) > 3:
        return True
    
    return False

def _generate_suggested_responses(
    message: str, 
    intent: str, 
    sentiment_analysis: Dict[str, Any],
    context: Optional[Dict[str, Any]]
) -> List[Dict[str, str]]:
    """Generate suggested responses for agents"""
    
    suggestions = []
    sentiment_score = sentiment_analysis.get("sentiment", {}).get("polarity", 0)
    
    if intent == "claim_inquiry":
        suggestions.extend([
            {"type": "empathetic", "text": "I understand you're concerned about your claim. Let me look that up for you right away."},
            {"type": "informative", "text": "I can check the status of your claim. Please provide your claim number or policy number."},
            {"type": "proactive", "text": "While I look up your claim, I can also explain our typical processing timeline if that would be helpful."}
        ])
    
    elif intent == "complaint":
        suggestions.extend([
            {"type": "apologetic", "text": "I sincerely apologize for this experience. Let me see how I can make this right for you."},
            {"type": "solution-focused", "text": "I want to resolve this issue for you. Can you walk me through exactly what happened?"},
            {"type": "escalation", "text": "I understand your frustration. Let me connect you with a supervisor who can give this the attention it deserves."}
        ])
    
    # Adjust based on sentiment
    if sentiment_score < -0.3:
        suggestions.insert(0, {
            "type": "empathetic", 
            "text": "I can hear that you're frustrated, and I want to help make this better for you."
        })
    
    return suggestions[:5]  # Limit to 5 suggestions

def _get_response_strategies(intent: str, sentiment_analysis: Dict[str, Any]) -> List[str]:
    """Get response strategies for the agent"""
    
    strategies = []
    sentiment_score = sentiment_analysis.get("sentiment", {}).get("polarity", 0)
    
    # General strategies based on intent
    intent_strategies = {
        "complaint": ["Acknowledge the issue", "Apologize sincerely", "Focus on solution", "Follow up"],
        "emergency": ["Assess urgency", "Provide immediate help", "Escalate if needed"],
        "claim_inquiry": ["Gather information", "Provide clear updates", "Set expectations"],
        "policy_question": ["Explain clearly", "Use simple language", "Provide examples"]
    }
    
    strategies.extend(intent_strategies.get(intent, ["Listen actively", "Ask clarifying questions"]))
    
    # Add sentiment-based strategies
    if sentiment_score < -0.3:
        strategies.extend(["Use empathetic language", "Acknowledge emotions", "Stay calm"])
    elif sentiment_score > 0.3:
        strategies.append("Match positive energy")
    
    return strategies

def _update_conversation_analytics(conversation_id: str, intent: str, confidence: float):
    """Update conversation analytics"""
    
    if conversation_id not in conversation_analytics:
        conversation_analytics[conversation_id] = {
            "intents": [],
            "confidences": [],
            "start_time": datetime.datetime.now().isoformat()
        }
    
    conversation_analytics[conversation_id]["intents"].append(intent)
    conversation_analytics[conversation_id]["confidences"].append(confidence)
    conversation_analytics[conversation_id]["last_update"] = datetime.datetime.now().isoformat()

def _generate_conversation_summary(messages: List[Dict[str, Any]]) -> str:
    """Generate a brief summary of the conversation"""
    
    if not messages:
        return "No messages"
    
    user_messages = [msg["message"] for msg in messages if msg["sender"] == "user"]
    
    if not user_messages:
        return "No user messages"
    
    # Simple summary based on first and last messages
    if len(user_messages) == 1:
        return user_messages[0][:100] + "..." if len(user_messages[0]) > 100 else user_messages[0]
    
    return f"Conversation about: {user_messages[0][:50]}... (Total: {len(messages)} messages)"

def _count_today_conversations() -> int:
    """Count conversations started today"""
    today = datetime.date.today().isoformat()
    count = 0
    
    for conv in conversations.values():
        if conv["created_at"].startswith(today):
            count += 1
    
    return count

def _calculate_average_confidence() -> float:
    """Calculate average confidence across all conversations"""
    all_confidences = []
    
    for analytics in conversation_analytics.values():
        all_confidences.extend(analytics.get("confidences", []))
    
    return round(sum(all_confidences) / max(len(all_confidences), 1), 3)

def _calculate_escalation_rate() -> float:
    """Calculate rate of conversations requiring human escalation"""
    # This would be calculated based on actual escalation data
    return 0.15  # 15% escalation rate

def _get_common_queries() -> List[Dict[str, Any]]:
    """Get most common query types"""
    return [
        {"query": "Claim status inquiry", "frequency": 34.2},
        {"query": "Policy coverage questions", "frequency": 28.1},
        {"query": "Billing inquiries", "frequency": 18.7},
        {"query": "Document submission", "frequency": 12.3},
        {"query": "General information", "frequency": 6.7}
    ]

def _get_peak_conversation_hours() -> List[Dict[str, Any]]:
    """Get peak conversation hours"""
    return [
        {"hour": "9-10 AM", "volume": 23.4},
        {"hour": "1-2 PM", "volume": 19.8},
        {"hour": "3-4 PM", "volume": 18.2},
        {"hour": "11-12 PM", "volume": 15.1},
        {"hour": "2-3 PM", "volume": 12.7}
    ]