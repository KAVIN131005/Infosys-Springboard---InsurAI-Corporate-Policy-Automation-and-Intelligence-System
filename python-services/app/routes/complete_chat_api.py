"""
Complete Working Chatbot Implementation for InsurAI
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
import json
import datetime
import re
import os
import asyncio
import random

# Import httpx for HTTP requests
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for conversations
conversations = {}
chat_analytics = {"total_messages": 0, "total_conversations": 0}

class ChatMessage(BaseModel):
    message: str
    user_id: str = "anonymous"
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    intent: str
    confidence: float
    suggestions: Optional[List[str]] = []

# Enhanced insurance-specific response templates
INSURANCE_RESPONSES = {
    "greeting": {
        "responses": [
            "Hello! I'm InsurAI, your personal insurance assistant. I'm here to help with claims, policies, payments, and any insurance questions you might have. How can I assist you today?",
            "Hi there! Welcome to InsurAI. I can help you with auto, home, health, and life insurance matters. What brings you here today?",
            "Good day! I'm your insurance AI assistant, ready to help with claims, coverage questions, billing, and more. What can I help you with?"
        ],
        "suggestions": ["File a claim", "Check policy coverage", "Get a quote", "Make a payment", "Emergency assistance"]
    },
    "claim_inquiry": {
        "responses": [
            "I can help you with your claim! To get started, I'll need either your claim number or policy number. I can check status, explain the process, or help you file a new claim.",
            "Let me assist you with your claim. Whether you need to file a new claim, check existing claim status, or understand the process, I'm here to help. What's your claim number or policy number?",
            "I'm here to help with your claim inquiry. I can guide you through filing, track your claim status, or explain what documents you might need. How can I assist?"
        ],
        "suggestions": ["Check claim status", "File new claim", "Upload documents", "Speak with adjuster", "Get repair estimates"]
    },
    "policy_question": {
        "responses": [
            "I'd be happy to explain your policy coverage! I can help you understand what's covered, your deductibles, coverage limits, and exclusions. What specific aspect would you like to know about?",
            "Great question about your policy! I can clarify your coverage details, explain benefits, discuss deductibles, or help you understand policy terms. What would you like to know?",
            "I can help you understand your policy better. Whether it's about coverage limits, what's included or excluded, premium details, or renewal information - what's your question?"
        ],
        "suggestions": ["Coverage details", "Deductible information", "Premium details", "Policy documents", "Exclusions", "Add coverage"]
    },
    "billing_inquiry": {
        "responses": [
            "I can help with all your billing questions! Whether you want to make a payment, set up autopay, check your balance, understand charges, or update payment methods - I'm here to assist.",
            "Let me help with your billing inquiry. I can assist with payments, explain charges, set up autopay, check payment history, or discuss payment plans. What do you need help with?",
            "I'm here to help with billing! I can guide you through making payments, understanding your bill, setting up automatic payments, or resolving billing questions."
        ],
        "suggestions": ["Make payment", "Set up autopay", "View payment history", "Explain charges", "Payment plans", "Update payment method"]
    },
    "emergency": {
        "responses": [
            "🚨 For life-threatening emergencies, call 911 immediately! For insurance emergencies, our 24/7 hotline is 1-800-CLAIM-NOW. I can also help guide you through immediate steps for your situation.",
            "This sounds urgent! If anyone is injured or in danger, call 911 first. For insurance emergencies like accidents, theft, or property damage, call 1-800-CLAIM-NOW immediately. How can I help you right now?",
            "I understand this is an emergency situation. Your safety comes first - call 911 if needed. For insurance emergencies, reach our 24/7 line at 1-800-CLAIM-NOW. I'm here to help guide you through next steps."
        ],
        "suggestions": ["Call emergency line", "File emergency claim", "Find nearest hospital", "Report police incident", "Emergency contacts"]
    },
    "complaint": {
        "responses": [
            "I sincerely apologize for your experience, and I understand your frustration. I want to help resolve this issue properly. Can you tell me more about what happened so I can assist you or connect you with the right person?",
            "I'm truly sorry to hear about this problem. Your concerns are important to us, and I want to make this right. Could you provide more details so I can help resolve this matter?",
            "I apologize for this situation and any inconvenience it has caused. I'm here to help find a solution. Let me see how I can assist you or escalate this to the appropriate team."
        ],
        "suggestions": ["Escalate to supervisor", "File formal complaint", "Request callback", "Speak with manager", "Resolution options"]
    },
    "quote_request": {
        "responses": [
            "I'd be happy to help you get a quote! To provide you with the most accurate pricing, I'll need some information about what type of coverage you're looking for and some basic details.",
            "Great! I can help you get a personalized quote. Whether it's auto, home, health, or life insurance, I'll connect you with our quote system or an agent who can provide competitive rates.",
            "I can definitely help you get a quote! Let me know what type of insurance you're interested in, and I'll guide you through the process to get the best rates available."
        ],
        "suggestions": ["Auto insurance quote", "Home insurance quote", "Health insurance quote", "Life insurance quote", "Compare rates"]
    },
    "auto_insurance": {
        "responses": [
            "I can help with all your auto insurance needs! Whether you need coverage information, want to file a claim, add a vehicle, or understand your policy, I'm here to assist.",
            "Auto insurance questions? I've got you covered! I can help with policy details, claims, coverage options, discounts, or connect you with an agent for specific needs.",
            "I'm here to help with your auto insurance! From understanding coverage options to filing claims or getting quotes, what specific auto insurance question do you have?"
        ],
        "suggestions": ["File auto claim", "Add vehicle", "Coverage options", "Discounts available", "Roadside assistance", "Get auto quote"]
    },
    "home_insurance": {
        "responses": [
            "I can assist with all your home insurance questions! Whether it's about coverage for your property, personal belongings, liability protection, or filing a claim, I'm here to help.",
            "Home insurance can be complex, but I'm here to help! I can explain coverage options, help with claims, discuss policy details, or connect you with specialists for your specific needs.",
            "I'm your home insurance assistant! From understanding what's covered to filing claims for damage, theft, or other incidents, how can I help protect your home today?"
        ],
        "suggestions": ["File home claim", "Coverage details", "Property value", "Personal belongings", "Liability coverage", "Natural disasters"]
    },
    "health_insurance": {
        "responses": [
            "I can help with your health insurance questions! Whether you need to understand your benefits, find network providers, file claims, or navigate coverage options, I'm here to assist.",
            "Health insurance can be confusing, but I'm here to help! I can explain your benefits, help you find doctors, understand prescription coverage, or assist with claims and billing questions.",
            "I'm here to help with your health insurance needs! From finding providers in your network to understanding copays, deductibles, and coverage, what can I help you with?"
        ],
        "suggestions": ["Find providers", "Check benefits", "Prescription coverage", "Claims status", "Preventive care", "Specialist referrals"]
    },
    "life_insurance": {
        "responses": [
            "I can help with your life insurance questions! Whether you're looking to understand your current policy, add beneficiaries, explore coverage options, or file a claim, I'm here to assist.",
            "Life insurance is an important protection for your family. I can help explain different policy types, coverage amounts, beneficiary information, or connect you with an agent for personalized advice.",
            "I'm here to help with life insurance! From understanding term vs. whole life policies to updating beneficiaries or exploring coverage options, what would you like to know?"
        ],
        "suggestions": ["Policy types", "Coverage amounts", "Beneficiaries", "Premium payments", "Policy loans", "Convert term policy"]
    },
    "general_info": {
        "responses": [
            "I'm here to help with any insurance questions! I can assist with auto, home, health, and life insurance matters, including claims, policies, billing, and general information. What would you like to know?",
            "I can provide information about various insurance topics and help you navigate your insurance needs. Whether it's understanding coverage, filing claims, or getting quotes, how can I assist you today?",
            "I'm knowledgeable about all types of insurance and here to help! From explaining coverage options to assisting with claims and billing, what insurance question can I answer for you?"
        ],
        "suggestions": ["Auto insurance", "Home insurance", "Health insurance", "Life insurance", "File a claim", "Get a quote"]
    }
}

def determine_intent(message: str) -> str:
    """Determine user intent from message with enhanced patterns"""
    message_lower = message.lower()
    
    # Define comprehensive intent patterns
    patterns = {
        "greeting": [
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening", 
            "greetings", "howdy", "what's up", "how are you", "nice to meet you",
            "start", "begin", "help me get started"
        ],
        "claim_inquiry": [
            "claim", "claim status", "claim number", "my claim", "file claim", "submit claim",
            "accident", "incident", "damage", "loss", "stolen", "theft", "collision",
            "claim form", "claim process", "claim documentation", "claim adjuster",
            "settlement", "estimate", "repair", "total loss", "claim payment"
        ],
        "policy_question": [
            "policy", "coverage", "covered", "deductible", "premium", "benefits",
            "what's covered", "what is covered", "policy details", "policy information",
            "coverage limits", "exclusions", "policy renewal", "policy terms",
            "liability", "comprehensive", "collision", "medical coverage"
        ],
        "billing_inquiry": [
            "bill", "payment", "pay", "invoice", "balance", "autopay", "due",
            "billing", "charges", "cost", "price", "fee", "payment method",
            "credit card", "bank account", "payment plan", "overdue", "late payment",
            "payment history", "payment schedule", "refund"
        ],
        "emergency": [
            "emergency", "urgent", "accident", "fire", "theft", "immediate", "help now",
            "crisis", "disaster", "flood", "hurricane", "tornado", "earthquake",
            "break in", "burglary", "vandalism", "medical emergency", "urgent help",
            "need help now", "emergency contact", "24/7", "asap"
        ],
        "complaint": [
            "complaint", "problem", "issue", "unhappy", "dissatisfied", "terrible",
            "awful", "horrible", "bad service", "poor service", "frustrated",
            "angry", "mad", "disappointed", "upset", "unacceptable", "manager",
            "supervisor", "escalate", "file complaint"
        ],
        "quote_request": [
            "quote", "estimate", "cost", "price", "how much", "rates", "pricing",
            "get a quote", "request quote", "quote request", "insurance quote",
            "compare rates", "better rate", "cheaper", "discount", "save money"
        ],
        "auto_insurance": [
            "auto", "car", "vehicle", "driving", "driver", "automobile", "motor",
            "car insurance", "auto insurance", "vehicle insurance", "driving record",
            "license", "registration", "dmv", "traffic ticket", "speeding ticket"
        ],
        "home_insurance": [
            "home", "house", "property", "homeowner", "dwelling", "residence",
            "home insurance", "homeowner insurance", "property insurance",
            "roof", "foundation", "plumbing", "electrical", "hvac", "appliances"
        ],
        "health_insurance": [
            "health", "medical", "doctor", "hospital", "prescription", "medication",
            "health insurance", "medical insurance", "healthcare", "clinic",
            "physician", "specialist", "network", "provider", "copay", "coinsurance"
        ],
        "life_insurance": [
            "life", "life insurance", "beneficiary", "death benefit", "term life",
            "whole life", "universal life", "permanent", "temporary", "survivor"
        ],
        "general_info": [
            "information", "help", "what", "how", "can you", "tell me", "explain",
            "about", "service", "company", "contact", "phone", "email", "website"
        ]
    }
    
    # Count matches for each intent with weighted scoring
    intent_scores = {}
    for intent, keywords in patterns.items():
        score = 0
        for keyword in keywords:
            if keyword in message_lower:
                # Give higher weight to exact matches and longer phrases
                if keyword == message_lower.strip():
                    score += 3  # Exact match
                elif len(keyword.split()) > 1 and keyword in message_lower:
                    score += 2  # Multi-word phrase match
                else:
                    score += 1  # Single word match
        
        if score > 0:
            intent_scores[intent] = score
    
    # Return intent with highest score, or general_info as default
    if intent_scores:
        best_intent = max(intent_scores, key=intent_scores.get)
        logger.info(f"Intent detected: {best_intent} (score: {intent_scores[best_intent]})")
        return best_intent
    
    return "general_info"

async def call_gemini_api(message: str, intent: str, conversation_history: List[Dict]) -> Optional[str]:
    """Call Gemini API for intelligent responses"""
    
    # Use the hardcoded API key first, then check environment
    api_key = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key or not HTTPX_AVAILABLE:
        logger.warning("Gemini API key not available or httpx not installed")
        return None
    
    # Build context from conversation history
    context = ""
    if conversation_history:
        recent_messages = conversation_history[-4:]  # Last 4 messages
        context = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in recent_messages])
    
    # Create insurance-focused prompt with more specific instructions
    system_prompt = """You are InsurAI, a professional insurance assistant specializing in helping customers with insurance needs.

