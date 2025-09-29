import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiHealthService, chatService } from '../../api/aiService';
import { getClaims } from '../../api/claimService';
import { getUserDashboard } from '../../api/dashboardService';
import { getCurrentUserPolicies } from '../../api/userPolicyService';
import { websocketService } from '../../api/websocketService';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    pendingApprovals: 0,
    totalClaims: 0,
    approvedClaims: 0,
    pendingClaims: 0,
    totalPremiumPaid: 0,
    monthlyPremium: 0,
    totalCoverage: 0,
    policyTypes: {},
    recentActivities: [],
    policies: [],
    claims: [],
    aiStatus: null
  });
  const [loading, setLoading] = useState(true);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkAIServiceHealth();
    setupWebSocketConnection();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const setupWebSocketConnection = async () => {
    if (user?.token) {
      try {
        await websocketService.connect(user.token);
        websocketService.subscribeToUpdates((data) => {
          console.log('WebSocket data received:', data);
          if (data.type === 'DASHBOARD_UPDATE' || data.type === 'USER_DASHBOARD_UPDATE') {
            setDashboardData(prevData => ({
              ...prevData,
              ...data.payload
            }));
          }
        });
        setWsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load comprehensive dashboard data from backend
      const [dashboardResult, userPoliciesResult, claimsResult] = await Promise.allSettled([
        getUserDashboard(),
        getCurrentUserPolicies().catch(() => []),
        getClaims().catch(() => [])
      ]);

      // Extract dashboard statistics
      const dashboardStats = dashboardResult.status === 'fulfilled' ? dashboardResult.value : {};
      const userPolicies = userPoliciesResult.status === 'fulfilled' ? userPoliciesResult.value : [];
      const claimsData = claimsResult.status === 'fulfilled' ? claimsResult.value : [];

      // Merge all data
      setDashboardData(prevData => ({
        ...prevData,
        // Backend dashboard statistics
        totalPolicies: dashboardStats.totalPolicies || userPolicies.length,
        activePolicies: dashboardStats.activePolicies || userPolicies.filter(p => p.status === 'ACTIVE').length,
        pendingApprovals: dashboardStats.pendingApprovals || userPolicies.filter(p => p.status === 'PENDING').length,
        totalClaims: dashboardStats.totalClaims || claimsData.length,
        approvedClaims: dashboardStats.approvedClaims || claimsData.filter(c => c.status === 'APPROVED').length,
        pendingClaims: dashboardStats.pendingClaims || claimsData.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length,
        totalPremiumPaid: dashboardStats.totalPremiumPaid || 0,
        monthlyPremium: dashboardStats.monthlyPremium || 0,
        totalCoverage: dashboardStats.totalCoverage || userPolicies.reduce((sum, policy) => sum + (parseFloat(policy.coverageAmount) || 0), 0),
        policyTypes: dashboardStats.policyTypes || {},
        recentActivities: dashboardStats.recentActivities || [],
        // Individual records for detailed display
        policies: userPolicies,
        claims: claimsData.slice(0, 5) // Show only recent 5 claims
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set minimal data structure on error
      setDashboardData(prevData => ({
        ...prevData,
        totalPolicies: 0,
        activePolicies: 0,
        pendingApprovals: 0,
        totalClaims: 0,
        approvedClaims: 0,
        pendingClaims: 0,
        totalPremiumPaid: 0,
        monthlyPremium: 0,
        totalCoverage: 0,
        policyTypes: {},
        recentActivities: [],
        policies: [],
        claims: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkAIServiceHealth = async () => {
    try {
      const healthStatus = await aiHealthService.checkHealth();
      setDashboardData(prev => ({
        ...prev,
        aiStatus: healthStatus
      }));
    } catch (error) {
      console.error('AI service health check failed:', error);
      setDashboardData(prev => ({
        ...prev,
        aiStatus: { status: 'unhealthy', error: error.message }
      }));
    }
  };

  const handleQuickChat = async () => {
    if (!chatMessage.trim()) return;

    setChatLoading(true);
    try {
      const response = await chatService.sendMessage(chatMessage);
      setChatResponse(response.message || response.response || 'AI service responded successfully');
    } catch (error) {
      console.error('Quick chat failed:', error);
      setChatResponse(`Sorry, I'm having trouble right now: ${error.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'healthy':
        return 'green';
      case 'pending':
      case 'under_review':
        return 'orange';
      case 'inactive':
      case 'rejected':
      case 'unhealthy':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderQuickChatModal = () => (
    <Modal
      isOpen={showQuickChat}
      onClose={() => {
        setShowQuickChat(false);
        setChatMessage('');
        setChatResponse('');
      }}
      title="Quick AI Assistant"
    >
      <div className="quick-chat-modal">
        <div className="chat-input-section">
          <textarea
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask me anything about your insurance..."
            rows={3}
            disabled={chatLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {dashboardData.aiStatus?.status !== 'healthy' 
                ? 'AI services are currently unavailable' 
                : 'AI is ready to help you'}
            </p>
            <Button
              onClick={handleQuickChat}
              disabled={chatLoading || !chatMessage.trim() || dashboardData.aiStatus?.status !== 'healthy'}
            >
              {chatLoading ? <Spinner size="small" /> : 'Ask AI'}
            </Button>
          </div>
        </div>
        
        {chatResponse && (
          <div className="chat-response-section mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">AI Response:</h4>
            <div className="chat-response text-blue-800">
              {chatResponse}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  if (loading) {
    return (
      <div className="dashboard-loading flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="dashboard-header bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your insurance policies and claims with AI assistance
              </p>
            </div>
            <div className="status-indicators flex items-center space-x-4">
              <div className="ai-status-indicator flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  getStatusColor(dashboardData.aiStatus?.status) === 'green' ? 'bg-green-500' :
                  getStatusColor(dashboardData.aiStatus?.status) === 'orange' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}></span>
                <span className="text-sm text-gray-600">
                  AI: {dashboardData.aiStatus?.status || 'Unknown'}
                </span>
              </div>
              <div className="ws-status-indicator flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  wsConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-sm text-gray-600">
                  Live Updates: {wsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Quick Actions */}
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                🤖
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-600">Get instant help with insurance questions</p>
              </div>
            </div>
            <div className="card-actions space-y-2">
              <Button 
                onClick={() => setShowQuickChat(true)} 
                variant="outline"
                className="w-full"
                disabled={dashboardData.aiStatus?.status !== 'healthy'}
              >
                Quick Chat
              </Button>
              <Button 
                onClick={() => window.location.href = '/chatbot'}
                className="w-full"
                disabled={dashboardData.aiStatus?.status !== 'healthy'}
              >
                Full Chat
              </Button>
            </div>
          </div>

          {/* Policies Overview */}
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                📋
              </div>
              <h3 className="text-lg font-semibold text-gray-900">My Policies</h3>
            </div>
            <div className="policies-summary">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="summary-stat text-center">
                  <span className="stat-number text-2xl font-bold text-gray-900 block">
                    {dashboardData.totalPolicies}
                  </span>
                  <span className="stat-label text-xs text-gray-600">Total Policies</span>
                </div>
                <div className="summary-stat text-center">
                  <span className="stat-number text-2xl font-bold text-green-600 block">
                    {dashboardData.activePolicies}
                  </span>
                  <span className="stat-label text-xs text-gray-600">Active</span>
                </div>
              </div>
              <div className="summary-stat text-center mb-4">
                <span className="stat-number text-lg font-semibold text-blue-600 block">
                  {formatCurrency(dashboardData.totalCoverage)}
                </span>
                <span className="stat-label text-sm text-gray-600">Total Coverage</span>
              </div>
              <div className="summary-stat text-center">
                <span className="stat-number text-sm font-medium text-purple-600 block">
                  {formatCurrency(dashboardData.monthlyPremium)}
                </span>
                <span className="stat-label text-xs text-gray-600">Monthly Premium</span>
              </div>
            </div>
            <div className="card-actions">
              <Button 
                onClick={() => window.location.href = '/policies'} 
                variant="outline"
                className="w-full"
              >
                View All Policies
              </Button>
            </div>
          </div>

          {/* Claims Overview */}
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                🏥
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
            </div>
            <div className="claims-summary mb-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="summary-stat text-center">
                  <span className="stat-number text-lg font-bold text-gray-900 block">
                    {dashboardData.totalClaims}
                  </span>
                  <span className="stat-label text-xs text-gray-600">Total</span>
                </div>
                <div className="summary-stat text-center">
                  <span className="stat-number text-lg font-bold text-green-600 block">
                    {dashboardData.approvedClaims}
                  </span>
                  <span className="stat-label text-xs text-gray-600">Approved</span>
                </div>
                <div className="summary-stat text-center">
                  <span className="stat-number text-lg font-bold text-orange-600 block">
                    {dashboardData.pendingClaims}
                  </span>
                  <span className="stat-label text-xs text-gray-600">Pending</span>
                </div>
              </div>
              
              <div className="recent-claims space-y-2">
                {dashboardData.claims.length > 0 ? (
                  dashboardData.claims.slice(0, 2).map((claim, index) => (
                    <div key={claim.id || index} className="claim-item flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="claim-info">
                        <span className="claim-id font-medium text-gray-900 block">
                          #{claim.claimNumber || claim.id || `CLAIM-${index + 1}`}
                        </span>
                        <span className="claim-amount text-gray-600">
                          {formatCurrency(claim.amount)}
                        </span>
                      </div>
                      <div className="claim-status">
                        <span className={`status-badge px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusColor(claim.status) === 'green' ? 'bg-green-100 text-green-800' :
                          getStatusColor(claim.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-claims text-gray-500 text-center py-3 text-sm">No recent claims</p>
                )}
              </div>
            </div>
            <div className="card-actions space-y-2">
              <Button 
                onClick={() => window.location.href = '/submit-claim'} 
                variant="primary"
                className="w-full"
              >
                Submit New Claim
              </Button>
              <Button 
                onClick={() => window.location.href = '/claim-status'} 
                variant="outline"
                className="w-full"
              >
                View All Claims
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Quick Actions */}
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="quick-actions-grid grid grid-cols-2 gap-3">
              <Button 
                onClick={() => window.location.href = '/submit-claim'}
                className="quick-action-btn flex flex-col items-center p-4 h-auto"
                variant="outline"
              >
                <span className="text-2xl mb-2">📋</span>
                <span className="text-sm">Submit Claim</span>
              </Button>
              <Button 
                onClick={() => window.location.href = '/policy-compare'}
                className="quick-action-btn flex flex-col items-center p-4 h-auto"
                variant="outline"
              >
                <span className="text-2xl mb-2">🔍</span>
                <span className="text-sm">Compare Policies</span>
              </Button>
              <Button 
                onClick={() => window.location.href = '/chatbot'}
                className="quick-action-btn flex flex-col items-center p-4 h-auto"
                variant="outline"
                disabled={dashboardData.aiStatus?.status !== 'healthy'}
              >
                <span className="text-2xl mb-2">🤖</span>
                <span className="text-sm">AI Chat</span>
              </Button>
              <Button 
                onClick={() => window.location.href = '/analytics'}
                className="quick-action-btn flex flex-col items-center p-4 h-auto"
                variant="outline"
              >
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </div>

          {/* AI Insights */}
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 AI Insights</h3>
            <div className="insights-content space-y-3">
              {dashboardData.aiStatus?.status === 'healthy' ? (
                <>
                  <div className="insight-item flex items-start p-3 bg-blue-50 rounded-lg">
                    <span className="insight-icon text-blue-600 mr-3 mt-1">💡</span>
                    <p className="text-blue-800 text-sm">
                      Your insurance profile looks comprehensive with {dashboardData.policies.length} active policies
                    </p>
                  </div>
                  <div className="insight-item flex items-start p-3 bg-green-50 rounded-lg">
                    <span className="insight-icon text-green-600 mr-3 mt-1">🛡️</span>
                    <p className="text-green-800 text-sm">
                      {dashboardData.claims.length === 0 
                        ? 'No recent claims indicate good risk management'
                        : `${dashboardData.claims.length} recent claims are being processed`
                      }
                    </p>
                  </div>
                  <div className="insight-item flex items-start p-3 bg-purple-50 rounded-lg">
                    <span className="insight-icon text-purple-600 mr-3 mt-1">📊</span>
                    <p className="text-purple-800 text-sm">
                      AI recommends reviewing your coverage annually for optimal protection
                    </p>
                  </div>
                </>
              ) : (
                <div className="insight-item flex items-start p-3 bg-orange-50 rounded-lg">
                  <span className="insight-icon text-orange-600 mr-3 mt-1">⚠️</span>
                  <div>
                    <p className="text-orange-800 text-sm font-medium">AI insights temporarily unavailable</p>
                    <small className="text-orange-700">We're working to restore this feature</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Summary Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Activity</h3>
            <div className="activity-list space-y-3">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="activity-item flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="activity-icon text-2xl mr-3">
                      {activity.type === 'POLICY' ? '📋' : activity.type === 'CLAIM' ? '🏥' : '📊'}
                    </span>
                    <div className="activity-content flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <small className="text-gray-600">
                        {formatDate(activity.date)}
                        {activity.amount && ` - ${formatCurrency(activity.amount)}`}
                      </small>
                    </div>
                    {activity.status && (
                      <span className={`status-badge px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(activity.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(activity.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="activity-item flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="activity-icon text-2xl mr-3">👋</span>
                  <div className="activity-content flex-1">
                    <p className="font-medium text-gray-900">Welcome to your dashboard!</p>
                    <small className="text-gray-600">
                      Start by exploring your policies or submitting a claim
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Overview</h3>
            <div className="financial-stats space-y-4">
              <div className="stat-row flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Premium Paid</p>
                  <p className="text-xs text-blue-600">Lifetime payments</p>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {formatCurrency(dashboardData.totalPremiumPaid)}
                </span>
              </div>
              
              <div className="stat-row flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">Monthly Premium</p>
                  <p className="text-xs text-green-600">Current month</p>
                </div>
                <span className="text-lg font-bold text-green-800">
                  {formatCurrency(dashboardData.monthlyPremium)}
                </span>
              </div>

              <div className="stat-row flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Total Coverage</p>
                  <p className="text-xs text-purple-600">Protection amount</p>
                </div>
                <span className="text-lg font-bold text-purple-800">
                  {formatCurrency(dashboardData.totalCoverage)}
                </span>
              </div>

              {Object.keys(dashboardData.policyTypes).length > 0 && (
                <div className="policy-types mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Policy Types:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dashboardData.policyTypes).map(([type, count]) => (
                      <div key={type} className="text-center p-2 bg-gray-50 rounded">
                        <span className="text-lg font-bold text-gray-800 block">{count}</span>
                        <span className="text-xs text-gray-600">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderQuickChatModal()}
    </div>
  );
};

export default UserDashboard;