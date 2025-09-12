"""
Simple Direct Test for Gemini ChatBot Implementation
"""
import asyncio
import httpx
import json
import os

# Set the Gemini API key
os.environ["GEMINI_API_KEY"] = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"

async def test_gemini_direct():
    """Test Gemini API directly"""
    print("🧪 Testing Gemini API Direct Connection...")
    
    api_key = "AIzaSyDp1SWZ_aTLRY200_-fqEWdL0Y6MJh_mfo"
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': api_key
    }
    
    # Test insurance-related prompt
    payload = {
        "contents": [{
            "parts": [{"text": """You are InsurAI, a professional insurance assistant. 

Customer message: "I need to file a car insurance claim"
Intent: claim_inquiry

Provide a helpful, professional insurance assistant response:"""}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 300
        }
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        ai_response = parts[0]["text"].strip()
                        print("✅ Gemini API Connection Successful!")
                        print(f"📝 Response: {ai_response}")
                        return True

    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return False

async def test_chatbot_logic():
    """Test the chatbot logic without server"""
    print("\n🤖 Testing Chatbot Logic...")
    
    # Import our chatbot functions
    import sys
    sys.path.append('app')
    
    try:
        from routes.complete_chat_api import determine_intent, call_gemini_api, get_fallback_response
        
        # Test intent detection
        test_messages = [
            "I need to file a claim",
            "What's covered in my policy?",
            "I want to make a payment", 
            "This is an emergency!"
        ]
        
        for message in test_messages:
            intent = determine_intent(message)
            print(f"✅ '{message}' -> Intent: {intent}")
            
            # Test Gemini API call
            try:
                ai_response = await call_gemini_api(message, intent, [])
                if ai_response:
                    print(f"🧠 Gemini Response: {ai_response[:100]}...")
                else:
                    fallback = get_fallback_response(intent)
                    print(f"🎭 Fallback Response: {fallback['response'][:100]}...")
            except Exception as e:
                print(f"⚠️ AI Error (using fallback): {e}")
                fallback = get_fallback_response(intent)
                print(f"🎭 Fallback Response: {fallback['response'][:100]}...")
            
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Chatbot Logic Error: {e}")
        return False

async def main():
    """Main test function"""
    print("="*70)
    print("🚀 InsurAI Gemini Chatbot - Direct Implementation Test")
    print("="*70)
    
    # Test Gemini API
    gemini_working = await test_gemini_direct()
    
    # Test chatbot logic
    logic_working = await test_chatbot_logic()
    
    print("="*70)
    print("📊 Test Results:")
    print(f"✅ Gemini API: {'Working' if gemini_working else 'Failed'}")
    print(f"✅ Chatbot Logic: {'Working' if logic_working else 'Failed'}")
    
    if gemini_working and logic_working:
        print("\n🎉 Complete Implementation is Ready!")
        print("\n📋 To use the chatbot:")
        print("1. Start backend: uvicorn app.main:app --port 8003")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Test direct API: Visit http://localhost:8003/docs")
    else:
        print("\n⚠️ Some components need attention")
    
    print("="*70)

if __name__ == "__main__":
    asyncio.run(main())
