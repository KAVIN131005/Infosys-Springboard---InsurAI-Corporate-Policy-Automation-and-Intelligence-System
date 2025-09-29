import { getAuthToken } from './authService';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.isConnected = false;
    this.connectionPromise = null;
  }

  connect(token) {
    // Prevent multiple connection attempts
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const authToken = token || getAuthToken();
        if (!authToken) {
          throw new Error('No authentication token available');
        }

        // Use WebSocket URL that matches your backend configuration
        const wsUrl = `ws://localhost:8080/ws?token=${authToken}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', { status: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            this.emit(data.type || 'message', data.payload || data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.connectionPromise = null;
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Auto-reconnect for unexpected closures
          if (event.code !== 1000) { // 1000 is normal closure
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max WebSocket reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }
    this.isConnected = false;
    this.connectionPromise = null;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send message to server
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(messageString);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected, message not sent:', message);
      return false;
    }
  }

  // Convenience methods for common operations
  subscribeToUpdates(callback) {
    this.on('DASHBOARD_UPDATE', callback);
    this.on('POLICY_UPDATE', callback);
    this.on('CLAIM_UPDATE', callback);
    this.on('USER_UPDATE', callback);
    
    // Send subscription request to server
    this.send({
      type: 'SUBSCRIBE',
      topics: ['dashboard', 'policies', 'claims', 'users']
    });
  }

  unsubscribeFromUpdates(callback) {
    this.off('DASHBOARD_UPDATE', callback);
    this.off('POLICY_UPDATE', callback);
    this.off('CLAIM_UPDATE', callback);
    this.off('USER_UPDATE', callback);
  }

  // Health check
  sendHeartbeat() {
    return this.send({
      type: 'HEARTBEAT',
      timestamp: new Date().toISOString()
    });
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Subscribe to specific data updates
  subscribeToPolicyUpdates(callback) {
    this.on('POLICY_UPDATE', callback);
    this.send({ type: 'SUBSCRIBE_POLICIES' });
  }

  subscribeToClaimUpdates(callback) {
    this.on('CLAIM_UPDATE', callback);
    this.send({ type: 'SUBSCRIBE_CLAIMS' });
  }

  subscribeToDashboardUpdates(callback) {
    this.on('DASHBOARD_UPDATE', callback);
    this.send({ type: 'SUBSCRIBE_DASHBOARD' });
  }
}

// Create and export singleton instance
export const websocketService = new WebSocketService();

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  const token = getAuthToken();
  if (token && !websocketService.isConnected) {
    return websocketService.connect(token);
  }
  return Promise.resolve();
};

// Helper function to ensure WebSocket is connected before use
export const ensureWebSocketConnection = async () => {
  if (!websocketService.isConnected) {
    await initializeWebSocket();
  }
  return websocketService;
};

export default websocketService;