import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BrokerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broker Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName || user?.username}! Navigate to manage your clients and policies.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/broker/upload"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
          >
            <span className="text-4xl mb-3">📤</span>
            <span className="text-lg font-medium text-gray-900 text-center">Upload Policy</span>
            <span className="text-sm text-gray-600 text-center mt-1">Upload and process new insurance policies</span>
          </Link>

          <Link
            to="/broker/policies"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
          >
            <span className="text-4xl mb-3">📋</span>
            <span className="text-lg font-medium text-gray-900 text-center">Manage Policies</span>
            <span className="text-sm text-gray-600 text-center mt-1">View and manage all client policies</span>
          </Link>

          <Link
            to="/broker/analytics"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
          >
            <span className="text-4xl mb-3">📊</span>
            <span className="text-lg font-medium text-gray-900 text-center">Analytics</span>
            <span className="text-sm text-gray-600 text-center mt-1">View performance metrics and reports</span>
          </Link>

          <Link
            to="/broker/clients"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors group"
          >
            <span className="text-4xl mb-3">👥</span>
            <span className="text-lg font-medium text-gray-900 text-center">Client Management</span>
            <span className="text-sm text-gray-600 text-center mt-1">Manage client relationships</span>
          </Link>

          <Link
            to="/broker/reports"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
          >
            <span className="text-4xl mb-3">📈</span>
            <span className="text-lg font-medium text-gray-900 text-center">Reports</span>
            <span className="text-sm text-gray-600 text-center mt-1">Generate and view detailed reports</span>
          </Link>

          <Link
            to="/broker/settings"
            className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
          >
            <span className="text-4xl mb-3">⚙️</span>
            <span className="text-lg font-medium text-gray-900 text-center">Settings</span>
            <span className="text-sm text-gray-600 text-center mt-1">Configure broker preferences</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
