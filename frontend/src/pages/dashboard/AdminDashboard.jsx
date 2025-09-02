import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrokers: 0,
    totalPolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    systemHealth: 'Excellent'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalUsers: 1247,
        totalBrokers: 23,
        totalPolicies: 3451,
        totalClaims: 892,
        pendingClaims: 47,
        systemHealth: 'Excellent'
      });
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Brokers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBrokers}</p>
            </div>
            <div className="text-3xl">🏢</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPolicies.toLocaleString()}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingClaims}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/analytics"
              className="block w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">System performance and insights</p>
                </div>
              </div>
            </Link>

            <Link
              to="/broker/policies"
              className="block w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <p className="font-medium text-gray-900">Manage Policies</p>
                  <p className="text-sm text-gray-600">Review and manage all policies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/claim/status"
              className="block w-full p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🔍</span>
                <div>
                  <p className="font-medium text-gray-900">Review Claims</p>
                  <p className="text-sm text-gray-600">Process pending claims</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Overall Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ {stats.systemHealth}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🟢 Online
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI Services</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🤖 Active
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌐 Healthy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New user registration</p>
              <p className="text-xs text-gray-600">John Doe registered as a new user</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">📋</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Policy uploaded</p>
              <p className="text-xs text-gray-600">Broker Smith uploaded a new auto policy</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Claim submitted</p>
              <p className="text-xs text-gray-600">New claim requires review and processing</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI analysis completed</p>
              <p className="text-xs text-gray-600">Fraud detection scan completed successfully</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;