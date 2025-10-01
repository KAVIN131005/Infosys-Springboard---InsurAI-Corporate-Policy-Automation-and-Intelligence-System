import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminClaimApproval = () => {
  const [pendingClaims, setPendingClaims] = useState([]);
  const { isDark } = useTheme();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/claims/pending-review', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingClaims(response.data);
    } catch (error) {
      console.error('Error fetching pending claims:', error);
      toast.error('Failed to fetch pending claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (approvedAmount) {
        params.append('approvedAmount', approvedAmount);
      }
      if (reviewNotes) {
        params.append('notes', reviewNotes);
      }

      await axios.post(`/api/claims/${claimId}/approve?${params.toString()}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Claim approved successfully!');
      setSelectedClaim(null);
      setApprovedAmount('');
      setReviewNotes('');
      fetchPendingClaims();
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error('Failed to approve claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`/api/claims/${claimId}/reject?reason=${encodeURIComponent(rejectionReason)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Claim rejected successfully!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedClaim(null);
      fetchPendingClaims();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error('Failed to reject claim');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getRiskScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : ''}`}> 
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 transition-colors duration-300 ${isDark ? 'text-slate-200' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Claims Requiring Manual Review</h1>
        <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Review and approve/reject claims with high risk scores</p>
      </div>

      {pendingClaims.length === 0 ? (
        <div className={`rounded-lg shadow-md p-8 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Claims Pending Review</h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>All claims have been processed by AI or reviewed by admins.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingClaims.map((claim) => (
            <div key={claim.id} className={`rounded-lg shadow-md border transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}` }>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Claim #{claim.claimNumber}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(claim.riskScore)} ${isDark ? 'border border-slate-600' : ''}`}>
                      Risk Score: {claim.riskScore?.toFixed(1)}%
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                      Requires Manual Review
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Claim Amount</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(claim.claimAmount)}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Policy Type</p>
                    <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{claim.userPolicy?.policy?.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Incident Type</p>
                    <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{claim.incidentType}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>User</p>
                    <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{claim.userPolicy?.user?.firstName} {claim.userPolicy?.user?.lastName}</p>
                  </div>
                </div>

                {/* AI Analysis Scores */}
                <div className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-slate-700/60' : 'bg-gray-50'}` }>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Analysis Scores</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Confidence</p>
                      <p className={`text-lg font-semibold ${getConfidenceColor(claim.confidenceScore)}`}>
                        {claim.confidenceScore?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Fraud Risk</p>
                      <p className={`text-lg font-semibold ${claim.fraudScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {claim.fraudScore?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Amount Risk</p>
                      <p className={`text-lg font-semibold ${claim.amountScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {claim.amountScore?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Completeness</p>
                      <p className={`text-lg font-semibold ${getConfidenceColor(claim.completenessScore)}`}>
                        {claim.completenessScore?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Claim Details */}
                {selectedClaim?.id === claim.id && (
                  <div className={`rounded-lg p-4 mb-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}` }>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Claim Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Description:</span> {claim.description}</p>
                      <p><span className="font-medium">Incident Date:</span> {new Date(claim.incidentDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Location:</span> {claim.incidentLocation}</p>
                      {claim.aiAnalysis && (
                        <p><span className="font-medium">AI Analysis:</span> {claim.aiAnalysis}</p>
                      )}
                    </div>

                    {/* Admin Review Form */}
                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-blue-800/40' : 'border-blue-200'}` }>
                      <h5 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Review</h5>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            Approved Amount (Optional)
                          </label>
                          <input
                            type="number"
                            value={approvedAmount}
                            onChange={(e) => setApprovedAmount(e.target.value)}
                            placeholder={`Default: ${formatCurrency(claim.claimAmount)}`}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border border-slate-600 text-white' : 'border border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            Review Notes (Optional)
                          </label>
                          <input
                            type="text"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Additional notes..."
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border border-slate-600 text-white' : 'border border-gray-300'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)}
                    className={`px-4 py-2 rounded-md transition-colors ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {selectedClaim?.id === claim.id ? 'Hide Details' : 'View Details'}
                  </button>
                  
                  <button
                    onClick={() => handleApproveClaim(claim.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => setShowRejectModal(claim.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md mx-4 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reject Claim</h3>
            <p className={isDark ? 'text-slate-300 mb-4' : 'text-gray-600 mb-4'}>Please provide a reason for rejecting this claim:</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${isDark ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400' : 'border border-gray-300'}`}
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className={`px-4 py-2 rounded-md hover:bg-gray-400 ${isDark ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectClaim(showRejectModal)}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaimApproval;