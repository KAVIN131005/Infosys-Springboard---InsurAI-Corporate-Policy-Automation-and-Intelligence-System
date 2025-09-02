import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PolicyCard from '../../components/policy/PolicyCard';
import { getPolicies } from '../../api/policyService';
import Spinner from '../../components/ui/Spinner';

const BrokerPolicies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
        
        // Mock data for broker policies
        const mockPolicies = [
          {
            id: 1,
            policyNumber: 'AUTO-2024-001',
            type: 'Auto Insurance',
            premium: 1200,
            coverage: 100000,
            status: 'Active',
            startDate: '2024-01-15',
            endDate: '2025-01-15',
            clientName: 'John Smith',
            clientEmail: 'john.smith@email.com'
          },
          {
            id: 2,
            policyNumber: 'HOME-2024-002',
            type: 'Home Insurance',
            premium: 800,
            coverage: 250000,
            status: 'Active',
            startDate: '2024-02-01',
            endDate: '2025-02-01',
            clientName: 'Jane Doe',
            clientEmail: 'jane.doe@email.com'
          },
          {
            id: 3,
            policyNumber: 'HEALTH-2024-003',
            type: 'Health Insurance',
            premium: 2400,
            coverage: 500000,
            status: 'Pending',
            startDate: '2024-03-01',
            endDate: '2025-03-01',
            clientName: 'Bob Johnson',
            clientEmail: 'bob.johnson@email.com'
          },
          {
            id: 4,
            policyNumber: 'LIFE-2024-004',
            type: 'Life Insurance',
            premium: 1800,
            coverage: 1000000,
            status: 'Active',
            startDate: '2024-01-10',
            endDate: '2025-01-10',
            clientName: 'Alice Wilson',
            clientEmail: 'alice.wilson@email.com'
          }
        ];

        setPolicies(mockPolicies);
        setFilteredPolicies(mockPolicies);
        
        // Calculate stats
        const policyStats = {
          total: mockPolicies.length,
          auto: mockPolicies.filter(p => p.type.includes('Auto')).length,
          health: mockPolicies.filter(p => p.type.includes('Health')).length,
          home: mockPolicies.filter(p => p.type.includes('Home')).length,
          life: mockPolicies.filter(p => p.type.includes('Life')).length
        };
        setStats(policyStats);
        
      } catch (error) {
        console.error('Failed to load policies:', error);
        setPolicies([]);
        setFilteredPolicies([]);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  useEffect(() => {
    let filtered = policies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.type.toLowerCase().includes(searchTerm.toLowerCase())
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
              🏢 Broker Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName || user?.username}! Manage your client policies.
            </p>
          </div>
          <Link
            to="/broker/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            ➕ Upload New Policy
          </Link>
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
                  placeholder="Search by policy number, client name, or type..."
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
                  <h3 className="text-lg font-semibold text-gray-900">{policy.policyNumber}</h3>
                  <p className="text-sm text-gray-600">{policy.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  policy.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {policy.status === 'Active' ? '✅' : '⏳'} {policy.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{policy.clientName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-medium text-green-600">${policy.premium.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-medium">${policy.coverage.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</span>
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