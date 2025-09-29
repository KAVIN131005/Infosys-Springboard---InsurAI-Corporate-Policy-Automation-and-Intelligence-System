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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📋 Available Insurance Policies
        </h1>
        <p className="text-gray-600">
          Browse and apply for insurance policies that meet your needs.
        </p>
      </div>

      {/* User's Applied Policies Section */}
      {userPolicies.length > 0 && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Your Policy Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPolicies.slice(0, 3).map((userPolicy) => (
              <div key={userPolicy.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{userPolicy.policyName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userPolicy.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    userPolicy.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    userPolicy.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userPolicy.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{userPolicy.policyType}</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(userPolicy.monthlyPremium)}/month
                </p>
                <p className="text-sm text-gray-500">
                  Applied: {new Date(userPolicy.applicationDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          {userPolicies.length > 3 && (
            <div className="mt-4 text-center">
              <Link to="/user/claims" className="text-blue-600 hover:text-blue-800 text-sm">
                View All Applications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div key={policy.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
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
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'No insurance policies are currently available.'}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
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