import axios from 'axios';
import { getAuthToken, isTokenExpired, refreshAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance for claim services
const claimClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
claimClient.interceptors.request.use(
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
claimClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return claimClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Legacy function support
export const submitClaim = async (file, policyId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('policyId', policyId);
    
    const response = await claimClient.post('/api/claims/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Submit claim error:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit claim');
  }
};

export const getClaims = async () => {
  try {
    const response = await claimClient.get('/api/claims');
    return response.data;
  } catch (error) {
    console.error('Get claims error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claims');
  }
};

export const getClaimById = async (id) => {
  try {
    const response = await claimClient.get(`/api/claims/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get claim by ID error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claim details');
  }
};

// Enhanced Claim Service Functions
export const submitClaimData = async (claimData) => {
  try {
    const response = await claimClient.post('/api/claims', claimData);
    return response.data;
  } catch (error) {
    console.error('Submit claim data error:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit claim');
  }
};

export const submitClaimWithAI = async (claimData) => {
  try {
    const response = await claimClient.post('/api/claims/submit-with-ai', claimData);
    return response.data;
  } catch (error) {
    console.error('AI claim submission error:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit claim with AI analysis');
  }
};

export const getClaimsPaginated = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  try {
    const response = await claimClient.get('/api/claims', {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('Get paginated claims error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claims');
  }
};

export const updateClaimStatus = async (claimId, status) => {
  try {
    const response = await claimClient.put(`/api/claims/${claimId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update claim status error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update claim status');
  }
};

export const deleteClaim = async (claimId) => {
  try {
    const response = await claimClient.delete(`/api/claims/${claimId}`);
    return response.data;
  } catch (error) {
    console.error('Delete claim error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete claim');
  }
};

// AI-Enhanced Claim Functions
export const analyzeClaimWithAI = async (claimId) => {
  try {
    const response = await claimClient.post(`/api/claims/${claimId}/analyze`);
    return response.data;
  } catch (error) {
    console.error('AI claim analysis error:', error);
    throw new Error(error.response?.data?.message || 'Failed to analyze claim with AI');
  }
};

export const bulkAnalyzeClaims = async (claimIds) => {
  try {
    const response = await claimClient.post('/api/claims/bulk-analyze', {
      claim_ids: claimIds
    });
    return response.data;
  } catch (error) {
    console.error('Bulk claim analysis error:', error);
    throw new Error(error.response?.data?.message || 'Failed to analyze claims in bulk');
  }
};

export const getClaimRecommendations = async (claimId) => {
  try {
    const response = await claimClient.get(`/api/claims/${claimId}/recommendations`);
    return response.data;
  } catch (error) {
    console.error('Get claim recommendations error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get claim recommendations');
  }
};

export const getFraudAssessment = async (claimId) => {
  try {
    const response = await claimClient.get(`/api/claims/${claimId}/fraud-assessment`);
    return response.data;
  } catch (error) {
    console.error('Get fraud assessment error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get fraud assessment');
  }
};

// Claim Document Functions
export const uploadClaimDocument = async (claimId, file, documentType = 'general') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await claimClient.post(`/api/claims/${claimId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload claim document error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
};

export const getClaimDocuments = async (claimId) => {
  try {
    const response = await claimClient.get(`/api/claims/${claimId}/documents`);
    return response.data;
  } catch (error) {
    console.error('Get claim documents error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claim documents');
  }
};

export const deleteClaimDocument = async (claimId, documentId) => {
  try {
    const response = await claimClient.delete(`/api/claims/${claimId}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Delete claim document error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete document');
  }
};

// Claim Statistics and Analytics
export const getClaimStatistics = async (userId = null, dateRange = null) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }
    
    const response = await claimClient.get('/api/claims/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Get claim statistics error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claim statistics');
  }
};

export const getClaimsByStatus = async (status) => {
  try {
    const response = await claimClient.get('/api/claims/by-status', {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Get claims by status error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch claims by status');
  }
};

export const getUserClaims = async (userId) => {
  try {
    const response = await claimClient.get(`/api/claims/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user claims error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user claims');
  }
};

// Claim Comments and Notes
export const addClaimComment = async (claimId, comment) => {
  try {
    const response = await claimClient.post(`/api/claims/${claimId}/comments`, { comment });
    return response.data;
  } catch (error) {
    console.error('Add claim comment error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add comment');
  }
};

export const getClaimComments = async (claimId) => {
  try {
    const response = await claimClient.get(`/api/claims/${claimId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Get claim comments error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

// Search and Filter Functions
export const searchClaims = async (searchParams) => {
  try {
    const response = await claimClient.get('/api/claims/search', {
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error('Search claims error:', error);
    throw new Error(error.response?.data?.message || 'Failed to search claims');
  }
};

export const filterClaims = async (filters) => {
  try {
    const response = await claimClient.post('/api/claims/filter', filters);
    return response.data;
  } catch (error) {
    console.error('Filter claims error:', error);
    throw new Error(error.response?.data?.message || 'Failed to filter claims');
  }
};

// Claim Validation and Utilities
export const validateClaimData = (claimData) => {
  const errors = [];
  
  if (!claimData.description || claimData.description.trim().length === 0) {
    errors.push('Claim description is required');
  }
  
  if (!claimData.amount || claimData.amount <= 0) {
    errors.push('Claim amount must be greater than 0');
  }
  
  if (!claimData.claimType) {
    errors.push('Claim type is required');
  }
  
  if (!claimData.policyId) {
    errors.push('Policy ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatClaimStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pending Review',
    'UNDER_REVIEW': 'Under Review',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
    'PROCESSING': 'Processing',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    'PENDING': 'orange',
    'UNDER_REVIEW': 'blue',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'PROCESSING': 'purple',
    'COMPLETED': 'green',
    'CANCELLED': 'gray'
  };
  
  return colorMap[status] || 'gray';
};

export const calculateProcessingTime = (submissionDate, currentDate = new Date()) => {
  const submission = new Date(submissionDate);
  const current = new Date(currentDate);
  const diffTime = Math.abs(current - submission);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''}`;
};

// Export default service object
export default {
  submitClaim,
  submitClaimData,
  submitClaimWithAI,
  getClaims,
  getClaimsPaginated,
  getClaimById,
  updateClaimStatus,
  deleteClaim,
  analyzeClaimWithAI,
  bulkAnalyzeClaims,
  getClaimRecommendations,
  getFraudAssessment,
  uploadClaimDocument,
  getClaimDocuments,
  deleteClaimDocument,
  getClaimStatistics,
  getClaimsByStatus,
  getUserClaims,
  addClaimComment,
  getClaimComments,
  searchClaims,
  filterClaims,
  validateClaimData,
  formatClaimStatus,
  getStatusColor,
  calculateProcessingTime
};