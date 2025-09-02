import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance for auth services
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Token utilities
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete authClient.defaults.headers.common['Authorization'];
  }
};

export const setRefreshToken = (refreshToken) => {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete authClient.defaults.headers.common['Authorization'];
};

// JWT token utilities
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token expiration:', error);
    return null;
  }
};

// Authentication API calls
export const login = async (username, password) => {
  try {
    const response = await authClient.post('/api/auth/login', { 
      username, 
      password 
    });
    
    const { token, refreshToken, id, role, email, firstName, lastName } = response.data;
    
    if (token) {
      // Store token and user data
      setAuthToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      // Create user object from response
      const userData = {
        id,
        username,
        email,
        firstName,
        lastName,
        role
      };
      
      setUserData(userData);
      
      return {
        token,
        user: userData,
        message: 'Login successful'
      };
    }
    
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    const message = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

export const register = async (userData) => {
  try {
    const response = await authClient.post('/api/auth/register', userData);
    
    const { id, username, email, firstName, lastName, role } = response.data;
    
    // Registration successful - do NOT auto-login
    // User must manually login with their credentials
    return {
      message: 'Registration successful! Please log in with your credentials.',
      user: { id, username, email, firstName, lastName, role }
    };
  } catch (error) {
    console.error('Registration error:', error);
    // Check multiple possible error message fields
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'Registration failed';
    throw new Error(message);
  }
};

// Enhanced authentication functions
export const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await authClient.post('/api/auth/refresh', {
      refreshToken
    });
    
    const { token, refreshToken: newRefreshToken } = response.data;
    
    if (token) {
      setAuthToken(token);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
    }
    
    return token;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthData();
    throw new Error('Token refresh failed');
  }
};

export const logoutUser = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await authClient.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

export const verifyToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      return false;
    }
    
    if (isTokenExpired(token)) {
      try {
        await refreshAuthToken();
        return true;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return false;
      }
    }
    
    const response = await authClient.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.valid;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }
    
    const response = await authClient.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userData = response.data;
    setUserData(userData);
    return userData;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = getAuthToken();
    const response = await authClient.post('/api/auth/change-password', passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await authClient.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw new Error(error.response?.data?.message || 'Failed to send reset email');
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await authClient.post('/api/auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

// Request interceptor to add auth token
authClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authClient(originalRequest);
      } catch (refreshError) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize auth on app start
export const initializeAuth = () => {
  const token = getAuthToken();
  if (token && !isTokenExpired(token)) {
    authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  } else if (token && isTokenExpired(token)) {
    // Try to refresh token
    refreshAuthToken().catch(() => {
      clearAuthData();
    });
  }
  return false;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token && !isTokenExpired(token);
};

// Get user roles
export const getUserRoles = () => {
  const userData = getUserData();
  return userData?.role ? [userData.role] : [];
};

// Check if user has specific role
export const hasRole = (role) => {
  const userData = getUserData();
  return userData?.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (rolesList) => {
  const userData = getUserData();
  return rolesList.includes(userData?.role);
};

export default {
  login,
  register,
  logoutUser,
  refreshAuthToken,
  verifyToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getAuthToken,
  setAuthToken,
  getUserData,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  initializeAuth,
  clearAuthData
};
