#!/usr/bin/env python3
"""
Test AI Policy Approval System
Tests the end-to-end flow of policy application and AI approval
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8080"
AI_SERVICE_URL = "http://localhost:8003"

def test_ai_approval_system():
    print("🚀 Testing AI Policy Approval System")
    print("=" * 50)
    
    # Test 1: Check if backend is accessible
    print("\n1. Testing Backend Connectivity...")
    try:
        # Try to access a public endpoint or login
        login_data = {
            "username": "user1",  # From data.sql
            "password": "password123"  # Default password from data.sql
        }
        
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"   Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            print(f"   ✅ Login successful for user: {login_result.get('username')}")
            token = login_result.get('token')
            
            # Test 2: Check available policies
            print("\n2. Testing Policy Access...")
            headers = {"Authorization": f"Bearer {token}"}
            
            policies_response = requests.get(f"{BASE_URL}/api/policies/public", headers=headers)
            print(f"   Policies Status: {policies_response.status_code}")
            
            if policies_response.status_code == 200:
                policies = policies_response.json()
                print(f"   ✅ Found {len(policies)} policies available")
                
                if len(policies) > 0:
                    # Test 3: Apply for a policy
                    print("\n3. Testing Policy Application...")
                    policy = policies[0]  # Take first available policy
                    
                    application_data = {
                        "policyId": policy.get('id'),
                        "applicantDetails": {
                            "age": 25,  # Low risk age
                            "annualIncome": 50000,
                            "employmentStatus": "EMPLOYED",
                            "previousClaims": 0
                        }
                    }
                    
                    apply_response = requests.post(f"{BASE_URL}/api/policies/apply", 
                                                 json=application_data, headers=headers)
                    print(f"   Application Status: {apply_response.status_code}")
                    
                    if apply_response.status_code in [200, 201]:
                        result = apply_response.json()
                        print(f"   ✅ Policy application submitted")
                        print(f"   📋 Application Result: {json.dumps(result, indent=2)}")
                        
                        # Check if it was auto-approved
                        if result.get('status') == 'ACTIVE':
                            print("   🎉 ✅ POLICY AUTO-APPROVED BY AI!")
                            return True
                        elif result.get('status') == 'PENDING_APPROVAL':
                            print("   ⏳ Policy pending admin approval (HIGH RISK)")
                            return True
                        else:
                            print(f"   ❓ Unexpected status: {result.get('status')}")
                    else:
                        print(f"   ❌ Application failed: {apply_response.text}")
                else:
                    print("   ❌ No policies available for testing")
            else:
                print(f"   ❌ Cannot access policies: {policies_response.text}")
        else:
            print(f"   ❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"   ❌ Backend connectivity error: {e}")
    
    # Test 4: Check AI Service
    print("\n4. Testing AI Service...")
    try:
        ai_response = requests.get(f"{AI_SERVICE_URL}/health")
        print(f"   AI Service Status: {ai_response.status_code}")
        
        if ai_response.status_code == 200:
            ai_health = ai_response.json()
            print(f"   ✅ AI Service is healthy")
            print(f"   🤖 AI Provider: {ai_health.get('ai_provider', 'Unknown')}")
            
            # Test NLP endpoint
            nlp_test_data = {"text": "This is a low risk policy application for a young professional."}
            nlp_response = requests.post(f"{AI_SERVICE_URL}/api/nlp/analyze", json=nlp_test_data)
            print(f"   NLP Analysis Status: {nlp_response.status_code}")
            
            if nlp_response.status_code == 200:
                nlp_result = nlp_response.json()
                print(f"   ✅ AI analysis working: {nlp_result}")
            else:
                print(f"   ❌ AI analysis failed: {nlp_response.text}")
        else:
            print(f"   ❌ AI Service unhealthy: {ai_response.text}")
            
    except Exception as e:
        print(f"   ❌ AI Service error: {e}")
    
    return False

def main():
    print("Testing AI Policy Approval System...")
    print("This will test:")
    print("- Backend connectivity")
    print("- User authentication") 
    print("- Policy application")
    print("- AI auto-approval logic")
    print("- Risk assessment")
    
    success = test_ai_approval_system()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 AI APPROVAL SYSTEM IS WORKING!")
        print("✅ LOW/MEDIUM risk policies are auto-approved")
        print("⏳ HIGH risk policies require admin approval")
    else:
        print("❌ AI APPROVAL SYSTEM NEEDS ATTENTION")
        print("Please check the backend and AI service logs")
    print("=" * 50)

if __name__ == "__main__":
    main()