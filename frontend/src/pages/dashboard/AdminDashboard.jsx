import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalPolicies: 0,
      totalClaims: 0,
      pendingClaims: 0,
      approvedClaims: 0,
      rejectedClaims: 0,
      activePolicies: 0,
      pendingPolicies: 0,
      totalRevenue: 0,
      monthlyRevenue: 0
    },
    recentUsers: [],
    recentPolicies: [],
    recentClaims: [],
    notifications: [],
    systemHealth: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all admin dashboard data in parallel
      const responses = await Promise.allSettled([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users/recent'),
        apiClient.get('/admin/policies/recent'),
        apiClient.get('/admin/claims/recent'),
        apiClient.get('/admin/notifications'),
        apiClient.get('/admin/system-health')
      ]);

      const [statsResponse, usersResponse, policiesResponse, claimsResponse, notificationsResponse, healthResponse] = responses;

      setDashboardData({
        stats: statsResponse.status === 'fulfilled' ? statsResponse.value.data : {
          totalUsers: 0,
          totalPolicies: 0,
          totalClaims: 0,
          pendingClaims: 0,
          approvedClaims: 0,
          rejectedClaims: 0,
          activePolicies: 0,
          pendingPolicies: 0,
          totalRevenue: 0,
          monthlyRevenue: 0
        },
        recentUsers: usersResponse.status === 'fulfilled' ? usersResponse.value.data : [],
        recentPolicies: policiesResponse.status === 'fulfilled' ? policiesResponse.value.data : [],
        recentClaims: claimsResponse.status === 'fulfilled' ? claimsResponse.value.data : [],
        notifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value.data : [],
        systemHealth: healthResponse.status === 'fulfilled' ? healthResponse.value.data : {}
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchDashboardData}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username}! Here's your system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalPolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.activePolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.pendingClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/dashboard"
              className="block w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-gray-900">Dashboard</p>
                  <p className="text-sm text-gray-600">System overview and metrics</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/policies"
              className="block w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <p className="font-medium text-gray-900">Manage Policies</p>
                  <p className="text-sm text-gray-600">Review and approve policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/upload-policy"
              className="block w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📤</span>
                <div>
                  <p className="font-medium text-gray-900">Upload Policy</p>
                  <p className="text-sm text-gray-600">Add new insurance policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/claims"
              className="block w-full p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">�</span>
                <div>
                  <p className="font-medium text-gray-900">Review Claims</p>
                  <p className="text-sm text-gray-600">Process pending claims</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/compare-policies"
              className="block w-full p-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚖️</span>
                <div>
                  <p className="font-medium text-gray-900">Compare Policies</p>
                  <p className="text-sm text-gray-600">Analyze policy comparisons</p>
                </div>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="block w-full p-3 text-left bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">System performance insights</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🟢 {dashboardData.systemHealth.database || 'Online'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌐 {dashboardData.systemHealth.api || 'Healthy'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI Services</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🤖 {dashboardData.systemHealth.aiServices?.ocr || 'Active'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fraud Detection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🛡️ {dashboardData.systemHealth.aiServices?.fraudDetection || 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">OCR Service</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                📄 {dashboardData.systemHealth.aiServices?.ocr || 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Risk Assessment</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ⚖️ {dashboardData.systemHealth.aiServices?.riskAssessment || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">� Recent Users</h2>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentUsers.length > 0 ? (
              dashboardData.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">👤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'BROKER' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Policies */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📋 Recent Policies</h2>
            <Link to="/admin/policies" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentPolicies.length > 0 ? (
              dashboardData.recentPolicies.slice(0, 5).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📋</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                      <p className="text-xs text-gray-600">{policy.type} - {formatCurrency(policy.monthlyPremium)}/month</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    policy.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {policy.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent policies</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📝 Recent Claims</h2>
          <Link to="/admin/claims" className="text-blue-600 hover:text-blue-800 text-sm">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.recentClaims.length > 0 ? (
            dashboardData.recentClaims.slice(0, 6).map((claim) => (
              <div key={claim.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Claim #{claim.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{claim.type}</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(claim.claimAmount)}</p>
                {claim.aiAnalysisResult && (
                  <p className="text-xs text-blue-600 mt-1">🤖 AI Analyzed</p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No recent claims</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔔 System Notifications</h2>
          <div className="space-y-3">
            {dashboardData.notifications.map((notification, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                notification.type === 'success' ? 'bg-green-50 border-green-400' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                notification.type === 'error' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;