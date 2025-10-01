import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const PolicyComparison = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
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
                toast.error('You can compare maximum 5 policies at once');
                return prev;
            }
        });
    };

    const comparePolicies = async () => {
        if (selectedPolicies.length < 2) {
            toast.error('Please select at least 2 policies to compare');
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
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                isSelected 
                    ? isDark
                        ? 'border-blue-500 bg-blue-900/20 shadow-md' 
                        : 'border-blue-500 bg-blue-50 shadow-md'
                    : isDark
                        ? 'border-slate-600 hover:border-slate-500 hover:shadow-sm bg-slate-800/50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
            }`}
            onClick={() => onSelect(policy.id)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-800'
                }`}>{policy.name}</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                    policy.riskLevel === 'LOW' 
                        ? isDark
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-green-100 text-green-800'
                        : policy.riskLevel === 'MEDIUM'
                            ? isDark
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-yellow-100 text-yellow-800'
                            : isDark
                                ? 'bg-red-900/50 text-red-300'
                                : 'bg-red-100 text-red-800'
                }`}>
                    {policy.riskLevel}
                </div>
            </div>
            
            <div className={`space-y-2 text-sm ${
                isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
                <div><span className="font-medium">Type:</span> {policy.type}</div>
                <div><span className="font-medium">Monthly Premium:</span> ₹{policy.monthlyPremium?.toLocaleString()}</div>
                <div><span className="font-medium">Coverage:</span> ₹{policy.coverage?.toLocaleString()}</div>
                <div><span className="font-medium">Deductible:</span> ₹{policy.deductible?.toLocaleString()}</div>
            </div>
            
            <p className={`mt-2 text-sm line-clamp-2 ${
                isDark ? 'text-slate-400' : 'text-gray-700'
            }`}>{policy.description}</p>
            
            {isSelected && (
                <div className={`mt-2 font-medium text-sm ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                    ✓ Selected for comparison
                </div>
            )}
        </div>
    );

    const ComparisonMatrix = ({ matrix }) => (
        <div className="overflow-x-auto">
            <table className={`min-w-full border-collapse border transition-all duration-300 ${
                isDark ? 'border-slate-600' : 'border-gray-300'
            }`}>
                <thead>
                    <tr className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                        <th className={`border px-4 py-2 text-left font-semibold ${
                            isDark ? 'border-slate-600 text-white' : 'border-gray-300 text-gray-900'
                        }`}>Criteria</th>
                        {comparisonResult.policies.map(policy => (
                            <th key={policy.id} className={`border px-4 py-2 text-center font-semibold ${
                                isDark ? 'border-slate-600 text-white' : 'border-gray-300 text-gray-900'
                            }`}>
                                {policy.name}
                            </th>
                        ))}
                        <th className={`border px-4 py-2 text-center font-semibold ${
                            isDark ? 'border-slate-600 text-green-400' : 'border-gray-300 text-green-600'
                        }`}>
                            Winner
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {matrix.criteria.map(criteria => (
                        <tr key={criteria} className={`transition-colors duration-200 ${
                            isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                        }`}>
                            <td className={`border px-4 py-2 font-medium ${
                                isDark ? 'border-slate-600 text-white' : 'border-gray-300 text-gray-900'
                            }`}>{criteria}</td>
                            {comparisonResult.policies.map(policy => {
                                const value = matrix.policyComparison[policy.name]?.[criteria];
                                const isWinner = matrix.winnerByCriteria[criteria] === policy.name;
                                return (
                                    <td key={policy.id} className={`border px-4 py-2 text-center ${
                                        isWinner 
                                            ? isDark
                                                ? 'border-slate-600 bg-green-900/30 font-semibold text-green-300'
                                                : 'border-gray-300 bg-green-100 font-semibold text-green-800'
                                            : isDark
                                                ? 'border-slate-600 text-slate-300'
                                                : 'border-gray-300 text-gray-700'
                                    }`}>
                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                         typeof value === 'number' ? value.toLocaleString() : 
                                         value}
                                    </td>
                                );
                            })}
                            <td className={`border px-4 py-2 text-center font-semibold ${
                                isDark ? 'border-slate-600 text-green-400' : 'border-gray-300 text-green-600'
                            }`}>
                                {matrix.winnerByCriteria[criteria]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${
            isDark 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' 
                : 'bg-gray-50 text-gray-900'
        }`}>
            <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-800'
                }`}>Policy Comparison</h1>
                <p className={`${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>Compare different insurance policies to find the best fit for your needs</p>
            </div>

            {/* Filters */}
            <div className={`rounded-lg shadow-sm border p-6 mb-6 transition-all duration-300 ${
                isDark 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-white border-gray-200'
            }`}>
                <h2 className={`text-xl font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                }`}>Filter Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>Policy Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDark
                                    ? 'bg-slate-700 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
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
                        <label className={`block text-sm font-medium mb-1 ${
                            isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>Risk Level</label>
                        <select
                            value={filters.riskLevel}
                            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDark
                                    ? 'bg-slate-700 border-slate-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="">All Risk Levels</option>
                            <option value="LOW">Low Risk</option>
                            <option value="MEDIUM">Medium Risk</option>
                            <option value="HIGH">High Risk</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>Min Premium (₹)</label>
                        <input
                            type="number"
                            value={filters.minPremium}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPremium: e.target.value }))}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDark
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="0"
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>Max Premium (₹)</label>
                        <input
                            type="number"
                            value={filters.maxPremium}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPremium: e.target.value }))}
                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isDark
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="No limit"
                        />
                    </div>
                </div>
            </div>

            {/* Comparison Controls */}
            {selectedPolicies.length > 0 && (
                <div className={`border rounded-lg p-4 mb-6 transition-all duration-300 ${
                    isDark 
                        ? 'bg-blue-900/20 border-blue-700/30' 
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className={`font-medium ${
                                isDark ? 'text-blue-300' : 'text-blue-800'
                            }`}>
                                {selectedPolicies.length} policies selected for comparison
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={comparisonType}
                                onChange={(e) => setComparisonType(e.target.value)}
                                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                    isDark
                                        ? 'bg-slate-700 border-slate-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value="basic">Basic Comparison</option>
                                <option value="detailed">Detailed Comparison</option>
                                <option value="premium">Premium Focus</option>
                            </select>
                            <button
                                onClick={comparePolicies}
                                disabled={loading || selectedPolicies.length < 2}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                                    isDark
                                        ? 'bg-blue-700 hover:bg-blue-800 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'Comparing...' : 'Compare Policies'}
                            </button>
                            <button
                                onClick={clearComparison}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                                    isDark
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                        : 'bg-gray-500 text-white hover:bg-gray-600'
                                }`}
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Policies */}
            <div className="mb-8">
                <h2 className={`text-xl font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                }`}>Available Policies ({availablePolicies.length})</h2>
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
                <div className={`rounded-lg shadow-sm border p-6 transition-all duration-300 ${
                    isDark 
                        ? 'bg-slate-800/50 border-slate-700' 
                        : 'bg-white border-gray-200'
                }`}>
                    <h2 className={`text-2xl font-semibold mb-6 ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>Comparison Results</h2>
                    
                    {/* Recommendation */}
                    <div className={`border rounded-lg p-4 mb-6 transition-all duration-300 ${
                        isDark 
                            ? 'bg-green-900/20 border-green-700/30' 
                            : 'bg-green-50 border-green-200'
                    }`}>
                        <h3 className={`font-semibold mb-2 ${
                            isDark ? 'text-green-300' : 'text-green-800'
                        }`}>💡 Our Recommendation</h3>
                        <p className={`${
                            isDark ? 'text-green-200' : 'text-green-700'
                        }`}>{comparisonResult.recommendedPolicy}</p>
                    </div>

                    {/* Comparison Matrix */}
                    <div className="mb-6">
                        <h3 className={`text-lg font-semibold mb-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Detailed Comparison</h3>
                        <ComparisonMatrix matrix={comparisonResult.comparisonMatrix} />
                    </div>

                    {/* Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className={`text-lg font-semibold mb-3 ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Key Insights</h3>
                            <div className="space-y-2 text-sm">
                                {Object.entries(comparisonResult.comparisonMatrix.analysis).map(([criteria, analysis]) => (
                                    <div key={criteria} className={`border-l-4 pl-3 transition-all duration-300 ${
                                        isDark 
                                            ? 'border-blue-500 bg-blue-900/10' 
                                            : 'border-blue-500 bg-blue-50'
                                    }`}>
                                        <div className={`font-medium ${
                                            isDark ? 'text-white' : 'text-gray-800'
                                        }`}>{criteria}</div>
                                        <div className={`${
                                            isDark ? 'text-slate-300' : 'text-gray-600'
                                        }`}>{analysis}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className={`text-lg font-semibold mb-3 ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Summary</h3>
                            <pre className={`text-sm whitespace-pre-wrap p-3 rounded transition-all duration-300 ${
                                isDark 
                                    ? 'bg-slate-700/50 border border-slate-600 text-slate-300' 
                                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                            }`}>
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
