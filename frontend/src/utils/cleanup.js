// Clear any existing demo data from localStorage
export const clearDemoData = () => {
  localStorage.removeItem('registered_users');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('refresh_token');
  console.log('Demo data cleared from localStorage');
};

// Initialize clean state - call this once to clean up demo data
export const initializeCleanState = () => {
  clearDemoData();
};
