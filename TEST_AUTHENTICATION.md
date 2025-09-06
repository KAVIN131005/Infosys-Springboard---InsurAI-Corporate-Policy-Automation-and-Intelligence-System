# JWT Authentication Test Guide

## Test Cases to Verify Authentication Fix

The JWT authentication has been updated to resolve the issue where page refresh redirects to login instead of maintaining the current page. Here's how to test the complete authentication flow:

### 1. Initial Authentication Test
1. Open browser and navigate to `http://localhost:3000`
2. Should redirect to login page if not authenticated
3. Login with valid credentials
4. Should redirect to dashboard or intended page

### 2. Page Refresh Test (Primary Issue)
1. After successful login, navigate to any protected page:
   - Dashboard: `/dashboard`
   - Claims: `/claims`
   - Policies: `/policies`
   - Any other protected route
2. **Perform a page refresh (F5 or Ctrl+R)**
3. **Expected Result**: Should stay on the same page without redirecting to login
4. **Previous Issue**: Was redirecting to signup/login page

### 3. Token Persistence Test
1. Login successfully
2. Close browser tab (not entire browser)
3. Open new tab and navigate to `http://localhost:3000`
4. Should remain authenticated and go to dashboard

### 4. Token Expiration Test
1. Login successfully
2. Wait for token to expire (or manually clear localStorage)
3. Try to navigate to protected page
4. Should redirect to login

### 5. Deep Link Test
1. Logout if authenticated
2. Try to access a deep link like `http://localhost:3000/dashboard`
3. Should redirect to login
4. After login, should redirect back to `/dashboard`

## What Was Fixed

### Frontend Changes:
1. **AuthContext.jsx**: Enhanced with immediate token validation and background verification
2. **AppRoutes.jsx**: Improved ProtectedRoute with better loading states and token validation
3. **authUtils.js**: Added token validation with 5-minute buffer for expiration
4. **authService.js**: Enhanced token handling and verification
5. **Login.jsx**: Improved redirect handling after successful login

### Backend Changes:
1. **AuthController.java**: Added `/api/auth/verify` and `/api/auth/refresh` endpoints
2. **AuthService.java**: Added token verification and refresh functionality
3. **JwtService.java**: Enhanced JWT token validation

## Key Improvements:
1. **Immediate Token Validation**: Auth state initializes immediately with stored token
2. **Token Buffer**: 5-minute buffer before token expiration for better UX
3. **Background Verification**: Async token verification doesn't block UI
4. **Better Loading States**: Proper loading indicators during auth checks
5. **Enhanced Error Handling**: Better error handling for expired/invalid tokens

## Test Commands (if needed):

### Check if services are running:
```bash
# Backend (should show Spring Boot app on port 8080)
curl http://localhost:8080/api/auth/verify -H "Authorization: Bearer YOUR_TOKEN"

# Frontend (should show Vite dev server on port 3000)
curl http://localhost:3000
```

### Manual Token Test:
```bash
# Login and get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Verify token
curl http://localhost:8080/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Behavior After Fix:
- ✅ Page refresh maintains current location
- ✅ Authentication state persists across page reloads
- ✅ Smooth user experience without unexpected redirects
- ✅ Proper handling of expired tokens
- ✅ Background token verification without blocking UI

## Common Issues to Check:
1. Ensure both backend (8080) and frontend (3000) are running
2. Check browser console for any authentication errors
3. Verify localStorage contains valid token after login
4. Check network tab for authentication API calls
