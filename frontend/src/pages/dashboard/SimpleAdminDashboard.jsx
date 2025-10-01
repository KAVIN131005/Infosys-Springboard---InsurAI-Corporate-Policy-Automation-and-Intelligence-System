import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SimpleAdminDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

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
    <div className={`p-6 min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gray-50'
    }`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ⚙️ Admin Dashboard
        </h1>
        <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
          Welcome back, {user?.firstName || user?.username}! Here's your admin panel.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white'}` }>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Users</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1,250</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md border-l-4 border-green-500 transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white'}` }>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Policies</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>450</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md border-l-4 border-yellow-500 transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white'}` }>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Active Policies</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>380</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className={`p-6 rounded-lg shadow-md border-l-4 border-red-500 transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white'}` }>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Pending Claims</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>28</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-lg shadow-md mb-8 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/dashboard"
            className={`flex items-center p-4 rounded-lg transition-colors ${isDark ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100'}`}
          >
            <span className="text-3xl mr-4">📊</span>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Full Dashboard</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Detailed system metrics</p>
            </div>
          </Link>

          <Link
            to="/admin/policies"
            className={`flex items-center p-4 rounded-lg transition-colors ${isDark ? 'bg-green-900/30 hover:bg-green-900/50' : 'bg-green-50 hover:bg-green-100'}`}
          >
            <span className="text-3xl mr-4">📋</span>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Policies</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Review and approve policies</p>
            </div>
          </Link>

          {/* Upload Policy quick action removed for Admin — upload is broker-only */}

          <Link
            to="/admin/claims"
            className={`flex items-center p-4 rounded-lg transition-colors ${isDark ? 'bg-yellow-900/30 hover:bg-yellow-900/50' : 'bg-yellow-50 hover:bg-yellow-100'}`}
          >
            <span className="text-3xl mr-4">📝</span>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Review Claims</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Process pending claims</p>
            </div>
          </Link>

          <Link
            to="/admin/compare"
            className={`flex items-center p-4 rounded-lg transition-colors ${isDark ? 'bg-indigo-900/30 hover:bg-indigo-900/50' : 'bg-indigo-50 hover:bg-indigo-100'}`}
          >
            <span className="text-3xl mr-4">⚖️</span>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Compare Policies</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Analyze policy comparisons</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className={`flex items-center p-4 rounded-lg transition-colors ${isDark ? 'bg-pink-900/30 hover:bg-pink-900/50' : 'bg-pink-50 hover:bg-pink-100'}`}
          >
            <span className="text-3xl mr-4">📈</span>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>System performance insights</p>
            </div>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔧 System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}` }>
            <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>Database</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800'}`}>🟢 Online</span>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}` }>
            <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>API Server</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800'}`}>🌐 Healthy</span>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}` }>
            <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>AI Services</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800'}`}>🤖 Active</span>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}` }>
            <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>WebSocket</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>🔵 Connected</span>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className={`mt-8 p-4 rounded-lg transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100'}` }>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>Debug Info:</h3>
        <p className={isDark ? 'text-slate-300' : ''}><strong>User Role:</strong> {user?.role}</p>
        <p className={isDark ? 'text-slate-300' : ''}><strong>User Name:</strong> {user?.firstName || user?.username}</p>
        <p className={isDark ? 'text-slate-300' : ''}><strong>User ID:</strong> {user?.id}</p>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;