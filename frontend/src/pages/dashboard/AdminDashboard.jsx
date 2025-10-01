import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard, processRevenueChartData, processPolicyDistributionData, processClaimStatusData } from '../../api/dashboardService';
import { websocketService } from '../../api/websocketService';
import apiClient from '../../api/apiClient';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  console.log('AdminDashboard component rendering...');
  const { user } = useAuth();
    console.log('Admin user data:', user);
    
    const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPolicies: 0,
    activePolicies: 0,
    pendingPolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    monthlyRevenue: 0,
    policyTypeDistribution: {},
    riskDistribution: {},
    recentPolicies: [],
    recentClaims: [],
    claimAnalytics: {
      statusDistribution: {},
      averageClaimAmount: 0,
      approvalRate: 0
    },
    growthTrends: {
      policiesLast6Months: 0,
      usersLast6Months: 0
    },
    systemHealth: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    setupWebSocketConnection();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const setupWebSocketConnection = async () => {
    if (user?.token) {
      try {
        await websocketService.connect(user.token);
        websocketService.subscribeToUpdates((data) => {
          console.log('Admin WebSocket data received:', data);
          if (data.type === 'DASHBOARD_UPDATE' || data.type === 'ADMIN_DASHBOARD_UPDATE') {
            setDashboardData(prevData => ({
              ...prevData,
              ...data.payload
            }));
          }
        });
        setWsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comprehensive admin dashboard data from backend
      const adminData = await getAdminDashboard();
      
      // Set the complete dashboard data
      setDashboardData({
        ...adminData,
        systemHealth: {
          database: 'Online',
          api: 'Healthy',
          aiServices: {
            ocr: 'Active',
            fraudDetection: 'Active',
            riskAssessment: 'Active'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data structure
      setDashboardData({
        totalUsers: 0,
        totalPolicies: 0,
        activePolicies: 0,
        pendingPolicies: 0,
        totalClaims: 0,
        pendingClaims: 0,
        monthlyRevenue: 0,
        policyTypeDistribution: {},
        riskDistribution: {},
        recentPolicies: [],
        recentClaims: [],
        claimAnalytics: {
          statusDistribution: {},
          averageClaimAmount: 0,
          approvalRate: 0
        },
        growthTrends: {
          policiesLast6Months: 0,
          usersLast6Months: 0
        },
        systemHealth: {
          database: 'Unknown',
          api: 'Unknown',
          aiServices: {
            ocr: 'Unknown',
            fraudDetection: 'Unknown',
            riskAssessment: 'Unknown'
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 transition-colors duration-300 bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/4 mb-6 bg-gray-200"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-lg shadow-md bg-white">
                <div className="h-4 rounded w-3/4 mb-2 bg-gray-200"></div>
                <div className="h-8 rounded w-1/2 bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 transition-colors duration-300 bg-gray-50">
        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm">
                <p className="text-red-700">{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-red-100 hover:bg-red-200 text-red-800"
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

  // Use shared formatCurrency util which defaults to INR

  // Error boundary
  if (error) {
    return (
      <div className="p-6 transition-colors duration-300 bg-gray-50">
        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold mb-2 text-red-800">Error Loading Admin Dashboard</h2>
          <p className="mb-4 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen transition-colors duration-300 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">⚙️ Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName || user?.username}! Here's your system overview.</p>
      </div>

      {/* Urgent Actions & Approval Queue */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔴 Urgent: Policy Applications Pending Approval</h2>
              <p className="opacity-90">
                {dashboardData.pendingPolicies || 0} user policy application{(dashboardData.pendingPolicies || 0) !== 1 ? 's' : ''} require your immediate attention
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{dashboardData.pendingPolicies || 0}</div>
              <div className="text-sm opacity-90">Pending</div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <Link
              to="/admin/approvals"
              className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 bg-white text-red-600 hover:bg-red-50"
            >
              <span>🔍</span>
              <span>Review Applications Now</span>
            </Link>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
  <div className={`p-6 rounded-lg shadow-md border-l-4 border-blue-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

  <div className={`p-6 rounded-lg shadow-md border-l-4 border-green-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalPolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

  <div className={`p-6 rounded-lg shadow-md border-l-4 border-yellow-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.activePolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

  <div className={`p-6 rounded-lg shadow-md border-l-4 border-red-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.pendingClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

  <div className={`p-6 rounded-lg shadow-md border-l-4 border-purple-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

  <div className={`p-6 rounded-lg shadow-md border-l-4 border-indigo-500 bg-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency((dashboardData.monthlyRevenue || 0) * 83)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-md bg-white`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">📊 Policy Distribution</h3>
          <div className="space-y-2">
            {Object.entries(dashboardData.policyTypeDistribution || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-gray-600">{type}:</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md bg-white`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">⚖️ Risk Distribution</h3>
          <div className="space-y-2">
            {Object.entries(dashboardData.riskDistribution || {}).map(([risk, count]) => (
              <div key={risk} className="flex justify-between">
                <span className="text-sm text-gray-600">{risk}:</span>
                <span className={`text-sm font-semibold ${
                  risk === 'HIGH' ? 'text-red-600' : 
                  risk === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                }`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md bg-white`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">📈 Growth Trends</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Policies (6m):</span>
              <span className="text-sm font-semibold text-green-600">{dashboardData.growthTrends?.policiesLast6Months || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Users (6m):</span>
              <span className="text-sm font-semibold text-blue-600">{dashboardData.growthTrends?.usersLast6Months || 0}</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md bg-white`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">🎯 Claim Analytics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Approval Rate:</span>
              <span className="text-sm font-semibold text-green-600">{dashboardData.claimAnalytics?.approvalRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Amount:</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency((dashboardData.claimAnalytics?.averageClaimAmount || 0) * 83)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">🚀 Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/dashboard"
              className="block w-full p-3 text-left rounded-lg transition-colors bg-blue-50 hover:bg-blue-100"
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
              className="block w-full p-3 text-left rounded-lg transition-colors bg-green-50 hover:bg-green-100"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <p className="font-medium text-gray-900">Manage Policies</p>
                  <p className="text-sm text-gray-600">Review and manage policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/approvals"
              className="block w-full p-3 text-left rounded-lg transition-colors bg-yellow-50 hover:bg-yellow-100"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="font-medium text-gray-900">Approvals</p>
                  <p className="text-sm text-gray-600">Approve broker uploaded policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="block w-full p-3 text-left rounded-lg transition-colors bg-pink-50 hover:bg-pink-100"
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

        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">📈 System Health & Real-time Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🟢 {dashboardData.systemHealth?.database || 'Online'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌐 {dashboardData.systemHealth?.api || 'Healthy'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WebSocket Connection</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI Services</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🤖 {dashboardData.systemHealth?.aiServices?.ocr || 'Active'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fraud Detection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                �️ {dashboardData.systemHealth?.aiServices?.fraudDetection || 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Risk Assessment</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ⚖️ {dashboardData.systemHealth?.aiServices?.riskAssessment || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Recent Activity</h2>
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="space-y-3">
            {dashboardData.recentPolicies?.length > 0 || dashboardData.recentClaims?.length > 0 ? (
              <>
                {dashboardData.recentPolicies?.slice(0, 3).map((policy) => (
                  <div key={`policy-${policy.id}`} className="flex items-center justify-between p-3 rounded-lg transition-colors duration-300 bg-blue-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm">�</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New policy: {policy.name}</p>
                        <p className="text-xs text-gray-600">{policy.type} - {policy.broker}</p>
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
                ))}
                {dashboardData.recentClaims?.slice(0, 2).map((claim) => (
                  <div key={`claim-${claim.id}`} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-orange-100">
                        <span className="text-orange-600 text-sm">📝</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim #{claim.claimNumber || claim.id}</p>
                        <p className="text-xs text-gray-600">{claim.type} - {formatCurrency(claim.amount)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      claim.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center py-4 text-gray-500">No recent activity</p>
            )}
          </div>
        </div>

        {/* Recent Policies */}
        <div className="p-6 rounded-lg shadow-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📋 Recent Policies</h2>
            <Link to="/admin/policies" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300">View All</Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentPolicies.length > 0 ? (
              dashboardData.recentPolicies.slice(0, 5).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-green-100">
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
              <p className="text-center py-4 text-gray-500">No recent policies</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Claims removed to focus admin on Approvals + Analytics */}

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">🔔 System Notifications</h2>
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
                    <p className="text-xs mt-1 text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
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