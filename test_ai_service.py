import requests
import json

def test_ai_service():
    """Test the AI service endpoints"""
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        print("Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Health check failed: {e}")
        print()
    
    # Test root endpoint
    try:
        print("Testing root endpoint...")
        response = requests.get(f"{base_url}/")
        print(f"Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Root endpoint failed: {e}")
        print()
    
    # Test risk assessment endpoint
    try:
        print("Testing risk assessment endpoint...")
        test_data = {
            "user_data": {
                "age": 30,
                "occupation": "Software Engineer",
                "medicalHistory": "None",
                "previousClaims": 0,
                "hasExistingPolicies": False,
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "annualSalary": 75000.0
            },
            "policy_type": "GENERAL",
            "coverage_amount": 50000.0,
            "additional_info": {
                "phoneNumber": "555-0123",
                "address": "123 Main St"
            }
        }
        
        response = requests.post(
            f"{base_url}/api/risk/assess",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        print(f"Risk assessment: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error response: {response.text}")
        print()
    except Exception as e:
        print(f"Risk assessment failed: {e}")
        print()

if __name__ == "__main__":
    print("🔍 Testing AI Service Connectivity")
    print("=" * 50)
    test_ai_service()
    print("✅ Test completed")