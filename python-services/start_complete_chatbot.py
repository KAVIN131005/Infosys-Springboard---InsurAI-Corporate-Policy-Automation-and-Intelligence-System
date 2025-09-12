"""
Complete InsurAI Chatbot Startup Script
Handles environment setup and service launch
"""
import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("\n" + "="*60)
    print("🤖 InsurAI Chatbot - Complete Implementation")
    print("="*60)
    print("🚀 Starting comprehensive insurance AI assistant")
    print("📋 Features: Claims, Policies, Billing, Emergency Help")
    print("🧠 AI: Google Gemini + Fallback Templates")
    print("="*60 + "\n")

def setup_environment():
    """Setup environment variables and API keys"""
    print("🔧 Setting up environment...")
    
    # Check if GEMINI_API_KEY is set
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found!")
        print("\n📋 To get a FREE Gemini API key:")
        print("1. Visit: https://aistudio.google.com/app/apikey")
        print("2. Sign in with Google account")
        print("3. Click 'Create API Key'")
        print("4. Copy the key")
        print("\n💡 Options to set the key:")
        print("Option 1 - Set for this session:")
        print('  set GEMINI_API_KEY=your_key_here')
        print("Option 2 - Enter it now:")
        
        user_key = input("\nEnter your Gemini API key (or press Enter for demo mode): ").strip()
        
        if user_key and user_key.startswith('AIza'):
            os.environ["GEMINI_API_KEY"] = user_key
            print(f"✅ API key set: {user_key[:10]}...")
            api_key = user_key
        else:
            print("🎭 Running in DEMO mode with template responses")
    else:
        print(f"✅ Found API key: {api_key[:10]}...")
    
    # Set other environment variables
    os.environ["GEMINI_MODEL"] = "gemini-1.5-flash"
    os.environ["HOST"] = "0.0.0.0"
    os.environ["PORT"] = "8000"
    os.environ["DEBUG"] = "true"
    
    return bool(api_key)

def check_dependencies():
    """Check if required packages are installed"""
    print("📦 Checking dependencies...")
    
    required_packages = [
        "fastapi", "uvicorn", "httpx", "pydantic", "python-multipart"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("📥 Installing missing packages...")
        
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
    
    print("✅ All dependencies satisfied")
    return True

def start_backend_service():
    """Start the FastAPI backend service"""
    print("🚀 Starting backend service...")
    
    try:
        # Change to the correct directory
        os.chdir(Path(__file__).parent)
        
        # Start the service
        import uvicorn
        from app.main import app
        
        print("✅ Backend service starting...")
        print("📍 URL: http://localhost:8000")
        print("📖 API Docs: http://localhost:8000/docs")
        print("💬 Chat Test: http://localhost:8000/api/chat/mode")
        print("\n🔄 Starting server (press Ctrl+C to stop)...")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
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
    print("🧪 Testing service...")
    
    max_retries = 10
    for i in range(max_retries):
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend service is healthy!")
                
                # Test chat endpoint
                chat_response = requests.post(
                    "http://localhost:8000/api/chat/query",
                    params={"question": "Hello, test message"}
                )
                
                if chat_response.status_code == 200:
                    data = chat_response.json()
                    print(f"✅ Chat service working: {data.get('response', 'No response')[:50]}...")
                    return True
                else:
                    print(f"❌ Chat service error: {chat_response.status_code}")
                    
            else:
                print(f"❌ Health check failed: {response.status_code}")
                
        except requests.exceptions.RequestException:
            print(f"⏳ Waiting for service... ({i+1}/{max_retries})")
            time.sleep(2)
    
    print("❌ Service test failed")
    return False

def print_instructions():
    """Print usage instructions"""
    print("\n" + "="*60)
    print("🎉 InsurAI Chatbot is Ready!")
    print("="*60)
    print("\n📱 Frontend Setup:")
    print("1. Open new terminal")
    print("2. cd frontend")
    print("3. npm run dev")
    print("4. Open http://localhost:3000")
    print("5. Navigate to Chatbot page")
    print("\n💬 Direct API Testing:")
    print("• Health: http://localhost:8000/health")
    print("• Chat Mode: http://localhost:8000/api/chat/mode")
    print("• API Docs: http://localhost:8000/docs")
    print("\n🧪 Test Commands:")
    print("• curl \"http://localhost:8000/api/chat/query?question=Hello\"")
    print("• python quick_test.py")
    print("\n🎭 Demo Messages to Try:")
    print("• 'I need to file a car insurance claim'")
    print("• 'What's covered under my home policy?'")
    print("• 'I want to make a payment'")
    print("• 'This is an emergency - I was in an accident'")
    print("\n" + "="*60)

def main():
    """Main startup function"""
    try:
        print_banner()
        
        # Setup environment
        has_api_key = setup_environment()
        
        # Check dependencies
        if not check_dependencies():
            print("❌ Dependency check failed")
            return False
        
        # Print API status
        if has_api_key:
            print("🧠 AI Mode: Gemini API + Fallback Templates")
        else:
            print("🎭 Demo Mode: Template Responses Only")
        
        print("\n" + "-"*40)
        
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
        print("\n❌ Failed to start InsurAI Chatbot")
        sys.exit(1)
