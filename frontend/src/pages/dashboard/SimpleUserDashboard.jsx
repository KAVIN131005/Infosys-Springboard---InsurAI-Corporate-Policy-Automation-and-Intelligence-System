import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatters';

const SimpleUserDashboard = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    policies: [],
    claims: [],
    aiStatus: { status: 'healthy' }
  });

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setDashboardData({
        policies: [
          { id: 1, name: 'Health Insurance', coverageAmount: 50000, status: 'active' },
          { id: 2, name: 'Auto Insurance', coverageAmount: 25000, status: 'active' }
        ],
        claims: [
          { id: 1, amount: 1500, status: 'pending', createdAt: new Date() },
          { id: 2, amount: 800, status: 'approved', createdAt: new Date() }
        ],
        aiStatus: { status: 'healthy' }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatToINR = (amount) => {
    const n = Number(amount) || 0;
    return formatCurrency(n * 83, 'INR');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <Spinner />
          <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${
          isDark 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDark ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Welcome to Insurance Dashboard! 🎉
              </h1>
              <p className={`mt-1 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Manage your insurance policies and claims with AI assistance
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                AI Services: {dashboardData.aiStatus.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Assistant Card */}
          <div className={`rounded-lg shadow-sm p-6 ${
            isDark 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>
                🤖
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  AI Assistant
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Get instant help with insurance questions
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => alert('Chat feature coming soon!')} 
                variant="outline"
                className="w-full"
              >
                Quick Chat
              </Button>
              <Button 
                onClick={() => window.location.href = '/chatbot'}
                className="w-full"
              >
                Full Chat
              </Button>
            </div>
          </div>

          {/* Policies Card */}
          <div className={`rounded-lg shadow-sm p-6 ${
            isDark 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'
              }`}>
                📋
              </div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-slate-100' : 'text-gray-900'
              }`}>My Policies</h3>
            </div>
            <div className="text-center mb-4">
              <span className={`text-2xl font-bold block ${
                isDark ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {dashboardData.policies.length}
              </span>
              <span className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>Active Policies</span>
            </div>
            <div className="text-center mb-4">
              <span className="text-lg font-semibold text-green-600 block">
                {formatToINR(
                  dashboardData.policies.reduce((sum, policy) => 
                    sum + (policy.coverageAmount || 0), 0
                  )
                )}
              </span>
              <span className={`text-sm ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>Total Coverage</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/policy/compare'} 
              variant="outline"
              className="w-full"
            >
              View All Policies
            </Button>
          </div>

          {/* Claims Card */}
          <div className={`rounded-lg shadow-sm p-6 ${
            isDark 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'
              }`}>
                🏥
              </div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-slate-100' : 'text-gray-900'
              }`}>Recent Claims</h3>
            </div>
            <div className="space-y-3 mb-4">
              {dashboardData.claims.map((claim) => (
                <div key={claim.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <span className={`text-sm font-medium block ${
                      isDark ? 'text-slate-100' : 'text-gray-900'
                    }`}>
                      #{claim.id}
                    </span>
                    <span className={`text-sm ${
                      isDark ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {formatToINR(claim.amount)}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      claim.status === 'approved' 
                        ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800' 
                        : claim.status === 'pending' 
                          ? isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800' 
                          : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/claim/submit'} 
                className="w-full"
              >
                Submit New Claim
              </Button>
              <Button 
                onClick={() => window.location.href = '/claim/status'} 
                variant="outline"
                className="w-full"
              >
                View All Claims
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-lg shadow-sm p-6 mt-6 ${
          isDark 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-slate-100' : 'text-gray-900'
          }`}>⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => window.location.href = '/claim/submit'}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm">Submit Claim</span>
            </Button>
            <Button 
              onClick={() => window.location.href = '/policy/compare'}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <span className="text-2xl mb-2">🔍</span>
              <span className="text-sm">Compare Policies</span>
            </Button>
            <Button 
              onClick={() => window.location.href = '/chatbot'}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <span className="text-2xl mb-2">🤖</span>
              <span className="text-sm">AI Chat</span>
            </Button>
            <Button 
              onClick={() => window.location.href = '/analytics'}
              className="flex flex-col items-center p-4 h-auto"
              variant="outline"
            >
              <span className="text-2xl mb-2">📊</span>
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </div>

        {/* Success Message */}
        <div className={`rounded-lg p-6 mt-6 ${
          isDark 
            ? 'bg-green-900/20 border border-green-800/30' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h4 className={`font-semibold ${
                isDark ? 'text-green-400' : 'text-green-900'
              }`}>Dashboard Successfully Loaded!</h4>
              <p className={isDark ? 'text-green-500' : 'text-green-700'}>
                All components are rendering correctly. You can now test other features of the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleUserDashboard;
