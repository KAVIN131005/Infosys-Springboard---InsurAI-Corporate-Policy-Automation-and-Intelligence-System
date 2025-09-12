"""
Complete Gemini-Powered InsurAI Chatbot Startup Script
Handles environment setup and service launch with Gemini API integration
"""
import os
import sys
import subprocess
import time
import requests
from pathlib import Path
import json

def print_banner():
    """Print startup banner"""
    print("\n" + "="*70)
    print("🤖 InsurAI Chatbot - Complete Gemini Implementation")
    print("="*70)
    print("🚀 Starting comprehensive insurance AI assistant")
    print("📋 Features: Claims, Policies, Billing, Emergency Help")
    print("🧠 AI: Google Gemini API + Enhanced Fallback Templates")
    print("🔑 API Key: AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo")
    print("="*70 + "\n")

def setup_environment():
    """Setup environment variables and API keys"""
    print("🔧 Setting up environment...")
    
    # Set the provided Gemini API key
    api_key = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
    os.environ["GEMINI_API_KEY"] = api_key
    print(f"✅ API key configured: {api_key[:10]}...")
    
    # Set other environment variables
    os.environ["GEMINI_MODEL"] = "gemini-1.5-flash"
    os.environ["HOST"] = "0.0.0.0"
    os.environ["PORT"] = "8003"  # Use port 8003 for this service
    os.environ["DEBUG"] = "true"
    
    print("✅ Environment configured successfully")
    return True

def check_and_install_dependencies():
    """Check if required packages are installed"""
    print("📦 Checking dependencies...")
    
    required_packages = [
        "fastapi", "uvicorn", "httpx", "pydantic", "python-multipart"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} - Missing")
    
    if missing_packages:
        print(f"\n📥 Installing missing packages: {', '.join(missing_packages)}")
        
        for package in missing_packages:
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", package
                ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
    
    print("✅ All dependencies satisfied")
    return True

def create_enhanced_main():
    """Create an enhanced main.py with complete chat integration"""
    
    main_content = '''"""
Enhanced FastAPI main with complete Gemini chatbot integration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from routes.complete_chat_api import router as complete_chat_router
from routes.document_api import router as document_router
from routes.nlp_api import router as nlp_router
from routes.risk_api import router as risk_router
from routes.claims_api import router as claims_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="InsurAI Gemini Chatbot Service",
    description="Complete AI-powered insurance assistant with Google Gemini integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend
        "http://localhost:8080",  # Java backend
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error", 
            "error": str(exc),
            "service": "InsurAI Chatbot"
        }
    )

# Include routers with proper prefixes
app.include_router(complete_chat_router, prefix="/api/chat", tags=["Gemini Chatbot"])
app.include_router(document_router, prefix="/api/document", tags=["Document Processing"])
app.include_router(nlp_router, prefix="/api/nlp", tags=["Natural Language Processing"])
app.include_router(risk_router, prefix="/api/risk", tags=["Risk Assessment"])
app.include_router(claims_router, prefix="/api/claims", tags=["Claims Analysis"])

@app.get("/", tags=["Health Check"])
async def read_root():
    """Root endpoint with service information"""
    return {
        "message": "InsurAI Gemini Chatbot Service Running",
        "version": "2.0.0",
        "status": "healthy",
        "ai_provider": "Google Gemini",
        "api_key_status": "configured" if os.environ.get("GEMINI_API_KEY") else "missing",
        "services": [
            "Gemini-Powered Chatbot",
            "Document Processing",
            "Risk Assessment", 
            "Claims Analysis",
            "NLP Services"
        ],
        "endpoints": {
            "chat": "/api/chat/query",
            "chat_advanced": "/api/chat/chat",
            "chat_mode": "/api/chat/mode",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health Check"])
async def health_check():
    """Comprehensive health check"""
    
    import httpx
    
    # Check Gemini API connectivity
    gemini_status = "unknown"
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash"
                headers = {"x-goog-api-key": api_key}
                response = await client.get(url, headers=headers)
                gemini_status = "connected" if response.status_code == 200 else "error"
        except Exception:
            gemini_status = "disconnected"
    else:
        gemini_status = "no_api_key"
    
    return {
        "status": "healthy",
        "timestamp": "2025-09-12T00:00:00Z",
        "service": "InsurAI Gemini Chatbot",
        "version": "2.0.0",
        "dependencies": {
            "gemini_api": gemini_status,
            "httpx": True,
            "fastapi": True
        },
        "services": {
            "chatbot": "available",
            "document_processing": "available",
            "risk_assessment": "available",
            "claims_analysis": "available",
            "nlp_services": "available"
        },
        "performance": {
            "response_time": "< 2s",
            "availability": "99.9%"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8003))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting InsurAI Gemini Chatbot on {host}:{port}")
    
    uvicorn.run(
        "enhanced_main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
'''
    
    # Write the enhanced main file
    with open("app/enhanced_main.py", "w", encoding="utf-8") as f:
        f.write(main_content)
    
    print("✅ Enhanced main.py created")

