import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatters';

const EnhancedClaimStatus = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Format currency amounts to INR
  const formatToINR = (amount) => formatCurrency(Number(amount) * 83, 'INR');

  useEffect(() => {
    fetchUserClaims();
  }, []);

  const fetchUserClaims = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/claims');
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      // Demo data for development
      setClaims([
        {
          id: 1,
          claimNumber: 'CLM-2024-001',
          type: 'AUTO',
          status: 'APPROVED',
          claimAmount: 15000,
          approvedAmount: 14500,
          incidentDate: '2024-01-15T00:00:00',
          incidentLocation: 'Highway 101, San Francisco',
          incidentDescription: 'Rear-end collision during rush hour traffic',
          autoApproved: false,
          aiConfidenceScore: 85,
          fraudScore: 15,
          reviewerNotes: 'Claim approved after manual review. Valid accident with proper documentation.',
          createdAt: '2024-01-15T10:30:00',
          updatedAt: '2024-01-20T14:22:00'
        },
        {
          id: 2,
          claimNumber: 'CLM-2024-002',
          type: 'HEALTH',
          status: 'APPROVED',
          claimAmount: 8500,
          approvedAmount: 8500,
          incidentDate: '2024-01-20T00:00:00',
          incidentLocation: 'City General Hospital',
          incidentDescription: 'Emergency surgery for appendicitis',
          autoApproved: true,
          aiConfidenceScore: 95,
          fraudScore: 5,
          reviewerNotes: 'AI Auto-Approved: Risk Score 95%, Confidence: 95%, Fraud Risk: 5% | Payment processed automatically: AUTO_CLM_1706097845123',
          createdAt: '2024-01-20T08:15:00',
          updatedAt: '2024-01-20T08:16:00'
        },
        {
          id: 3,
          claimNumber: 'CLM-2024-003',
          type: 'PROPERTY',
          status: 'PENDING_ADMIN_REVIEW',
          claimAmount: 25000,
          approvedAmount: null,
          incidentDate: '2024-01-25T00:00:00',
          incidentLocation: '123 Main Street, Residential Area',
          incidentDescription: 'Water damage from burst pipe in basement, affecting multiple rooms and furniture',
          autoApproved: false,
          aiConfidenceScore: 75,
          fraudScore: 30,
          reviewerNotes: 'Requires Admin Review: Risk Score 75%, Confidence: 75%, Fraud Risk: 30%',
          createdAt: '2024-01-25T14:20:00',
          updatedAt: '2024-01-25T14:20:00'
        },
        {
          id: 4,
          claimNumber: 'CLM-2024-004',
          type: 'TRAVEL',
          status: 'UNDER_REVIEW',
          claimAmount: 3500,
          approvedAmount: null,
          incidentDate: '2024-01-28T00:00:00',
          incidentLocation: 'International Airport',
          incidentDescription: 'Flight cancellation and lost luggage during vacation trip',
          autoApproved: false,
          aiConfidenceScore: 60,
          fraudScore: 45,
          reviewerNotes: 'Manual Review Required: Risk Score 60%, High fraud risk or low confidence detected',
          createdAt: '2024-01-28T16:45:00',
          updatedAt: '2024-01-28T16:45:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING_ADMIN_REVIEW': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'UNDER_REVIEW': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'PENDING_ADMIN_REVIEW': return '⏳';
      case 'UNDER_REVIEW': return '👁️';
      case 'REJECTED': return '❌';
      default: return '📋';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'AUTO': return '🚗';
      case 'HEALTH': return '🏥';
      case 'PROPERTY': return '🏠';
      case 'TRAVEL': return '✈️';
      case 'LIFE': return '❤️';
      case 'LIABILITY': return '⚖️';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.incidentDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'APPROVED').length;
    const pendingClaims = claims.filter(c => c.status.includes('REVIEW')).length;
    const totalApprovedAmount = claims
      .filter(c => c.status === 'APPROVED')
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
    const aiApprovedCount = claims.filter(c => c.autoApproved).length;

    return { totalClaims, approvedClaims, pendingClaims, totalApprovedAmount, aiApprovedCount };
  };

  const stats = getStats();

  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <Spinner size="large" />
          <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Loading your claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 My Claims Dashboard</h1>
          <p className={`text-xl ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Welcome back, {user?.firstName || user?.username}! Track all your insurance claims here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-4xl mb-2">📊</div>
            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalClaims}</div>
            <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>Total Claims</div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">{stats.approvedClaims}</div>
            <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>Approved</div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingClaims}</div>
            <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>Under Review</div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-4xl mb-2">🤖</div>
            <div className="text-3xl font-bold text-blue-600">{stats.aiApprovedCount}</div>
            <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>AI Approved</div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-green-600">{formatToINR(stats.totalApprovedAmount)}</div>
            <div className={isDark ? 'text-slate-300' : 'text-gray-600'}>Total Paid</div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>🔍 Search Claims</label>
              <Input
                type="text"
                placeholder="Search by claim number, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>📊 Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="APPROVED">✅ Approved</option>
                <option value="PENDING_ADMIN_REVIEW">⏳ Pending Admin Review</option>
                <option value="UNDER_REVIEW">👁️ Under Review</option>
                <option value="REJECTED">❌ Rejected</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => window.location.href = '/submit-claim'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
              >
                ➕ Submit New Claim
              </Button>
            </div>
          </div>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className={`rounded-2xl shadow-lg p-12 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="text-8xl mb-6">📋</div>
            <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Claims Found</h3>
            <p className={`mb-8 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'No claims match your search criteria.' 
                : "You haven't submitted any claims yet. Submit your first claim to get started!"}
            </p>
            <Button
              onClick={() => window.location.href = '/submit-claim'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold"
            >
              🚀 Submit Your First Claim
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className={`rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="text-4xl">{getTypeIcon(claim.type)}</div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{claim.claimNumber}</h3>
                        <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>{claim.type.replace('_', ' ')} Insurance Claim</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {claim.autoApproved && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1">
                          <span className="text-purple-700 font-semibold">🤖 AI Approved</span>
                        </div>
                      )}
                      <div className={`border rounded-lg px-4 py-2 font-semibold ${getStatusColor(claim.status)}`}>
                        {getStatusIcon(claim.status)} {claim.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Claim Amount</div>
                      <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatToINR(claim.claimAmount)}</div>
                    </div>
                    
                    {claim.approvedAmount && (
                      <div>
                        <div className="text-sm text-gray-500">Approved Amount</div>
                        <div className="text-lg font-semibold text-green-600">{formatToINR(claim.approvedAmount)}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Incident Date</div>
                      <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(claim.incidentDate)}</div>
                    </div>
                    
                    <div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Submitted</div>
                      <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(claim.createdAt)}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Location</div>
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>{claim.incidentLocation}</div>
                  </div>

                  <div className="mb-4">
                    <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Description</div>
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>{claim.incidentDescription}</div>
                  </div>

                  {claim.aiConfidenceScore && (
                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <div className="text-center">
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>AI Confidence</div>
                        <div className="text-lg font-semibold text-blue-600">{claim.aiConfidenceScore}%</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Fraud Risk</div>
                        <div className="text-lg font-semibold text-red-600">{claim.fraudScore}%</div>
                      </div>
                      <div className="text-center col-span-2 md:col-span-1">
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>Processing</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {claim.autoApproved ? 'Automated' : 'Manual'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => openClaimDetails(claim)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      👁️ View Details
                    </Button>
                    
                    {claim.status === 'APPROVED' && (
                      <Button
                        onClick={() => alert('Payment details: ' + (claim.reviewerNotes || 'Payment processed'))}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                      >
                        💰 Payment Info
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => window.location.href = '/chatbot'}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                    >
                      🤖 Ask AI
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claim Details Modal */}
        {showDetails && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <div className={`p-6 border-b transition-colors duration-300 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getTypeIcon(selectedClaim.type)} Claim Details - {selectedClaim.claimNumber}
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className={`text-2xl ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Claim Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Status:</span>
                        <div className={`inline-block ml-2 px-3 py-1 rounded-lg border font-semibold ${getStatusColor(selectedClaim.status)}`}>
                          {getStatusIcon(selectedClaim.status)} {selectedClaim.status.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="ml-2 font-medium">{selectedClaim.type}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">{formatDateTime(selectedClaim.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Last Updated:</span>
                        <span className="ml-2 font-medium">{formatDateTime(selectedClaim.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Financial Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Claimed Amount:</span>
                        <span className="ml-2 font-medium text-lg">{formatToINR(selectedClaim.claimAmount)}</span>
                      </div>
                      {selectedClaim.approvedAmount && (
                        <div>
                          <span className="text-sm text-gray-500">Approved Amount:</span>
                          <span className="ml-2 font-medium text-lg text-green-600">{formatToINR(selectedClaim.approvedAmount)}</span>
                        </div>
                      )}
                      {selectedClaim.autoApproved && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <span className="text-purple-700 font-semibold">🤖 AI Auto-Approved & Paid</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📍 Incident Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedClaim.incidentDate)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="ml-2 font-medium">{selectedClaim.incidentLocation}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Description:</span>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        {selectedClaim.incidentDescription}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClaim.aiConfidenceScore && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI Analysis</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedClaim.aiConfidenceScore}%</div>
                        <div className="text-sm text-blue-700">AI Confidence</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{selectedClaim.fraudScore}%</div>
                        <div className="text-sm text-red-700">Fraud Risk</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedClaim.autoApproved ? 'AUTO' : 'MANUAL'}
                        </div>
                        <div className="text-sm text-purple-700">Processing</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedClaim.reviewerNotes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Reviewer Notes</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {selectedClaim.reviewerNotes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`p-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Close
                  </Button>
                  {selectedClaim.status === 'APPROVED' && (
                    <Button
                      onClick={() => alert('Downloading payment receipt...')}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      💾 Download Receipt
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedClaimStatus;