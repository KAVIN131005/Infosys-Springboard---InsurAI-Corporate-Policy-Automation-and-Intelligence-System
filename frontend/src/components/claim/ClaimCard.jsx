import React, { useState } from 'react';
import Button from '../ui/Button';

const ClaimCard = ({ claim }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'pending review':
      case 'under review':
        return '👁️';
      case 'rejected':
      case 'denied':
        return '❌';
      case 'processing':
        return '⏳';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending review':
      case 'under review':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getClaimTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'auto accident':
      case 'auto':
        return '🚗';
      case 'property damage':
      case 'property':
        return '🏠';
      case 'health insurance':
      case 'health':
        return '🏥';
      case 'life insurance':
      case 'life':
        return '💔';
      case 'travel':
        return '✈️';
      case 'theft':
        return '🔒';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{getClaimTypeIcon(claim.type)}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Claim {claim.id}
                </h3>
                <p className="text-sm text-gray-600">{claim.type}</p>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center ${getStatusColor(claim.status)}`}>
            <span className="mr-1">{getStatusIcon(claim.status)}</span>
            {claim.status}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Claim Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Claim Amount */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="text-xs text-gray-500">Claim Amount</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(claim.amount)}
              </p>
            </div>
          </div>

          {/* Policy Info */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">🛡️</span>
            <div>
              <p className="text-xs text-gray-500">Policy Number</p>
              <p className="font-semibold text-gray-900">
                {claim.policyNumber || 'N/A'}
              </p>
            </div>
          </div>

          {/* Submitted Date */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">📅</span>
            <div>
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="font-semibold text-gray-900">
                {formatDate(claim.submittedDate)}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔄</span>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="font-semibold text-gray-900">
                {formatDate(claim.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {claim.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📝</span>
              Description
            </h4>
            <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
              {claim.description}
            </p>
            {claim.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-1"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {claim.progress !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <span className="mr-2">📊</span>
                Progress
              </h4>
              <span className="text-sm font-medium text-gray-600">{claim.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${claim.progress}%` }}
              ></div>
            </div>
            {claim.nextStep && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Next:</strong> {claim.nextStep}
              </p>
            )}
          </div>
        )}

        {/* Assigned Adjuster */}
        {claim.adjusterName && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">👤</span>
              Assigned Adjuster
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{claim.adjusterName}</p>
                {claim.adjusterPhone && (
                  <p className="text-sm text-gray-600">{claim.adjusterPhone}</p>
                )}
              </div>
              {claim.adjusterPhone && (
                <Button
                  onClick={() => window.open(`tel:${claim.adjusterPhone}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📞 Call
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {claim.documents && claim.documents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📎</span>
              Documents ({claim.documents.length})
            </h4>
            <div className="space-y-2">
              {claim.documents.slice(0, 3).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-2">📄</span>
                    <span className="text-sm text-gray-700">
                      {doc.name || doc}
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    📥 Download
                  </button>
                </div>
              ))}
              {claim.documents.length > 3 && (
                <p className="text-xs text-gray-500 ml-6">
                  +{claim.documents.length - 3} more documents
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {claim.timeline && claim.timeline.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2">⏰</span>
              Timeline
            </h4>
            <div className="space-y-3">
              {claim.timeline.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <span className="text-lg">
                    {event.status === 'completed' ? '✅' :
                     event.status === 'current' ? '🔄' : '⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={() => alert(`Viewing details for claim ${claim.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            👁️ View Details
          </Button>

          {claim.status.toLowerCase().includes('pending') && (
            <Button
              onClick={() => alert('Upload additional documents')}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              📎 Upload Docs
            </Button>
          )}

          {claim.status.toLowerCase() === 'approved' && (
            <Button
              onClick={() => alert('Viewing payment details')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              💳 Payment
            </Button>
          )}
        </div>

        {/* Settlement Amount (for approved claims) */}
        {claim.status.toLowerCase() === 'approved' && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 flex items-center">
                <span className="mr-2">💰</span>
                Settlement Amount:
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(claim.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className="text-sm font-medium text-green-600">
                ✅ Payment Approved
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimCard;