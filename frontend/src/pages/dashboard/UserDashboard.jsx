import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiHealthService, chatService } from '../../api/aiService';
import { getClaims } from '../../api/claimService';
import { getPolicies } from '../../api/policyService';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    policies: [],
    claims: [],
    aiStatus: null
  });
  const [loading, setLoading] = useState(true);
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkAIServiceHealth();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [claimsResult, policiesResult] = await Promise.allSettled([
        getClaims().catch(() => []),
        getPolicies().catch(() => [])
      ]);

      const claimsData = claimsResult.status === 'fulfilled' ? claimsResult.value : [];
      const policiesData = policiesResult.status === 'fulfilled' ? policiesResult.value : [];

      setDashboardData({
        policies: policiesData,
        claims: claimsData.slice(0, 5), // Show only recent 5 claims
        aiStatus: null
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
            <div className="ai-status-indicator flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                getStatusColor(dashboardData.aiStatus?.status) === 'green' ? 'bg-green-500' :
                getStatusColor(dashboardData.aiStatus?.status) === 'orange' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></span>
              <span className="text-sm text-gray-600">
                AI Services: {dashboardData.aiStatus?.status || 'Unknown'}
              </span>
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
              <div className="summary-stat text-center mb-4">
                <span className="stat-number text-2xl font-bold text-gray-900 block">
                  {dashboardData.policies.length}
                </span>
                <span className="stat-label text-sm text-gray-600">Active Policies</span>
              </div>
              <div className="summary-stat text-center mb-4">
                <span className="stat-number text-lg font-semibold text-green-600 block">
                  {formatCurrency(
                    dashboardData.policies.reduce((sum, policy) => 
                      sum + (parseFloat(policy.coverageAmount) || 0), 0
                    )
                  )}
                </span>
                <span className="stat-label text-sm text-gray-600">Total Coverage</span>
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
            <div className="claims-list space-y-3 mb-4">
              {dashboardData.claims.length > 0 ? (
                dashboardData.claims.slice(0, 3).map((claim, index) => (
                  <div key={claim.id || index} className="claim-item flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="claim-info">
                      <span className="claim-id text-sm font-medium text-gray-900 block">
                        #{claim.id || `CLAIM-${index + 1}`}
                      </span>
                      <span className="claim-amount text-sm text-gray-600">
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
                <p className="no-claims text-gray-500 text-center py-4">No recent claims</p>
              )}
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

        {/* Recent Activity */}
        <div className="dashboard-card bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Activity</h3>
          <div className="activity-list space-y-3">
            {dashboardData.claims.length > 0 ? (
              <>
                <div className="activity-item flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="activity-icon text-2xl mr-3">🏥</span>
                  <div className="activity-content flex-1">
                    <p className="font-medium text-gray-900">Latest claim submitted</p>
                    <small className="text-gray-600">
                      {formatDate(dashboardData.claims[0]?.createdAt || new Date())}
                    </small>
                  </div>
                </div>
                <div className="activity-item flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="activity-icon text-2xl mr-3">🤖</span>
                  <div className="activity-content flex-1">
                    <p className="font-medium text-gray-900">
                      AI services are {dashboardData.aiStatus?.status || 'available'}
                    </p>
                    <small className="text-gray-600">Real-time status</small>
                  </div>
                </div>
              </>
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
      </div>

      {renderQuickChatModal()}
    </div>
  );
};

export default UserDashboard;