Your capabilities include:
- Auto Insurance: Claims, coverage options, quotes, accident reporting
- Home Insurance: Property protection, natural disasters, liability coverage
- Health Insurance: Benefits, claims, network providers, prescription coverage
- Life Insurance: Beneficiaries, coverage amounts, policy types
- Claims Processing: Filing procedures, required documents, status tracking
- Billing & Payments: Due dates, payment methods, autopay setup
- Policy Management: Coverage changes, renewals, updates
- Emergency Support: Immediate assistance procedures, emergency contacts

Guidelines:
- Be empathetic and professional
- Provide specific, actionable advice
- Keep responses helpful but concise (2-4 sentences)
- If you don't know something specific, guide them to the right resource
- For emergencies, prioritize safety and immediate action steps
- Always maintain customer privacy and security"""

    # Create intent-specific prompts
    intent_context = {
        "greeting": "Respond warmly and ask how you can help with their insurance needs.",
        "claim_inquiry": "Help them with filing or tracking claims. Ask for specific details needed.",
        "policy_question": "Explain coverage clearly and help them understand their policy benefits.",
        "billing_inquiry": "Assist with payment options, due dates, and billing questions.",
        "emergency": "Prioritize immediate safety, then guide through emergency procedures.",
        "complaint": "Show empathy, apologize for issues, and focus on resolution.",
        "general_info": "Provide helpful insurance information and guidance."
    }

    context_instruction = intent_context.get(intent, "Provide helpful insurance assistance.")

    user_prompt = f"""
