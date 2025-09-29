import requests
import datetime

BASE = "http://localhost:8080"

def register_user(username, password, role='USER'):
    url = BASE + '/api/auth/register'
    payload = {
        'username': username,
        'password': password,
        'email': f'{username}@example.com',
        'firstName': 'Test',
        'lastName': 'User',
        'phoneNumber': '1234567890',
        'dateOfBirth': '1990-01-01',
        'address': '123 Test St',
        'city': 'Testville',
        'state': 'TS',
        'postalCode': '00000',
        'country': 'Testland',
        'role': role
    }
    r = requests.post(url, json=payload)
    print('REGISTER', r.status_code, r.text)
    return r.json() if r.ok else None


def login(username, password):
    url = BASE + '/api/auth/login'
    r = requests.post(url, json={'username': username, 'password': password})
    print('LOGIN', r.status_code, r.text)
    return r.json() if r.ok else None


def list_public_policies():
    url = BASE + '/api/policies/public'
    r = requests.get(url)
    print('POLICIES', r.status_code, r.text[:500])
    return r.json() if r.ok else None


def apply_policy(token, policy_id, age, annual_salary):
    url = BASE + '/api/user-policies/apply'
    headers = {'Authorization': f'Bearer {token}'}
    payload = {
        'policyId': policy_id,
        'age': age,
        'annualSalary': annual_salary
    }
    r = requests.post(url, json=payload, headers=headers)
    print('APPLY', r.status_code, r.text)
    return r.json() if r.ok else None


if __name__ == '__main__':
    # 1) register
    username = 'e2e_test_user'
    password = 'Password123!'
    register_user(username, password)

    # 2) login
    login_resp = login(username, password)
    if not login_resp:
        print('Login failed, abort')
        exit(1)
    token = login_resp.get('token')

    # 3) list policies
    policies = list_public_policies()
    if not policies:
        print('No policies available')
        exit(1)
    policy_id = policies[0].get('id')

    # 4) apply with low salary -> expect PENDING_APPROVAL or ACTIVE depending on risk
    print('\n-- Applying with low salary (expect PENDING or rejected)')
    apply_policy(token, policy_id, age=30, annual_salary=6000)

    # 5) apply with sufficient salary -> expect ACTIVE if risk low
    print('\n-- Applying with sufficient salary (expect ACTIVE if low risk)')
    apply_policy(token, policy_id, age=30, annual_salary=120000)
