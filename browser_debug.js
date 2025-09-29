// Debug Script for Browser Console
// Copy and paste this into the browser console when the frontend is running

console.log('=== AUTHENTICATION DEBUG ===');

// Check current token storage
const authToken = localStorage.getItem('auth_token');
const token = localStorage.getItem('token');
const authTokenAlt = localStorage.getItem('authToken');

console.log('Auth token (auth_token):', authToken ? 'EXISTS' : 'MISSING');
console.log('Auth token (token):', token ? 'EXISTS' : 'MISSING');  
console.log('Auth token (authToken):', authTokenAlt ? 'EXISTS' : 'MISSING');

if (authToken) {
  console.log('Token length:', authToken.length);
  console.log('Token preview:', authToken.substring(0, 50) + '...');
}

// Check user data
const userData = localStorage.getItem('user_data');
if (userData) {
  console.log('User data:', JSON.parse(userData));
}

// Test login if no token
if (!authToken) {
  console.log('No token found. Testing login...');
  
  fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'password123'
    })
  })
  .then(response => {
    console.log('Login response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Login response:', data);
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      console.log('Token stored!');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
  });
} else {
  // Test analytics endpoint with existing token
  console.log('Testing analytics endpoint...');
  
  fetch('http://localhost:8080/api/analytics/comprehensive', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Analytics response status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('Analytics data:', data);
  })
  .catch(error => {
    console.error('Analytics error:', error);
  });
}