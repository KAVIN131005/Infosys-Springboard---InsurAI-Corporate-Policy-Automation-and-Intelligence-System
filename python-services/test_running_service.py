import asyncio
import httpx
import json

async def test_gemini_service():
    """Test the running Gemini service"""
    print("🧪 Testing Gemini API Service...")
    
    base_url = "http://localhost:8003"
    
    try:
        # Test health endpoint
        async with httpx.AsyncClient() as client:
            print("1. Testing health endpoint...")
            health_response = await client.get(f"{base_url}/health")
            if health_response.status_code == 200:
                health_data = health_response.json()
                print("✅ Health check passed")
                print(f"   Service: {health_data.get('service', 'Unknown')}")
                print(f"   Gemini Status: {health_data.get('gemini_status', 'Unknown')}")
            else:
                print(f"❌ Health check failed: {health_response.status_code}")
                return False
            
            # Test chat endpoint
            print("\n2. Testing chat endpoint...")
            test_message = "I need to file a car insurance claim"
            chat_response = await client.post(
                f"{base_url}/api/chat/query",
                params={"question": test_message}
            )
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                print("✅ Chat endpoint working")
                print(f"   Message: {test_message}")
                print(f"   Response: {chat_data.get('response', 'No response')[:100]}...")
                print(f"   Intent: {chat_data.get('intent', 'Unknown')}")
                print(f"   AI Generated: {chat_data.get('ai_generated', False)}")
                return True
            else:
                print(f"❌ Chat endpoint failed: {chat_response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

async def main():
    success = await test_gemini_service()
    if success:
        print("\n🎉 Application is ready!")
        print("📍 Frontend: http://localhost:3000")
        print("📍 Backend API: http://localhost:8003")
        print("📍 Java Backend: http://localhost:8080")
        print("\n💬 Go to the chatbot page and test the Gemini AI!")
    else:
        print("\n❌ Service test failed")

if __name__ == "__main__":
    asyncio.run(main())
