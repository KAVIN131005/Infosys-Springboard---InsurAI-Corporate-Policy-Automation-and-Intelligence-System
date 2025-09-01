/**
 * Utility functions for formatting data
 */

/**
 * Format currency with proper symbols and commas
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }

  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || '₹';
  
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format date to a readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return dateObj.toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format date to a short string (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) {
    return formatDateShort(date);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Format percentage with proper symbol
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format as +91 XXXXX XXXXX for Indian numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
  }

  return phoneNumber;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const formatTitle = (str) => {
  if (!str) return '';
  
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format text to display with ellipsis if too long
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const formatTruncate = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format status with proper styling classes
 * @param {string} status - Status to format
 * @returns {object} Object with text and className
 */
export const formatStatus = (status) => {
  if (!status) return { text: 'Unknown', className: 'text-gray-500' };

  const statusMap = {
    ACTIVE: { text: 'Active', className: 'text-green-600' },
    INACTIVE: { text: 'Inactive', className: 'text-red-600' },
    PENDING: { text: 'Pending', className: 'text-yellow-600' },
    APPROVED: { text: 'Approved', className: 'text-green-600' },
    REJECTED: { text: 'Rejected', className: 'text-red-600' },
    CANCELLED: { text: 'Cancelled', className: 'text-gray-600' },
    EXPIRED: { text: 'Expired', className: 'text-red-600' },
    PROCESSING: { text: 'Processing', className: 'text-blue-600' }
  };

  return statusMap[status.toUpperCase()] || { 
    text: formatTitle(status), 
    className: 'text-gray-500' 
  };
};

export default {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatTitle,
  formatTruncate,
  formatStatus
};
