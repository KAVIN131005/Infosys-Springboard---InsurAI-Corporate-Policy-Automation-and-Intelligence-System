import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ThemeContext removed: using light-mode styles only

const DynamicAnalyticsDashboard = () => {
  // dark theme removed; component uses light-mode Tailwind classes
  const [analytics, setAnalytics] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8080/api/analytics';

  useEffect(() => {
    fetchComprehensiveAnalytics();
  }, []);

  const fetchComprehensiveAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${API_BASE_URL}/comprehensive`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setAnalytics(response.data);
      setUserRole(response.data.userRole);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecificAnalytics = async (endpoint) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      return null;
    }
  };

  const exportAnalytics = async (format) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(`${API_BASE_URL}/export`, 
        { format: format },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(response.data);
    } catch (err) {
      alert('Export failed');
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchComprehensiveAnalytics}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="shadow rounded-lg p-6 mb-6 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dynamic Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Role: <span className="font-semibold text-blue-600">{userRole}</span> | 
                User: <span className="font-semibold">{analytics?.username}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => exportAnalytics('PDF')}
                className="px-4 py-2 rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
              >
                Export PDF
              </button>
              <button 
                onClick={() => exportAnalytics('Excel')}
                className="px-4 py-2 rounded transition-colors bg-green-500 text-white hover:bg-green-600"
              >
                Export Excel
              </button>
              <button 
                onClick={() => fetchSpecificAnalytics('realtime')}
                className="px-4 py-2 rounded transition-colors bg-red-500 text-white hover:bg-red-600"
              >
                Real-time Data
              </button>
            </div>
          </div>
        </div>

        {/* Admin-Specific Analytics */}
        {userRole === 'ADMIN' && analytics?.adminAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="shadow rounded-lg p-6 bg-white">
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                  <div className="space-y-3">
                {Object.entries(analytics.adminAnalytics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                      <span className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="shadow rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Broker Performance</h2>
              {analytics?.brokerAggregatedAnalytics && (
                  <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Brokers</span>
                    <span className="font-semibold">{analytics.brokerAggregatedAnalytics.totalBrokers}</span>
                  </div>
                  {analytics.brokerAggregatedAnalytics.brokerPerformance && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-semibold text-green-600">
                                                  Total Revenue:
                          ₹{analytics.brokerAggregatedAnalytics.brokerPerformance.totalRevenue ? 
                            (analytics.brokerAggregatedAnalytics.brokerPerformance.totalRevenue * 83).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Revenue/Broker</span>
                        <span className="font-semibold">
                                                  Average Revenue per Broker:
                          ₹{analytics.brokerAggregatedAnalytics.brokerPerformance.averageRevenuePerBroker ? 
                            (analytics.brokerAggregatedAnalytics.brokerPerformance.averageRevenuePerBroker * 83).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Broker-Specific Analytics */}
        {userRole === 'BROKER' && analytics?.brokerAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="shadow rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">My Performance</h2>
              <div className="space-y-3">
                {analytics.brokerAnalytics.revenueByMonth && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-700">Monthly Revenue</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(analytics.brokerAnalytics.revenueByMonth).map(([month, revenue]) => (
                        <div key={month} className="flex justify-between">
                          <span>{month}</span>
                          <span className="font-semibold">₹{revenue ? (revenue * 83).toLocaleString() : 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shadow rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Market Context</h2>
              {analytics?.systemContext?.marketTrends && (
                  <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-green-600">
                      {analytics.systemContext.marketTrends.growthRate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Popular Policy Types</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {analytics.systemContext.marketTrends.popularPolicyTypes?.map((type, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Analytics (Common) */}
        {analytics?.systemAnalytics && (
          <div className={`shadow rounded-lg p-6 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>System Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.systemAnalytics.revenueTrends && (
                <div>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Revenue Trends</h3>
                  <div className="text-2xl font-bold text-green-600">
                                      Monthly Revenue:
                    ₹{analytics.systemAnalytics.revenueTrends.monthlyRevenue ? 
                      (analytics.systemAnalytics.revenueTrends.monthlyRevenue * 83).toLocaleString() : 'N/A'}
                  </div>
                </div>
              )}
              
              {analytics.systemAnalytics.policyTrends && (
                <div>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Policy Trends</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(analytics.systemAnalytics.policyTrends).length} Metrics
                  </div>
                </div>
              )}
              
              {analytics.systemAnalytics.performanceMetrics && (
                <div>
                  <h3 className={`font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Performance</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.systemAnalytics.performanceMetrics.policyApprovalRate || 'N/A'}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={`shadow rounded-lg p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => fetchSpecificAnalytics('trends')}
              className={`px-4 py-2 rounded transition-colors ${isDark ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              View Trends
            </button>
            <button 
              onClick={() => fetchSpecificAnalytics('revenue')}
              className={`px-4 py-2 rounded transition-colors ${isDark ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              Revenue Details
            </button>
            <button 
              onClick={() => fetchSpecificAnalytics('performance')}
              className={`px-4 py-2 rounded transition-colors ${isDark ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
            >
              Performance
            </button>
            <button 
              onClick={() => fetchSpecificAnalytics('realtime')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Real-time Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Last Updated: {new Date(analytics?.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default DynamicAnalyticsDashboard;