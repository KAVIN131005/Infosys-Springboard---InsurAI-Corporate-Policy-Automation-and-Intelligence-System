import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { aiHealthService } from '../../api/aiService';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPolicies: 0,
      activeClients: 0,
      pendingClaims: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      approvalRate: 0
    },
    recentPolicies: [],
    recentClaims: [],
    clientActivity: [],
    notifications: [],
    aiStatus: null
  });

  useEffect(() => {
    fetchDashboardData();
    checkAIServiceHealth();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch broker-specific dashboard data
      const responses = await Promise.allSettled([
        apiClient.get('/broker/stats'),
        apiClient.get('/broker/policies'),
        apiClient.get('/broker/claims'),
        apiClient.get('/broker/clients/activity'),
        apiClient.get('/broker/notifications')
      ]);

      const [statsResponse, policiesResponse, claimsResponse, activityResponse, notificationsResponse] = responses;

      setDashboardData({
        stats: statsResponse.status === 'fulfilled' ? statsResponse.value.data : {
          totalPolicies: 0,
          activeClients: 0,
          pendingClaims: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          approvalRate: 0
        },
        recentPolicies: policiesResponse.status === 'fulfilled' ? policiesResponse.value.data.slice(0, 5) : [],
        recentClaims: claimsResponse.status === 'fulfilled' ? claimsResponse.value.data.slice(0, 5) : [],
        clientActivity: activityResponse.status === 'fulfilled' ? activityResponse.value.data.slice(0, 5) : [],
        notifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value.data.slice(0, 3) : [],
        aiStatus: null
      });
    } catch (error) {
      console.error('Error fetching broker dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAIServiceHealth = async () => {
    try {
      const healthStatus = await aiHealthService.checkHealth();
      setDashboardData(prev => ({
        ...prev,
        aiStatus: healthStatus
      }));
    } catch (error) {
      console.error('AI service health check failed:', error);
      setDashboardData(prev => ({
        ...prev,
        aiStatus: { status: 'unhealthy', error: error.message }
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'healthy':
        return 'green';
      case 'pending':
      case 'under_review':
        return 'yellow';
      case 'inactive':
      case 'rejected':
      case 'unhealthy':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading broker dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broker Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName || user?.username}! Manage your clients and policies.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                getStatusColor(dashboardData.aiStatus?.status) === 'green' ? 'bg-green-500' :
                getStatusColor(dashboardData.aiStatus?.status) === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></span>
              <span className="text-sm text-gray-600">
                AI Services: {dashboardData.aiStatus?.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.totalPolicies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.pendingClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="font-semibold text-green-600">{formatCurrency(dashboardData.stats.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="font-semibold text-blue-600">{dashboardData.stats.approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Policy Value</span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(dashboardData.stats.totalRevenue / (dashboardData.stats.totalPolicies || 1))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Tools Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-3">🤖</span>
                <span className="text-sm font-medium">Policy Analysis</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData.aiStatus?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dashboardData.aiStatus?.status === 'healthy' ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-3">📄</span>
                <span className="text-sm font-medium">Document OCR</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData.aiStatus?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dashboardData.aiStatus?.status === 'healthy' ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-3">🛡️</span>
                <span className="text-sm font-medium">Risk Assessment</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData.aiStatus?.status === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {dashboardData.aiStatus?.status === 'healthy' ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Policies</h2>
            <Link to="/broker/policies" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentPolicies.length > 0 ? (
              dashboardData.recentPolicies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{policy.name}</p>
                    <p className="text-sm text-gray-600">{policy.type} - {formatCurrency(policy.premium)}/month</p>
                    <p className="text-xs text-gray-500">Client: {policy.clientName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      policy.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-gray-500 mb-2">No policies found</p>
                <Link 
                  to="/broker/upload" 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Upload your first policy
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Claims removed for broker dashboard by admin preference */}
      </div>

      {/* Client Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Client Activity</h2>
          <div className="space-y-3">
            {dashboardData.clientActivity.length > 0 ? (
              dashboardData.clientActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.clientName}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">👥</span>
                <p className="text-gray-500">No recent client activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/broker/upload"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl mb-2">📤</span>
              <span className="text-sm font-medium text-gray-900 text-center">Upload Policy</span>
            </Link>

            <Link
              to="/broker/policies"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-3xl mb-2">📋</span>
              <span className="text-sm font-medium text-gray-900 text-center">Manage Policies</span>
            </Link>

            {/* Claims quick-action removed */}

            <Link
              to="/broker/analytics"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <span className="text-3xl mb-2">📊</span>
              <span className="text-sm font-medium text-gray-900 text-center">Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {dashboardData.notifications.map((notification, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                notification.type === 'success' ? 'bg-green-50 border-green-400' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                notification.type === 'error' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerDashboard;
