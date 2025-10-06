import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatters';

const EnhancedSubmitClaim = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    userPolicyId: '',
    type: '',
    incidentDate: '',
    incidentLocation: '',
    incidentDescription: '',
    claimAmount: '',
    supportingDocuments: []
  });
  
  const [userPolicies, setUserPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [claimResult, setClaimResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Format currency amounts to INR
  const formatToINR = (amount) => formatCurrency(Number(amount) * 83, 'INR');

  const claimTypes = [
    { value: 'AUTO', label: '🚗 Auto Insurance', icon: '🚗', desc: 'Vehicle accidents, damages, theft' },
    { value: 'HEALTH', label: '🏥 Health Insurance', icon: '🏥', desc: 'Medical treatments, hospital bills' },
    { value: 'PROPERTY', label: '🏠 Property Insurance', icon: '🏠', desc: 'Home damages, theft, natural disasters' },
    { value: 'LIFE', label: '❤️ Life Insurance', icon: '❤️', desc: 'Life insurance claims' },
    { value: 'TRAVEL', label: '✈️ Travel Insurance', icon: '✈️', desc: 'Trip cancellation, medical emergencies' },
    { value: 'LIABILITY', label: '⚖️ Liability Insurance', icon: '⚖️', desc: 'Third-party claims, legal liability' }
  ];

  useEffect(() => {
    fetchUserPolicies();
  }, []);

  const fetchUserPolicies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user/policies');
      const activePolicies = (response.data || []).filter(policy => 
        policy.status === 'ACTIVE' || policy.status === 'APPROVED'
      );
      setUserPolicies(activePolicies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
      // Demo data fallback
      setUserPolicies([
        { id: 1, name: 'Comprehensive Auto Insurance', type: 'AUTO', policyNumber: 'AUTO-001', status: 'ACTIVE' },
        { id: 2, name: 'Premium Health Insurance', type: 'HEALTH', policyNumber: 'HEALTH-002', status: 'ACTIVE' },
        { id: 3, name: 'Home Protection Plan', type: 'PROPERTY', policyNumber: 'PROP-003', status: 'ACTIVE' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      data: file
    }));
    
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...fileData]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.userPolicyId && formData.type;
      case 2:
        return formData.incidentDate && formData.incidentLocation && 
               formData.incidentDescription && formData.claimAmount;
      case 3:
        return true; // Documents are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitClaim = async () => {
    try {
      setSubmitting(true);
      
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const claimRequest = {
        userPolicyId: parseInt(formData.userPolicyId),
        type: formData.type,
        incidentDate: formData.incidentDate + 'T00:00:00',
        incidentLocation: formData.incidentLocation,
        incidentDescription: formData.incidentDescription,
        claimAmount: parseFloat(formData.claimAmount),
        supportingDocuments: formData.supportingDocuments.map(doc => doc.name)
      };

      const response = await apiClient.post('/claims/submit', claimRequest);
      setClaimResult(response.data);
      setCurrentStep(4);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <Spinner size="large" />
          <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Loading your policies...</p>
        </div>
      </div>
    );
  }

  // Success page
  if (currentStep === 4 && claimResult) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30' : 'bg-gradient-to-br from-green-50 to-emerald-100'
      }`}>
        <div className={`rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center transition-colors duration-300 ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          {claimResult.autoApproved ? (
            <>
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-green-700 mb-4">
                🤖 AI Auto-Approved! 
              </h1>
              <div className={`rounded-xl p-6 mb-6 border-2 transition-colors duration-300 ${
                isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'
              }`}>
                <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-green-400' : 'text-green-800'}`}>💰 Payment Processing</h2>
                <p className={`mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  <strong>Approved Amount:</strong> {formatToINR(claimResult.approvedAmount)}
                </p>
                <p className={`mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  <strong>Payment Status:</strong> Processing to your account
                </p>
                <p className={`text-sm ${isDark ? 'text-green-500' : 'text-green-600'}`}>
                  Money will be transferred within 1-2 business days
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">✅</div>
              <h1 className="text-3xl font-bold text-blue-700 mb-4">
                Claim Submitted Successfully!
              </h1>
              <div className={`rounded-xl p-6 mb-6 border-2 transition-colors duration-300 ${
                isDark ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
              }`}>
                <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>📋 Under Review</h2>
                <p className={`mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  Your claim requires manual review by our team
                </p>
                <p className={`text-sm ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>
                  We'll notify you once the review is complete
                </p>
              </div>
            </>
          )}
          
          <div className={`rounded-xl p-4 mb-6 transition-colors duration-300 ${
            isDark ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>
              <strong>Claim Number:</strong> {claimResult.claimNumber}
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>
              <strong>AI Confidence:</strong> {claimResult.aiConfidenceScore}%
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>
              <strong>Fraud Risk:</strong> {claimResult.fraudScore}%
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.location.href = '/claim-status'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              📊 Track Claim Status
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl"
            >
              🏠 Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Submit Insurance Claim</h1>
          <p className={`text-xl ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Welcome, {user?.firstName || user?.username}! Let's process your claim quickly with AI assistance.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`h-2 w-16 mx-2 rounded-full ${
                    currentStep > step 
                      ? 'bg-blue-600' 
                      : isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center text-sm">
            <div className="flex space-x-16">
              <span className={currentStep === 1 
                ? 'font-semibold text-blue-600' 
                : isDark ? 'text-slate-400' : 'text-gray-600'}>
                Policy & Type
              </span>
              <span className={currentStep === 2 
                ? 'font-semibold text-blue-600' 
                : isDark ? 'text-slate-400' : 'text-gray-600'}>
                Incident Details
              </span>
              <span className={currentStep === 3 
                ? 'font-semibold text-blue-600' 
                : isDark ? 'text-slate-400' : 'text-gray-600'}>
                Documents & Submit
              </span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
          {/* Step 1: Policy and Claim Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Select Policy & Claim Type</h2>
                <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Choose the policy and type of claim you want to submit</p>
              </div>

              {/* Policy Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  1. Select Your Insurance Policy
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      onClick={() => handleInputChange('userPolicyId', policy.id.toString())}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.userPolicyId === policy.id.toString()
                          ? isDark 
                            ? 'border-blue-400 bg-blue-900/30 shadow-lg' 
                            : 'border-blue-500 bg-blue-50 shadow-lg'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📄</div>
                        <div>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{policy.name || `${policy.type} Insurance`}</div>
                          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Policy #{policy.policyNumber || policy.id}</div>
                          <div className={`text-sm font-medium ${
                            policy.status === 'ACTIVE' 
                              ? isDark ? 'text-green-400' : 'text-green-600' 
                              : isDark ? 'text-yellow-400' : 'text-yellow-600'
                          }`}>
                            ● {policy.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Type Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  2. Select Claim Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claimTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange('type', type.value)}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.type === type.value
                          ? isDark 
                            ? 'border-blue-400 bg-blue-900/30 shadow-lg' 
                            : 'border-blue-500 bg-blue-50 shadow-lg'
                          : isDark
                            ? 'border-slate-600 hover:border-slate-500 hover:shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{type.icon}</div>
                        <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{type.label}</div>
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{type.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📅 Incident Details</h2>
                <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Provide detailed information about the incident</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    📅 Date of Incident *
                  </label>
                  <Input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    💰 Claim Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.claimAmount}
                      onChange={(e) => handleInputChange('claimAmount', e.target.value)}
                      className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  📍 Location of Incident *
                </label>
                <Input
                  type="text"
                  placeholder="Enter the exact location where the incident occurred"
                  value={formData.incidentLocation}
                  onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  📝 Detailed Description *
                </label>
                <textarea
                  rows="5"
                  placeholder="Please provide a detailed description of what happened. Include all relevant details, circumstances, and any other important information..."
                  value={formData.incidentDescription}
                  onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDark ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' : 'border-gray-300'
                  }`}
                />
                <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {formData.incidentDescription.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents and Submit */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📎 Supporting Documents</h2>
                <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Upload any supporting documents to strengthen your claim</p>
              </div>

              {/* File Upload Area */}
              <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400 transition-colors ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
                <div className="text-6xl mb-4">📁</div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload Supporting Documents</h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Drop files here or click to browse (PDF, JPG, PNG up to 10MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </div>

              {/* Uploaded Files */}
              {formData.supportingDocuments.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Uploaded Documents</h3>
                  <div className="space-y-3">
                    {formData.supportingDocuments.map((doc, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📄</div>
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.name}</div>
                            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Documents */}
              <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'}`}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>💡 Recommended Documents</h4>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  <div>• Photos of damage/incident scene</div>
                  <div>• Police report (if applicable)</div>
                  <div>• Medical records/bills</div>
                  <div>• Repair estimates/receipts</div>
                  <div>• Witness statements</div>
                  <div>• Insurance correspondence</div>
                </div>
              </div>

              {/* Submit Section */}
              <div className={`rounded-xl p-6 border transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-800/30' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'}`}>
                <div className="text-center">
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>🤖 AI-Powered Processing</h3>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    Our AI will analyze your claim instantly. If risk assessment ≥ 90%, 
                    you'll receive immediate approval and payment processing!
                  </p>
                  
                  {submitting && (
                    <div className="mb-4">
                      <div className={`rounded-lg p-4 mb-2 transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                        <div className="flex items-center justify-center space-x-2">
                          <Spinner size="small" />
                          <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>Processing your claim with AI...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{uploadProgress}% complete</div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={submitClaim}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold disabled:opacity-50"
                  >
                    {submitting ? '🔄 Processing...' : '🚀 Submit Claim'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex justify-between mt-8 pt-6 border-t transition-colors duration-300 ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 border rounded-lg disabled:opacity-50 ${
                isDark 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ← Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 rounded-lg"
              >
                Next →
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubmitClaim;