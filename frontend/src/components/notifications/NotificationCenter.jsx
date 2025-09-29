import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ isOpen, onClose, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load stored notifications
    loadNotifications();

    // Listen for new notifications
    const handleNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      updateUnreadCount();
    };

    const handleNotificationRead = ({ notificationId }) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      updateUnreadCount();
    };

    notificationService.addEventListener('notification', handleNotification);
    notificationService.addEventListener('notification-read', handleNotificationRead);

    return () => {
      notificationService.removeEventListener('notification', handleNotification);
      notificationService.removeEventListener('notification-read', handleNotificationRead);
    };
  }, []);

  const loadNotifications = () => {
    const stored = notificationService.getStoredNotifications();
    setNotifications(stored);
    updateUnreadCount(stored);
  };

  const updateUnreadCount = (notificationList = notifications) => {
    const unread = notificationList.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        markAsRead(n.id);
      }
    });
  };

  const clearAll = () => {
    localStorage.removeItem('notifications');
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'POLICY_AUTO_APPROVED':
      case 'POLICY_APPROVED_BY_ADMIN':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'POLICY_PENDING_APPROVAL':
      case 'POLICY_REQUIRES_APPROVAL':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'POLICY_REJECTED_BY_ADMIN':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'POLICY_AUTO_APPROVED':
      case 'POLICY_APPROVED_BY_ADMIN':
        return 'border-l-green-400 bg-green-50';
      case 'POLICY_PENDING_APPROVAL':
      case 'POLICY_REQUIRES_APPROVAL':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'POLICY_REJECTED_BY_ADMIN':
        return 'border-l-red-400 bg-red-50';
      default:
        return 'border-l-blue-400 bg-blue-50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-30'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                    
                    {/* Additional notification details */}
                    {notification.policyName && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Policy:</span> {notification.policyName}
                      </div>
                    )}
                    {notification.riskLevel && (
                      <div className="mt-1 text-xs">
                        <span className="font-medium">Risk Level:</span>
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          notification.riskLevel === 'LOW' 
                            ? 'bg-green-100 text-green-800'
                            : notification.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.riskLevel}
                        </span>
                      </div>
                    )}
                    {notification.actionRequired && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Action Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Bell Icon Component
export const NotificationBell = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    initializeNotifications();
    
    return () => {
      notificationService.disconnect();
    };
  }, [user]);

  const initializeNotifications = async () => {
    if (user && user.token) {
      try {
        // Request notification permission
        await notificationService.requestNotificationPermission();
        
        // Connect to WebSocket
        await notificationService.connect(user.token);
        setConnected(true);
        
        // Subscribe to user-specific notifications
        notificationService.subscribeToUserNotifications(user.id);
        
        // Subscribe to role-specific notifications
        if (user.role) {
          notificationService.subscribeToRoleNotifications(user.role);
        }
        
        // Load initial unread count
        updateUnreadCount();
        
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    }
  };

  const updateUnreadCount = () => {
    const notifications = notificationService.getStoredNotifications();
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    const handleNotification = () => {
      updateUnreadCount();
    };

    const handleNotificationRead = () => {
      updateUnreadCount();
    };

    notificationService.addEventListener('notification', handleNotification);
    notificationService.addEventListener('notification-read', handleNotificationRead);

    return () => {
      notificationService.removeEventListener('notification', handleNotification);
      notificationService.removeEventListener('notification-read', handleNotificationRead);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${
          connected ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400'
        }`}
        title={connected ? 'Notifications' : 'Notifications (Disconnected)'}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!connected && (
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-yellow-400 rounded-full"></span>
        )}
      </button>
      
      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        user={user}
      />
    </div>
  );
};

export default NotificationCenter;