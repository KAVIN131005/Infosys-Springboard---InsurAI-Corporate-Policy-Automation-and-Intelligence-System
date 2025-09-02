import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import BrokerUploadPolicy from './pages/broker/BrokerUploadPolicy';
import BrokerPolicies from './pages/broker/BrokerPolicies';
import PolicyView from './pages/policy/PolicyView';
import PolicyComparePage from './pages/policy/PolicyComparePage';
import SubmitClaim from './pages/claim/SubmitClaim';
import ClaimStatus from './pages/claim/ClaimStatus';
import Chatbot from './pages/chatbot/Chatbot';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';

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
        <a 
          href="/login" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In
        </a>
        <a 
          href="/register" 
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return children; // Show login/register while loading
  }
  
  if (isAuthenticated && user) {
    // Redirect based on user role
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'BROKER':
        return <Navigate to="/broker/policies" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

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

            {/* Protected Routes - All Users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/policies" 
              element={
                <ProtectedRoute>
                  <BrokerPolicies />
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
            
            <Route 
              path="/submit-claim" 
              element={
                <ProtectedRoute>
                  <SubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim/submit" 
              element={
                <ProtectedRoute>
                  <SubmitClaim />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim-status" 
              element={
                <ProtectedRoute>
                  <ClaimStatus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/claim/status" 
              element={
                <ProtectedRoute>
                  <ClaimStatus />
                </ProtectedRoute>
              } 
            />
            
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
              path="/analytics" 
              element={
                <ProtectedRoute roles={['ADMIN', 'BROKER']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Broker Routes */}
            <Route 
              path="/broker/upload" 
              element={
                <ProtectedRoute roles={['BROKER', 'ADMIN']}>
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

            {/* Additional User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute roles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Routes */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRoutes;