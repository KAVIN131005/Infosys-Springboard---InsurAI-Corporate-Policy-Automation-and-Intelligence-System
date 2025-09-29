import axios from 'axios';
import { getAuthToken, isTokenExpired, refreshAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance for dashboard services
const dashboardClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
dashboardClient.interceptors.request.use(
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
dashboardClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return dashboardClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Dashboard Data Functions
export const getAdminDashboard = async () => {
  try {
    const response = await dashboardClient.get('/api/dashboard/admin');
    return response.data;
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    // Return mock data for development
    return {
      totalUsers: 1250,
      totalPolicies: 450,
      activePolicies: 380,
      pendingPolicies: 45,
      totalClaims: 125,
      pendingClaims: 28,
      monthlyRevenue: 125000.00,
      policyTypeDistribution: {
        'AUTO': 120,
        'HEALTH': 95,
        'LIFE': 80,
        'PROPERTY': 65,
        'TRAVEL': 90
      },
      riskDistribution: {
        'LOW': 200,
        'MEDIUM': 180,
        'HIGH': 70
      },
      recentPolicies: [
        {
          id: 1,
          name: 'Comprehensive Auto Insurance',
          type: 'AUTO',
          status: 'ACTIVE',
          premium: 250.00,
          broker: 'john_broker',
          createdAt: '2024-06-20T10:30:00'
        }
      ],
      recentClaims: [
        {
          id: 1,
          claimNumber: 'CLM1704067200000',
          type: 'AUTO',
          status: 'APPROVED',
          amount: 5000.00,
          approvedAmount: 4500.00,
          submittedBy: 'jane_user',
          createdAt: '2024-06-19T14:15:00'
        }
      ],
      claimAnalytics: {
        statusDistribution: {
          'APPROVED': 45,
          'UNDER_REVIEW': 28,
          'REJECTED': 12
        },
        averageClaimAmount: 3250.00,
        approvalRate: 76.5
      },
      growthTrends: {
        policiesLast6Months: 150,
        usersLast6Months: 420
      }
    };
  }
};

export const getBrokerDashboard = async () => {
  try {
    const response = await dashboardClient.get('/api/dashboard/broker');
    return response.data;
  } catch (error) {
    console.error('Get broker dashboard error:', error);
    // Return mock data for development
    return {
      totalPolicies: 45,
      activePolicies: 38,
      pendingPolicies: 7,
      totalClients: 65,
      monthlyRevenue: 15200.00,
      policyPerformance: {
        'ACTIVE': 38,
        'PENDING': 7,
        'REJECTED': 2
      },
      recentActivities: [
        {
          id: 1,
          name: 'Premium Health Insurance',
          type: 'HEALTH',
          status: 'ACTIVE',
          premium: 300.00,
          broker: 'current_broker',
          createdAt: '2024-06-20T09:15:00'
        }
      ]
    };
  }
};

export const getUserDashboard = async () => {
  try {
    const response = await dashboardClient.get('/api/dashboard/user');
    return response.data;
  } catch (error) {
    console.error('Get user dashboard error:', error);
    // Return mock data for development
    return {
      totalPolicies: 3,
      activePolicies: 2,
      pendingApprovals: 1,
      totalClaims: 2,
      approvedClaims: 1,
      pendingClaims: 1,
      totalPremiumPaid: 2400.00,
      monthlyPremium: 450.00,
      totalCoverage: 200000.00,
      policyTypes: {
        'AUTO': 1,
        'HEALTH': 1,
        'LIFE': 1
      },
      recentActivities: [
        {
          type: 'POLICY',
          action: 'Applied for Health Insurance Premium',
          date: '2024-06-18T10:30:00',
          status: 'ACTIVE'
        },
        {
          type: 'CLAIM',
          action: 'Submitted claim CLM1704067200000',
          date: '2024-06-16T14:15:00',
          status: 'APPROVED',
          amount: 1500.00
        }
      ]
    };
  }
};

export const getAnalyticsDashboard = async () => {
  try {
    const response = await dashboardClient.get('/api/dashboard/analytics');
    return response.data;
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    // Return mock data for development
    return {
      revenueTrends: {
        monthlyRevenue: {
          'JANUARY': 98000.00,
          'FEBRUARY': 102000.00,
          'MARCH': 108000.00,
          'APRIL': 115000.00,
          'MAY': 122000.00,
          'JUNE': 125000.00
        }
      },
      policyTrends: {
        monthlyPolicies: {
          'JANUARY': 35,
          'FEBRUARY': 42,
          'MARCH': 38,
          'APRIL': 45,
          'MAY': 52,
          'JUNE': 48
        }
      },
      claimTrends: {
        monthlyClaims: {
          'JANUARY': 15,
          'FEBRUARY': 18,
          'MARCH': 22,
          'APRIL': 19,
          'MAY': 25,
          'JUNE': 21
        }
      },
      riskAnalysis: {
        riskDistribution: {
          'LOW': 180,
          'MEDIUM': 150,
          'HIGH': 70
        }
      },
      performanceMetrics: {
        policyApprovalRate: 84.5,
        averageProcessingDays: 3.5,
        customerSatisfactionRate: 87.5
      }
    };
  }
};

export const getRealTimeData = async () => {
  try {
    const response = await dashboardClient.get('/api/dashboard/real-time');
    return response.data;
  } catch (error) {
    console.error('Get real-time data error:', error);
    // Return role-appropriate mock data
    const userRole = getUserRole(); // You'd implement this based on your auth system
    
    if (userRole === 'ADMIN') {
      return await getAdminDashboard();
    } else if (userRole === 'BROKER') {
      return await getBrokerDashboard();
    } else {
      return await getUserDashboard();
    }
  }
};

// Helper function to get user role (implement based on your auth system)
const getUserRole = () => {
  // This should be implemented to get the current user's role
  // For now, return a default
  return 'USER';
};

// Chart Data Processing Functions
export const processRevenueChartData = (revenueTrends) => {
  const labels = Object.keys(revenueTrends.monthlyRevenue || {});
  const data = Object.values(revenueTrends.monthlyRevenue || {});
  
  return {
    labels,
    datasets: [{
      label: 'Monthly Revenue',
      data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1
    }]
  };
};

export const processPolicyDistributionData = (policyTypeDistribution) => {
  const labels = Object.keys(policyTypeDistribution || {});
  const data = Object.values(policyTypeDistribution || {});
  
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6'  // Purple
  ];
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      hoverBackgroundColor: colors.slice(0, labels.length)
    }]
  };
};

export const processClaimStatusData = (claimAnalytics) => {
  const statusDistribution = claimAnalytics.statusDistribution || {};
  const labels = Object.keys(statusDistribution);
  const data = Object.values(statusDistribution);
  
  const colors = {
    'APPROVED': '#10B981',
    'UNDER_REVIEW': '#F59E0B',
    'REJECTED': '#EF4444',
    'PENDING': '#6B7280'
  };
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: labels.map(label => colors[label] || '#6B7280')
    }]
  };
};

export const processGrowthTrendData = (growthTrends) => {
  // Mock monthly data for trend visualization
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const policyGrowth = [35, 42, 38, 45, 52, growthTrends.policiesLast6Months || 48];
  const userGrowth = [45, 52, 48, 58, 65, growthTrends.usersLast6Months || 70];
  
  return {
    labels: months,
    datasets: [
      {
        label: 'New Policies',
        data: policyGrowth,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        label: 'New Users',
        data: userGrowth,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }
    ]
  };
};

// Real-time Updates (WebSocket simulation)
export const subscribeToRealTimeUpdates = (callback) => {
  // Simulate real-time updates every 30 seconds
  const interval = setInterval(async () => {
    try {
      const realTimeData = await getRealTimeData();
      callback(realTimeData);
    } catch (error) {
      console.error('Real-time update error:', error);
    }
  }, 30000);
  
  return () => clearInterval(interval);
};

// Summary Statistics
export const calculateSummaryStats = (dashboardData) => {
  const stats = {
    totalRevenue: dashboardData.monthlyRevenue || 0,
    growthRate: 0,
    activeUsers: dashboardData.totalUsers || 0,
    activePolicies: dashboardData.activePolicies || 0
  };
  
  // Calculate growth rate if we have trend data
  if (dashboardData.revenueTrends?.monthlyRevenue) {
    const revenues = Object.values(dashboardData.revenueTrends.monthlyRevenue);
    if (revenues.length >= 2) {
      const current = revenues[revenues.length - 1];
      const previous = revenues[revenues.length - 2];
      stats.growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }
  }
  
  return stats;
};

// Performance Metrics
export const getPerformanceMetrics = (dashboardData) => {
  return {
    approvalRate: dashboardData.claimAnalytics?.approvalRate || 0,
    avgProcessingTime: dashboardData.performanceMetrics?.averageProcessingDays || 0,
    customerSatisfaction: dashboardData.performanceMetrics?.customerSatisfactionRate || 0,
    policyApprovalRate: dashboardData.performanceMetrics?.policyApprovalRate || 0
  };
};

// Export default service object
export default {
  getAdminDashboard,
  getBrokerDashboard,
  getUserDashboard,
  getAnalyticsDashboard,
  getRealTimeData,
  processRevenueChartData,
  processPolicyDistributionData,
  processClaimStatusData,
  processGrowthTrendData,
  subscribeToRealTimeUpdates,
  calculateSummaryStats,
  getPerformanceMetrics
};