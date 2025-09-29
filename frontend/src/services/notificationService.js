import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class NotificationService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (this.connected) {
      console.log('Already connected to WebSocket');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Use SockJS as fallback for older browsers
        const socket = new SockJS('/ws');
        
        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          onConnect: (frame) => {
            console.log('Connected to WebSocket:', frame);
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // Send connection message
            this.client.publish({
              destination: '/app/connect',
              body: JSON.stringify({ timestamp: new Date().toISOString() })
            });
            
            resolve(frame);
          },
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.connected = false;
            reject(new Error(`STOMP error: ${frame.body}`));
          },
          onWebSocketClose: () => {
            console.log('WebSocket connection closed');
            this.connected = false;
            this.handleReconnect(token);
          },
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
            reject(error);
          }
        });

        this.client.activate();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token).catch(console.error);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('connection-failed', { 
        message: 'Failed to maintain WebSocket connection' 
      });
    }
  }

  /**
   * Subscribe to user-specific notifications
   */
  subscribeToUserNotifications(userId) {
    if (!this.connected) {
      console.warn('Cannot subscribe - not connected to WebSocket');
      return null;
    }

    const destination = `/topic/user/${userId}/notifications`;
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Received user notification:', notification);
        this.handleNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(`user-${userId}`, subscription);
    return subscription;
  }

  /**
   * Subscribe to role-specific notifications
   */
  subscribeToRoleNotifications(role) {
    if (!this.connected) {
      console.warn('Cannot subscribe - not connected to WebSocket');
      return null;
    }

    const destination = `/topic/role/${role}/notifications`;
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Received role notification:', notification);
        this.handleNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(`role-${role}`, subscription);
    return subscription;
  }

  /**
   * Handle incoming notifications
   */
  handleNotification(notification) {
    // Store notification in localStorage for persistence
    this.storeNotification(notification);
    
    // Show browser notification if permitted
    this.showBrowserNotification(notification);
    
    // Notify all listeners
    this.notifyListeners('notification', notification);
    
    // Trigger specific event based on notification type
    this.notifyListeners(notification.type, notification);
  }

  /**
   * Store notification in localStorage
   */
  storeNotification(notification) {
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      stored.unshift(notification);
      
      // Keep only last 100 notifications
      const trimmed = stored.slice(0, 100);
      localStorage.setItem('notifications', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get stored notifications
   */
  getStoredNotifications() {
    try {
      return JSON.parse(localStorage.getItem('notifications') || '[]');
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'HIGH'
      });
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    if (this.connected) {
      this.client.publish({
        destination: '/app/mark-read',
        body: JSON.stringify({ notificationId })
      });
    }

    // Update local storage
    try {
      const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = stored.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      this.notifyListeners('notification-read', { notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all listeners for an event
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client && this.connected) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      // Deactivate client
      this.client.deactivate();
      this.connected = false;
      console.log('Disconnected from WebSocket');
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;