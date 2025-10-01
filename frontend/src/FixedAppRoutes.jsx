import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboard/CleanAdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import BrokerDashboard from './pages/dashboard/BrokerDashboard';
import BrokerUploadPolicy from './pages/broker/BrokerUploadPolicy';
import BrokerPolicies from './pages/broker/BrokerPolicies';
import UserPolicies from './pages/user/UserPolicies';
import PolicyView from './pages/policy/PolicyView';
import PolicyComparePage from './pages/policy/PolicyComparePage';
import PolicyComparison from './pages/PolicyComparison';
import EnhancedSubmitClaim from './pages/claim/EnhancedSubmitClaim';
import EnhancedClaimStatus from './pages/claim/EnhancedClaimStatus';
import AdminClaimApproval from './pages/admin/AdminClaimApproval';
import Chatbot from './pages/chatbot/Chatbot';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import AdminApprovals from './pages/dashboard/AdminApprovals';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';
import { hasValidToken } from './utils/authUtils';

// Simple Home/Landing Page Component
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
    <div className="text-center max-w-4xl mx-auto px-6">
      <div className="mb-8">
        <div className="text-6xl mb-4">🛡️</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to InsurAI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Insurance Management Platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered Claims</h3>
          <p className="text-gray-600">Intelligent claim processing with fraud detection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
          <p className="text-gray-600">Real-time insights and risk assessment</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Secure Platform</h3>
          <p className="text-gray-600">Enterprise-grade security and compliance</p>
        </div>
      </div>
      
      <div className="space-x-4">
        <button 
          onClick={() => window.location.href = '/login'}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In
        </button>
        <button 
          onClick={() => window.location.href = '/register'}
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();
  
  // If we have a valid token in localStorage, don't redirect immediately
  const hasToken = hasValidToken();
  
  // Show loading while initializing or if we have a token but auth state not ready
  if (loading || !initialized || (hasToken && !isAuthenticated && !user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  // Only redirect to login if we're sure the user is not authenticated
  if (!isAuthenticated && !hasToken) {
    // Store the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user doesn't have required role but is authenticated
  if (roles && user && !roles.includes(user.role)) {
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'BROKER':
        return <Navigate to="/broker/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading, initialized } = useAuth();
  const hasToken = hasValidToken();
  
  // If loading or we have a token but auth state not yet determined, show loading
  if (loading || !initialized || (hasToken && !isAuthenticated && !user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  // If authenticated, redirect based on user role
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'BROKER':
        return <Navigate to="/broker/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

// Role-based dashboard routing
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'BROKER':
      return <BrokerDashboard />;
    default:
      return <UserDashboard />;
  }
};

// Role-based policy routing
const PolicyRoutingComponent = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Route to appropriate policy view based on user role
  switch (user.role) {
    case 'ADMIN':
    case 'BROKER':
      return <BrokerPolicies />;
    default:
      return <UserPolicies />;
  }
};

function AppRoutes() {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Show loading spinner during initial auth check
  if (loading || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'p-4' : ''}`}>
          <Routes>
            {/* Public Home Route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Routes - Universal Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Policies */}
            <Route 
              path="/policies" 
              element={
                <ProtectedRoute>
                  <PolicyRoutingComponent />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/policy/view/:id" 
              element={
                <ProtectedRoute>
                  <PolicyView />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/policy/compare" 
              element={
                <ProtectedRoute>
                  <PolicyComparePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Claims */}
            <Route 
              path="/submit-claim" 
              element={
                <ProtectedRoute>
                  <EnhancedSubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim/submit" 
              element={
                <ProtectedRoute>
                  <EnhancedSubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim-status" 
              element={
                <ProtectedRoute>
                  <EnhancedClaimStatus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim/status" 
              element={
                <ProtectedRoute>
                  <EnhancedClaimStatus />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - AI Chat */}
            <Route 
              path="/chatbot" 
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } 
            />

            {/* Admin Only Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/policies" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <BrokerPolicies />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/claim-approvals"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminClaimApproval />
                </ProtectedRoute>
              }
            />
            
            {/* Admin upload route removed — upload is broker-only */}
            
            <Route 
              path="/admin/compare" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <PolicyComparePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/claims" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <EnhancedClaimStatus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/submit-claim" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <EnhancedSubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            {/* Analytics - Admin and Broker Only */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute roles={['ADMIN', 'BROKER']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Broker Routes */}
            <Route 
              path="/broker" 
              element={
                <ProtectedRoute roles={['BROKER']}>
                  <Navigate to="/broker/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/broker/dashboard" 
              element={
                <ProtectedRoute roles={['BROKER']}>
                  <BrokerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/broker/upload" 
              element={
                <ProtectedRoute roles={['BROKER']}>
                  <BrokerUploadPolicy />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/broker/policies" 
              element={
                <ProtectedRoute roles={['BROKER', 'ADMIN']}>
                  <BrokerPolicies />
                </ProtectedRoute>
              } 
            />

            {/* User-specific Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/policies" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <UserPolicies />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/compare" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <PolicyComparePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/claims" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <EnhancedClaimStatus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/submit-claim" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <EnhancedSubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user/chatbot" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <Chatbot />
                </ProtectedRoute>
              } 
            />

            {/* Alternative comparison routes */}
            <Route 
              path="/compare" 
              element={
                <ProtectedRoute>
                  <PolicyComparePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/comparison" 
              element={
                <ProtectedRoute>
                  <PolicyComparison />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Routes and Redirects */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/login-redirect" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRoutes;