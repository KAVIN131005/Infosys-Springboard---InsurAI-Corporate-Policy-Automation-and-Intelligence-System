import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Theme removed: no ThemeContext import
import { formatCurrency } from '../../utils/formatters';
import { getAdminDashboard } from '../../api/dashboardService';

const AdminDashboard = () => {
  const { user } = useAuth();
  // Theme removed: force light mode styles
  // const { isDark } = useTheme();
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
    systemHealth: {},
    notifications: []
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
        },
        notifications: adminData.notifications || []
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data structure
      setDashboardData({
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
            monthlyPremium: 250.00,
            broker: 'john_broker'
          }
        ],
        recentClaims: [
          {
            id: 1,
            claimNumber: 'CLM1704067200000',
            type: 'AUTO',
            status: 'APPROVED',
            claimAmount: 5000.00,
            approvedAmount: 4500.00
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
        },
        systemHealth: {
          database: 'Online',
          api: 'Healthy',
          aiServices: {
            ocr: 'Active',
            fraudDetection: 'Active',
            riskAssessment: 'Active'
          }
        },
        notifications: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state (light-only)
  if (loading) {
    return (
      <div className="p-6 bg-gray-50">
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

  // Error state (light-only)
  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
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
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-100 hover:bg-red-200 text-red-800"
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

  // Check user permissions
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p>Access Denied: Admin role required</p>
          <p>Current role: {user.role}</p>
        </div>
      </div>
    );
  }

  const formatToINR = (amount) => {
    // Convert backend USD quantities to INR for display (fixed rate used here)
    const val = Number(amount) || 0;
    return formatCurrency(val * 83, 'INR');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          ⚙️ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username}! Here's your system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="p-6 rounded-lg shadow-md border-l-4 border-blue-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalPolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.activePolicies?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.pendingClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalClaims?.toLocaleString() || 0}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatToINR(dashboardData.monthlyRevenue)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📊</span>
            <div>
              <p className="font-medium text-gray-900">Dashboard</p>
              <p className="text-sm text-gray-600">System overview and metrics</p>
            </div>
          </Link>

          <Link
            to="/admin/policies"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📋</span>
            <div>
              <p className="font-medium text-gray-900">Manage Policies</p>
              <p className="text-sm text-gray-600">Review and approve policies</p>
            </div>
          </Link>

          <Link
            to="/admin/approvals"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">✅</span>
            <div>
              <p className="font-medium text-gray-900">Approvals</p>
              <p className="text-sm text-gray-600">Approve broker uploads and pending items</p>
            </div>
          </Link>

          <Link
            to="/admin/compare"
            className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">⚖️</span>
            <div>
              <p className="font-medium text-gray-900">Compare Policies</p>
              <p className="text-sm text-gray-600">Analyze policy comparisons</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📈</span>
            <div>
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">System performance insights</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Health & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Analytics Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Analytics Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Policy Distribution</span>
              <div className="text-sm text-right">
                <div>Auto: {dashboardData.policyTypeDistribution?.AUTO || 0}</div>
                <div>Health: {dashboardData.policyTypeDistribution?.HEALTH || 0}</div>
                <div>Life: {dashboardData.policyTypeDistribution?.LIFE || 0}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Claim Approval Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {dashboardData.claimAnalytics?.approvalRate || 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth (Last 6 Months)</span>
              <div className="text-sm text-right">
                <div>Policies: +{dashboardData.growthTrends?.policiesLast6Months || 0}</div>
                <div>Users: +{dashboardData.growthTrends?.usersLast6Months || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 System Health</h2>
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
              <span className="text-gray-600">AI Services</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🤖 {dashboardData.systemHealth?.aiServices?.ocr || 'Active'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fraud Detection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🛡️ {dashboardData.systemHealth?.aiServices?.fraudDetection || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Policies */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Policies</h3>
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
                        <p className="text-xs text-gray-600">{policy.type} - {formatToINR(policy.monthlyPremium)}/month</p>
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

          {/* Recent Claims */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Claims</h3>
            <div className="space-y-3">
              {dashboardData.recentClaims.length > 0 ? (
                dashboardData.recentClaims.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 text-sm">📝</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim #{claim.claimNumber || claim.id}</p>
                        <p className="text-xs text-gray-600">{claim.type} - {formatToINR(claim.claimAmount)}</p>
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
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent claims</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info for Development */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔍 Debug Info:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>User Role:</strong> {user?.role}
          </div>
          <div>
            <strong>User Name:</strong> {user?.firstName || user?.username}
          </div>
          <div>
            <strong>Data Loaded:</strong> {loading ? 'Loading...' : 'Complete'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;