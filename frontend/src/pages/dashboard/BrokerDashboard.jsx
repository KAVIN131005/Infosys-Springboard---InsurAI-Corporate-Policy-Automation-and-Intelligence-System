import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeCard from '../../components/ui/ThemeCard';

const BrokerDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <ThemeCard className="text-center">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Broker Dashboard
            </h1>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Welcome back, {user?.firstName || user?.username}! Navigate to manage your clients and policies.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Navigation Menu */}
      <ThemeCard>
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/broker/upload"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-blue-900/20 hover:border-blue-500/50' 
                : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📤</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Upload Policy
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Upload and process new insurance policies
            </span>
          </Link>

          <Link
            to="/broker/policies"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-green-900/20 hover:border-green-500/50' 
                : 'border-gray-200 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📋</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Manage Policies
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              View and manage all client policies
            </span>
          </Link>

          <Link
            to="/broker/analytics"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-purple-900/20 hover:border-purple-500/50' 
                : 'border-gray-200 hover:bg-purple-50 hover:border-purple-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analytics
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              View performance metrics and reports
            </span>
          </Link>

          <Link
            to="/broker/clients"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-yellow-900/20 hover:border-yellow-500/50' 
                : 'border-gray-200 hover:bg-yellow-50 hover:border-yellow-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Client Management
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Manage client relationships
            </span>
          </Link>

          <Link
            to="/broker/reports"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-indigo-900/20 hover:border-indigo-500/50' 
                : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📈</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Reports
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Generate and view detailed reports
            </span>
          </Link>

          <Link
            to="/broker/settings"
            className={`flex flex-col items-center p-6 border rounded-lg transition-all duration-300 hover:scale-105 group ${
              isDark 
                ? 'border-slate-600 hover:bg-gray-800/50 hover:border-gray-500/50' 
                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚙️</span>
            <span className={`text-lg font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </span>
            <span className={`text-sm text-center mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Configure broker preferences
            </span>
          </Link>
        </div>
      </ThemeCard>
    </div>
  );
};

export default BrokerDashboard;
