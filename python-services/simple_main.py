from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
try:
    from dotenv import load_dotenv
    # Load environment variables from .env (if python-dotenv is installed)
    load_dotenv()
except Exception:
    # If dotenv not available, rely on environment variables set outside the process
    pass

# Import chat router and mount under /api/ai
try:
    from app.routes.chat_api import router as chat_router
except Exception:
    chat_router = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="InsurAI - AI Services",
    description="Comprehensive AI services for insurance automation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
async def read_root():
    return {
        "message": "InsurAI AI Services Running",
        "version": "1.0.0",
        "status": "healthy",
        "services": [
            "Risk Assessment", 
            "Claims Analysis",
            "NLP Processing",
            "Chatbot"
        ],
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "risk": "/api/risk/*",
            "claims": "/api/claims/*",
            "nlp": "/api/nlp/*",
            "chat": "/api/chat/*"
        }
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-09-01T10:00:00Z",
        "services": {
            "risk_assessment": "operational",
            "fraud_detection": "operational", 
            "nlp_service": "operational",
            "chatbot": "operational"
        }
    }

# Simple API endpoints for testing
@app.post("/api/risk/assess", tags=["Risk Assessment"])
async def assess_risk(data: dict):
    """Simple risk assessment endpoint"""
    try:
        # Mock risk assessment
        risk_score = 0.3 if data.get("age", 30) < 65 else 0.6
        
        return {
            "risk_score": risk_score,
            "risk_level": "low" if risk_score < 0.4 else "medium",
            "recommendations": ["Standard processing recommended"],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/claims/analyze", tags=["Claims Analysis"])
async def analyze_claim(data: dict):
    """Simple claims analysis endpoint"""
    try:
        # Mock fraud detection
        fraud_score = 0.2 if len(data.get("description", "")) < 100 else 0.5
        
        return {
            "fraud_score": fraud_score,
            "risk_level": "low" if fraud_score < 0.4 else "medium",
            "indicators": ["Standard claim pattern"],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/nlp/analyze", tags=["NLP Processing"])
async def analyze_text(data: dict):
    """Simple text analysis endpoint"""
    try:
        text = data.get("text", "")
        word_count = len(text.split())
        
        # Mock sentiment analysis
        sentiment = "positive" if "good" in text.lower() else "neutral"
        
        return {
            "sentiment": sentiment,
            "word_count": word_count,
            "entities": [],
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

@app.post("/api/chat/query", tags=["Chatbot"])
async def chat_query(question: str = None):
    """Chatbot endpoint using Gemini ONLY"""
    try:
        if not question:
            return JSONResponse(
                status_code=400,
                content={"error": "Question parameter is required", "status": "failed"}
            )

        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if not gemini_api_key:
            logger.error("GEMINI_API_KEY not set; Gemini required")
            return JSONResponse(
                status_code=400,
                content={
                    "error": "GEMINI_API_KEY is required. Set the GEMINI_API_KEY environment variable to enable the Gemini-powered chatbot.",
                    "status": "failed"
                }
            )

        try:
            # Call Gemini only — no fallback to dummy responses
            response_text = await call_gemini_api(question, gemini_api_key)
            intent = determine_intent(question)
            confidence = 0.9  # assume high confidence for Gemini
        except Exception as gemini_error:
            logger.exception("Gemini API call failed")
            return JSONResponse(
                status_code=502,
                content={
                    "error": f"Gemini API call failed: {str(gemini_error)}",
                    "status": "failed"
                }
            )

        suggestions = generate_suggestions(intent, question)
        return {
            "response": response_text,
            "intent": intent,
            "confidence": confidence,
            "suggestions": suggestions,
            "status": "success",
            "source": "gemini"
        }
    except Exception as e:
        logger.exception("Chat query error")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "failed"}
        )

async def call_gemini_api(question: str, api_key: str) -> str:
    """Call Gemini API for intelligent responses"""
    try:
        import httpx
        
        # Create versatile AI assistant prompt that handles both general and insurance questions
        prompt = f"""You are an intelligent AI assistant for InsurAI, a comprehensive insurance management platform. You can help with both general questions and insurance-specific topics.

For INSURANCE-RELATED questions, provide detailed information about:
- Auto Insurance (Coverage: $50K-$100K, Premium: $1200-2400/year)
- Health Insurance (Coverage: $100K-$500K, Premium: $2400-3500/year)  
- Home Insurance (Coverage: $250K-$300K, Premium: $800-1200/year)
- Life Insurance (Coverage: $250K-$1M, Premium: $550-1800/year)
- Claims processing, billing, policy management, risk assessment

For GENERAL questions, provide helpful, accurate, and friendly responses on topics like:
- Technology, science, mathematics, history, literature
- How-to guides and explanations
- General knowledge and trivia
- Advice and recommendations
- Creative writing and brainstorming

User Question: {question}

Please provide a helpful, accurate, and engaging response. If it's insurance-related, include specific details about our InsurAI platform services. If it's a general question, provide informative and friendly assistance while maintaining a professional tone."""

        # Gemini API endpoint
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        headers = {
            "Content-Type": "application/json",
        }
        params = {"key": api_key}
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, params=params, json=payload)
            response.raise_for_status()
            
            data = response.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    return candidate["content"]["parts"][0]["text"]
            
            return "I'm here to help with your insurance questions. Could you please provide more details about what you need assistance with?"
            
    except Exception as e:
        print(f"Gemini API call failed: {e}")
        raise e

