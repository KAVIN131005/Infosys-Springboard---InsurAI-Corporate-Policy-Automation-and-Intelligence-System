import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { hasValidToken } from '../utils/authUtils';

// Custom hook to handle authentication state during app initialization
export const useAuthGuard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // After the auth context has finished loading, mark initial load as complete
    if (!loading) {
      setInitialLoad(false);
    }
  }, [loading]);

  // During initial load, if we have a valid token, assume authenticated
  // This prevents flashing of login page during app startup
  const isAuthenticatedOrHasValidToken = isAuthenticated || (initialLoad && hasValidToken());

  return {
    user,
    isAuthenticated: isAuthenticatedOrHasValidToken,
    loading: loading || initialLoad,
    initialLoad
  };
};

export default useAuthGuard;
