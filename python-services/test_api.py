import requests
import json

def test_api():
    base_url = "http://localhost:8001"
    
    print("Testing FastAPI AI Services...")
    print("="*50)
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"Root endpoint: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"Root endpoint error: {e}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health endpoint: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"Health endpoint error: {e}")
    
    # Test risk assessment
    try:
        data = {"age": 35, "location": "New York"}
        response = requests.post(f"{base_url}/api/risk/assess", json=data)
        print(f"Risk assessment: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"Risk assessment error: {e}")
    
    # Test claims analysis
    try:
        data = {"description": "Car accident on highway"}
        response = requests.post(f"{base_url}/api/claims/analyze", json=data)
        print(f"Claims analysis: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"Claims analysis error: {e}")
    
    # Test NLP analysis
    try:
        data = {"text": "This is a good service"}
        response = requests.post(f"{base_url}/api/nlp/analyze", json=data)
        print(f"NLP analysis: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"NLP analysis error: {e}")
    
    # Test chatbot
    try:
        data = {"message": "I need help with my claim"}
        response = requests.post(f"{base_url}/api/chat/query", json=data)
        print(f"Chatbot: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        print()
    except Exception as e:
        print(f"Chatbot error: {e}")

if __name__ == "__main__":
    test_api()
