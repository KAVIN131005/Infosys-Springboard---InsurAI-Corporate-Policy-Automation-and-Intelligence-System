"""
Final Verification of Gemini API Integration
"""
import asyncio
import aiohttp
import time

async def verify_gemini_service():
    print("🔍 Verifying Gemini API Integration")
    print("=" * 50)
    
    try:
        # Test the service endpoints
        async with aiohttp.ClientSession() as session:
            
            # 1. Root endpoint
            print("1. Testing root endpoint...")
            async with session.get("http://localhost:8003/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ Service running: {data.get('ai_provider')}")
                    print(f"   ✅ API Key: {data.get('api_key_status')}")
                else:
                    print(f"   ❌ Service error: {response.status}")
                    return
            
            # 2. Health check
            print("\n2. Testing health endpoint...")
            async with session.get("http://localhost:8003/health") as response:
                if response.status == 200:
                    health = await response.json()
                    gemini_status = health.get('dependencies', {}).get('gemini_api', 'unknown')
                    print(f"   ✅ Health: {health.get('status')}")
                    print(f"   ✅ Gemini API: {gemini_status}")
                else:
                    print(f"   ❌ Health check failed: {response.status}")
            
            # 3. Chat mode
            print("\n3. Testing chat mode...")
            async with session.get("http://localhost:8003/api/chat/mode") as response:
                if response.status == 200:
                    mode = await response.json()
                    print(f"   ✅ Chat Mode: {mode.get('mode')}")
                    print(f"   ✅ Gemini Working: {mode.get('gemini_working')}")
                    print(f"   ✅ Key Present: {mode.get('gemini_key_present')}")
                else:
                    print(f"   ❌ Mode check failed: {response.status}")
            
            # 4. Sample chat query
            print("\n4. Testing chat query with Gemini...")
            params = {"question": "Hello, I need help with my car insurance"}
            async with session.post("http://localhost:8003/api/chat/query", params=params) as response:
                if response.status == 200:
                    chat = await response.json()
                    print(f"   ✅ Query Status: {chat.get('status')}")
                    print(f"   ✅ Mode Used: {chat.get('mode')}")
                    print(f"   ✅ AI Generated: {chat.get('ai_generated')}")
                    print(f"   ✅ Intent: {chat.get('intent')}")
                    print(f"   📝 Response: {chat.get('response', '')[:80]}...")
                    
                    if chat.get('mode') == 'gemini' and chat.get('ai_generated'):
                        print("\n🎉 SUCCESS: Gemini API is working perfectly!")
                    else:
                        print("\n⚠️ WARNING: Using fallback mode instead of Gemini")
                else:
                    print(f"   ❌ Chat query failed: {response.status}")
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")

if __name__ == "__main__":
    # Give the service a moment to fully start
    time.sleep(3)
    asyncio.run(verify_gemini_service())
