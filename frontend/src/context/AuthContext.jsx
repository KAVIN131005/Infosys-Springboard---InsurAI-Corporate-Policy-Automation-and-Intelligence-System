import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, isAuthenticated, clearAuthData, initializeAuth, getCurrentUser } from '../api/authService';

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Initialize auth system
      initializeAuth();
      
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verify token is still valid by checking with backend
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            console.log('User authenticated:', currentUser);
          } else {
            // Token is invalid, clear auth data
            clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // If API call fails but we have local data, use it
          console.warn('API verification failed, using local data:', error);
          setUser(user);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
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
    logout,
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