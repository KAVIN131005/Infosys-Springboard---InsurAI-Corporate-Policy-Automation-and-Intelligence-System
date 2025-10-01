import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailablePolicies } from '../../api/policyService';
import { getCurrentUserPolicies } from '../../api/userPolicyService';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const UserPolicies = () => {
  const { user } = useAuth();
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [available, userApplied] = await Promise.all([
        getAvailablePolicies(),
        getCurrentUserPolicies()
      ]);
      setAvailablePolicies(available);
      setUserPolicies(userApplied);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = availablePolicies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || policy.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount) => {
    // Convert USD to INR and format
    const inrAmount = (amount || 0) * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(inrAmount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          📋 Available Insurance Policies
        </h1>
        <p className="text-gray-600">
          Browse and apply for insurance policies that meet your needs.
        </p>
      </div>

      {/* User's Applied Policies Section */}
      {userPolicies.length > 0 && (
        <div className="mb-8 p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">📄 Your Policy Applications & Active Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPolicies.map((userPolicy) => {
              const getStatusInfo = (status) => {
                switch(status) {
                  case 'ACTIVE':
                    return { color: 'bg-green-100 text-green-800', icon: '✅', label: 'ACTIVE' };
                  case 'PENDING_APPROVAL':
                    return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'PENDING APPROVAL' };
                  case 'APPLIED':
                    return { color: 'bg-blue-100 text-blue-800', icon: '📋', label: 'APPLIED' };
                  case 'REJECTED':
                    return { color: 'bg-red-100 text-red-800', icon: '❌', label: 'REJECTED' };
                  case 'CANCELLED':
                    return { color: 'bg-gray-100 text-gray-800', icon: '🚫', label: 'CANCELLED' };
                  case 'EXPIRED':
                    return { color: 'bg-orange-100 text-orange-800', icon: '⚠️', label: 'EXPIRED' };
                  default:
                    return { color: 'bg-gray-100 text-gray-800', icon: '❓', label: status || 'UNKNOWN' };
                }
              };
              
              const statusInfo = getStatusInfo(userPolicy.status);
              
                return (
                <div key={userPolicy.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  userPolicy.status === 'ACTIVE' ? 'bg-green-50 border-green-200' :
                  userPolicy.status === 'PENDING_APPROVAL' ? 'bg-yellow-50 border-yellow-200' :
                  userPolicy.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {userPolicy.policy?.name || userPolicy.policyName || 'Policy Application'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusInfo.color}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{userPolicy.policy?.type || userPolicy.policyType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(userPolicy.monthlyPremium)}/month
                      </span>
                    </div>
                    {userPolicy.status === 'ACTIVE' && (
                      <>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(userPolicy.policy?.coverage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Since:</span>
                          <span className="font-medium">
                            {userPolicy.startDate ? new Date(userPolicy.startDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Payment:</span>
                          <span className="font-medium">
                            {userPolicy.nextPaymentDate ? new Date(userPolicy.nextPaymentDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                    {userPolicy.status === 'PENDING_APPROVAL' && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                        <p className="font-medium text-yellow-800">🔍 Under Review</p>
                        <p className="text-yellow-700">Your application is being reviewed by our team. You'll be notified once approved.</p>
                        {userPolicy.riskScore && (
                          <p className="text-yellow-700 mt-1">Risk Score: {userPolicy.riskScore}</p>
                        )}
                      </div>
                    )}
                    {userPolicy.status === 'REJECTED' && userPolicy.approvalNotes && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                        <p className="font-medium text-red-800">❌ Rejection Reason</p>
                        <p className="text-red-700">{userPolicy.approvalNotes}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Applied:</span>
                      <span>{userPolicy.createdAt ? new Date(userPolicy.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons for different statuses */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {userPolicy.status === 'ACTIVE' && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/user/claims?policyId=${userPolicy.id}`}
                          className={`flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-1 px-2 rounded text-xs font-medium transition-colors`}
                        >
                          📝 File Claim
                        </Link>
                        <button className={`bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs font-medium transition-colors`}>
                          📄 View Policy
                        </button>
                      </div>
                    )}
                    {userPolicy.status === 'PENDING_APPROVAL' && (
                      <div className="text-center">
                        <button 
                          onClick={() => alert('🕒 Your application is currently under review by our team. You will receive an email notification once the review is complete.')}
                          className={`bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors`}
                        >
                          🕒 Check Status
                        </button>
                      </div>
                    )}
                    {userPolicy.status === 'REJECTED' && (
                      <div className="text-center">
                        <Link
                          to="/user/policies"
                          className={`bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors`}
                        >
                          🔄 Apply for Other Policies
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {userPolicies.length > 6 && (
            <div className="mt-4 text-center">
              <Link to="/user/dashboard" className={`${isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'} text-sm font-medium`}>
                View All Policies & Applications →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className={`p-6 rounded-lg shadow-md mb-6 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'border-gray-300'
              }`}
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'border-gray-300'
              }`}
            >
              <option value="all">All Types</option>
              <option value="AUTO">Auto Insurance</option>
              <option value="HEALTH">Health Insurance</option>
              <option value="HOME">Home Insurance</option>
              <option value="LIFE">Life Insurance</option>
              <option value="TRAVEL">Travel Insurance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Available Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <div key={policy.id} className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold text-gray-900`}>{policy.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                policy.type === 'AUTO' ? 'bg-blue-100 text-blue-800' :
                policy.type === 'HEALTH' ? 'bg-green-100 text-green-800' :
                policy.type === 'HOME' ? 'bg-yellow-100 text-yellow-800' :
                policy.type === 'LIFE' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {policy.type}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{policy.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Premium:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(policy.monthlyPremium)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage Amount:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(policy.coverageAmount)}
                </span>
              </div>
              {policy.deductible && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deductible:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(policy.deductible)}
                  </span>
                </div>
              )}
            </div>

            {/* Key Features */}
            {policy.keyFeatures && policy.keyFeatures.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {policy.keyFeatures.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Link
                to={`/policy/view/${policy.id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                View Details
              </Link>
              <Link
                to={`/policy/compare?policies=${policy.id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors text-sm"
                title="Compare Policy"
              >
                ⚖️
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-6xl mb-4 text-gray-400`}>📋</div>
          <h3 className={`text-lg font-semibold mb-2 text-gray-900`}>No Policies Found</h3>
          <p className={`text-gray-600`}>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'No insurance policies are currently available.'}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`mt-8 p-6 rounded-lg shadow-md bg-white`}>
        <h2 className={`text-xl font-semibold mb-4 text-gray-900`}>🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/user/compare"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">⚖️</span>
            <div>
              <p className="font-medium text-gray-900">Compare Policies</p>
              <p className="text-sm text-gray-600">Compare multiple policies side by side</p>
            </div>
          </Link>
          
          <Link
            to="/user/submit-claim"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">📝</span>
            <div>
              <p className="font-medium text-gray-900">Submit Claim</p>
              <p className="text-sm text-gray-600">File a new insurance claim</p>
            </div>
          </Link>
          
          <Link
            to="/user/chatbot"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <span className="text-3xl mr-4">🤖</span>
            <div>
              <p className="font-medium text-gray-900">AI Assistant</p>
              <p className="text-sm text-gray-600">Get help with policy questions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserPolicies;