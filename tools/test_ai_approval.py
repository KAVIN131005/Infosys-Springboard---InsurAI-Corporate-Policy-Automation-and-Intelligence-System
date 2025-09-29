import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_backend_health():
    """Test if backend is responding"""
    try:
        response = requests.get(f"{BASE_URL}/api/policies/public", timeout=5)
        print(f"✅ Backend Health: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend Health: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    payload = {
        "username": "ai_test_user",
        "password": "TestPass123!",
        "email": "aitest@example.com",
        "firstName": "AI",
        "lastName": "Test",
        "phoneNumber": "1234567890",
        "dateOfBirth": "1990-01-01",
        "address": "123 Test St",
        "city": "TestCity",
        "state": "TS",
        "postalCode": "12345",
        "country": "TestCountry",
        "role": "USER"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=10)
        print(f"✅ User Registration: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"   User ID: {data.get('id')}")
            print(f"   Token: {data.get('token')[:20]}..." if data.get('token') else "   No token")
            return data.get('token')
        else:
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ User Registration: {e}")
        return None

def test_policy_application(token, low_risk=True):
    """Test policy application with different risk profiles"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get available policies first
    try:
        policies_response = requests.get(f"{BASE_URL}/api/policies/public", headers=headers, timeout=10)
        if not policies_response.ok:
            print(f"❌ Failed to get policies: {policies_response.status_code}")
            return False
            
        policies = policies_response.json()
        if not policies:
            print("❌ No policies available")
            return False
            
        policy_id = policies[0]["id"]
        print(f"📋 Using Policy ID: {policy_id} - {policies[0].get('name', 'Unknown')}")
        
    except Exception as e:
        print(f"❌ Failed to get policies: {e}")
        return False
    
    # Test application with different risk profiles
    if low_risk:
        # Low risk application
        application_data = {
            "policyId": policy_id,
            "firstName": "AI",
            "lastName": "Test",
            "email": "aitest@example.com",
            "age": 30,
            "occupation": "Software Engineer",
            "annualSalary": 120000,  # High salary = low financial risk
            "medicalHistory": "None",
            "previousClaims": "None",
            "hasExistingPolicies": False,
            "additionalInformation": "Test application for AI approval system"
        }
        risk_type = "LOW RISK"
    else:
        # High risk application
        application_data = {
            "policyId": policy_id,
            "firstName": "AI", 
            "lastName": "Test",
            "email": "aitest@example.com",
            "age": 75,  # High age = high risk
            "occupation": "Extreme Sports Athlete",
            "annualSalary": 25000,  # Low salary = high financial risk
            "medicalHistory": "Multiple chronic conditions",
            "previousClaims": "Several high-value claims",
            "hasExistingPolicies": True,
            "additionalInformation": "High risk profile for testing admin approval"
        }
        risk_type = "HIGH RISK"
    
    try:
        print(f"\n🧪 Testing {risk_type} Application...")
        response = requests.post(f"{BASE_URL}/api/user-policies/apply", 
                               json=application_data, headers=headers, timeout=15)
        
        print(f"   Response Status: {response.status_code}")
        
        if response.ok:
            data = response.json()
            status = data.get('status', 'UNKNOWN')
            ai_assessment = data.get('aiAssessment', 'No assessment')
            risk_score = data.get('riskScore', 'No score')
            
            print(f"   ✅ Application Status: {status}")
            print(f"   🤖 AI Assessment: {ai_assessment}")
            print(f"   📊 Risk Score: {risk_score}")
            
            if status == 'ACTIVE':
                print(f"   🎉 AUTO-APPROVED! Policy is immediately active.")
                print(f"   📅 Start Date: {data.get('startDate')}")
                print(f"   💰 Monthly Premium: ${data.get('monthlyPremium')}")
            elif status == 'PENDING_APPROVAL':
                print(f"   ⏳ ADMIN REVIEW REQUIRED - High risk detected.")
                print(f"   📝 Notes: {data.get('approvalNotes', 'No notes')}")
            
            return True
        else:
            print(f"   ❌ Application Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Policy Application: {e}")
        return False

def main():
    print("🚀 Testing AI-Driven Policy Approval System")
    print("=" * 50)
    
    # Test 1: Backend Health
    if not test_backend_health():
        print("💥 Backend is not running. Please start the Spring Boot application.")
        return
        
    # Test 2: User Registration  
    token = test_user_registration()
    if not token:
        print("💥 User registration failed. Cannot proceed with tests.")
        return
        
    # Test 3: Low Risk Application (should auto-approve)
    print("\n" + "="*50)
    success1 = test_policy_application(token, low_risk=True)
    
    # Test 4: High Risk Application (should require admin approval)
    print("\n" + "="*50)
    success2 = test_policy_application(token, low_risk=False)
    
    # Summary
    print("\n" + "="*50)
    print("🏁 TEST SUMMARY")
    print("="*50)
    if success1 and success2:
        print("✅ All tests passed! AI approval system is working correctly.")
        print("🔍 Expected Results:")
        print("   - Low risk app → AUTO-APPROVED (ACTIVE status)")
        print("   - High risk app → ADMIN REVIEW (PENDING_APPROVAL status)")
    else:
        print("❌ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()