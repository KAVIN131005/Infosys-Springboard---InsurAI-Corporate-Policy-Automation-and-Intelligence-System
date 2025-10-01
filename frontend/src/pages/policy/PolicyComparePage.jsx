import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const PolicyComparePage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Try multiple endpoints in prioritized order. This makes the page resilient
      // to missing role-specific endpoints or 401s while still returning data.
      const endpoints = [
        '/public/policies',
        '/user/policies',
        '/broker/policies',
        '/admin/policies'
      ];

      // If user has explicit role, try their role-specific endpoint first
      if (user?.role === 'ADMIN') {
        endpoints.unshift('/admin/policies');
      } else if (user?.role === 'BROKER') {
        endpoints.unshift('/broker/policies');
      } else if (user?.role === 'USER') {
        endpoints.unshift('/user/policies');
      }

      let loaded = false;
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint);
          if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
            setPolicies(response.data);
            loaded = true;
            break;
          } else if (response?.data && Array.isArray(response.data)) {
            // accept empty arrays but stop trying more endpoints
            setPolicies(response.data);
            loaded = true;
            break;
          }
        } catch (e) {
          // swallow per-endpoint errors and try next
          console.debug(`Endpoint ${endpoint} failed:`, e?.response?.status || e.message);
        }
      }

      if (!loaded) {
        setError('Failed to load policies from server');
        // Set comprehensive mock data as fallback so UI is usable
        setPolicies([
        {
          id: 1,
          name: 'Comprehensive Health Plan',
          type: 'HEALTH',
          subType: 'COMPREHENSIVE',
          monthlyPremium: 299.99,
          yearlyPremium: 3499.88,
          coverage: 'Medical: $500K, Dental: $5K, Vision: $2K',
          deductible: 1000.00,
          status: 'ACTIVE',
          description: 'Complete health insurance with medical, dental, and vision coverage'
        },
        {
          id: 2,
          name: 'Auto Full Coverage',
          type: 'AUTO',
          subType: 'FULL_COVERAGE',
          monthlyPremium: 149.99,
          yearlyPremium: 1799.88,
          coverage: 'Liability: $100K, Collision: $50K, Comprehensive: $25K',
          deductible: 500.00,
          status: 'ACTIVE',
          description: 'Complete auto insurance with collision and comprehensive'
        },
        {
          id: 3,
          name: 'Home Protection Plus',
          type: 'HOME',
          subType: 'COMPREHENSIVE',
          monthlyPremium: 89.99,
          yearlyPremium: 1079.88,
          coverage: 'Dwelling: $300K, Personal Property: $150K, Liability: $100K',
          deductible: 1000.00,
          status: 'ACTIVE',
          description: 'Comprehensive home insurance with additional riders'
        },
        {
          id: 4,
          name: 'Life Term 20',
          type: 'LIFE',
          subType: 'TERM',
          monthlyPremium: 45.99,
          yearlyPremium: 551.88,
          coverage: 'Death Benefit: $250K',
          deductible: 0.00,
          status: 'PENDING',
          description: '20-year term life insurance policy'
        },
        {
          id: 5,
          name: 'Business Liability',
          type: 'BUSINESS',
          subType: 'LIABILITY',
          monthlyPremium: 199.99,
          yearlyPremium: 2399.88,
          coverage: 'General Liability: $1M, Professional Liability: $500K',
          deductible: 2500.00,
          status: 'ACTIVE',
          description: 'General liability insurance for small businesses'
        },
        {
          id: 6,
          name: 'Travel Protection',
          type: 'TRAVEL',
          subType: 'INTERNATIONAL',
          monthlyPremium: 25.99,
          yearlyPremium: 311.88,
          coverage: 'Medical: $100K, Trip Cancellation: $10K, Baggage: $2K',
          deductible: 100.00,
          status: 'PENDING',
          description: 'International travel insurance with medical coverage'
        }
      ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy) => {
    if (selectedPolicies.find(p => p.id === policy.id)) {
      setSelectedPolicies(selectedPolicies.filter(p => p.id !== policy.id));
    } else if (selectedPolicies.length < 3) {
      setSelectedPolicies([...selectedPolicies, policy]);
    } else {
      alert('You can compare up to 3 policies at a time');
    }
  };

  const clearSelection = () => {
    setSelectedPolicies([]);
    setComparing(false);
  };

  const formatToINR = (amount) => {
    const n = Number(amount) || 0;
    return formatCurrency(n * 83, 'INR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Compare Policies</h1>
        <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
          Select up to 3 policies to compare their features, coverage, and pricing side by side.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            {error} - Showing sample data for demonstration.
          </div>
        )}
      </div>

      {/* Selection Controls */}
      <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Select Policies ({selectedPolicies.length}/3)
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Choose policies to compare their features
            </p>
          </div>
          <div className="space-x-2">
            {selectedPolicies.length > 0 && (
              <Button onClick={clearSelection} variant="outline">
                Clear Selection
              </Button>
            )}
            {selectedPolicies.length >= 2 && (
              <Button onClick={() => setComparing(true)}>
                Compare Selected ({selectedPolicies.length})
              </Button>
            )}
          </div>
        </div>

        {/* Policy Selection Grid */}
        {!comparing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => {
              const isSelected = selectedPolicies.find(p => p.id === policy.id);
              return (
                <div 
                  key={policy.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handlePolicySelect(policy)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        policy.type === 'HEALTH' ? 'bg-green-100 text-green-800' :
                        policy.type === 'AUTO' ? 'bg-blue-100 text-blue-800' :
                        policy.type === 'HOME' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.type}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Monthly: </span>
                      <span className="font-medium">{formatToINR(policy.monthlyPremium)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deductible: </span>
                      <span className="font-medium">{formatToINR(policy.deductible)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status: </span>
                      <span className={`font-medium ${
                        policy.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {policy.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {comparing && selectedPolicies.length >= 2 && (
        <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Policy Comparison
            </h2>
            <Button onClick={() => setComparing(false)} variant="outline">
              Back to Selection
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  {selectedPolicies.map((policy) => (
                    <th key={policy.id} className="border border-gray-200 p-3 text-left font-semibold text-gray-900">
                      {policy.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Type</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        policy.type === 'HEALTH' ? 'bg-green-100 text-green-800' :
                        policy.type === 'AUTO' ? 'bg-blue-100 text-blue-800' :
                        policy.type === 'HOME' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.type}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-25">
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Monthly Premium</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3 font-semibold text-green-600">
                      {formatToINR(policy.monthlyPremium)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Yearly Premium</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3 font-semibold text-green-600">
                      {formatToINR(policy.yearlyPremium)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-25">
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Deductible</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3">
                      {formatToINR(policy.deductible)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Coverage</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3">
                      <div className="text-sm text-gray-600">
                        {policy.coverage || 'Coverage details not available'}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-25">
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Status</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        policy.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 font-medium text-gray-700">Annual Savings</td>
                  {selectedPolicies.map((policy) => (
                    <td key={policy.id} className="border border-gray-200 p-3">
                      <span className="text-sm text-gray-600">
                        Save {formatToINR((policy.monthlyPremium * 12) - policy.yearlyPremium)} annually
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recommendation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 AI Recommendation</h3>
            <p className="text-blue-800 text-sm">
              Based on the comparison, we recommend considering the policy with the best value for your needs. 
              Factors to consider: coverage amount, deductible, and specific features that match your requirements.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {policies.length === 0 && !loading && (
        <div className={`p-12 rounded-lg shadow text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          <div className="text-4xl mb-4">📋</div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Policies Available</h3>
          <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            There are no policies available to compare at the moment.
          </p>
          <Button onClick={fetchPolicies}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default PolicyComparePage;