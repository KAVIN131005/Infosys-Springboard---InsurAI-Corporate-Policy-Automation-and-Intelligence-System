"""
Complete Standalone Gemini Chatbot Implementation
Ready to use with the provided API key
"""
import asyncio
import httpx
import json
import re
from typing import Dict, List, Optional
import datetime

# Configure the Gemini API
GEMINI_API_KEY = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
GEMINI_MODEL = "gemini-1.5-flash"

class InsurAIGeminiChatbot:
    def __init__(self):
        self.conversations = {}
        self.api_key = GEMINI_API_KEY
        
    def determine_intent(self, message: str) -> str:
        """Determine user intent from message with enhanced patterns"""
        message_lower = message.lower()
        
        patterns = {
            "greeting": [
                "hello", "hi", "hey", "good morning", "good afternoon", "good evening", 
                "greetings", "howdy", "what's up", "how are you", "nice to meet you"
            ],
            "claim_inquiry": [
                "claim", "claim status", "claim number", "my claim", "file claim", "submit claim",
                "accident", "incident", "damage", "loss", "stolen", "theft", "collision"
            ],
            "policy_question": [
                "policy", "coverage", "covered", "deductible", "premium", "benefits",
                "what's covered", "what is covered", "policy details", "policy information"
            ],
            "billing_inquiry": [
                "bill", "payment", "pay", "invoice", "balance", "autopay", "due",
                "billing", "charges", "cost", "price", "fee", "payment method"
            ],
            "emergency": [
                "emergency", "urgent", "accident", "fire", "theft", "immediate", "help now",
                "crisis", "disaster", "flood", "hurricane", "tornado", "earthquake"
            ],
            "complaint": [
                "complaint", "problem", "issue", "unhappy", "dissatisfied", "terrible",
                "awful", "horrible", "bad service", "poor service", "frustrated"
            ],
            "quote_request": [
                "quote", "estimate", "cost", "price", "how much", "rates", "pricing",
                "get a quote", "request quote", "quote request"
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
            return best_intent
        
        return "general_info"
    
    async def call_gemini_api(self, message: str, intent: str, conversation_history: List[Dict]) -> Optional[str]:
        """Call Gemini API for intelligent responses"""
        
        if not self.api_key:
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
                'x-goog-api-key': self.api_key
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
                            print(f"✅ Gemini API response generated for intent: {intent}")
                            return response_text

                print("⚠️ No valid response from Gemini API")
                return None

        except httpx.TimeoutException:
            print("❌ Gemini API timeout")
            return None
        except httpx.HTTPStatusError as e:
            print(f"❌ Gemini API HTTP error: {e.response.status_code}")
            return None
        except Exception as e:
            print(f"❌ Gemini API call failed: {e}")
            return None
    
    def get_fallback_response(self, intent: str) -> Dict:
        """Get fallback response when Gemini API is not available"""
        
        insurance_responses = {
            "greeting": {
                "responses": [
                    "Hello! I'm InsurAI, your personal insurance assistant. I can help with claims, policies, payments, and any insurance questions you might have. How can I assist you today?",
                    "Hi there! Welcome to InsurAI. I can help you with auto, home, health, and life insurance matters. What brings you here today?",
                    "Good day! I'm your insurance AI assistant, ready to help with claims, coverage questions, billing, and more. What can I help you with?"
                ],
                "suggestions": ["File a claim", "Check policy coverage", "Get a quote", "Make a payment", "Emergency assistance"]
            },
            "claim_inquiry": {
                "responses": [
                    "I can help you with your claim! To get started, I'll need either your claim number or policy number. I can check status, explain the process, or help you file a new claim.",
                    "Let me assist you with your claim. Whether you need to file a new claim, check existing claim status, or understand the process, I'm here to help. What's your claim number or policy number?"
                ],
                "suggestions": ["Check claim status", "File new claim", "Upload documents", "Speak with adjuster", "Get repair estimates"]
            },
            "policy_question": {
                "responses": [
                    "I'd be happy to explain your policy coverage! I can help you understand what's covered, your deductibles, coverage limits, and exclusions. What specific aspect would you like to know about?",
                    "Great question about your policy! I can clarify your coverage details, explain benefits, discuss deductibles, or help you understand policy terms. What would you like to know?"
                ],
                "suggestions": ["Coverage details", "Deductible information", "Premium details", "Policy documents", "Exclusions"]
            },
            "emergency": {
                "responses": [
                    "🚨 For life-threatening emergencies, call 911 immediately! For insurance emergencies, our 24/7 hotline is 1-800-CLAIM-NOW. I can also help guide you through immediate steps for your situation.",
                    "This sounds urgent! If anyone is injured or in danger, call 911 first. For insurance emergencies like accidents, theft, or property damage, call 1-800-CLAIM-NOW immediately. How can I help you right now?"
                ],
                "suggestions": ["Call emergency line", "File emergency claim", "Find nearest hospital", "Report police incident"]
            }
        }
        
        if intent in insurance_responses:
            template = insurance_responses[intent]
            response = template["responses"][0]  # Use first response
            suggestions = template["suggestions"]
        else:
            response = "I'm here to help with your insurance needs! Could you please provide more details about what you're looking for?"
            suggestions = ["File a claim", "Policy questions", "Make a payment", "Contact agent"]
        
        return {
            "response": response,
            "suggestions": suggestions,
            "confidence": 0.75
        }
    
    async def chat(self, message: str, user_id: str = "demo_user") -> Dict:
        """Main chat function"""
        
        # Initialize conversation if new
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        
        # Add user message
        user_message = {
            "sender": "user",
            "message": message,
            "timestamp": datetime.datetime.now().isoformat()
        }
        self.conversations[user_id].append(user_message)
        
        # Determine intent
        intent = self.determine_intent(message)
        print(f"🎯 Detected Intent: {intent}")
        
        # Try Gemini API first, fallback to templates
        ai_response = await self.call_gemini_api(
            message, 
            intent, 
            self.conversations[user_id]
        )
        
        if ai_response:
            # Use AI response
            response_data = {
                "response": ai_response,
                "suggestions": self.get_fallback_response(intent)["suggestions"],
                "confidence": 0.9,
                "ai_generated": True
            }
        else:
            # Use fallback response
            response_data = self.get_fallback_response(intent)
            response_data["ai_generated"] = False
        
        # Add bot message to conversation
        bot_message = {
            "sender": "bot",
            "message": response_data["response"],
            "intent": intent,
            "timestamp": datetime.datetime.now().isoformat()
        }
        self.conversations[user_id].append(bot_message)
        
        return {
            "response": response_data["response"],
            "intent": intent,
            "confidence": response_data["confidence"],
            "suggestions": response_data["suggestions"],
            "ai_generated": response_data["ai_generated"],
            "conversation_id": user_id
        }

async def demo_chatbot():
    """Demonstrate the chatbot functionality"""
    
    print("="*80)
    print("🤖 InsurAI Gemini Chatbot - Live Demo")
    print("="*80)
    print("🔑 Using API Key: AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo")
    print("🧠 Model: Gemini 1.5 Flash")
    print("💬 Type 'quit' to exit")
    print("="*80)
    
    chatbot = InsurAIGeminiChatbot()
    
    # Test messages to demonstrate functionality
    test_messages = [
        "Hello, I need help with insurance",
        "I need to file a car insurance claim",
        "What's covered under my home policy?",
        "I want to make a payment",
        "This is an emergency - I was in an accident!"
    ]
    
    print("\n🎭 Demo Mode - Testing with sample messages:")
    print("-" * 50)
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n👤 User: {message}")
        
        try:
            response = await chatbot.chat(message)
            
            print(f"🤖 InsurAI: {response['response']}")
            print(f"🎯 Intent: {response['intent']} | Confidence: {response['confidence']:.2f}")
            print(f"🧠 AI Generated: {response['ai_generated']}")
            
            if response['suggestions']:
                print(f"💡 Suggestions: {', '.join(response['suggestions'][:3])}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 50)
        
        if i < len(test_messages):
            await asyncio.sleep(1)  # Small delay between messages
    
    print("\n🎉 Demo Complete!")
    print("\n📋 Integration Instructions:")
    print("1. The chatbot is fully functional with Gemini API")
    print("2. It includes fallback responses for reliability")
    print("3. Supports insurance-specific intent detection")
    print("4. Ready for frontend integration")
    print("\n🚀 To integrate with the frontend:")
    print("- Start the FastAPI server with this chatbot")
    print("- Update the frontend to call the chat API")
    print("- Use the enhanced aiService.js provided")

async def main():
    """Main function"""
    await demo_chatbot()

if __name__ == "__main__":
    asyncio.run(main())