Intent: {intent}
Context: {context_instruction}
Customer message: "{message}"
Recent conversation: {context}

Provide a helpful, professional insurance assistant response:
"""

    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': api_key
        }
        
        payload = {
            "contents": [{
                "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 300,
                "stopSequences": []
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH", 
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            # Extract response text
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        response_text = parts[0]["text"].strip()
                        logger.info(f"✅ Gemini API response generated for intent: {intent}")
                        return response_text

            logger.warning("No valid response from Gemini API")
            return None

    except httpx.TimeoutException:
        logger.error("Gemini API timeout")
        return None
    except httpx.HTTPStatusError as e:
        logger.error(f"Gemini API HTTP error: {e.response.status_code} - {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None

def get_fallback_response(intent: str) -> Dict[str, Any]:
    """Get fallback response when Gemini API is not available"""
    
    if intent in INSURANCE_RESPONSES:
        template = INSURANCE_RESPONSES[intent]
        response = random.choice(template["responses"])
        suggestions = template["suggestions"]
    else:
        response = "I'm here to help with your insurance needs! Could you please provide more details about what you're looking for?"
        suggestions = ["File a claim", "Policy questions", "Make a payment", "Contact agent"]
    
    return {
        "response": response,
        "suggestions": suggestions,
        "confidence": 0.75
    }

@router.post("/chat", response_model=ChatResponse)
async def process_chat_message(chat_request: ChatMessage):
    """Main chat endpoint with complete functionality"""
    
    try:
        # Generate conversation ID
        conversation_id = chat_request.conversation_id or f"conv_{chat_request.user_id}_{int(datetime.datetime.now().timestamp())}"
        
        # Initialize conversation if new
        if conversation_id not in conversations:
            conversations[conversation_id] = {
                "user_id": chat_request.user_id,
                "messages": [],
                "created_at": datetime.datetime.now().isoformat()
            }
            chat_analytics["total_conversations"] += 1
        
        # Add user message
        user_message = {
            "sender": "user",
            "message": chat_request.message,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(user_message)
        chat_analytics["total_messages"] += 1
        
        # Determine intent
        intent = determine_intent(chat_request.message)
        
        # Try Gemini API first, fallback to templates
        ai_response = await call_gemini_api(
            chat_request.message, 
            intent, 
            conversations[conversation_id]["messages"]
        )
        
        if ai_response:
            # Use AI response
            response_data = {
                "response": ai_response,
                "suggestions": INSURANCE_RESPONSES.get(intent, {}).get("suggestions", []),
                "confidence": 0.9
            }
        else:
            # Use fallback response
            response_data = get_fallback_response(intent)
        
        # Add bot message to conversation
        bot_message = {
            "sender": "bot",
            "message": response_data["response"],
            "intent": intent,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(bot_message)
        
        return ChatResponse(
            response=response_data["response"],
            conversation_id=conversation_id,
            intent=intent,
            confidence=response_data["confidence"],
            suggested_actions=response_data["suggestions"],
            requires_human=intent in ["complaint", "emergency"],
            suggestions=response_data["suggestions"]
        )
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.post("/query")
async def chat_query(question: str = Query(..., description="User's question")):
    """Simple chat query endpoint for easy testing"""
    
    try:
        # Create chat request
        chat_request = ChatMessage(
            message=question,
            user_id="anonymous"
        )
        
        # Process the message
        response = await process_chat_message(chat_request)
        
        return {
            "response": response.response,
            "intent": response.intent,
            "confidence": response.confidence,
            "suggestions": response.suggestions,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Query processing failed: {e}")
        return {
            "response": f"I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
            "intent": "error",
            "confidence": 0.0,
            "suggestions": ["Try again", "Rephrase question", "Contact support"],
            "status": "error",
            "error": str(e)
        }

@router.get("/mode")
async def get_chat_mode():
    """Get current chat mode and service status"""
    
    try:
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        has_httpx = HTTPX_AVAILABLE
        
        # Test Gemini API if available
        gemini_working = False
        if gemini_api_key and has_httpx:
            try:
                # Quick test call
                test_response = await call_gemini_api("Hello", "greeting", [])
                gemini_working = test_response is not None
            except:
                gemini_working = False
        
        return {
            "mode": "gemini" if gemini_working else "fallback",
            "gemini_key_present": bool(gemini_api_key),
            "gemini_working": gemini_working,
            "httpx_available": has_httpx,
            "service_available": True,
            "total_conversations": chat_analytics["total_conversations"],
            "total_messages": chat_analytics["total_messages"],
            "endpoints": [
                "/api/chat/chat",
                "/api/chat/query", 
                "/api/chat/mode",
                "/api/chat/health"
            ]
        }
        
    except Exception as e:
        logger.error(f"Mode check failed: {e}")
        return {
            "mode": "error",
            "service_available": False,
            "error": str(e)
        }

@router.get("/health")
async def chat_health():
    """Health check for chat service"""
    
    return {
        "status": "healthy",
        "service": "InsurAI Chat Service",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0",
        "ai_enabled": bool(os.environ.get("GEMINI_API_KEY")),
        "dependencies": {
            "httpx": HTTPX_AVAILABLE,
            "gemini_api": bool(os.environ.get("GEMINI_API_KEY"))
        }
    }

@router.get("/conversations")
async def list_conversations():
    """List all conversations (for debugging)"""
    
    return {
        "total_conversations": len(conversations),
        "conversations": [
            {
                "id": conv_id,
                "user_id": conv["user_id"],
                "message_count": len(conv["messages"]),
                "created_at": conv["created_at"],
                "last_message": conv["messages"][-1]["message"] if conv["messages"] else ""
            }
            for conv_id, conv in conversations.items()
        ]
    }

@router.delete("/conversations")
async def clear_conversations():
    """Clear all conversations (for testing)"""
    
    global conversations, chat_analytics
    conversations.clear()
    chat_analytics = {"total_messages": 0, "total_conversations": 0}
    
    return {"message": "All conversations cleared", "status": "success"}