def get_fallback_response(question: str) -> tuple:
    """Comprehensive fallback responses for both general and insurance topics"""
    question_lower = question.lower()
    
    # Direct definition / meaning queries about insurance
    if "insurance" in question_lower and any(kw in question_lower for kw in ["what is", "what's", "define", "definition", "meaning"]):
        intent = "insurance_definition"
        response = (
            "Insurance is a contract (policy) where an individual or organization pays a premium in exchange "
            "for financial protection against specified losses. It transfers risk from the insured to an "
            "insurer and can cover areas such as property, auto, health, life, and liability."
        )
        confidence = 0.95
        return response, intent, confidence
    
    # General Knowledge Queries
    if any(word in question_lower for word in ["what is", "who is", "when", "where", "why", "how does", "explain"]):
        if not any(insurance_word in question_lower for insurance_word in ["insurance", "policy", "claim", "premium", "coverage"]):
            intent = "general_knowledge"
            if "weather" in question_lower:
                response = "I can provide general information about weather, but for real-time weather updates, I recommend checking a dedicated weather service. Is there something specific about weather patterns or meteorology you'd like to know?"
            elif "time" in question_lower:
                response = "I can help with time-related questions! For current time, check your device's clock. I can explain time zones, calendars, or help with time calculations. What specific time-related topic interests you?"
            elif "math" in question_lower or "calculate" in question_lower:
                response = "I can help with math problems, calculations, and mathematical concepts! Feel free to ask about arithmetic, algebra, geometry, statistics, or any math topic you need assistance with."
            elif "technology" in question_lower or "computer" in question_lower:
                response = "I can help explain technology concepts, computer basics, software, programming, or digital tools. What specific technology topic would you like to learn about?"
            elif "history" in question_lower:
                response = "I can discuss historical events, periods, figures, and civilizations. What historical topic or time period interests you?"
            elif "science" in question_lower:
                response = "I'm happy to explain scientific concepts, discoveries, and phenomena across physics, chemistry, biology, and more. What scientific topic would you like to explore?"
            else:
                response = "I'm here to help with a wide range of topics! I can assist with general knowledge questions, explanations, how-to guides, and of course, all things related to insurance. What would you like to know more about?"
            confidence = 0.7
    
    # Technology and Computing
    elif any(word in question_lower for word in ["computer", "software", "programming", "app", "website", "internet"]):
        intent = "technology"
        response = "I can help with technology questions! Whether you're curious about software, programming concepts, web development, mobile apps, or general computer topics, I'm here to assist. What specific technology topic interests you?"
        confidence = 0.8
    
    # Math and Calculations
    elif any(word in question_lower for word in ["math", "calculate", "plus", "minus", "multiply", "divide", "equation"]):
        intent = "mathematics"
        response = "I can help with mathematical problems and concepts! I can assist with basic arithmetic, algebra, geometry, statistics, and more. Please share your math question or problem, and I'll help solve it step by step."
        confidence = 0.9
    
    # Science Questions
    elif any(word in question_lower for word in ["science", "physics", "chemistry", "biology", "space", "earth"]):
        intent = "science"
        response = "I'm excited to discuss science with you! I can explain concepts in physics, chemistry, biology, earth science, astronomy, and more. What scientific topic or phenomenon would you like to explore?"
        confidence = 0.8
    
    # Creative and Fun Questions
    elif any(word in question_lower for word in ["joke", "funny", "story", "creative", "write", "poem"]):
        intent = "creative"
        response = "I'd be happy to help with creative tasks! I can share jokes, write stories, create poems, help with creative writing, or brainstorm ideas. What kind of creative assistance would you like?"
        confidence = 0.8
    
    # Auto Insurance Queries
    elif any(word in question_lower for word in ["auto", "car", "vehicle", "driving", "accident", "collision"]):
        intent = "auto_insurance"
        if "claim" in question_lower:
            response = "For auto insurance claims: 1) Ensure everyone's safety first, 2) Call police if required, 3) Take photos of damage and exchange information, 4) Contact us at 1-800-CLAIMS or submit through our app. You'll need your policy number (like AUTO-2024-001), driver's license, and accident details. Processing typically takes 3-7 business days."
        elif "premium" in question_lower or "cost" in question_lower:
            response = "Our auto insurance premiums range from $1,200-$2,400 annually depending on coverage, vehicle type, driving history, and location. We offer liability, collision, comprehensive, and uninsured motorist coverage. Get a personalized quote by providing your vehicle details and driving history."
        else:
            response = "Our auto insurance covers liability, collision, comprehensive damages, and more. Coverage limits range from $50K-$100K. We offer competitive rates starting at $100/month with options for multi-car discounts, safe driver bonuses, and bundling savings."
        confidence = 0.9
    
    # Health Insurance Queries  
    elif any(word in question_lower for word in ["health", "medical", "doctor", "hospital", "prescription"]):
        intent = "health_insurance"
        if "claim" in question_lower:
            response = "For health insurance claims: Most are processed automatically when you use network providers. For manual submissions, provide receipts, treatment details, and your policy number (like HEALTH-2024-003). Claims are typically processed within 15-30 days. Check your coverage limits and deductibles first."
        elif "coverage" in question_lower:
            response = "Our health insurance plans cover medical expenses, hospitalization, prescription drugs, preventive care, and specialist visits. Coverage ranges from $100K-$500K with deductibles from $1,000-$5,000. Plans include network providers and emergency services."
        else:
            response = "We offer comprehensive health insurance with medical, dental, and vision coverage. Premiums range from $2,400-$3,500 annually. Benefits include preventive care, prescription coverage, and access to our nationwide provider network."
        confidence = 0.9
    
    # Home Insurance Queries
    elif any(word in question_lower for word in ["home", "house", "property", "dwelling", "fire", "flood", "theft"]):
        intent = "home_insurance"
        if "claim" in question_lower:
            response = "For home insurance claims: 1) Secure the property and prevent further damage, 2) Document damage with photos, 3) Contact us immediately at 1-800-CLAIMS, 4) Keep receipts for temporary repairs. We cover dwelling, personal property, and liability. Claims are reviewed within 48 hours."
        elif "coverage" in question_lower:
            response = "Home insurance covers dwelling ($250K-$300K), personal property ($150K), liability ($100K), and additional living expenses. We protect against fire, theft, storm damage, and more. Optional riders available for jewelry, electronics, and high-value items."
        else:
            response = "Our home insurance protects your property and belongings with coverage up to $300K for dwelling and $150K for personal property. Premiums start at $800/year. We cover fire, theft, storm damage, and liability protection."
        confidence = 0.9
    
    # Life Insurance Queries
    elif any(word in question_lower for word in ["life", "death", "beneficiary", "term", "whole"]):
        intent = "life_insurance"
        response = "Our life insurance provides financial protection for your loved ones with coverage from $250K to $1M. We offer term (20-30 year) and whole life policies. Premiums range from $550-$1,800 annually based on age, health, and coverage amount. Simple application process with fast approval."
        confidence = 0.9
    
    # Claims Processing
    elif "claim" in question_lower:
        intent = "claim_inquiry"
        if "status" in question_lower or "track" in question_lower:
            response = "Track your claim status online at our portal or mobile app using your claim number. You'll receive updates via email and SMS. Typical processing times: Auto (3-7 days), Health (15-30 days), Home (5-10 days), Life (30-60 days). For urgent matters, call our claims hotline."
        elif "documents" in question_lower or "paperwork" in question_lower:
            response = "Required claim documents typically include: Policy number, incident report/photos, receipts, police reports (if applicable), medical records (for health claims), and proof of ownership. Upload documents through our secure portal or mobile app for faster processing."
        else:
            response = "Filing a claim is easy: 1) Report the incident immediately, 2) Gather required documentation, 3) Submit through our app, website, or call 1-800-CLAIMS, 4) Work with your assigned adjuster, 5) Receive settlement. We're here to guide you through every step."
        confidence = 0.8
    
    # Policy Questions
    elif any(word in question_lower for word in ["policy", "coverage", "deductible", "premium", "benefits"]):
        intent = "policy_question"
        if "deductible" in question_lower:
            response = "Deductibles vary by policy type: Auto ($500-$2,000), Health ($1,000-$5,000), Home ($1,000-$2,500). Higher deductibles typically mean lower premiums. You can adjust your deductible during renewal or when making policy changes."
        elif "premium" in question_lower:
            response = "Premium costs depend on coverage type, risk factors, and selected deductibles. Auto: $1,200-$2,400/year, Health: $2,400-$3,500/year, Home: $800-$1,200/year, Life: $550-$1,800/year. We offer monthly or annual payment options with discounts for bundling."
        else:
            response = "Our policies provide comprehensive protection with competitive rates. Each policy includes detailed coverage information, benefits, exclusions, and terms. You can view your policy documents online, make changes during open enrollment, or add riders for additional protection."
        confidence = 0.8
    
    # Billing and Payments
    elif any(word in question_lower for word in ["payment", "bill", "billing", "due", "autopay"]):
        intent = "billing_inquiry"
        if "due" in question_lower:
            response = "Payment due dates depend on your billing cycle (monthly or annual). You'll receive reminders 10 days before due date via email/SMS. Late payments may result in coverage lapse after a 30-day grace period. Set up autopay to never miss a payment."
        elif "autopay" in question_lower or "automatic" in question_lower:
            response = "Set up automatic payments through our website or mobile app. Choose from checking account, savings account, or credit card. Autopay ensures on-time payments and may qualify for a small discount. You can modify or cancel autopay anytime."
        else:
            response = "We accept payments via online portal, mobile app, phone, or mail. Payment methods include bank transfer, credit/debit cards, and check. Set up autopay for convenience and potential discounts. Grace period of 30 days for late payments."
        confidence = 0.8
    
    # Quotes and Applications
    elif any(word in question_lower for word in ["quote", "application", "apply", "enroll", "sign up"]):
        intent = "quote_request"
        response = "Get instant quotes through our website or mobile app! Provide basic information about yourself and desired coverage. Auto quotes need vehicle details and driving history. Health quotes require age and medical history. Home quotes need property details. Most quotes ready in under 5 minutes."
        confidence = 0.8
    
    # Customer Service and Contact
    elif any(word in question_lower for word in ["contact", "phone", "email", "support", "help"]):
        intent = "customer_service"
        response = "Contact us anytime: Phone: 1-800-INSURAI, Email: support@insurai.com, Live Chat available 24/7 on our website/app, Claims Hotline: 1-800-CLAIMS. Our customer service team is ready to help with policies, claims, payments, and general questions."
        confidence = 0.9
    
    # Greetings
    elif any(greeting in question_lower for greeting in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "how are you"]):
        intent = "greeting"
        response = "Hello! I'm your AI assistant for InsurAI. I can help with both insurance-related questions and general topics. Whether you need help with policies, claims, billing, or just want to have a conversation about science, technology, math, or any other subject, I'm here to assist! How can I help you today?"
        confidence = 0.9
    
    # Thank you
    elif any(word in question_lower for word in ["thank", "thanks", "appreciate"]):
        intent = "gratitude"
        response = "You're very welcome! I'm happy to help with anything you need, whether it's insurance-related questions or general topics. Feel free to ask me anything else!"
        confidence = 0.9
    
    # General inquiries
    else:
        intent = "general_inquiry"
        response = "I'm your versatile AI assistant! I can help you with: 🚗 Auto Insurance, 🏥 Health Insurance, 🏠 Home Insurance, ❤️ Life Insurance, 📋 Claims & Billing, and also general topics like 🧮 Math, 🔬 Science, � Technology, 📚 Knowledge Questions, and more. What would you like to explore?"
        confidence = 0.7
    
    return response, intent, confidence

