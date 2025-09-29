import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvailablePolicies, getPolicyById } from '../../api/policyService';
import { applyForPolicy } from '../../api/userPolicyService';
import { useAuth } from '../../hooks/useAuth';
import PolicyDetails from '../../components/policy/PolicyDetails';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const PolicyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    policyId: id,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    age: '',
    occupation: '',
    medicalHistory: '',
    previousClaims: '',
    hasExistingPolicies: false,
    additionalInformation: '',
    annualSalary: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (id) {
        // Load specific policy
        const policyData = await getPolicyById(id);
        setPolicy(policyData);
      } else {
        // Load all available policies
        const availablePolicies = await getAvailablePolicies();
        setPolicies(availablePolicies);
      }
    } catch (err) {
      console.error('Error loading policy data:', err);
      setError('Failed to load policy information');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForPolicy = (policyId) => {
    setApplicationData(prev => ({ ...prev, policyId }));
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    try {
      setApplying(true);
      setError(null);
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'age', 'occupation'];
      const missingFields = requiredFields.filter(field => !applicationData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Submit application
      const response = await applyForPolicy(applicationData);
      
      // Show real-time AI decision
      setShowApplicationForm(false);
      
      if (response.status === 'ACTIVE') {
        // Auto-approved by AI
        alert(`🎉 Congratulations! Your ${policy.name} application has been automatically approved by our AI system!\n\n` +
              `✅ Status: ACTIVE\n` +
              `🤖 AI Assessment: ${response.aiAssessment || 'Low risk profile detected'}\n` +
              `📅 Coverage starts: ${response.startDate}\n` +
              `💰 Monthly Premium: ₹${(response.monthlyPremium * 83).toLocaleString()}\n\n` +
              `You'll receive a confirmation email and policy documents shortly.`);
      } else if (response.status === 'PENDING_APPROVAL') {
        // Requires admin review
        alert(`📋 Your ${policy.name} application is under review.\n\n` +
              `⏳ Status: PENDING ADMIN APPROVAL\n` +
              `🤖 AI Assessment: ${response.aiAssessment || 'Requires manual review'}\n` +
              `📊 Risk Score: ${response.riskScore || 'N/A'}\n\n` +
              `Our team will review your application and notify you within 24-48 hours. ` +
              `You'll receive real-time notifications once a decision is made.`);
      } else {
        // Default success message
        alert('Application submitted successfully! You will be notified of the approval status.');
      }
      
      // Dispatch event to refresh policies in dashboard
      window.dispatchEvent(new CustomEvent('policiesUpdated'));
      
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (error && !policy && !policies.length) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Individual policy view
  if (id && policy) {
    return (
      <>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/policies')}
              className="mb-4"
            >
              ← Back to Policies
            </Button>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <PolicyDetails policy={policy} />
              
              {user && user.role === 'USER' && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Apply for this Policy</h3>
                  <p className="text-gray-600 mb-4">
                    Ready to get protected? Click the button below to start your application.
                  </p>
                  <Button 
                    onClick={() => handleApplyForPolicy(policy.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Apply Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <Modal
            isOpen={showApplicationForm}
            onClose={() => setShowApplicationForm(false)}
            title="Policy Application"
            size="large"
          >
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={applicationData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={applicationData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={applicationData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={applicationData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Occupation *
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={applicationData.occupation}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Annual Salary (optional)
                  </label>
                  <input
                    type="number"
                    name="annualSalary"
                    value={applicationData.annualSalary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 48000"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={applicationData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={applicationData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={applicationData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={applicationData.postalCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={applicationData.medicalHistory}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Previous Claims
                </label>
                <textarea
                  name="previousClaims"
                  value={applicationData.previousClaims}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasExistingPolicies"
                    checked={applicationData.hasExistingPolicies}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I have existing insurance policies
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <textarea
                  name="additionalInformation"
                  value={applicationData.additionalInformation}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional information you'd like to provide..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applying}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </>
    );
  }

  // All policies view
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Policies</h1>
        <p className="text-gray-600 mt-2">Browse and apply for insurance policies that meet your needs.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
              <p className="text-sm text-gray-500">{policy.type}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 text-sm line-clamp-3">{policy.description}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Premium:</span>
                <span className="font-semibold">${policy.monthlyPremium}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Coverage:</span>
                <span className="font-semibold">${policy.coverage?.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate(`/policy/view/${policy.id}`)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                View Details
              </Button>
              {user && user.role === 'USER' && (
                <Button
                  onClick={() => handleApplyForPolicy(policy.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyView;