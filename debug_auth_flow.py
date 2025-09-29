#!/usr/bin/env python3
"""
Debug authentication issue for InsurAI analytics endpoint
"""

import requests
import json

BASE_URL = "http://localhost:8080"

def test_auth_flow():
    print("=== DEBUGGING AUTHENTICATION FLOW ===")
    
    # Test 1: Login and get token
    print("\n1. Testing Login...")
    login_data = {
        "username": "admin",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Login Status: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('token')
            
            if token:
                print(f"✅ Token received: {token[:50]}...")
                
                # Test 2: Use token for analytics
                print("\n2. Testing Analytics Access...")
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                analytics_response = requests.get(
                    f"{BASE_URL}/api/analytics/comprehensive",
                    headers=headers
                )
                
                print(f"Analytics Status: {analytics_response.status_code}")
                print(f"Analytics Headers: {dict(analytics_response.headers)}")
                
                if analytics_response.status_code == 200:
                    print("✅ Analytics endpoint accessible!")
                    analytics_data = analytics_response.json()
                    print(f"Data keys: {list(analytics_data.keys())}")
                else:
                    print(f"❌ Analytics Error: {analytics_response.text}")
                    
                    # Test 3: Check if token is valid with a simpler endpoint
                    print("\n3. Testing Token Validity with Profile...")
                    profile_response = requests.get(
                        f"{BASE_URL}/api/user/profile",
                        headers=headers
                    )
                    print(f"Profile Status: {profile_response.status_code}")
                    if profile_response.status_code != 200:
                        print(f"Profile Error: {profile_response.text}")
                    else:
                        print("✅ Token is valid - issue is with analytics endpoint")
                        
            else:
                print("❌ No token in login response")
        else:
            print(f"❌ Login failed")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_different_endpoints():
    """Test different endpoints to see which ones work"""
    print("\n=== TESTING DIFFERENT ENDPOINTS ===")
    
    # Login first
    login_data = {"username": "admin", "password": "password123"}
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if login_response.status_code != 200:
        print("❌ Cannot login, skipping endpoint tests")
        return
        
    token = login_response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints_to_test = [
        "/api/auth/me",
        "/api/user/profile", 
        "/api/dashboard/admin",
        "/api/dashboard/broker",
        "/api/analytics/comprehensive",
        "/api/analytics/role-based-overview"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {endpoint}: {response.status_code}")
            if response.status_code not in [200, 404]:
                print(f"    Error: {response.text[:100]}")
        except Exception as e:
            print(f"❌ {endpoint}: Exception - {e}")

if __name__ == "__main__":
    test_auth_flow()
    test_different_endpoints()