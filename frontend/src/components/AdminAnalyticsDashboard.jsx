import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { fetchAdminAnalytics } from '../services/analyticsService';
import { debugAuthState, testApiCall } from '../utils/authDebug';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const AdminAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('AdminAnalyticsDashboard: Current user:', user);
    debugAuthState();
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Loading analytics data...');
      
      // Debug: Test the API call
      await testApiCall();
      
      const data = await fetchAdminAnalytics();
      console.log('Analytics data received:', data);
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button 
          onClick={loadAnalyticsData}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Metrics Cards */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-blue-700 font-semibold">Total Policies</h3>
          <p className="text-2xl font-bold text-blue-800">{analyticsData?.totalPolicies || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="text-green-700 font-semibold">Total Claims</h3>
          <p className="text-2xl font-bold text-green-800">{analyticsData?.totalClaims || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h3 className="text-yellow-700 font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold text-yellow-800">${analyticsData?.totalRevenue || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h3 className="text-purple-700 font-semibold">Active Brokers</h3>
          <p className="text-2xl font-bold text-purple-800">{analyticsData?.activeBrokers || 0}</p>
        </div>
      </div>

      {/* Policy Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Policy Distribution by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData?.policyDistribution || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {analyticsData?.policyDistribution?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Claims Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Claims Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData?.claimsStatusDistribution || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {analyticsData?.claimsStatusDistribution?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analyticsData?.monthlyTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="policies" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="claims" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" stroke="#ffc658" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData?.revenueAnalytics || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
          <h3 className="text-indigo-700 font-semibold">AI Accuracy</h3>
          <p className="text-2xl font-bold text-indigo-800">
            {analyticsData?.aiAnalytics?.accuracy ? `${analyticsData.aiAnalytics.accuracy.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
          <h3 className="text-teal-700 font-semibold">AI Processed Claims</h3>
          <p className="text-2xl font-bold text-teal-800">{analyticsData?.aiAnalytics?.aiProcessedClaims || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h3 className="text-orange-700 font-semibold">Avg Processing Time</h3>
          <p className="text-2xl font-bold text-orange-800">
            {analyticsData?.aiAnalytics?.avgProcessingTime ? `${analyticsData.aiAnalytics.avgProcessingTime}s` : 'N/A'}
          </p>
        </div>
      </div>

      {/* AI Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI vs Manual Claims Processing</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData?.aiPerformanceChart || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
            <Bar dataKey="accuracy" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
          <h3 className="text-cyan-700 font-semibold">Avg Claim Process Time</h3>
          <p className="text-2xl font-bold text-cyan-800">
            {analyticsData?.performanceMetrics?.avgClaimProcessTime || 'N/A'}
          </p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
          <h3 className="text-pink-700 font-semibold">System Uptime</h3>
          <p className="text-2xl font-bold text-pink-800">
            {analyticsData?.performanceMetrics?.systemUptime ? `${analyticsData.performanceMetrics.systemUptime}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-lime-50 p-4 rounded-lg border-l-4 border-lime-500">
          <h3 className="text-lime-700 font-semibold">Error Rate</h3>
          <p className="text-2xl font-bold text-lime-800">
            {analyticsData?.performanceMetrics?.errorRate ? `${analyticsData.performanceMetrics.errorRate}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
          <h3 className="text-amber-700 font-semibold">User Satisfaction</h3>
          <p className="text-2xl font-bold text-amber-800">
            {analyticsData?.performanceMetrics?.userSatisfaction ? `${analyticsData.performanceMetrics.userSatisfaction}/5` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData?.performanceTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="throughput" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="errorRate" stroke="#ff7300" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive system analytics and performance metrics</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'trends', label: 'Trends', icon: '📈' },
            { id: 'ai', label: 'AI Analytics', icon: '🤖' },
            { id: 'performance', label: 'Performance', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'ai' && renderAITab()}
        {activeTab === 'performance' && renderPerformanceTab()}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadAnalyticsData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;