import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

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
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      
      throw new Error('Login failed - no token received');
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const userProfile = await authService.getCurrentUser();
        setUser(userProfile);
        setIsAuthenticated(true);
        return { success: true, user: userProfile };
      }
      
      return { success: true, message: 'Registration successful. Please verify your email.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => hasRole('ADMIN');
  const isBroker = () => hasRole('BROKER');
  const isUser = () => hasRole('USER');

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isBroker,
    isUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;