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
import TestPage from './pages/TestPage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect based on user role
    switch (user?.role) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
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
            {/* Public Routes */}
            <Route path="/test" element={<TestPage />} />
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
              path="/claim/submit" 
              element={
                <ProtectedRoute>
                  <SubmitClaim />
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
                <ProtectedRoute roles={['ADMIN']}>
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

            {/* Default and Catch-all Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRoutes;