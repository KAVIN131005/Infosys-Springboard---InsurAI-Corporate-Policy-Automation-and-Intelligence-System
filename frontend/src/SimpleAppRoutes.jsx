import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import SimpleUserDashboard from './pages/dashboard/SimpleUserDashboard';
import BrokerUploadPolicy from './pages/broker/BrokerUploadPolicy';
import BrokerPolicies from './pages/broker/BrokerPolicies';
import PolicyView from './pages/policy/PolicyView';
import PolicyComparePage from './pages/policy/PolicyComparePage';
import SubmitClaim from './pages/claim/SubmitClaim';
import ClaimStatus from './pages/claim/ClaimStatus';
import Chatbot from './pages/chatbot/Chatbot';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import TestPage from './pages/TestPage';

// Theme removed: using light-mode styles only

function SimpleAppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Test Routes */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<SimpleUserDashboard />} />
          <Route path="/dashboard/simple" element={<SimpleUserDashboard />} />
          <Route path="/dashboard/full" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Policy Routes */}
          <Route path="/policy/view/:id" element={<PolicyView />} />
          <Route path="/policy/compare" element={<PolicyComparePage />} />
          
          {/* Claim Routes */}
          <Route path="/claim/submit" element={<SubmitClaim />} />
          <Route path="/claim/status" element={<ClaimStatus />} />
          
          {/* Other Routes */}
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          
          {/* Broker Routes */}
          <Route path="/broker/upload" element={<BrokerUploadPolicy />} />
          <Route path="/broker/policies" element={<BrokerPolicies />} />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/test" replace />} />
          <Route path="*" element={<Navigate to="/test" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SimpleAppRoutes;
