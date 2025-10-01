
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import Spinner from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const { isDark } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [lastUpdated, setLastUpdated] = useState(null);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const API_BASE_URL = 'http://localhost:8080/api/analytics';

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  // Create axios instance with auth headers
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add auth token to requests
  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const loadComprehensiveAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Check token
      const token = getAuthToken();
      console.log('Auth token exists:', !!token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await apiClient.get('/comprehensive');
      setAnalyticsData(response.data);
      setUserRole(response.data.userRole);
      setLastUpdated(new Date(response.data.timestamp));
      
    } catch (err) {
      console.error('Failed to load analytics:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view analytics.');
      } else {
        setError('Failed to load analytics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSpecificAnalytics = useCallback(async (endpoint) => {
    try {
      const response = await apiClient.get(`/${endpoint}`, {
        params: { timeframe: selectedTimeframe }
      });
      return response.data;
    } catch (err) {
      console.error(`Failed to load ${endpoint}:`, err);
      return null;
    }
  }, [selectedTimeframe]);

  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true);
      let endpoint = '';
      if (userRole === 'ADMIN') {
        endpoint = '/admin/charts';
      } else if (userRole === 'BROKER') {
        endpoint = '/broker/charts';
      } else {
        return;
      }
      
      const response = await apiClient.get(endpoint);
      setChartData(response.data.chartData);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setChartLoading(false);
    }
  }, [userRole]);

  const exportAnalytics = async (format) => {
    try {
      const response = await apiClient.post('/export', { format });
      alert(response.data);
    } catch (err) {
      alert('Export failed. Please try again.');
      console.error('Export error:', err);
    }
  };

  useEffect(() => {
    loadComprehensiveAnalytics();
  }, [loadComprehensiveAnalytics]);

  useEffect(() => {
    if (userRole && (userRole === 'ADMIN' || userRole === 'BROKER')) {
      loadChartData();
    }
  }, [userRole, loadChartData]);

  const renderMetricCard = (title, value, subtitle, trend, icon = "📊", color = "blue") => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );

  const transformObjectToChartData = (data) => {
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'number' ? value : parseFloat(value) || 0
    }));
  };

  const renderAdminDashboard = () => {
    if (!analyticsData || userRole !== 'ADMIN') return null;

    const { adminAnalytics, brokerAggregatedAnalytics } = analyticsData;

    return (
      <>
        {/* Admin Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminAnalytics?.policyDistribution && (
            <>
              {renderMetricCard("Total Policies", Object.values(adminAnalytics.policyDistribution).reduce((a, b) => a + b, 0), "All policy types", 8, "📋", "blue")}
              {renderMetricCard("Brokers", brokerAggregatedAnalytics?.totalBrokers || 0, "Active brokers", 5, "👥", "green")}
              {renderMetricCard("System Revenue", `₹${(brokerAggregatedAnalytics?.brokerPerformance?.totalRevenue * 83 || 0).toLocaleString()}`, "Total monthly", 12, "💰", "emerald")}
              {renderMetricCard("Avg/Broker", `₹${Math.round((brokerAggregatedAnalytics?.brokerPerformance?.averageRevenuePerBroker * 83 || 0)).toLocaleString()}`, "Monthly average", 3, "📈", "purple")}
            </>
          )}
        </div>

        {/* Enhanced Admin Charts with New Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Policy Distribution from New API */}
          {chartData?.policyDistribution && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Policy Performance Summary</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.policyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}`}
                  >
                    {chartData.policyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Claims Status from New API */}
          {chartData?.claimsStatus && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Claims Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.claimsStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}`}
                  >
                    {chartData.claimsStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue Performance from New API */}
          {chartData?.monthlyRevenue && chartData.monthlyRevenue.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Revenue Performance (INR)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">₹10,37,500</div>
                  <div className="text-sm text-gray-600">Current Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">85.3%</div>
                  <div className="text-sm text-gray-600">Target Achievement</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fallback to Original Charts if New Data Not Available */}
        {!chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Original Policy Distribution */}
            {adminAnalytics?.policyDistribution && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Policy Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transformObjectToChartData(adminAnalytics.policyDistribution)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {transformObjectToChartData(adminAnalytics.policyDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Original Claims Distribution */}
            {adminAnalytics?.claimsDistribution && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Claims Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transformObjectToChartData(adminAnalytics.claimsDistribution)}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderBrokerDashboard = () => {
    if (!analyticsData || userRole !== 'BROKER') return null;

    const { brokerAnalytics, brokerDashboard, systemContext } = analyticsData;

    return (
      <>
        {/* Broker Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {brokerDashboard && (
            <>
              {renderMetricCard("My Policies", brokerDashboard.totalPolicies || 0, "Total managed", null, "📋", "blue")}
              {renderMetricCard("Active Policies", brokerDashboard.activePolicies || 0, "Currently active", null, "✅", "green")}
              {renderMetricCard("My Revenue", `₹${(brokerDashboard.monthlyRevenue * 83 || 0).toLocaleString()}`, "Monthly earnings", null, "💰", "emerald")}
              {renderMetricCard("My Clients", brokerDashboard.totalClients || 0, "Active clients", null, "👥", "purple")}
            </>
          )}
        </div>

        {/* Enhanced Broker Charts with New Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Policy Performance Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Policy Performance Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{brokerDashboard?.totalPolicies || 0}</div>
                <div className="text-sm text-gray-600">Total Policies</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{brokerDashboard?.activePolicies || 0}</div>
                <div className="text-sm text-gray-600">Active Policies</div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  ₹{((brokerDashboard?.monthlyRevenue || 0) * 83).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{brokerDashboard?.totalClients || 0}</div>
                <div className="text-sm text-gray-600">Total Clients</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback to Original Charts if New Data Not Available */}
        {!chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Original Revenue by Month */}
            {brokerAnalytics?.revenueByMonth && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transformObjectToChartData(brokerAnalytics.revenueByMonth)}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${(value * 83).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Original Policy Distribution */}
            {brokerAnalytics?.policyDistribution && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">My Policy Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transformObjectToChartData(brokerAnalytics.policyDistribution)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {transformObjectToChartData(brokerAnalytics.policyDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Market Context */}
        {systemContext?.marketTrends && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemContext.marketTrends.growthRate}</div>
                <div className="text-sm text-gray-600">Market Growth Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{systemContext.marketTrends.industryBenchmark}</div>
                <div className="text-sm text-gray-600">Industry Benchmark</div>
              </div>
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {systemContext.marketTrends.popularPolicyTypes?.map((type, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {type}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">Popular Policy Types</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Spinner />
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadComprehensiveAnalytics} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Role: <span className="font-semibold text-blue-600">{userRole}</span> | 
            User: <span className="font-semibold">{analyticsData?.username}</span>
          </p>
        </div>
        <div className="flex space-x-4">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button 
            onClick={() => exportAnalytics('PDF')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📄 Export PDF
          </button>
          <button 
            onClick={() => exportAnalytics('Excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            📊 Export Excel
          </button>
          <button 
            onClick={() => {
              loadComprehensiveAnalytics();
              if (userRole) loadChartData();
            }} 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            disabled={loading || chartLoading}
          >
            🔄 {loading || chartLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Role-specific Dashboard Content */}
      {chartLoading && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-center">
            <Spinner />
            <span className="ml-2 text-gray-600">Loading enhanced chart data...</span>
          </div>
        </div>
      )}
      {userRole === 'ADMIN' && renderAdminDashboard()}
      {userRole === 'BROKER' && renderBrokerDashboard()}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => loadSpecificAnalytics('trends')}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📈 View Trends
          </button>
          <button 
            onClick={() => loadSpecificAnalytics('revenue')}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            💰 Revenue Details
          </button>
          <button 
            onClick={() => loadSpecificAnalytics('performance')}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            ⚡ Performance
          </button>
          <button 
            onClick={() => loadSpecificAnalytics('realtime')}
            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            🔴 Real-time Data
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 border-t">
        <p>Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Unknown'}</p>
        <p>Data refreshes automatically based on user activity</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

