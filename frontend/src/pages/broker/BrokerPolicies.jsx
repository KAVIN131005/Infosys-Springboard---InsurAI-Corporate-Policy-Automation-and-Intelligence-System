import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PolicyCard from '../../components/policy/PolicyCard';
import { getPolicies, getBrokerPolicies } from '../../api/policyService';
import axios from 'axios';
import { getAuthToken } from '../../api/authService';
import Spinner from '../../components/ui/Spinner';

// Create policy client for direct API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const policyClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth interceptor
policyClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BrokerPolicies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    auto: 0,
    health: 0,
    home: 0,
    life: 0
  });

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        // Choose endpoint based on user role so Admins see all policies
        let brokerPolicies = [];
        try {
          if (user?.role === 'ADMIN') {
            // Admin should see all policies
            const response = await policyClient.get('/api/policies');
            brokerPolicies = response.data || [];
            console.log('Admin: all policies loaded:', brokerPolicies.length, 'policies');
          } else if (user?.role === 'BROKER') {
            const response = await policyClient.get('/api/policies/broker');
            brokerPolicies = response.data || [];
            console.log('Broker policies loaded:', brokerPolicies.length, 'policies');
          } else {
            // Default to user policies
            const response = await policyClient.get('/api/policies/user');
            brokerPolicies = response.data || [];
            console.log('User policies loaded:', brokerPolicies.length, 'policies');
          }
        } catch (apiError) {
          console.log('Primary endpoint failed, trying fallback endpoints:', apiError.message);
          try {
            const fallback = await policyClient.get('/api/policies');
            brokerPolicies = fallback.data || [];
            console.log('Fallback loaded policies:', brokerPolicies.length);
          } catch (finalError) {
            console.log('Failed to load policies from server:', finalError.message);
            brokerPolicies = [];
          }
        }
        
        setPolicies(brokerPolicies);
        setFilteredPolicies(brokerPolicies);
        
        // Calculate stats
        const policyStats = {
          total: brokerPolicies.length,
          auto: brokerPolicies.filter(p => p.type && p.type.toLowerCase().includes('auto')).length,
          health: brokerPolicies.filter(p => p.type && p.type.toLowerCase().includes('health')).length,
          home: brokerPolicies.filter(p => p.type && p.type.toLowerCase().includes('home')).length,
          life: brokerPolicies.filter(p => p.type && p.type.toLowerCase().includes('life')).length
        };
        setStats(policyStats);
        
      } catch (error) {
        console.error('Failed to load policies:', error);
        // Fallback to empty state
        setPolicies([]);
        setFilteredPolicies([]);
        setStats({ total: 0, auto: 0, health: 0, home: 0, life: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, [refreshTrigger]);

  // Listen for global updates when policies are approved/rejected elsewhere
  useEffect(() => {
    const onPoliciesUpdated = (e) => {
      console.log('policiesUpdated event received', e?.detail);
      refreshPolicies();
    };

    window.addEventListener('policiesUpdated', onPoliciesUpdated);
    return () => window.removeEventListener('policiesUpdated', onPoliciesUpdated);
  }, []);

  // Function to refresh policies (can be called after upload)
  const refreshPolicies = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let filtered = policies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(policy => 
        (policy.name && policy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.uploadedBy && policy.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.type && policy.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(policy => 
        policy.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    setFilteredPolicies(filtered);
  }, [searchTerm, filterType, policies]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.role === 'ADMIN' ? '📋 All Policies' : '🏢 Broker Dashboard'}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'ADMIN'
                ? `Welcome back, ${user?.firstName || user?.username}! Manage platform policies.`
                : `Welcome back, ${user?.firstName || user?.username}! Manage your client policies.`}
            </p>
          </div>
          {user?.role !== 'ADMIN' && (
            <Link
              to="/broker/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              ➕ Upload New Policy
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto</p>
                <p className="text-2xl font-bold text-gray-900">{stats.auto}</p>
              </div>
              <span className="text-2xl">🚗</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health</p>
                <p className="text-2xl font-bold text-gray-900">{stats.health}</p>
              </div>
              <span className="text-2xl">🏥</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Home</p>
                <p className="text-2xl font-bold text-gray-900">{stats.home}</p>
              </div>
              <span className="text-2xl">🏠</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Life</p>
                <p className="text-2xl font-bold text-gray-900">{stats.life}</p>
              </div>
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Policies
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by policy name, uploader, type, or description..."
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="auto">🚗 Auto Insurance</option>
                <option value="health">🏥 Health Insurance</option>
                <option value="home">🏠 Home Insurance</option>
                <option value="life">❤️ Life Insurance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{policy.name || `Policy #${policy.id}`}</h3>
                      <p className="text-sm text-gray-600">{policy.type || 'General Policy'}</p>
                    </div>
                    {/* Extracted badge if monthlyPremium or coverage present */}
                    {(policy.monthlyPremium || policy.coverage) && (
                      <div className="ml-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium" title={policy.analysisResult ? 'Values extracted from document' : 'Values provided by system'}>
                        Extracted
                      </div>
                    )}
                  </div>
                  {policy.description && (
                    <p className="text-xs text-gray-500 mt-1">{policy.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  policy.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : policy.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {policy.status === 'ACTIVE' ? '✅' : policy.status === 'PENDING' ? '⏳' : '❓'} {policy.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded by:</span>
                  <span className="font-medium">{policy.uploadedBy || 'Unknown'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Premium:</span>
                  <span className="font-medium text-green-600">
                    ${policy.monthlyPremium ? Number(policy.monthlyPremium).toLocaleString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-medium">
                    ${policy.coverage ? Number(policy.coverage).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Link
                  to={`/policy/view/${policy.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  View Details
                </Link>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'No policies match your search criteria.' 
              : 'You haven\'t uploaded any policies yet.'
            }
          </p>
          <Link
            to="/broker/upload"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Upload Your First Policy
          </Link>
        </div>
      )}
    </div>
  );
};

export default BrokerPolicies;