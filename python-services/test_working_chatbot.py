"""
Simple test script for the working chatbot
"""
import requests
import json
import time

def test_chatbot_complete():
    """Test the complete chatbot implementation"""
    
    print("🧪 Testing InsurAI Chatbot...")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    # Wait for service to be ready
    print("⏳ Waiting for service...")
    for i in range(10):
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Service is ready!")
                break
        except:
            time.sleep(2)
            print(f"   Attempt {i+1}/10...")
    else:
        print("❌ Service not ready")
        return
    
    # Test chat mode
    try:
        response = requests.get(f"{base_url}/api/chat/mode")
        if response.status_code == 200:
            mode_data = response.json()
            print(f"🔧 Mode: {mode_data.get('mode', 'unknown')}")
            print(f"🧠 AI Status: {'✅ Working' if mode_data.get('gemini_working') else '🎭 Demo Mode'}")
        else:
            print(f"❌ Mode check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Mode check error: {e}")
    
    # Test various chat messages
    test_messages = [
        "Hello, I need help with insurance",
        "I want to file a car insurance claim", 
        "What's covered under my home policy?",
        "I need to make a payment",
        "This is an emergency - I was in an accident",
        "I have a complaint about my service"
    ]
    
    print("\n💬 Testing Chat Messages:")
    print("-" * 30)
    
    for i, message in enumerate(test_messages, 1):
        try:
            response = requests.post(
                f"{base_url}/api/chat/query",
                params={"question": message},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n{i}. User: {message}")
                print(f"   Bot: {data.get('response', 'No response')[:100]}...")
                print(f"   Intent: {data.get('intent', 'unknown')}")
                print(f"   Confidence: {data.get('confidence', 0):.1%}")
                
                if data.get('suggestions'):
                    print(f"   Suggestions: {', '.join(data['suggestions'][:3])}")
            else:
                print(f"❌ Message {i} failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Message {i} error: {e}")
    
    print("\n🎉 Chatbot Test Complete!")
    print("📍 Frontend: http://localhost:3000")
    print("📖 API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    test_chatbot_complete()
