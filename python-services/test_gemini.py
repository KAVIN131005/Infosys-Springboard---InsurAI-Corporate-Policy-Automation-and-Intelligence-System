"""
Test the Gemini API integration
"""
import requests
import json
import time

def test_gemini_integration():
    """Test the chatbot with Gemini API"""
    
    print("🧪 Testing InsurAI with Gemini API")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    # Wait for service
    print("⏳ Waiting for service...")
    for i in range(5):
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Service is ready!")
                break
        except:
            time.sleep(2)
    
    # Check mode with API key
    try:
        response = requests.get(f"{base_url}/api/chat/mode")
        if response.status_code == 200:
            mode_data = response.json()
            print(f"\n🔧 Chat Mode: {mode_data.get('mode', 'unknown')}")
            print(f"🔑 API Key Present: {mode_data.get('gemini_key_present', False)}")
            print(f"🧠 Gemini Working: {mode_data.get('gemini_working', False)}")
            print(f"📡 Service Available: {mode_data.get('service_available', False)}")
        else:
            print(f"❌ Mode check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Mode check error: {e}")
    
    # Test AI chat
    test_messages = [
        "Hello, I need help with my car insurance",
        "I was in an accident and need to file a claim",
        "What is covered under comprehensive coverage?"
    ]
    
    print("\n💬 Testing AI Chat:")
    print("-" * 30)
    
    for i, message in enumerate(test_messages, 1):
        try:
            response = requests.post(
                f"{base_url}/api/chat/query",
                params={"question": message},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n{i}. User: {message}")
                print(f"   AI: {data.get('response', 'No response')[:150]}...")
                print(f"   Intent: {data.get('intent', 'unknown')}")
                print(f"   Confidence: {data.get('confidence', 0):.1%}")
                print(f"   Status: {data.get('status', 'unknown')}")
            else:
                print(f"❌ Message {i} failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Message {i} error: {e}")
    
    print("\n🎉 Test Complete!")
    print("📱 Now refresh your frontend at http://localhost:3000")

if __name__ == "__main__":
    test_gemini_integration()
