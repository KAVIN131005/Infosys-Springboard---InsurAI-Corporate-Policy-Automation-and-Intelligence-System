import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PolicyUploader from '../../components/policy/PolicyUploader';
import Button from '../../components/ui/Button';

const BrokerUploadPolicy = () => {
  const { user } = useAuth();
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
          <div className={`mb-6 p-4 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {uploadStatus.type === 'success' ? '✅' : '❌'}
              </span>
              {uploadStatus.message}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <PolicyUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/broker/policies'}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <span className="text-2xl mr-2">📋</span>
              <div className="text-left">
                <div className="font-medium">View Policies</div>
                <div className="text-sm">Manage existing policies</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/analytics'}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
            >
              <span className="text-2xl mr-2">📊</span>
              <div className="text-left">
                <div className="font-medium">Analytics</div>
                <div className="text-sm">View performance data</div>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/chatbot'}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
            >
              <span className="text-2xl mr-2">🤖</span>
              <div className="text-left">
                <div className="font-medium">AI Assistant</div>
                <div className="text-sm">Get help and insights</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerUploadPolicy;