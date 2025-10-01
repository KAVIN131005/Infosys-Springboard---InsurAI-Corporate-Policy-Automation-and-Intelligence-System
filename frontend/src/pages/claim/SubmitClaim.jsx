import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ClaimUploader from '../../components/claim/ClaimUploader';
import { submitClaim } from '../../api/claimService';
import { getCurrentUserPolicies } from '../../api/userPolicyService';

const SubmitClaim = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimData, setClaimData] = useState({
    policyId: '',
    claimType: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: '',
    estimatedAmount: '',
    witnesses: '',
    policeReport: false,
    medicalReport: false,
    emergencyServices: false,
    documents: []
  });

  const claimTypes = [
    { value: 'auto', label: '🚗 Auto Accident', description: 'Vehicle damage or collision' },
    { value: 'health', label: '🏥 Health/Medical', description: 'Medical expenses or treatment' },
    { value: 'property', label: '🏠 Property Damage', description: 'Home or property damage' },
    { value: 'life', label: '💔 Life Insurance', description: 'Life insurance claim' },
    { value: 'disability', label: '♿ Disability', description: 'Disability insurance claim' },
    { value: 'travel', label: '✈️ Travel', description: 'Travel insurance claim' },
    { value: 'theft', label: '🔒 Theft/Burglary', description: 'Stolen or burglarized items' },
    { value: 'liability', label: '⚖️ Liability', description: 'Third-party liability claim' }
  ];

  useEffect(() => {
    loadUserPolicies();
  }, []);

  const loadUserPolicies = async () => {
    setLoading(true);
    try {
      const response = await getCurrentUserPolicies();
      // Filter only active policies for claims
      const activePolicies = (response || []).filter(policy => 
        policy.status === 'ACTIVE' || policy.status === 'APPROVED'
      );
      setPolicies(activePolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
      // Mock policies for demo when backend is unavailable
      setPolicies([
        { id: '1', name: 'Comprehensive Auto Insurance', type: 'AUTO', policyNumber: 'AUTO-2024-001', status: 'ACTIVE' },
        { id: '2', name: 'Premium Health Insurance', type: 'HEALTH', policyNumber: 'HEALTH-2024-002', status: 'ACTIVE' },
        { id: '3', name: 'Home Protection Insurance', type: 'PROPERTY', policyNumber: 'HOME-2024-003', status: 'ACTIVE' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setClaimData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (documents) => {
    setClaimData(prev => ({
      ...prev,
      documents: [...prev.documents, ...documents]
    }));
  };

  const handleSubmitClaim = async () => {
    setSubmitting(true);
    try {
      // Prepare claim data for submission
      const claimSubmission = {
        policyId: claimData.policyId,
        type: claimData.claimType.toUpperCase(),
        incidentDate: claimData.incidentDate,
        incidentTime: claimData.incidentTime,
        location: claimData.location,
        description: claimData.description,
        claimAmount: parseFloat(claimData.estimatedAmount) || 0,
        witnesses: claimData.witnesses,
        policeReportFiled: claimData.policeReport,
        medicalAttentionReceived: claimData.medicalReport,
        emergencyServicesCalled: claimData.emergencyServices,
        supportingDocuments: claimData.documents.map(doc => doc.name).join(', ')
      };

      const response = await submitClaim(claimSubmission);
      
      // Store claim ID for success page
      localStorage.setItem('lastClaimId', response.claimNumber || response.id);
      setStep(5); // Success step
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim: ' + (error.message || 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return claimData.policyId && claimData.claimType;
      case 2:
        return claimData.incidentDate && claimData.location && claimData.description;
      case 3:
        return true; // Documents are optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  if (step === 5) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className={`rounded-lg shadow-lg p-8 max-w-md text-center transition-colors duration-300 ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">Claim Submitted Successfully!</h2>
          <p className={`mb-4 ${
            isDark ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Your claim has been submitted and is being processed. You'll receive updates via email.
          </p>
          {localStorage.getItem('lastClaimId') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                <strong>Claim Number:</strong> {localStorage.getItem('lastClaimId')}
              </p>
              <p className="text-green-700 text-sm">Please save this number for your records.</p>
            </div>
          )}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/claim-status'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Track Claim Status
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>📋 Submit New Claim</h1>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
            Welcome, {user?.firstName || user?.username}! Let's get your claim submitted quickly and efficiently.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`h-1 w-24 mx-2 ${
                    step > num ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className={`flex justify-between text-sm ${
            isDark ? 'text-slate-400' : 'text-gray-600'
          }`}>
            <span>Policy & Type</span>
            <span>Incident Details</span>
            <span>Documentation</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Step Content */}
        <div className={`rounded-lg shadow-md p-8 transition-colors duration-300 ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          {/* Step 1: Policy Selection and Claim Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>📋 Select Policy and Claim Type</h2>
              
              {/* Policy Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Insurance Policy
                </label>
                {loading ? (
                  <div className="text-center py-4">Loading policies...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((policy) => (
                      <div
                        key={policy.id}
                        onClick={() => handleInputChange('policyId', policy.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          claimData.policyId === policy.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{policy.name || policy.type}</div>
                        <div className="text-sm text-gray-600">{policy.policyNumber || `Policy #${policy.id}`}</div>
                        <div className={`text-sm font-medium ${
                          policy.status === 'Active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {policy.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claim Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type of Claim
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange('claimType', type.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        claimData.claimType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">📅 Incident Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Incident *
                  </label>
                  <Input
                    type="date"
                    value={claimData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time of Incident
                  </label>
                  <Input
                    type="time"
                    value={claimData.incidentTime}
                    onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location of Incident *
                </label>
                <Input
                  type="text"
                  placeholder="Enter the location where the incident occurred"
                  value={claimData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description of Incident *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Please provide a detailed description of what happened..."
                  value={claimData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Amount (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="Enter estimated claim amount"
                  value={claimData.estimatedAmount}
                  onChange={(e) => handleInputChange('estimatedAmount', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Witnesses (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Names and contact information of any witnesses..."
                  value={claimData.witnesses}
                  onChange={(e) => handleInputChange('witnesses', e.target.value)}
                />
              </div>

              {/* Additional Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Emergency Services Involved
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={claimData.policeReport}
                      onChange={(e) => handleInputChange('policeReport', e.target.checked)}
                      className="mr-2"
                    />
                    Police report filed
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={claimData.medicalReport}
                      onChange={(e) => handleInputChange('medicalReport', e.target.checked)}
                      className="mr-2"
                    />
                    Medical attention received
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={claimData.emergencyServices}
                      onChange={(e) => handleInputChange('emergencyServices', e.target.checked)}
                      className="mr-2"
                    />
                    Emergency services called
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documentation */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">📎 Upload Supporting Documents</h2>
              
              <ClaimUploader onUploadSuccess={handleDocumentUpload} />
              
              {claimData.documents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {claimData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <button
                          onClick={() => {
                            const newDocs = claimData.documents.filter((_, i) => i !== index);
                            handleInputChange('documents', newDocs);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Recommended Documents</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Photos of damage or incident scene</li>
                  <li>• Police report (if applicable)</li>
                  <li>• Medical records or bills</li>
                  <li>• Receipts or estimates for repairs</li>
                  <li>• Witness statements</li>
                  <li>• Any relevant correspondence</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">👁️ Review Your Claim</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Policy Information</h3>
                  <p><strong>Policy ID:</strong> {claimData.policyId}</p>
                  <p><strong>Claim Type:</strong> {claimTypes.find(t => t.value === claimData.claimType)?.label}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Incident Details</h3>
                  <p><strong>Date:</strong> {claimData.incidentDate} {claimData.incidentTime}</p>
                  <p><strong>Location:</strong> {claimData.location}</p>
                  <p><strong>Description:</strong> {claimData.description}</p>
                  {claimData.estimatedAmount && <p><strong>Estimated Amount:</strong> ${claimData.estimatedAmount}</p>}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                  <p>{claimData.documents.length} document(s) uploaded</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ← Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleSubmitClaim}
                disabled={submitting}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitClaim;