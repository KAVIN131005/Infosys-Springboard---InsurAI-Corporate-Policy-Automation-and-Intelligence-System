#!/usr/bin/env python3
"""
Quick authentication debugging test for InsurAI application
Tests login and analytics access with different user types
"""

import requests
import json

BASE_URL = "http://localhost:8080"

def test_login_and_analytics():
    """Test login and analytics access"""
    
    # Test login
    login_data = {
        "username": "admin",
        "password": "password123"
    }
    
    print("=== TESTING AUTHENTICATION & ANALYTICS ACCESS ===")
    print(f"Testing login with: {login_data['username']}")
    
    try:
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            print(f"Login successful!")
            print(f"Token received: {login_result.get('token', 'NO TOKEN')[:50]}...")
            print(f"User role: {login_result.get('role', 'NO ROLE')}")
            
            # Test analytics access
            token = login_result.get('token')
            if token:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                # Test comprehensive analytics
                print("\n--- Testing Comprehensive Analytics ---")
                analytics_response = requests.get(
                    f"{BASE_URL}/api/analytics/comprehensive",
                    headers=headers
                )
                
                print(f"Analytics Status: {analytics_response.status_code}")
                
                if analytics_response.status_code == 200:
                    analytics_data = analytics_response.json()
                    print("Analytics data keys:", list(analytics_data.keys()))
                    
                    # Print some sample data structure
                    for key, value in analytics_data.items():
                        if isinstance(value, dict):
                            print(f"  {key}: {len(value)} properties")
                        else:
                            print(f"  {key}: {type(value).__name__}")
                else:
                    print(f"Analytics Error: {analytics_response.text}")
                    
                # Test role-based overview
                print("\n--- Testing Role-Based Overview ---")
                overview_response = requests.get(
                    f"{BASE_URL}/api/analytics/role-based-overview",
                    headers=headers
                )
                
                print(f"Overview Status: {overview_response.status_code}")
                if overview_response.status_code == 200:
                    overview_data = overview_response.json()
                    print("Overview data keys:", list(overview_data.keys()))
                else:
                    print(f"Overview Error: {overview_response.text}")
                    
        else:
            print(f"Login failed: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to server. Make sure the application is running on localhost:8080")
    except Exception as e:
        print(f"ERROR: {str(e)}")

def test_different_users():
    """Test with different user types"""
    users_to_test = [
        {"username": "admin", "password": "password123"},
        {"username": "broker1", "password": "password123"},
        {"username": "user1", "password": "password123"}
    ]
    
    print("\n=== TESTING MULTIPLE USER TYPES ===")
    
    for user_data in users_to_test:
        print(f"\n--- Testing user: {user_data['username']} ---")
        
        try:
            # Login
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json=user_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                print(f"Role: {login_result.get('role', 'NO ROLE')}")
                
                # Quick analytics test
                token = login_result.get('token')
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    analytics_response = requests.get(
                        f"{BASE_URL}/api/analytics/comprehensive",
                        headers=headers
                    )
                    print(f"Analytics Access: {analytics_response.status_code}")
                    
                    if analytics_response.status_code != 200:
                        print(f"Analytics Error: {analytics_response.text}")
            else:
                print(f"Login failed: {login_response.text}")
                
        except Exception as e:
            print(f"ERROR testing {user_data['username']}: {str(e)}")

if __name__ == "__main__":
    test_login_and_analytics()
    test_different_users()