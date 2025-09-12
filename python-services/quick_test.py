import requests
import time

# Wait a bit for service to fully start
time.sleep(2)

try:
    # Test the service
    response = requests.get("http://localhost:8003/", timeout=5)
    print("✅ Service is responding!")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"AI Provider: {data.get('ai_provider')}")
    print(f"API Key Status: {data.get('api_key_status')}")
    print(f"Status: {data.get('status')}")
    
    # Test chat mode
    mode_response = requests.get("http://localhost:8003/api/chat/mode", timeout=5)
    mode_data = mode_response.json()
    print(f"\nChat Mode: {mode_data.get('mode')}")
    print(f"Gemini Working: {mode_data.get('gemini_working')}")
    
except Exception as e:
    print(f"❌ Error: {e}")
