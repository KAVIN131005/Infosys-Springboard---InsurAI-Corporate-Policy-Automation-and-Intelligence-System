import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SimpleAdminDashboard = () => {
  const { user } = useAuth();

  console.log('AdminDashboard rendered, user:', user);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username}! Here's your admin panel.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">1,250</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900">450</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900">380</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">28</p>
            </div>
            <div className="text-3xl">⏳</div>
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
              <p className="font-medium text-gray-900">Full Dashboard</p>
              <p className="text-sm text-gray-600">Detailed system metrics</p>
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
            to="/admin/upload-policy"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📤</span>
            <div>
              <p className="font-medium text-gray-900">Upload Policy</p>
              <p className="text-sm text-gray-600">Add new insurance policies</p>
            </div>
          </Link>

          <Link
            to="/admin/claims"
            className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📝</span>
            <div>
              <p className="font-medium text-gray-900">Review Claims</p>
              <p className="text-sm text-gray-600">Process pending claims</p>
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

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Database</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🟢 Online
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">API Server</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🌐 Healthy
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">AI Services</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🤖 Active
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-gray-700">WebSocket</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              🔵 Connected
            </span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
        <p><strong>User Role:</strong> {user?.role}</p>
        <p><strong>User Name:</strong> {user?.firstName || user?.username}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;