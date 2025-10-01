import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PolicyUploader from '../../components/policy/PolicyUploader';
import Button from '../../components/ui/Button';

const BrokerUploadPolicy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleUploadSuccess = (policyData) => {
    setUploadStatus({ type: 'success', message: 'Policy uploaded successfully!' });
    setTimeout(() => setUploadStatus(null), 5000);
  };

  const handleUploadError = (error) => {
    setUploadStatus({ type: 'error', message: error.message || 'Upload failed' });
    setTimeout(() => setUploadStatus(null), 5000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📄 Upload New Policy
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.firstName || user?.username}! Upload a new insurance policy for your clients.
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div
            role="status"
            aria-live={uploadStatus.type === 'success' ? 'polite' : 'assertive'}
            className={`mb-6 p-4 rounded-lg ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">
                  {uploadStatus.type === 'success' ? '✅' : '❌'}
                </span>
                <span className="break-words">{uploadStatus.message}</span>
              </div>
              <button
                aria-label="Dismiss notification"
                onClick={() => setUploadStatus(null)}
                className="ml-4 text-sm text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className={`rounded-lg shadow-md p-8 transition-colors duration-300 bg-white border border-gray-200`}>
          <PolicyUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Quick Actions */}
        <div className={`mt-8 rounded-lg shadow-md p-6 transition-colors duration-300 bg-white border border-gray-200`}>
          <h3 className={`text-lg font-semibold mb-4 text-gray-900`}>🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/broker/policies')}
              className="flex items-center w-full text-left p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <div className="font-medium">View Policies</div>
                <div className="text-sm text-blue-100">Manage existing policies</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/analytics')}
              className="flex items-center w-full text-left p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-green-100">View performance data</div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/chatbot')}
              className="flex items-center w-full text-left p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <span className="text-2xl mr-3">🤖</span>
              <div>
                <div className="font-medium">AI Assistant</div>
                <div className="text-sm text-purple-100">Get help and insights</div>
              </div>
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => navigate('/broker/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerUploadPolicy;