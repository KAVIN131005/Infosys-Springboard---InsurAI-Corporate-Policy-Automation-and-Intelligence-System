// Authentication utilities for better state management

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state'
};

// Store authentication state
export const storeAuthState = (isAuthenticated, user = null) => {
  try {
    const authState = {
      isAuthenticated,
      user,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
  } catch (error) {
    console.error('Failed to store auth state:', error);
  }
};

// Get stored authentication state
export const getStoredAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_STATE);
    if (!stored) return null;
    
    const authState = JSON.parse(stored);
    
    // Check if stored state is too old (older than 1 hour)
    const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    if (Date.now() - authState.timestamp > maxAge) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_STATE);
      return null;
    }
    
    return authState;
  } catch (error) {
    console.error('Failed to get stored auth state:', error);
    localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_STATE);
    return null;
  }
};

// Clear authentication state
export const clearStoredAuthState = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_STATE);
  } catch (error) {
    console.error('Failed to clear stored auth state:', error);
  }
};

// Check if token exists and is not expired
export const hasValidToken = () => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (!token) return false;
    
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check expiration with a buffer (5 minutes)
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    const buffer = 300; // 5 minutes buffer
    
    return payload.exp > (currentTime + buffer);
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Check if token is about to expire (within 10 minutes)
export const isTokenNearExpiry = () => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (!token) return true;
    
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    const buffer = 600; // 10 minutes
    
    return payload.exp < (currentTime + buffer);
  } catch (error) {
    return true;
  }
};

// Get redirect path based on user role
export const getRedirectPath = (userRole) => {
  switch (userRole) {
    case 'ADMIN':
      return '/admin';
    case 'BROKER':
      return '/broker/policies';
    case 'USER':
    default:
      return '/dashboard';
  }
};

// Check if current path requires authentication
export const isProtectedRoute = (pathname) => {
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  return !publicPaths.includes(pathname);
};

// Check if current path is a public route that should redirect authenticated users
export const isPublicRoute = (pathname) => {
  const publicAuthPaths = ['/login', '/register'];
  return publicAuthPaths.includes(pathname);
};
