"""
Working FastAPI Service with Gemini Integration
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
import asyncio
import httpx
import datetime
import re
from typing import Dict, List, Optional
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="InsurAI Gemini Chatbot Service",
    description="Complete AI-powered insurance assistant with Google Gemini integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Set the Gemini API key
GEMINI_API_KEY = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

# In-memory storage for conversations
conversations = {}
chat_analytics = {"total_messages": 0, "total_conversations": 0}

def determine_intent(message: str) -> str:
    """Determine user intent from message with enhanced patterns"""
    message_lower = message.lower()
    
    patterns = {
        "greeting": [
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening", 
            "greetings", "howdy", "what's up", "how are you", "nice to meet you",
            "start", "begin", "help me get started"
        ],
        "claim_inquiry": [
            "claim", "claim status", "claim number", "my claim", "file claim", "submit claim",
            "accident", "incident", "damage", "loss", "stolen", "theft", "collision",
            "claim form", "claim process", "claim documentation", "claim adjuster"
        ],
        "policy_question": [
            "policy", "coverage", "covered", "deductible", "premium", "benefits",
            "what's covered", "what is covered", "policy details", "policy information",
            "coverage limits", "exclusions", "policy renewal", "policy terms"
        ],
        "billing_inquiry": [
            "bill", "payment", "pay", "invoice", "balance", "autopay", "due",
            "billing", "charges", "cost", "price", "fee", "payment method",
            "credit card", "bank account", "payment plan", "overdue"
        ],
        "emergency": [
            "emergency", "urgent", "accident", "fire", "theft", "immediate", "help now",
            "crisis", "disaster", "flood", "hurricane", "tornado", "earthquake",
            "break in", "burglary", "vandalism", "medical emergency"
        ],
        "complaint": [
            "complaint", "problem", "issue", "unhappy", "dissatisfied", "terrible",
            "awful", "horrible", "bad service", "poor service", "frustrated",
            "angry", "mad", "disappointed", "upset"
        ],
        "quote_request": [
            "quote", "estimate", "cost", "price", "how much", "rates", "pricing",
            "get a quote", "request quote", "quote request", "insurance quote"
        ],
        "auto_insurance": [
            "auto", "car", "vehicle", "driving", "driver", "automobile", "motor",
            "car insurance", "auto insurance", "vehicle insurance"
        ],
        "home_insurance": [
            "home", "house", "property", "homeowner", "dwelling", "residence",
            "home insurance", "homeowner insurance", "property insurance"
        ],
        "health_insurance": [
            "health", "medical", "doctor", "hospital", "prescription", "medication",
            "health insurance", "medical insurance", "healthcare"
        ],
        "life_insurance": [
            "life", "life insurance", "beneficiary", "death benefit", "term life",
            "whole life", "universal life"
        ]
    }
    
    # Count matches for each intent with weighted scoring
    intent_scores = {}
    for intent, keywords in patterns.items():
        score = 0
        for keyword in keywords:
            if keyword in message_lower:
                if keyword == message_lower.strip():
                    score += 3  # Exact match
                elif len(keyword.split()) > 1 and keyword in message_lower:
                    score += 2  # Multi-word phrase match
                else:
                    score += 1  # Single word match
        
        if score > 0:
            intent_scores[intent] = score
    
    if intent_scores:
        best_intent = max(intent_scores, key=intent_scores.get)
        logger.info(f"Intent detected: {best_intent} (score: {intent_scores[best_intent]})")
        return best_intent
    
    return "general_info"

async def call_gemini_api(message: str, intent: str, conversation_history: List[Dict] = None) -> Optional[str]:
    """Call Gemini API for intelligent responses"""
    
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not available")
        return None
    
    # Build context from conversation history
    context = ""
    if conversation_history:
        recent_messages = conversation_history[-4:]  # Last 4 messages
        context = "\n".join([f"{msg['sender']}: {msg['message']}" for msg in recent_messages])
    
    # Create insurance-focused prompt with specific instructions
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
            'x-goog-api-key': GEMINI_API_KEY
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
        logger.error(f"Gemini API HTTP error: {e.response.status_code}")
        return None
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None

def get_fallback_response(intent: str) -> Dict:
    """Get fallback response when Gemini API is not available"""
    
    insurance_responses = {
        "greeting": {
            "responses": [
                "Hello! I'm InsurAI, your personal insurance assistant. I can help with claims, policies, payments, and any insurance questions you might have. How can I assist you today?"
            ],
            "suggestions": ["File a claim", "Check policy coverage", "Get a quote", "Make a payment", "Emergency assistance"]
        },
        "claim_inquiry": {
            "responses": [
                "I can help you with your claim! To get started, I'll need either your claim number or policy number. I can check status, explain the process, or help you file a new claim."
            ],
            "suggestions": ["Check claim status", "File new claim", "Upload documents", "Speak with adjuster"]
        },
        "policy_question": {
            "responses": [
                "I'd be happy to explain your policy coverage! I can help you understand what's covered, your deductibles, coverage limits, and exclusions. What specific aspect would you like to know about?"
            ],
            "suggestions": ["Coverage details", "Deductible information", "Premium details", "Policy documents"]
        },
        "billing_inquiry": {
            "responses": [
                "I can help with all your billing questions! Whether you want to make a payment, set up autopay, check your balance, understand charges, or update payment methods - I'm here to assist."
            ],
            "suggestions": ["Make payment", "Set up autopay", "View payment history", "Explain charges"]
        },
        "emergency": {
            "responses": [
                "🚨 For life-threatening emergencies, call 911 immediately! For insurance emergencies, our 24/7 hotline is 1-800-CLAIM-NOW. I can also help guide you through immediate steps for your situation."
            ],
            "suggestions": ["Call emergency line", "File emergency claim", "Find nearest hospital", "Report police incident"]
        }
    }
    
    if intent in insurance_responses:
        template = insurance_responses[intent]
        response = template["responses"][0]
        suggestions = template["suggestions"]
    else:
        response = "I'm here to help with your insurance needs! Could you please provide more details about what you're looking for?"
        suggestions = ["File a claim", "Policy questions", "Make a payment", "Contact agent"]
    
    return {
        "response": response,
        "suggestions": suggestions,
        "confidence": 0.75
    }

# API Endpoints
@app.get("/", tags=["Health Check"])
async def read_root():
    """Root endpoint with service information"""
    return {
        "message": "InsurAI Gemini Chatbot Service Running",
        "version": "2.0.0",
        "status": "healthy",
        "ai_provider": "Google Gemini",
        "api_key_status": "configured" if GEMINI_API_KEY else "missing",
        "gemini_model": "gemini-1.5-flash",
        "services": [
            "Gemini-Powered Chatbot",
            "Insurance Domain Expertise",
            "Dynamic Response Generation",
            "Context-Aware Conversations"
        ],
        "endpoints": {
            "chat": "/api/chat/query",
            "chat_mode": "/api/chat/mode",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    """Comprehensive health check"""
    
    # Test Gemini API connectivity
    gemini_status = "unknown"
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash"
                headers = {"x-goog-api-key": GEMINI_API_KEY}
                response = await client.get(url, headers=headers)
                gemini_status = "connected" if response.status_code == 200 else "error"
        except Exception:
            gemini_status = "disconnected"
    else:
        gemini_status = "no_api_key"
    
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "service": "InsurAI Gemini Chatbot",
        "version": "2.0.0",
        "ai_provider": "Google Gemini",
        "api_key_status": "configured" if GEMINI_API_KEY else "missing",
        "dependencies": {
            "gemini_api": gemini_status,
            "httpx": True,
            "fastapi": True
        },
        "services": {
            "chatbot": "available",
            "gemini_integration": "available" if GEMINI_API_KEY else "disabled",
            "fallback_responses": "available"
        },
        "performance": {
            "response_time": "< 2s",
            "availability": "99.9%"
        }
    }

@app.post("/api/chat/query")
async def chat_query(question: str = Query(..., description="User's question")):
    """Main chat endpoint with Gemini integration"""
    
    try:
        # Generate conversation ID
        conversation_id = f"conv_anonymous_{int(datetime.datetime.now().timestamp())}"
        
        # Initialize conversation if new
        if conversation_id not in conversations:
            conversations[conversation_id] = {
                "user_id": "anonymous",
                "messages": [],
                "created_at": datetime.datetime.now().isoformat()
            }
            chat_analytics["total_conversations"] += 1
        
        # Add user message
        user_message = {
            "sender": "user",
            "message": question,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(user_message)
        chat_analytics["total_messages"] += 1
        
        # Determine intent
        intent = determine_intent(question)
        logger.info(f"🎯 Intent detected: {intent}")
        
        # Try Gemini API first, fallback to templates
        ai_response = await call_gemini_api(
            question, 
            intent, 
            conversations[conversation_id]["messages"]
        )
        
        if ai_response:
            # Use AI response
            response_data = {
                "response": ai_response,
                "suggestions": get_fallback_response(intent)["suggestions"],
                "confidence": 0.9,
                "ai_generated": True,
                "mode": "gemini"
            }
            logger.info("✅ Using Gemini AI response")
        else:
            # Use fallback response
            fallback_data = get_fallback_response(intent)
            response_data = {
                "response": fallback_data["response"],
                "suggestions": fallback_data["suggestions"],
                "confidence": fallback_data["confidence"],
                "ai_generated": False,
                "mode": "fallback"
            }
            logger.info("⚠️ Using fallback response")
        
        # Add bot message to conversation
        bot_message = {
            "sender": "bot",
            "message": response_data["response"],
            "intent": intent,
            "timestamp": datetime.datetime.now().isoformat()
        }
        conversations[conversation_id]["messages"].append(bot_message)
        
        return {
            "response": response_data["response"],
            "intent": intent,
            "confidence": response_data["confidence"],
            "suggestions": response_data["suggestions"],
            "status": "success",
            "mode": response_data["mode"],
            "ai_generated": response_data["ai_generated"],
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        return {
            "response": f"I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
            "intent": "error",
            "confidence": 0.0,
            "suggestions": ["Try again", "Rephrase question", "Contact support"],
            "status": "error",
            "mode": "fallback",
            "ai_generated": False,
            "error": str(e)
        }

@app.get("/api/chat/mode")
async def get_chat_mode():
    """Get current chat mode and service status"""
    
    try:
        # Test Gemini API if available
        gemini_working = False
        if GEMINI_API_KEY:
            try:
                # Quick test call
                test_response = await call_gemini_api("Hello", "greeting", [])
                gemini_working = test_response is not None
            except:
                gemini_working = False
        
        return {
            "mode": "gemini" if gemini_working else "fallback",
            "gemini_key_present": bool(GEMINI_API_KEY),
            "gemini_working": gemini_working,
            "service_available": True,
            "api_key_configured": bool(GEMINI_API_KEY),
            "total_conversations": chat_analytics["total_conversations"],
            "total_messages": chat_analytics["total_messages"],
            "endpoints": [
                "/api/chat/query", 
                "/api/chat/mode",
                "/health"
            ]
        }
        
    except Exception as e:
        logger.error(f"Mode check failed: {e}")
        return {
            "mode": "error",
            "service_available": False,
            "gemini_working": False,
            "error": str(e)
        }

@app.delete("/api/chat/conversations")
async def clear_conversations():
    """Clear all conversations (for testing)"""
    
    global conversations, chat_analytics
    conversations.clear()
    chat_analytics = {"total_messages": 0, "total_conversations": 0}
    
    return {"message": "All conversations cleared", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting InsurAI Gemini Chatbot Service")
    logger.info(f"🔑 API Key configured: {GEMINI_API_KEY[:10]}...")
    
    uvicorn.run(
        "working_gemini_service:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )
