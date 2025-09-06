import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, isAuthenticated, clearAuthData, initializeAuth, getCurrentUser } from '../api/authService';
import { storeAuthState, getStoredAuthState, clearStoredAuthState, hasValidToken } from '../utils/authUtils';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeAuthState();
  }, []);

  const initializeAuthState = async () => {
    try {
      setLoading(true);
      
      // Initialize auth system
      initializeAuth();
      
      // First, check if we have a valid token
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData && hasValidToken()) {
        try {
          const user = JSON.parse(userData);
          
          // Immediately set the auth state to prevent redirects
          setUser(user);
          setIsAuthenticated(true);
          storeAuthState(true, user);
          
          // Don't wait for background verification to complete
          setLoading(false);
          setInitialized(true);
          
          // Verify with backend in background, but don't block UI
          verifyAuthInBackground();
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          await checkAuthStatus();
        }
      } else if (token && userData) {
        // Token might be expired, but try to refresh
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
          storeAuthState(true, user);
          setLoading(false);
          setInitialized(true);
          
          // Try to refresh token in background
          verifyAuthInBackground();
        } catch (error) {
          await checkAuthStatus();
        }
      } else {
        // No token or user data
        setUser(null);
        setIsAuthenticated(false);
        storeAuthState(false, null);
        setLoading(false);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setInitialized(true);
    }
  };

  const verifyAuthInBackground = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        storeAuthState(true, currentUser);
      } else {
        // Only logout if we can't verify the user and we don't have valid local data
        console.warn('Background verification failed - user not found');
        // Don't logout immediately, maybe it's just a network issue
      }
    } catch (error) {
      console.warn('Background auth verification failed:', error);
      // Only logout on 401 (unauthorized), not on network errors
      if (error.response?.status === 401) {
        console.log('Token invalid - logging out');
        logout();
      }
      // For other errors (network, etc.), keep current state
    }
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Initialize auth system
      initializeAuth();
      
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        // Check if token is expired first
        const isExpired = token.split('.').length === 3 ? (() => {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
          } catch {
            return true;
          }
        })() : true;

        if (isExpired) {
          console.log('Token expired, clearing auth data');
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        const user = JSON.parse(userData);
        
        // Verify token is still valid by checking with backend
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            storeAuthState(true, currentUser);
            console.log('User authenticated:', currentUser);
          } else {
            // Token is invalid, clear auth data
            console.log('Token validation failed, clearing auth data');
            clearAuthData();
            clearStoredAuthState();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // If API call fails but we have local data and token is not expired, use it
          console.warn('API verification failed, using local data:', error);
          if (error.response?.status === 401) {
            // Unauthorized - clear auth data
            clearAuthData();
            clearStoredAuthState();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // Network error or other issues - use local data temporarily
            setUser(user);
            setIsAuthenticated(true);
            storeAuthState(true, user);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        storeAuthState(false, null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
      clearStoredAuthState();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const logout = () => {
    clearAuthData();
    clearStoredAuthState();
    setUser(null);
    setIsAuthenticated(false);
  };

  const loginUser = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    storeAuthState(true, userData);
    // Store in localStorage is handled by authService
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    storeAuthState(true, updatedUser);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => hasRole('ADMIN');
  const isBroker = () => hasRole('BROKER');
  const isUserRole = () => hasRole('USER');

  const value = {
    user,
    loading,
    isAuthenticated,
    initialized,
    logout,
    loginUser,
    updateUser,
    hasRole,
    isAdmin,
    isBroker,
    isUser: isUserRole,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;