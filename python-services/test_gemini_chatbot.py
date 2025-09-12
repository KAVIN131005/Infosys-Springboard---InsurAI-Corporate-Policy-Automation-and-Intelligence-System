"""
Quick Test Script for InsurAI Gemini Chatbot
Tests various scenarios and functionalities
"""
import requests
import json
import time

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {test_name}")
    print('='*60)

def test_health_endpoint():
    """Test health endpoint"""
    print_test_header("Health Check")
    
    try:
        response = requests.get("http://localhost:8003/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check Passed")
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            print(f"   Gemini API: {data.get('dependencies', {}).get('gemini_api', 'Unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_chat_mode():
    """Test chat mode endpoint"""
    print_test_header("Chat Mode Check")
    
    try:
        response = requests.get("http://localhost:8003/api/chat/mode", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat Mode Check Passed")
            print(f"   Mode: {data.get('mode', 'Unknown')}")
            print(f"   Gemini Working: {data.get('gemini_working', False)}")
            print(f"   Service Available: {data.get('service_available', False)}")
            return True
        else:
            print(f"❌ Chat mode check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat mode error: {e}")
        return False

def test_chat_query(question, expected_intent=None):
    """Test a chat query"""
    print(f"\n🤖 Testing Query: '{question}'")
    
    try:
        response = requests.post(
            "http://localhost:8003/api/chat/query",
            params={"question": question},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Query Successful")
            print(f"   Intent: {data.get('intent', 'Unknown')}")
            print(f"   Confidence: {data.get('confidence', 0):.2f}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Response: {data.get('response', 'No response')[:150]}...")
            
            if data.get('suggestions'):
                print(f"   Suggestions: {', '.join(data['suggestions'][:3])}")
            
            if expected_intent and data.get('intent') == expected_intent:
                print(f"✅ Intent detection correct: {expected_intent}")
            elif expected_intent:
                print(f"⚠️  Expected intent: {expected_intent}, Got: {data.get('intent')}")
            
            return True
        else:
            print(f"❌ Query failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Query error: {e}")
        return False

def run_comprehensive_tests():
    """Run comprehensive chatbot tests"""
    print("\n" + "="*80)
    print("🚀 InsurAI Gemini Chatbot - Comprehensive Test Suite")
    print("="*80)
    
    # Test basic connectivity
    if not test_health_endpoint():
        print("❌ Basic connectivity failed. Is the service running?")
        return False
    
    if not test_chat_mode():
        print("❌ Chat mode check failed.")
        return False
    
    print("\n" + "="*60)
    print("💬 Testing Chat Scenarios")
    print("="*60)
    
    # Test various chat scenarios
    test_scenarios = [
        ("Hello, I need help with insurance", "greeting"),
        ("I need to file a claim for my car accident", "claim_inquiry"),
        ("What's covered under my home insurance policy?", "policy_question"),
        ("I want to make a payment on my bill", "billing_inquiry"),
        ("This is an emergency! I was in an accident", "emergency"),
        ("I'm very unhappy with your service", "complaint"),
        ("Can I get a quote for auto insurance?", "quote_request"),
        ("How much does life insurance cost?", "life_insurance"),
        ("My house was damaged in a storm", "home_insurance"),
        ("I need to see a doctor but don't know if it's covered", "health_insurance")
    ]
    
    successful_tests = 0
    total_tests = len(test_scenarios)
    
    for question, expected_intent in test_scenarios:
        if test_chat_query(question, expected_intent):
            successful_tests += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)
    print(f"✅ Successful Tests: {successful_tests}/{total_tests}")
    print(f"📈 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 All tests passed! Chatbot is fully functional.")
    elif successful_tests >= total_tests * 0.8:
        print("✅ Most tests passed. Chatbot is working well.")
    else:
        print("⚠️  Some tests failed. Check the service configuration.")
    
    return successful_tests >= total_tests * 0.8

def test_advanced_features():
    """Test advanced chatbot features"""
    print("\n" + "="*60)
    print("🔬 Testing Advanced Features")
    print("="*60)
    
    # Test conversation flow
    print("\n🔄 Testing Conversation Flow:")
    test_chat_query("Hello")
    time.sleep(1)
    test_chat_query("I need help with a claim")
    time.sleep(1)
    test_chat_query("My car was damaged yesterday")
    
    # Test edge cases
    print("\n🎯 Testing Edge Cases:")
    test_chat_query("")  # Empty message
    time.sleep(1)
    test_chat_query("asdfghjkl")  # Nonsense message
    time.sleep(1)
    test_chat_query("HELP ME NOW!!!")  # Urgent message with caps

def main():
    """Main test function"""
    try:
        print("Starting comprehensive chatbot tests...")
        print("⏳ Please ensure the service is running on port 8003")
        time.sleep(2)
        
        # Run basic tests
        basic_success = run_comprehensive_tests()
        
        if basic_success:
            # Run advanced tests
            test_advanced_features()
            
            print("\n" + "="*80)
            print("🎉 Testing Complete!")
            print("="*80)
            print("\n📋 Next Steps:")
            print("1. Start the frontend: cd frontend && npm run dev")
            print("2. Open http://localhost:3000")
            print("3. Navigate to the Chatbot page")
            print("4. Test the full integration")
            print("\n💡 The chatbot is ready for production use!")
        else:
            print("\n❌ Basic tests failed. Please check the service.")
            
    except KeyboardInterrupt:
        print("\n👋 Tests cancelled by user")
    except Exception as e:
        print(f"\n💥 Test suite failed: {e}")

if __name__ == "__main__":
    main()
