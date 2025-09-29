import React, { useEffect, useState } from 'react';
import { getPendingPolicies, approvePolicy, rejectPolicy } from '../../api/policyService';
import { useAuth } from '../../context/AuthContext';

const AdminApprovals = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingPolicies();
      setPending(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Failed to load pending policies', err);
      setError('Failed to load pending policies');
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (id) => {
    const approvalNotes = prompt('Enter approval notes (optional):', 'Approved after manual review');
    try {
      const result = await approvePolicy(Number(id), approvalNotes);
      setPending((p) => p.filter((x) => x.id !== id));
      
      // Enhanced success notification
      const policy = pending.find(p => p.id === id);
      alert(`✅ Policy Approved Successfully!\n\n` +
            `📋 Policy: ${policy?.policyName || policy?.name || `ID ${id}`}\n` +
            `👤 User: ${policy?.userName || policy?.userFirstName || 'N/A'}\n` +
            `🤖 AI Assessment: ${policy?.aiAssessment || 'N/A'}\n` +
            `📊 Risk Score: ${policy?.riskScore || 'N/A'}\n\n` +
            `The user, brokers, and all admins have been notified automatically.`);
      
      // Let other parts of the app know policies changed
      window.dispatchEvent(new CustomEvent('policiesUpdated', { detail: { id, action: 'approved' } }));
    } catch (err) {
      console.error('Approve failed', err);
      alert('❌ Approval failed: ' + (err.message || 'Unknown error'));
    }
  };

  const onReject = async (id) => {
    const reason = prompt('Enter rejection reason:', 'Does not meet approval criteria after manual review');
    if (reason === null) return; // User cancelled
    
    try {
      const result = await rejectPolicy(Number(id), reason || 'Rejected by admin');
      setPending((p) => p.filter((x) => x.id !== id));
      
      // Enhanced rejection notification
      const policy = pending.find(p => p.id === id);
      alert(`❌ Policy Rejected\n\n` +
            `📋 Policy: ${policy?.policyName || policy?.name || `ID ${id}`}\n` +
            `👤 User: ${policy?.userName || policy?.userFirstName || 'N/A'}\n` +
            `💭 Reason: ${reason}\n\n` +
            `The user has been notified of the rejection with the reason provided.`);
      
      window.dispatchEvent(new CustomEvent('policiesUpdated', { detail: { id, action: 'rejected' } }));
    } catch (err) {
      console.error('Reject failed', err);
      alert('❌ Rejection failed: ' + (err.message || 'Unknown error'));
    }
  };

  if (!user) return <div className="p-6">Loading user...</div>;
  if (user.role !== 'ADMIN') return <div className="p-6">Access denied</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">✅ Approvals</h1>
      <p className="text-sm text-gray-600 mb-6">Review and approve broker-uploaded policies.</p>

      {loading ? (
        <div>Loading pending policies...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : pending.length === 0 ? (
        <div className="text-gray-600">No pending policies.</div>
      ) : (
        <div className="space-y-4">
          {pending.map((policy) => (
            <div key={policy.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-lg text-gray-900">
                      {policy.policyName || policy.name || `Policy Application #${policy.id}`}
                    </div>
                    
                    {/* Risk Level Badge */}
                    {policy.riskScore && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        policy.riskScore < 30 ? 'bg-green-100 text-green-800' :
                        policy.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {policy.riskScore < 30 ? 'LOW RISK' :
                         policy.riskScore < 70 ? 'MEDIUM RISK' : 'HIGH RISK'}
                        ({policy.riskScore})
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Applicant:</span> {policy.userName || policy.userFirstName || 'N/A'}
                      {policy.userLastName && ` ${policy.userLastName}`}
                    </div>
                    <div>
                      <span className="font-medium">Monthly Premium:</span> ${policy.monthlyPremium || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        PENDING APPROVAL
                      </span>
                    </div>
                  </div>
                  
                  {/* AI Assessment */}
                  {policy.aiAssessment && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm font-medium text-blue-900 mb-1">🤖 AI Assessment:</div>
                      <div className="text-sm text-blue-800">{policy.aiAssessment}</div>
                    </div>
                  )}
                  
                  {/* Approval Notes/Reason */}
                  {policy.approvalNotes && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-md">
                      <div className="text-sm font-medium text-orange-900 mb-1">📝 Review Notes:</div>
                      <div className="text-sm text-orange-800">{policy.approvalNotes}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button 
                    onClick={() => onApprove(policy.id)} 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => onReject(policy.id)} 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
