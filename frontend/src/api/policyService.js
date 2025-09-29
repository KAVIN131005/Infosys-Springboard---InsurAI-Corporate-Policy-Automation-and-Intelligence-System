import axios from 'axios';
import { getAuthToken, isTokenExpired, refreshAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance for policy services
const policyClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
policyClient.interceptors.request.use(
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
policyClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return policyClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Policy CRUD Operations
export const getPolicies = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  try {
    const response = await policyClient.get('/api/policies/all', {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('Get policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch policies');
  }
};

// Get available policies for users to apply
export const getAvailablePolicies = async () => {
  try {
    const response = await policyClient.get('/api/policies/available');
    return response.data;
  } catch (error) {
    console.error('Get available policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch available policies');
  }
};

// Get pending policies for admin approval
export const getPendingPolicies = async () => {
  try {
    // Use user-policies endpoint for policy applications
    const response = await policyClient.get('/api/user-policies/pending-approvals');
    return response.data;
  } catch (error) {
    console.error('Get pending policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch pending policies');
  }
};

// Admin approve/reject policies
export const approvePolicy = async (userPolicyId, notes = '') => {
  try {
    // Use user-policies endpoint for policy applications
    const response = await policyClient.post(`/api/user-policies/${userPolicyId}/approve`, null, {
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
    // Use user-policies endpoint for policy applications
    const response = await policyClient.post(`/api/user-policies/${userPolicyId}/reject`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Reject policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject policy');
  }
};

export const getPolicyById = async (id) => {
  try {
    const response = await policyClient.get(`/api/policies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get policy by ID error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch policy details');
  }
};

export const createPolicy = async (policyData) => {
  try {
    const response = await policyClient.post('/api/policies', policyData);
    return response.data;
  } catch (error) {
    console.error('Create policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create policy');
  }
};

export const updatePolicy = async (id, policyData) => {
  try {
    const response = await policyClient.put(`/api/policies/${id}`, policyData);
    return response.data;
  } catch (error) {
    console.error('Update policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update policy');
  }
};

export const deletePolicy = async (id) => {
  try {
    const response = await policyClient.delete(`/api/policies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete policy');
  }
};

// User-specific policy functions
export const getUserPolicies = async (userId = null) => {
  try {
    const endpoint = userId ? `/api/policies/user/${userId}` : '/api/policies/user';
    const response = await policyClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Get user policies error:', error);
    // Return mock data for development
    return {
      data: [
        {
          id: '1',
          policyNumber: 'AUTO-2024-001',
          type: 'Auto Insurance',
          status: 'Active',
          premium: 1200,
          coverage: 50000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: 'Comprehensive auto insurance coverage'
        },
        {
          id: '2',
          policyNumber: 'HOME-2024-002',
          type: 'Home Insurance',
          status: 'Active',
          premium: 800,
          coverage: 300000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          description: 'Full home insurance protection'
        }
      ]
    };
  }
};

export const getBrokerPolicies = async (brokerId = null) => {
  try {
    const endpoint = brokerId ? `/api/policies/broker/${brokerId}` : '/api/policies/broker';
    const response = await policyClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Get broker policies error:', error);
    // Return mock data for development
    return {
      data: [
        {
          id: '1',
          policyNumber: 'AUTO-2024-001',
          type: 'Auto Insurance',
          status: 'Active',
          premium: 1200,
          coverage: 50000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          clientName: 'John Doe',
          clientEmail: 'john@example.com'
        },
        {
          id: '2',
          policyNumber: 'HOME-2024-002',
          type: 'Home Insurance',
          status: 'Active',
          premium: 800,
          coverage: 300000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          clientName: 'Jane Smith',
          clientEmail: 'jane@example.com'
        },
        {
          id: '3',
          policyNumber: 'HEALTH-2024-003',
          type: 'Health Insurance',
          status: 'Pending',
          premium: 2400,
          coverage: 100000,
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          clientName: 'Bob Johnson',
          clientEmail: 'bob@example.com'
        }
      ]
    };
  }
};

// Policy upload and document management
export const uploadPolicy = async (file, name, description) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    
    const response = await policyClient.post('/api/policies/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload policy error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload policy');
  }
};

export const getPolicyDocuments = async (policyId) => {
  try {
    const response = await policyClient.get(`/api/policies/${policyId}/documents`);
    return response.data;
  } catch (error) {
    console.error('Get policy documents error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch policy documents');
  }
};

export const uploadPolicyDocument = async (policyId, file, documentType = 'general') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await policyClient.post(`/api/policies/${policyId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload policy document error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
};

// Policy search and filtering
export const searchPolicies = async (searchParams) => {
  try {
    const response = await policyClient.get('/api/policies/search', {
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Search policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to search policies');
  }
};

export const filterPolicies = async (filters) => {
  try {
    const response = await policyClient.post('/api/policies/filter', filters);
    return response.data;
  } catch (error) {
    console.error('Filter policies error:', error);
    throw new Error(error.response?.data?.message || 'Failed to filter policies');
  }
};

// Policy analytics and statistics
export const getPolicyStatistics = async (userId = null, dateRange = null) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }
    
    const response = await policyClient.get('/api/policies/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Get policy statistics error:', error);
    // Return mock data for development
    return {
      totalPolicies: 3,
      activePolicies: 2,
      pendingPolicies: 1,
      totalPremium: 4400,
      totalCoverage: 450000,
      policyTypes: {
        'Auto Insurance': 1,
        'Home Insurance': 1,
        'Health Insurance': 1
      }
    };
  }
};

export const getPoliciesByStatus = async (status) => {
  try {
    const response = await policyClient.get('/api/policies/by-status', {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Get policies by status error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch policies by status');
  }
};

// Policy validation and utilities
export const validatePolicyData = (policyData) => {
  const errors = [];
  
  if (!policyData.type) {
    errors.push('Policy type is required');
  }
  
  if (!policyData.premium || policyData.premium <= 0) {
    errors.push('Premium must be greater than 0');
  }
  
  if (!policyData.coverage || policyData.coverage <= 0) {
    errors.push('Coverage amount must be greater than 0');
  }
  
  if (!policyData.startDate) {
    errors.push('Start date is required');
  }
  
  if (!policyData.endDate) {
    errors.push('End date is required');
  }
  
  if (policyData.startDate && policyData.endDate && new Date(policyData.startDate) >= new Date(policyData.endDate)) {
    errors.push('End date must be after start date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatPolicyStatus = (status) => {
  const statusMap = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'EXPIRED': 'Expired',
    'CANCELLED': 'Cancelled',
    'SUSPENDED': 'Suspended'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    'ACTIVE': 'green',
    'PENDING': 'yellow',
    'EXPIRED': 'red',
    'CANCELLED': 'gray',
    'SUSPENDED': 'orange'
  };
  
  return colorMap[status] || 'gray';
};

export const calculatePolicyDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
};

export const isPolicyExpiringSoon = (endDate, daysThreshold = 30) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold && diffDays > 0;
};

// Export default service object
export default {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getUserPolicies,
  getBrokerPolicies,
  uploadPolicy,
  getPolicyDocuments,
  uploadPolicyDocument,
  searchPolicies,
  filterPolicies,
  getPolicyStatistics,
  getPoliciesByStatus,
  validatePolicyData,
  formatPolicyStatus,
  getStatusColor,
  calculatePolicyDuration,
  isPolicyExpiringSoon
};