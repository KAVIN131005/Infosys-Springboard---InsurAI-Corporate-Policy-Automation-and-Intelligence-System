import React, { useEffect, useState } from 'react';
import { getPendingApprovals, approvePolicy, rejectPolicy } from '../../api/userPolicyService';
import { useAuth } from '../../context/AuthContext';

const AdminApprovals = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingApprovals();
      setPending(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Failed to load pending policy applications', err);
      setError('Failed to load pending policy applications');
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (id) => {
    const policyApplication = pending.find(p => p.id === id);
    if (!policyApplication) return;

    const approvalNotes = prompt(
      `Approve policy application for ${policyApplication.user?.firstName} ${policyApplication.user?.lastName}?\n\n` +
      `Policy: ${policyApplication.policy?.name}\n` +
      `Risk Score: ${policyApplication.riskScore || 'N/A'}\n` +
      `AI Assessment: ${policyApplication.aiAssessment || 'N/A'}\n\n` +
      `Enter approval notes (optional):`, 
      'Approved after manual review - meets all criteria'
    );
    
    if (approvalNotes === null) return; // User cancelled
    
    try {
      setProcessingId(id);
      const result = await approvePolicy(id, approvalNotes || 'Approved by admin');
      
      // Remove from pending list
      setPending(prev => prev.filter(p => p.id !== id));
      
      // Enhanced success notification
      alert(`✅ Policy Application Approved Successfully!\n\n` +
            `📋 Policy: ${policyApplication.policy?.name || `Application #${id}`}\n` +
            `👤 Applicant: ${policyApplication.user?.firstName} ${policyApplication.user?.lastName}\n` +
            `📧 Email: ${policyApplication.user?.email}\n` +
            `🤖 AI Assessment: ${policyApplication.aiAssessment || 'N/A'}\n` +
            `📊 Risk Score: ${policyApplication.riskScore || 'N/A'}\n` +
            `💰 Monthly Premium: $${policyApplication.monthlyPremium || 'N/A'}\n\n` +
            `The user has been automatically notified and their policy is now ACTIVE.`);
      
      // Notify other parts of the app
      window.dispatchEvent(new CustomEvent('userPoliciesUpdated', { 
        detail: { id, action: 'approved', userPolicy: result } 
      }));
      
    } catch (err) {
      console.error('Approval failed', err);
      alert('❌ Approval failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const onReject = async (id) => {
    const policyApplication = pending.find(p => p.id === id);
    if (!policyApplication) return;

    const reason = prompt(
      `Reject policy application for ${policyApplication.user?.firstName} ${policyApplication.user?.lastName}?\n\n` +
      `Policy: ${policyApplication.policy?.name}\n` +
      `Risk Score: ${policyApplication.riskScore || 'N/A'}\n` +
      `AI Assessment: ${policyApplication.aiAssessment || 'N/A'}\n\n` +
      `Please provide a detailed rejection reason:`, 
      'Application does not meet our current underwriting criteria'
    );
    
    if (reason === null || reason.trim() === '') return; // User cancelled or empty reason
    
    try {
      setProcessingId(id);
      const result = await rejectPolicy(id, reason);
      
      // Remove from pending list
      setPending(prev => prev.filter(p => p.id !== id));
      
      // Enhanced rejection notification
      alert(`❌ Policy Application Rejected\n\n` +
            `📋 Policy: ${policyApplication.policy?.name || `Application #${id}`}\n` +
            `👤 Applicant: ${policyApplication.user?.firstName} ${policyApplication.user?.lastName}\n` +
            `📧 Email: ${policyApplication.user?.email}\n` +
            `💭 Reason: ${reason}\n\n` +
            `The user has been notified of the rejection with the reason provided.`);
      
      // Notify other parts of the app
      window.dispatchEvent(new CustomEvent('userPoliciesUpdated', { 
        detail: { id, action: 'rejected', userPolicy: result } 
      }));
      
    } catch (err) {
      console.error('Rejection failed', err);
      alert('❌ Rejection failed: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const getRiskBadge = (riskScore) => {
    if (!riskScore) return null;
    
    const score = parseFloat(riskScore);
    let color, label;
    
    if (score < 30) {
      color = 'bg-green-100 text-green-800';
      label = 'LOW RISK';
    } else if (score < 70) {
      color = 'bg-yellow-100 text-yellow-800';
      label = 'MEDIUM RISK';
    } else {
      color = 'bg-red-100 text-red-800';
      label = 'HIGH RISK';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label} ({score})
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  if (!user) return <div className="p-6">Loading user...</div>;
  if (user.role !== 'ADMIN') return <div className="p-6 text-red-600">Access denied - Admin role required</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Policy Application Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve user policy applications that require manual approval.
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-4">
          <button 
            onClick={fetchPending}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>{loading ? 'Refreshing...' : 'Refresh Pending Applications'}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending policy applications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <span className="text-red-600 text-lg mr-2">⚠️</span>
              <span className="text-red-800 font-medium">Error:</span>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
            <button 
              onClick={fetchPending}
              className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Try Again
            </button>
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-8 text-center">
            <span className="text-green-600 text-4xl block mb-4">✅</span>
            <h3 className="text-lg font-medium text-green-800 mb-2">All Caught Up!</h3>
            <p className="text-green-700">No pending policy applications require approval at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">📋 Approval Queue Summary</h3>
              <p className="text-blue-800 text-sm">
                <strong>{pending.length}</strong> policy application{pending.length !== 1 ? 's' : ''} requiring your review.
              </p>
            </div>

            {pending.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.policy?.name || `Policy Application #${application.id}`}
                        </h3>
                        {getRiskBadge(application.riskScore)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">👤 Applicant:</span>
                            <span className="text-gray-900">
                              {application.user?.firstName} {application.user?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">📧 Email:</span>
                            <span className="text-gray-900">{application.user?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">🏷️ Policy Type:</span>
                            <span className="text-gray-900">{application.policy?.type || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">💰 Monthly Premium:</span>
                            <span className="text-gray-900 font-medium">
                              ${application.monthlyPremium || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">🛡️ Coverage:</span>
                            <span className="text-gray-900">
                              ${application.policy?.coverage?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">📅 Applied:</span>
                            <span className="text-gray-900">{formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">📊 Status:</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              PENDING APPROVAL
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">🔍 Risk Score:</span>
                            <span className="text-gray-900">{application.riskScore || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Assessment */}
                  {application.aiAssessment && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-600 text-lg">🤖</span>
                        <span className="font-medium text-blue-900">AI Risk Assessment</span>
                      </div>
                      <p className="text-blue-800 text-sm">{application.aiAssessment}</p>
                    </div>
                  )}
                  
                  {/* Approval Notes/Reason */}
                  {application.approvalNotes && (
                    <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-orange-600 text-lg">📝</span>
                        <span className="font-medium text-orange-900">Review Notes</span>
                      </div>
                      <p className="text-orange-800 text-sm">{application.approvalNotes}</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => onReject(application.id)} 
                      disabled={processingId === application.id}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>❌</span>
                      <span>{processingId === application.id ? 'Processing...' : 'Reject'}</span>
                    </button>
                    
                    <button 
                      onClick={() => onApprove(application.id)} 
                      disabled={processingId === application.id}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>✅</span>
                      <span>{processingId === application.id ? 'Processing...' : 'Approve'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;
