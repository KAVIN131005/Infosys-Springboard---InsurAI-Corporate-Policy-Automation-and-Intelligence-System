import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch comprehensive admin analytics data
 * @returns {Promise<Object>} Admin analytics data with charts
 */
export const fetchAdminAnalytics = async () => {
  try {
    console.log('Attempting to fetch admin analytics...');
    
    // First try the test endpoint to verify connectivity
    try {
      const testResponse = await apiClient.get('/test/analytics');
      console.log('Test endpoint successful:', testResponse.data);
      return testResponse.data;
    } catch (testError) {
      console.log('Test endpoint failed, trying real endpoint...');
    }
    
    // Try the real endpoint
    const response = await apiClient.get('/admin/dashboard/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    console.error('Error details:', error.response);
    throw new Error('Failed to fetch admin analytics data');
  }
};

/**
 * Fetch admin analytics overview
 * @returns {Promise<Object>} Admin analytics overview
 */
export const fetchAdminAnalyticsOverview = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/analytics-overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics overview:', error);
    throw new Error('Failed to fetch admin analytics overview');
  }
};

/**
 * Fetch broker-specific analytics data
 * @param {string} brokerId - Optional broker ID (if not provided, uses current user)
 * @returns {Promise<Object>} Broker analytics data with charts
 */
export const fetchBrokerAnalytics = async (brokerId = null) => {
  try {
    console.log('Attempting to fetch broker analytics...');
    
    // First try the test endpoint to verify connectivity
    try {
      const testResponse = await apiClient.get('/test/broker-analytics');
      console.log('Broker test endpoint successful:', testResponse.data);
      return testResponse.data;
    } catch (testError) {
      console.log('Broker test endpoint failed, trying real endpoint...');
    }
    
    // Try the real endpoint
    const endpoint = brokerId ? `/broker/analytics/${brokerId}` : '/broker/analytics/overview';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching broker analytics:', error);
    throw new Error('Failed to fetch broker analytics data');
  }
};

/**
 * Fetch system performance metrics
 * @returns {Promise<Object>} System performance data
 */
export const fetchSystemPerformance = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching system performance:', error);
    throw new Error('Failed to fetch system performance data');
  }
};

/**
 * Fetch AI analytics and performance metrics
 * @returns {Promise<Object>} AI analytics data
 */
export const fetchAIAnalytics = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/ai-analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching AI analytics:', error);
    throw new Error('Failed to fetch AI analytics data');
  }
};

/**
 * Fetch monthly trends data
 * @param {string} timeframe - Time period (monthly, quarterly, yearly)
 * @returns {Promise<Object>} Monthly trends data
 */
export const fetchMonthlyTrends = async (timeframe = 'monthly') => {
  try {
    const response = await apiClient.get(`/admin/dashboard/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    throw new Error('Failed to fetch monthly trends data');
  }
};

/**
 * Fetch revenue analytics
 * @param {string} period - Time period for revenue analysis
 * @returns {Promise<Object>} Revenue analytics data
 */
export const fetchRevenueAnalytics = async (period = 'monthly') => {
  try {
    const response = await apiClient.get(`/admin/dashboard/revenue?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw new Error('Failed to fetch revenue analytics data');
  }
};

/**
 * Fetch broker portfolio summary
 * @param {string} brokerId - Broker ID
 * @returns {Promise<Object>} Broker portfolio data
 */
export const fetchBrokerPortfolio = async (brokerId = null) => {
  try {
    const endpoint = brokerId ? `/broker/portfolio/${brokerId}` : '/broker/portfolio';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching broker portfolio:', error);
    throw new Error('Failed to fetch broker portfolio data');
  }
};

/**
 * Fetch broker commission data
 * @param {string} brokerId - Broker ID
 * @param {string} timeframe - Time period for commission data
 * @returns {Promise<Object>} Broker commission data
 */
export const fetchBrokerCommission = async (brokerId = null, timeframe = 'monthly') => {
  try {
    const endpoint = brokerId 
      ? `/broker/commission/${brokerId}?timeframe=${timeframe}` 
      : `/broker/commission?timeframe=${timeframe}`;
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching broker commission:', error);
    throw new Error('Failed to fetch broker commission data');
  }
};

/**
 * Fetch claims analytics for broker
 * @param {string} brokerId - Broker ID
 * @returns {Promise<Object>} Claims analytics data
 */
export const fetchBrokerClaimsAnalytics = async (brokerId = null) => {
  try {
    const endpoint = brokerId ? `/broker/claims-analytics/${brokerId}` : '/broker/claims-analytics';
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching broker claims analytics:', error);
    throw new Error('Failed to fetch broker claims analytics data');
  }
};

/**
 * Export analytics data to various formats
 * @param {string} type - Type of analytics (admin, broker)
 * @param {string} format - Export format (pdf, excel, csv)
 * @param {Object} filters - Additional filters for export
 * @returns {Promise<Blob>} Exported data blob
 */
export const exportAnalyticsData = async (type, format, filters = {}) => {
  try {
    const response = await apiClient.post(`/analytics/export`, {
      type,
      format,
      filters
    }, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    throw new Error('Failed to export analytics data');
  }
};

/**
 * Fetch real-time dashboard updates
 * @param {string} dashboardType - Type of dashboard (admin, broker)
 * @returns {Promise<Object>} Real-time updates
 */
export const fetchRealTimeUpdates = async (dashboardType) => {
  try {
    const response = await apiClient.get(`/analytics/realtime/${dashboardType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time updates:', error);
    throw new Error('Failed to fetch real-time updates');
  }
};

/**
 * Save dashboard configuration/preferences
 * @param {string} dashboardType - Type of dashboard (admin, broker)
 * @param {Object} config - Dashboard configuration
 * @returns {Promise<Object>} Save confirmation
 */
export const saveDashboardConfig = async (dashboardType, config) => {
  try {
    const response = await apiClient.post(`/analytics/dashboard-config/${dashboardType}`, config);
    return response.data;
  } catch (error) {
    console.error('Error saving dashboard config:', error);
    throw new Error('Failed to save dashboard configuration');
  }
};

/**
 * Load dashboard configuration/preferences
 * @param {string} dashboardType - Type of dashboard (admin, broker)
 * @returns {Promise<Object>} Dashboard configuration
 */
export const loadDashboardConfig = async (dashboardType) => {
  try {
    const response = await apiClient.get(`/analytics/dashboard-config/${dashboardType}`);
    return response.data;
  } catch (error) {
    console.error('Error loading dashboard config:', error);
    // Return default config if none exists
    return {
      theme: 'light',
      refreshInterval: 300000, // 5 minutes
      defaultTab: dashboardType === 'admin' ? 'overview' : 'portfolio',
      chartPreferences: {
        showLegend: true,
        showTooltips: true,
        animationDuration: 500
      }
    };
  }
};

export default {
  fetchAdminAnalytics,
  fetchAdminAnalyticsOverview,
  fetchBrokerAnalytics,
  fetchSystemPerformance,
  fetchAIAnalytics,
  fetchMonthlyTrends,
  fetchRevenueAnalytics,
  fetchBrokerPortfolio,
  fetchBrokerCommission,
  fetchBrokerClaimsAnalytics,
  exportAnalyticsData,
  fetchRealTimeUpdates,
  saveDashboardConfig,
  loadDashboardConfig
};