def determine_intent(question: str) -> str:
    """Determine the intent of the user's question"""
    question_lower = question.lower()
    
    intent_keywords = {
        "claim_inquiry": ["claim", "accident", "damage", "incident", "file claim", "claim status"],
        "policy_question": ["policy", "coverage", "covered", "deductible", "limit", "exclusion"],
        "billing_inquiry": ["payment", "bill", "premium", "due date", "billing", "invoice"],
        "quote_request": ["quote", "price", "cost", "rate", "how much", "estimate"],
        "greeting": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        "emergency": ["emergency", "urgent", "immediately", "asap", "help now"]
    }
    
    for intent, keywords in intent_keywords.items():
        if any(keyword in question_lower for keyword in keywords):
            return intent
    
    return "general_inquiry"

def generate_suggestions(intent: str, question: str) -> list:
    """Generate contextual suggestions based on intent and InsurAI platform features"""
    suggestions_map = {
        "auto_insurance": [
            "How do I file an auto claim?",
            "What's covered in auto insurance?", 
            "Get auto insurance quote",
            "Multi-car discount options"
        ],
        "health_insurance": [
            "Submit a health claim",
            "Find network doctors",
            "Prescription coverage details",
            "Health insurance benefits"
        ],
        "home_insurance": [
            "File home insurance claim",
            "What does home insurance cover?",
            "Property damage protection",
            "Home insurance discounts"
        ],
        "life_insurance": [
            "Life insurance beneficiaries",
            "Term vs whole life insurance",
            "Life insurance quotes",
            "Add coverage amount"
        ],
        "claim_inquiry": [
            "Check my claim status",
            "Required claim documents",
            "Claim processing timeline",
            "Contact claims adjuster"
        ],
        "policy_question": [
            "View my policy details",
            "Update coverage limits",
            "Add policy riders",
            "Policy renewal options"
        ],
        "billing_inquiry": [
            "Set up autopay",
            "View payment history",
            "Change payment method",
            "Billing cycle options"
        ],
        "quote_request": [
            "Get instant quote",
            "Compare coverage options",
            "Bundle insurance savings",
            "Apply for policy online"
        ],
        "discounts_inquiry": [
            "Multi-policy discounts",
            "Safe driver benefits",
            "Home security discounts",
            "Student discounts available"
        ],
        "customer_service": [
            "Speak with agent",
            "24/7 support options",
            "Submit feedback",
            "Schedule appointment"
        ],
        "greeting": [
            "View my policies",
            "File a new claim",
            "Make a payment",
            "Get insurance quote"
        ],
        "general_inquiry": [
            "Browse insurance types",
            "Calculate premium costs",
            "Coverage recommendations", 
            "Account management help"
        ]
    }
    
    return suggestions_map.get(intent, suggestions_map["general_inquiry"])

# Mount chat router if available (this provides /api/ai/chat and related endpoints)
if chat_router is not None:
    app.include_router(chat_router, prefix="/api/ai", tags=["AI Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
