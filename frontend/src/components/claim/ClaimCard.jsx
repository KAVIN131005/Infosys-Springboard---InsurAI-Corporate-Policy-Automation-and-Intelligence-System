import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  Download,
  MessageCircle,
  User
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime, formatStatus } from '../../utils/formatters';
import Button from '../ui/Button';

const ClaimCard = ({ claim, onViewDetails, onDownloadDocument }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'REJECTED':
      case 'DENIED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PROCESSING':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
      case 'DENIED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusInfo = formatStatus(claim.status);

  return (
    <div className="bg-white rounded-xl card-shadow hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FileText className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Claim #{claim.claimNumber || claim.id}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {claim.claimType || 'Insurance Claim'}
            </p>
            <div className="flex items-center">
              {getStatusIcon(claim.status)}
              <span className={`ml-2 text-sm font-medium ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(claim.status)}`}>
            {claim.status?.replace('_', ' ') || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Claim Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Claim Amount */}
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Claim Amount</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(claim.claimAmount || claim.amount || 0)}
              </p>
            </div>
          </div>

          {/* Policy Info */}
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Policy</p>
              <p className="font-semibold text-gray-900 truncate">
                {claim.policyName || claim.policyNumber || 'N/A'}
              </p>
            </div>
          </div>

          {/* Incident Date */}
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Incident Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(claim.incidentDate || claim.dateOfLoss)}
              </p>
            </div>
          </div>

          {/* Submitted Date */}
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="font-semibold text-gray-900">
                {formatRelativeTime(claim.submittedAt || claim.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {claim.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
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

        {/* AI Analysis (if available) */}
        {claim.aiAnalysis && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              AI Analysis
            </h4>
            <div className="space-y-2">
              {claim.aiAnalysis.riskScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Risk Score:</span>
                  <span className={`text-sm font-medium ${
                    claim.aiAnalysis.riskScore < 30 ? 'text-green-600' :
                    claim.aiAnalysis.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {claim.aiAnalysis.riskScore}%
                  </span>
                </div>
              )}
              {claim.aiAnalysis.recommendation && (
                <p className="text-sm text-blue-700">
                  <strong>Recommendation:</strong> {claim.aiAnalysis.recommendation}
                </p>
              )}
              {claim.aiAnalysis.fraudIndicators && claim.aiAnalysis.fraudIndicators.length > 0 && (
                <div>
                  <p className="text-sm text-blue-700 font-medium">Fraud Indicators:</p>
                  <ul className="text-sm text-blue-600 ml-4 list-disc">
                    {claim.aiAnalysis.fraudIndicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {claim.documents && claim.documents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Supporting Documents ({claim.documents.length})
            </h4>
            <div className="space-y-2">
              {claim.documents.slice(0, 3).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate">
                      {doc.name || doc.fileName || `Document ${index + 1}`}
                    </span>
                  </div>
                  {onDownloadDocument && (
                    <button
                      onClick={() => onDownloadDocument(doc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {claim.documents.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{claim.documents.length - 3} more documents
                </p>
              )}
            </div>
          </div>
        )}

        {/* Assigned Adjuster (if available) */}
        {claim.assignedAdjuster && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Assigned Adjuster
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{claim.assignedAdjuster.name}</p>
                <p className="text-sm text-gray-600">{claim.assignedAdjuster.email}</p>
              </div>
              {claim.assignedAdjuster.phone && (
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Progress Timeline (if available) */}
        {claim.timeline && claim.timeline.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Claim Timeline</h4>
            <div className="space-y-3">
              {claim.timeline.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(claim)}
              className="flex-1 flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}

          {claim.status === 'PENDING' && (
            <Button
              variant="outline"
              className="flex-1"
            >
              Upload Documents
            </Button>
          )}

          {claim.status === 'APPROVED' && claim.paymentDetails && (
            <Button
              className="flex-1 gradient-secondary text-white"
            >
              View Payment
            </Button>
          )}
        </div>

        {/* Approval/Rejection Details */}
        {(claim.status === 'APPROVED' || claim.status === 'REJECTED') && claim.reviewNotes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {claim.status === 'APPROVED' ? 'Approval' : 'Rejection'} Notes
            </h4>
            <p className="text-sm text-gray-600">{claim.reviewNotes}</p>
            {claim.reviewedBy && (
              <p className="text-xs text-gray-500 mt-2">
                Reviewed by: {claim.reviewedBy} on {formatDate(claim.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* Settlement Amount (for approved claims) */}
        {claim.status === 'APPROVED' && claim.settlementAmount && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Settlement Amount:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(claim.settlementAmount)}
              </span>
            </div>
            {claim.paymentDate && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Payment Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(claim.paymentDate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimCard;