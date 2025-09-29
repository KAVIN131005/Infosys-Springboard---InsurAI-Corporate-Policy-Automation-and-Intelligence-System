import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PolicyComparison = () => {
    const { user } = useAuth();
    const [availablePolicies, setAvailablePolicies] = useState([]);
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        riskLevel: '',
        minPremium: '',
        maxPremium: ''
    });
    const [comparisonType, setComparisonType] = useState('basic');

    useEffect(() => {
        fetchAvailablePolicies();
    }, []);

    useEffect(() => {
        if (filters.type || filters.riskLevel || filters.minPremium || filters.maxPremium) {
            filterPolicies();
        } else {
            fetchAvailablePolicies();
        }
    }, [filters]);

    const fetchAvailablePolicies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/policy-comparison/available', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const policies = await response.json();
                setAvailablePolicies(policies);
            } else {
                toast.error('Failed to fetch available policies');
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            toast.error('Error fetching policies');
        }
    };

    const filterPolicies = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.riskLevel) queryParams.append('riskLevel', filters.riskLevel);
            if (filters.minPremium) queryParams.append('minPremium', filters.minPremium);
            if (filters.maxPremium) queryParams.append('maxPremium', filters.maxPremium);

            const response = await fetch(`http://localhost:8080/api/policy-comparison/policies/filter?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const policies = await response.json();
                setAvailablePolicies(policies);
            } else {
                toast.error('Failed to filter policies');
            }
        } catch (error) {
            console.error('Error filtering policies:', error);
            toast.error('Error filtering policies');
        }
    };

    const handlePolicySelection = (policyId) => {
        setSelectedPolicies(prev => {
            if (prev.includes(policyId)) {
                return prev.filter(id => id !== policyId);
            } else if (prev.length < 5) {
                return [...prev, policyId];
            } else {
                toast.warning('You can compare maximum 5 policies at once');
                return prev;
            }
        });
    };

    const comparePolicies = async () => {
        if (selectedPolicies.length < 2) {
            toast.warning('Please select at least 2 policies to compare');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/policy-comparison/compare', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policyIds: selectedPolicies,
                    userId: user?.id,
                    comparisonType: comparisonType
                })
            });

            if (response.ok) {
                const result = await response.json();
                setComparisonResult(result);
                toast.success('Policies compared successfully!');
            } else {
                toast.error('Failed to compare policies');
            }
        } catch (error) {
            console.error('Error comparing policies:', error);
            toast.error('Error comparing policies');
        } finally {
            setLoading(false);
        }
    };

    const clearComparison = () => {
        setSelectedPolicies([]);
        setComparisonResult(null);
    };

    const PolicyCard = ({ policy, isSelected, onSelect }) => (
        <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onSelect(policy.id)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-800">{policy.name}</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                    policy.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                    policy.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {policy.riskLevel}
                </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">Type:</span> {policy.type}</div>
                <div><span className="font-medium">Monthly Premium:</span> ₹{policy.monthlyPremium?.toLocaleString()}</div>
                <div><span className="font-medium">Coverage:</span> ₹{policy.coverage?.toLocaleString()}</div>
                <div><span className="font-medium">Deductible:</span> ₹{policy.deductible?.toLocaleString()}</div>
            </div>
            
            <p className="text-gray-700 mt-2 text-sm line-clamp-2">{policy.description}</p>
            
            {isSelected && (
                <div className="mt-2 text-blue-600 font-medium text-sm">
                    ✓ Selected for comparison
                </div>
            )}
        </div>
    );

    const ComparisonMatrix = ({ matrix }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Criteria</th>
                        {comparisonResult.policies.map(policy => (
                            <th key={policy.id} className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                {policy.name}
                            </th>
                        ))}
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-green-600">
                            Winner
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {matrix.criteria.map(criteria => (
                        <tr key={criteria} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">{criteria}</td>
                            {comparisonResult.policies.map(policy => {
                                const value = matrix.policyComparison[policy.name]?.[criteria];
                                const isWinner = matrix.winnerByCriteria[criteria] === policy.name;
                                return (
                                    <td key={policy.id} className={`border border-gray-300 px-4 py-2 text-center ${
                                        isWinner ? 'bg-green-100 font-semibold' : ''
                                    }`}>
                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                         typeof value === 'number' ? value.toLocaleString() : 
                                         value}
                                    </td>
                                );
                            })}
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-green-600">
                                {matrix.winnerByCriteria[criteria]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Policy Comparison</h1>
                <p className="text-gray-600">Compare different insurance policies to find the best fit for your needs</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Filter Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="HEALTH">Health</option>
                            <option value="AUTO">Auto</option>
                            <option value="LIFE">Life</option>
                            <option value="PROPERTY">Property</option>
                            <option value="TRAVEL">Travel</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                        <select
                            value={filters.riskLevel}
                            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Risk Levels</option>
                            <option value="LOW">Low Risk</option>
                            <option value="MEDIUM">Medium Risk</option>
                            <option value="HIGH">High Risk</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Premium (₹)</label>
                        <input
                            type="number"
                            value={filters.minPremium}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPremium: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Premium (₹)</label>
                        <input
                            type="number"
                            value={filters.maxPremium}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPremium: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="No limit"
                        />
                    </div>
                </div>
            </div>

            {/* Comparison Controls */}
            {selectedPolicies.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-medium text-blue-800">
                                {selectedPolicies.length} policies selected for comparison
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={comparisonType}
                                onChange={(e) => setComparisonType(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="basic">Basic Comparison</option>
                                <option value="detailed">Detailed Comparison</option>
                                <option value="premium">Premium Focus</option>
                            </select>
                            <button
                                onClick={comparePolicies}
                                disabled={loading || selectedPolicies.length < 2}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Comparing...' : 'Compare Policies'}
                            </button>
                            <button
                                onClick={clearComparison}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Policies */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Available Policies ({availablePolicies.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePolicies.map(policy => (
                        <PolicyCard
                            key={policy.id}
                            policy={policy}
                            isSelected={selectedPolicies.includes(policy.id)}
                            onSelect={handlePolicySelection}
                        />
                    ))}
                </div>
            </div>

            {/* Comparison Results */}
            {comparisonResult && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-2xl font-semibold mb-6">Comparison Results</h2>
                    
                    {/* Recommendation */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-green-800 mb-2">💡 Our Recommendation</h3>
                        <p className="text-green-700">{comparisonResult.recommendedPolicy}</p>
                    </div>

                    {/* Comparison Matrix */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
                        <ComparisonMatrix matrix={comparisonResult.comparisonMatrix} />
                    </div>

                    {/* Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Key Insights</h3>
                            <div className="space-y-2 text-sm">
                                {Object.entries(comparisonResult.comparisonMatrix.analysis).map(([criteria, analysis]) => (
                                    <div key={criteria} className="border-l-4 border-blue-500 pl-3">
                                        <div className="font-medium text-gray-800">{criteria}</div>
                                        <div className="text-gray-600">{analysis}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Summary</h3>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                                {comparisonResult.comparisonSummary}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyComparison;
