"""
Test the working Gemini service
"""
import requests
import json

def test_service():
    base_url = "http://localhost:8003"
    
    print("🧪 Testing Working Gemini Service")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"✅ Health Check: {response.status_code}")
        health_data = response.json()
        print(f"   Status: {health_data.get('status')}")
        print(f"   Gemini API: {health_data.get('dependencies', {}).get('gemini_api')}")
        print(f"   API Key: {health_data.get('api_key_status')}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return
    
    # Test 2: Chat mode
    try:
        response = requests.get(f"{base_url}/api/chat/mode", timeout=10)
        print(f"\n✅ Chat Mode Check: {response.status_code}")
        mode_data = response.json()
        print(f"   Mode: {mode_data.get('mode')}")
        print(f"   Gemini Working: {mode_data.get('gemini_working')}")
        print(f"   API Key Present: {mode_data.get('gemini_key_present')}")
    except Exception as e:
        print(f"❌ Chat Mode Check Failed: {e}")
        return
    
    # Test 3: Sample chat query
    try:
        response = requests.post(
            f"{base_url}/api/chat/query",
            params={"question": "Hello, I need help with my car insurance claim"},
            timeout=15
        )
        print(f"\n✅ Chat Query: {response.status_code}")
        chat_data = response.json()
        print(f"   Mode: {chat_data.get('mode')}")
        print(f"   AI Generated: {chat_data.get('ai_generated')}")
        print(f"   Intent: {chat_data.get('intent')}")
        print(f"   Response: {chat_data.get('response')[:100]}...")
    except Exception as e:
        print(f"❌ Chat Query Failed: {e}")
        return
    
    print("\n🎉 Service Test Complete!")

if __name__ == "__main__":
    test_service()