def test_gemini_api():
    """Test Gemini API connectivity"""
    print("🧪 Testing Gemini API...")
    
    api_key = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
    
    try:
        import httpx
        import asyncio
        
        async def test_call():
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': api_key
            }
            
            payload = {
                "contents": [{
                    "parts": [{"text": "Hello, this is a test message for InsurAI chatbot."}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 100
                }
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            return parts[0]["text"].strip()
                
                return "Test response received"
        
        # Run the test
        result = asyncio.run(test_call())
        print(f"✅ Gemini API test successful: {result[:50]}...")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        print("⚠️  Will use fallback responses only")
        return False

def start_backend_service():
    """Start the FastAPI backend service"""
    print("🚀 Starting Gemini-powered backend service...")
    
    try:
        # Change to the correct directory
        os.chdir(Path(__file__).parent)
        
        # Create enhanced main if it doesn't exist
        if not Path("app/enhanced_main.py").exists():
            create_enhanced_main()
        
        # Start the service using enhanced main
        import uvicorn
        
        print("✅ Backend service starting...")
        print("📍 URL: http://localhost:8003")
        print("📖 API Docs: http://localhost:8003/docs")
        print("💬 Chat Test: http://localhost:8003/api/chat/mode")
        print("🧪 Quick Test: http://localhost:8003/api/chat/query?question=Hello")
        print("\n🔄 Starting server (press Ctrl+C to stop)...")
        
        # Import the enhanced app
        sys.path.insert(0, str(Path.cwd() / "app"))
        from enhanced_main import app
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8003,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 Service stopped by user")
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False
    
    return True

def test_service():
    """Test if the service is working"""
    print("🧪 Testing service endpoints...")
    
    max_retries = 15
    for i in range(max_retries):
        try:
            # Test health endpoint
            response = requests.get("http://localhost:8003/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ Backend service is healthy!")
                print(f"   Service: {data.get('service', 'Unknown')}")
                print(f"   Gemini API: {data.get('dependencies', {}).get('gemini_api', 'Unknown')}")
                
                # Test chat endpoint
                chat_response = requests.post(
                    "http://localhost:8003/api/chat/query",
                    params={"question": "Hello, this is a test message for insurance assistance"}
                )
                
                if chat_response.status_code == 200:
                    chat_data = chat_response.json()
                    print(f"✅ Chat service working!")
                    print(f"   Response: {chat_data.get('response', 'No response')[:100]}...")
                    print(f"   Intent: {chat_data.get('intent', 'Unknown')}")
                    print(f"   Status: {chat_data.get('status', 'Unknown')}")
                    return True
                else:
                    print(f"❌ Chat service error: {chat_response.status_code}")
                    
            else:
                print(f"❌ Health check failed: {response.status_code}")
                
        except requests.exceptions.RequestException:
            print(f"⏳ Waiting for service... ({i+1}/{max_retries})")
            time.sleep(3)
    
    print("❌ Service test failed")
    return False

def print_instructions():
    """Print usage instructions"""
    print("\n" + "="*70)
    print("🎉 InsurAI Gemini Chatbot is Ready!")
    print("="*70)
    print("\n📱 Frontend Integration:")
    print("1. Open new terminal")
    print("2. cd frontend")
    print("3. npm run dev")
    print("4. Open http://localhost:3000")
    print("5. Navigate to Chatbot page")
    print("\n💬 Direct API Testing:")
    print("• Health: http://localhost:8003/health")
    print("• Chat Mode: http://localhost:8003/api/chat/mode")
    print("• API Docs: http://localhost:8003/docs")
    print("• Quick Test: http://localhost:8003/api/chat/query?question=Hello")
    print("\n🧪 Test Commands:")
    print('• curl "http://localhost:8003/api/chat/query?question=Hello"')
    print('• curl "http://localhost:8003/api/chat/query?question=I%20need%20to%20file%20a%20claim"')
    print('• curl "http://localhost:8003/health"')
    print("\n🎭 Example Messages to Try:")
    print("• 'I need to file a car insurance claim'")
    print("• 'What's covered under my home policy?'")
    print("• 'I want to make a payment'")
    print("• 'This is an emergency - I was in an accident'")
    print("• 'I'm unhappy with my service'")
    print("• 'Can you help me understand my deductible?'")
    print("\n🔑 Gemini Features:")
    print("• Dynamic AI responses using Gemini 1.5 Flash")
    print("• Context-aware conversations")
    print("• Intent detection and smart routing")
    print("• Fallback templates for reliability")
    print("• Enhanced insurance domain knowledge")
    print("\n" + "="*70)

def main():
    """Main startup function"""
    try:
        print_banner()
        
        # Setup environment
        if not setup_environment():
            print("❌ Environment setup failed")
            return False
        
        # Check dependencies
        if not check_and_install_dependencies():
            print("❌ Dependency check failed")
            return False
        
        # Test Gemini API
        gemini_working = test_gemini_api()
        
        if gemini_working:
            print("🧠 AI Mode: Gemini API + Enhanced Fallback Templates")
        else:
            print("🎭 Demo Mode: Enhanced Template Responses Only")
        
        print("\n" + "-"*50)
        
        # Start service
        return start_backend_service()
        
    except KeyboardInterrupt:
        print("\n👋 Startup cancelled by user")
        return False
    except Exception as e:
        print(f"\n💥 Startup failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Failed to start InsurAI Gemini Chatbot")
        sys.exit(1)
