import { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Star,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';
import Button from '../ui/Button';

const PolicyCard = ({ 
  policy, 
  onViewDetails, 
  onApply, 
  isUserPolicy = false, 
  showApplyButton = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (onApply) {
      setIsLoading(true);
      try {
        await onApply(policy.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRiskLevelInfo = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'MEDIUM':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'HIGH':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const riskInfo = getRiskLevelInfo(policy.riskLevel);
  const statusInfo = formatStatus(policy.status || 'AVAILABLE');

  return (
    <div className="bg-white rounded-xl card-shadow hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {policy.policyName || policy.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {policy.policyType || 'General Insurance'}
            </p>
            {isUserPolicy && (
              <div className="flex items-center">
                {getStatusIcon(policy.status)}
                <span className={`ml-2 text-sm font-medium ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
              </div>
            )}
          </div>
          
          {/* Risk Level Badge */}
          {policy.riskLevel && (
            <div className={`flex items-center px-3 py-1 rounded-full ${riskInfo.bg}`}>
              <riskInfo.icon className={`w-4 h-4 ${riskInfo.color} mr-1`} />
              <span className={`text-xs font-medium ${riskInfo.color}`}>
                {policy.riskLevel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {policy.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {policy.description}
          </p>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Premium */}
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Premium</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(
                  isUserPolicy 
                    ? policy.premiumAmount || policy.monthlyPremium 
                    : policy.monthlyPremium
                )}
                {!isUserPolicy && <span className="text-xs text-gray-500">/month</span>}
              </p>
            </div>
          </div>

          {/* Coverage */}
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Coverage</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(
                  policy.coverageAmount || policy.coverage || policy.sumInsured || 0
                )}
              </p>
            </div>
          </div>

          {/* Duration or Start Date */}
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">
                {isUserPolicy ? 'Start Date' : 'Duration'}
              </p>
              <p className="font-semibold text-gray-900">
                {isUserPolicy 
                  ? formatDate(policy.startDate || policy.createdAt)
                  : `${policy.duration || 12} months`
                }
              </p>
            </div>
          </div>

          {/* Deductible or End Date */}
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">
                {isUserPolicy ? 'End Date' : 'Deductible'}
              </p>
              <p className="font-semibold text-gray-900">
                {isUserPolicy 
                  ? formatDate(policy.endDate)
                  : formatCurrency(policy.deductible || 0)
                }
              </p>
            </div>
          </div>
        </div>

        {/* Features/Benefits */}
        {policy.benefits && policy.benefits.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Benefits</h4>
            <div className="space-y-1">
              {policy.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="truncate">{benefit}</span>
                </div>
              ))}
              {policy.benefits.length > 3 && (
                <p className="text-xs text-gray-500 ml-6">
                  +{policy.benefits.length - 3} more benefits
                </p>
              )}
            </div>
          </div>
        )}

        {/* Eligibility (for available policies) */}
        {!isUserPolicy && policy.eligibilityCriteria && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {policy.eligibilityCriteria}
            </p>
          </div>
        )}

        {/* Rating (if available) */}
        {policy.rating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(policy.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {policy.rating} ({policy.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(policy)}
              className="flex-1 flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}

          {showApplyButton && onApply && (
            <Button
              onClick={handleApply}
              disabled={isLoading}
              className="flex-1 gradient-primary text-white"
            >
              {isLoading ? 'Applying...' : 'Apply Now'}
            </Button>
          )}

          {isUserPolicy && policy.status === 'ACTIVE' && (
            <Button
              variant="outline"
              className="flex-1"
            >
              Manage Policy
            </Button>
          )}
        </div>

        {/* Additional Info for User Policies */}
        {isUserPolicy && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Policy Number:</span>
              <span className="font-medium text-gray-900">
                {policy.policyNumber || `POL-${policy.id}`}
              </span>
            </div>
            {policy.nextPremiumDue && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Next Premium Due:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(policy.nextPremiumDue)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Requires Approval Badge */}
        {!isUserPolicy && policy.requiresApproval && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-800 font-medium">
                Requires Manual Approval
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This policy requires admin approval after application
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyCard;