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
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <div className="flex">
        {user && <Sidebar />}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/broker/upload" element={<ProtectedRoute roles={['UPLOADER', 'ADMIN']}><BrokerUploadPolicy /></ProtectedRoute>} />
            <Route path="/broker/policies" element={<ProtectedRoute roles={['UPLOADER', 'ADMIN']}><BrokerPolicies /></ProtectedRoute>} />
            <Route path="/policy/view/:id" element={<ProtectedRoute><PolicyView /></ProtectedRoute>} />
            <Route path="/policy/compare" element={<ProtectedRoute><PolicyComparePage /></ProtectedRoute>} />
            <Route path="/claim/submit" element={<ProtectedRoute><SubmitClaim /></ProtectedRoute>} />
            <Route path="/claim/status" element={<ProtectedRoute><ClaimStatus /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute roles={['ADMIN']}><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppRoutes;