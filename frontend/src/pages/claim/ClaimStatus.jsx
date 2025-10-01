import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ClaimCard from '../../components/claim/ClaimCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const ClaimStatus = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock claims data
      const mockClaims = [
        {
          id: 'CLM-2024-001',
          type: 'Auto Accident',
          status: 'Under Review',
          statusColor: 'yellow',
          submittedDate: '2024-01-15',
          lastUpdated: '2024-01-20',
          amount: 15000,
          estimatedAmount: 15000,
          description: 'Rear-end collision on Highway 101',
          policyNumber: 'AUTO-2024-001',
          adjusterName: 'Sarah Johnson',
          adjusterPhone: '(555) 123-4567',
          progress: 60,
          nextStep: 'Awaiting damage assessment report',
          documents: ['Police Report', 'Photos', 'Estimate'],
          timeline: [
            { date: '2024-01-15', event: 'Claim submitted', status: 'completed' },
            { date: '2024-01-16', event: 'Initial review completed', status: 'completed' },
            { date: '2024-01-18', event: 'Adjuster assigned', status: 'completed' },
            { date: '2024-01-20', event: 'Damage assessment scheduled', status: 'current' },
            { date: 'TBD', event: 'Settlement offer', status: 'pending' }
          ]
        },
        {
          id: 'CLM-2024-002',
          type: 'Property Damage',
          status: 'Approved',
          statusColor: 'green',
          submittedDate: '2024-01-10',
          lastUpdated: '2024-01-22',
          amount: 8500,
          estimatedAmount: 9000,
          description: 'Water damage from burst pipe',
          policyNumber: 'HOME-2024-003',
          adjusterName: 'Mike Chen',
          adjusterPhone: '(555) 987-6543',
          progress: 100,
          nextStep: 'Payment being processed',
          documents: ['Photos', 'Repair Estimates', 'Receipts'],
          timeline: [
            { date: '2024-01-10', event: 'Claim submitted', status: 'completed' },
            { date: '2024-01-11', event: 'Initial review completed', status: 'completed' },
            { date: '2024-01-12', event: 'Adjuster assigned', status: 'completed' },
            { date: '2024-01-15', event: 'Damage assessment completed', status: 'completed' },
            { date: '2024-01-22', event: 'Claim approved', status: 'completed' }
          ]
        },
        {
          id: 'CLM-2024-003',
          type: 'Health Insurance',
          status: 'Pending Review',
          statusColor: 'blue',
          submittedDate: '2024-01-25',
          lastUpdated: '2024-01-25',
          amount: 2500,
          estimatedAmount: 2500,
          description: 'Emergency room visit',
          policyNumber: 'HEALTH-2024-002',
          adjusterName: 'Lisa Wang',
          adjusterPhone: '(555) 456-7890',
          progress: 25,
          nextStep: 'Medical records review',
          documents: ['Medical Bills', 'Prescription Receipts'],
          timeline: [
            { date: '2024-01-25', event: 'Claim submitted', status: 'completed' },
            { date: 'TBD', event: 'Initial review', status: 'current' },
            { date: 'TBD', event: 'Medical review', status: 'pending' },
            { date: 'TBD', event: 'Decision', status: 'pending' }
          ]
        }
      ];
      
      setClaims(mockClaims);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims
    .filter(claim => {
      const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.status.toLowerCase().includes(statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedDate) - new Date(a.submittedDate);
        case 'oldest':
          return new Date(a.submittedDate) - new Date(b.submittedDate);
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusStats = () => {
    const stats = {
      total: claims.length,
      pending: claims.filter(c => c.status.includes('Pending')).length,
      review: claims.filter(c => c.status.includes('Review')).length,
      approved: claims.filter(c => c.status.includes('Approved')).length,
      totalAmount: claims.reduce((sum, c) => sum + c.amount, 0)
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gray-50'
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
      isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Claim Status</h1>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
            Welcome, {user?.firstName || user?.username}! Track and manage your insurance claims.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className={`rounded-lg shadow p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-3xl mb-2">📊</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Claims</div>
          </div>
          <div className={`rounded-lg shadow p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Pending</div>
          </div>
          <div className={`rounded-lg shadow p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Under Review</div>
          </div>
          <div className={`rounded-lg shadow p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Approved</div>
          </div>
          <div className={`rounded-lg shadow p-6 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-3xl mb-2">💰</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.totalAmount.toLocaleString()}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Amount</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-lg shadow p-6 mb-8 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Search Claims</label>
              <Input
                type="text"
                placeholder="Search by ID, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-700 border border-slate-600 text-white' : 'border border-gray-300'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-700 border border-slate-600 text-white' : 'border border-gray-300'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => window.location.href = '/submit-claim'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                ➕ New Claim
              </Button>
            </div>
          </div>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className={`rounded-lg shadow p-12 text-center transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
            <div className="text-6xl mb-4">📋</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Claims Found</h3>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'No claims match your search criteria.' 
                : "You haven't submitted any claims yet."}
            </p>
            <Button
              onClick={() => window.location.href = '/submit-claim'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              Submit Your First Claim
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className={`mt-8 rounded-lg shadow p-6 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}` }>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/submit-claim'}
              className={`flex items-center justify-center p-4 rounded-lg transition-colors ${isDark ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
            >
              <span className="text-2xl mr-2">📝</span>
              <div className="text-left">
                <div className={isDark ? 'font-medium text-white' : 'font-medium'}>Submit New Claim</div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : ''}`}>Start a new claim process</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/policies'}
              className={`flex items-center justify-center p-4 rounded-lg transition-colors ${isDark ? 'bg-green-900/30 hover:bg-green-900/50 text-green-300' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
            >
              <span className="text-2xl mr-2">📋</span>
              <div className="text-left">
                <div className={isDark ? 'font-medium text-white' : 'font-medium'}>View Policies</div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : ''}`}>Review your policies</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/chatbot'}
              className={`flex items-center justify-center p-4 rounded-lg transition-colors ${isDark ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'}`}
            >
              <span className="text-2xl mr-2">🤖</span>
              <div className="text-left">
                <div className={isDark ? 'font-medium text-white' : 'font-medium'}>AI Assistant</div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : ''}`}>Get help with claims</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimStatus;