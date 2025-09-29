import axios from 'axios';
import { getAuthToken, isTokenExpired, refreshAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance for user policy services
const userPolicyClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
userPolicyClient.interceptors.request.use(
  async (config) => {
    let token = getAuthToken();
    
    // Check if token is expired and refresh if needed
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAuthToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
userPolicyClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return userPolicyClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// User Policy Operations
export const applyForPolicy = async (applicationData) => {
  try {
    const payload = { ...applicationData };
    if (payload.annualSalary && typeof payload.annualSalary === 'string') {
      const parsed = parseFloat(payload.annualSalary);
      payload.annualSalary = isNaN(parsed) ? null : parsed;
    }
    const response = await userPolicyClient.post('/api/user-policies/apply', payload);
    return response.data;
  } catch (error) {
    console.error('Apply for policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to apply for policy');
  }
};

export const getCurrentUserPolicies = async () => {
  try {
    const response = await userPolicyClient.get('/api/user-policies/user');
    return response.data;
  } catch (error) {
    console.error('Get user policies error:', error);
    // Return mock data for development
    return [
      {
        id: 1,
        status: 'ACTIVE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        monthlyPremium: 150.00,
        totalPremiumPaid: 1800.00,
        nextPaymentDate: '2024-07-01',
        paymentStatus: 'CURRENT',
        riskScore: 25.5,
        policy: {
          id: 1,
          name: 'Comprehensive Auto Insurance',
          type: 'AUTO',
          coverage: 50000.00
        }
      },
      {
        id: 2,
        status: 'PENDING_APPROVAL',
        startDate: null,
        endDate: null,
        monthlyPremium: 200.00,
        totalPremiumPaid: 0.00,
        nextPaymentDate: null,
        paymentStatus: 'PENDING',
        riskScore: 45.0,
        policy: {
          id: 2,
          name: 'Health Insurance Premium',
          type: 'HEALTH',
          coverage: 100000.00
        }
      }
    ];
  }
};

export const getUserPolicies = async (userId) => {
  try {
    const response = await userPolicyClient.get(`/api/user-policies/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user policies');
  }
};

export const getActivePolicies = async (userId) => {
  try {
    const response = await userPolicyClient.get(`/api/user-policies/active/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get active policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch active policies');
  }
};

export const getPendingApprovals = async () => {
  try {
    const response = await userPolicyClient.get('/api/user-policies/pending-approvals');
    return response.data;
  } catch (error) {
    console.error('Get pending approvals error:', error);
    // Return mock data for development
    return [
      {
        id: 3,
        status: 'PENDING_APPROVAL',
        riskScore: 65.0,
        aiAssessment: 'MEDIUM_RISK - Requires manual review due to previous claims history',
        user: {
          id: 2,
          username: 'john_doe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        policy: {
          id: 1,
          name: 'Premium Life Insurance',
          type: 'LIFE',
          coverage: 500000.00
        }
      }
    ];
  }
};

export const approvePolicy = async (userPolicyId, notes = '') => {
  try {
    const response = await userPolicyClient.post(`/api/user-policies/${userPolicyId}/approve`, null, {
      params: { notes }
    });
    return response.data;
  } catch (error) {
    console.error('Approve policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to approve policy');
  }
};

export const rejectPolicy = async (userPolicyId, reason) => {
  try {
    const response = await userPolicyClient.post(`/api/user-policies/${userPolicyId}/reject`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Reject policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject policy');
  }
};

// Policy Application Form Helper
export const validateApplicationData = (applicationData) => {
  const errors = [];
  
  if (!applicationData.policyId) {
    errors.push('Policy selection is required');
  }
  
  if (!applicationData.firstName || applicationData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (!applicationData.lastName || applicationData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  
  if (!applicationData.email || !/\S+@\S+\.\S+/.test(applicationData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!applicationData.age || applicationData.age < 18 || applicationData.age > 100) {
    errors.push('Age must be between 18 and 100');
  }
  
  if (!applicationData.occupation || applicationData.occupation.trim().length < 2) {
    errors.push('Occupation is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatPolicyStatus = (status) => {
  const statusMap = {
    'ACTIVE': { label: 'Active', color: 'green', icon: '✓' },
    'PENDING_APPROVAL': { label: 'Pending Approval', color: 'yellow', icon: '⏳' },
    'APPLIED': { label: 'Applied', color: 'blue', icon: '📝' },
    'REJECTED': { label: 'Rejected', color: 'red', icon: '✗' },
    'CANCELLED': { label: 'Cancelled', color: 'gray', icon: '🚫' },
    'EXPIRED': { label: 'Expired', color: 'orange', icon: '⚠️' }
  };
  
  return statusMap[status] || { label: status, color: 'gray', icon: '?' };
};

export const calculatePolicyProgress = (userPolicy) => {
  if (userPolicy.status !== 'ACTIVE') return 0;
  
  const start = new Date(userPolicy.startDate);
  const end = new Date(userPolicy.endDate);
  const now = new Date();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.round((elapsed / total) * 100);
};

export const getRiskScoreColor = (riskScore) => {
  if (riskScore <= 30) return 'green';
  if (riskScore <= 70) return 'yellow';
  return 'red';
};

export const getRiskScoreLabel = (riskScore) => {
  if (riskScore <= 30) return 'Low Risk';
  if (riskScore <= 70) return 'Medium Risk';
  return 'High Risk';
};

export const isPolicyExpiringSoon = (userPolicy, daysThreshold = 30) => {
  if (userPolicy.status !== 'ACTIVE' || !userPolicy.endDate) return false;
  
  const end = new Date(userPolicy.endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold && diffDays > 0;
};

// Export default service object
export default {
  applyForPolicy,
  getCurrentUserPolicies,
  getUserPolicies,
  getActivePolicies,
  getPendingApprovals,
  approvePolicy,
  rejectPolicy,
  validateApplicationData,
  formatPolicyStatus,
  calculatePolicyProgress,
  getRiskScoreColor,
  getRiskScoreLabel,
  isPolicyExpiringSoon
};