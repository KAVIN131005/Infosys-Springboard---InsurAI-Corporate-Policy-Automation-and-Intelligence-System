import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Define navigation items for each role
  const getNavigationItems = () => {
    const role = user?.role;
    
    if (role === 'ADMIN') {
      // Admin sidebar: focus on system-wide controls and approvals
      return [
        { path: '/admin/dashboard', label: 'Admin Dashboard', icon: '📊' },
        { path: '/admin/policies', label: 'Manage Policies', icon: '📋' },
        { path: '/admin/approvals', label: 'Policy Approvals', icon: '✅' },
        { path: '/admin/claim-approvals', label: 'Claim Approvals', icon: '🔍' },
        { path: '/admin/upload-policy', label: 'Upload Policy', icon: '📤' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
      ];
    } else if (role === 'BROKER') {
      return [
        { path: '/broker/dashboard', label: 'Broker Dashboard', icon: '📊' },
        { path: '/broker/policies', label: 'My Policies', icon: '📋' },
        { path: '/broker/upload', label: 'Upload Policy', icon: '📤' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
        { path: '/submit-claim', label: 'Submit Claim', icon: '✍️' },
        { path: '/claim-status', label: 'Claims Status', icon: '📝' },
      ];
    } else { // USER
      return [
        { path: '/dashboard', label: 'My Dashboard', icon: '📊' },
        { path: '/policies', label: 'Available Policies', icon: '📋' },
        { path: '/user/compare', label: 'Compare Policies', icon: '⚖️' },
        { path: '/claim-status', label: 'My Claims', icon: '📝' },
        { path: '/submit-claim', label: 'Submit Claim', icon: '✍️' },
        { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  // Check if current path matches the nav item path
  const isActivePath = (navPath) => {
    if (navPath === '/dashboard' && location.pathname === '/') return false;
    return location.pathname === navPath || location.pathname.startsWith(navPath + '/');
  };

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-sm min-h-screen">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {user?.role === 'ADMIN' ? 'Admin Panel' : 
             user?.role === 'BROKER' ? 'Broker Panel' : 'User Panel'}
          </h2>
          <p className="text-sm text-gray-600">
            Welcome, {user?.firstName || user?.username}
          </p>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 group ${
                isActivePath(item.path)
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className={`mr-3 text-lg transition-transform duration-200 ${
                isActivePath(item.path) ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Quick Actions Section */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {user?.role === 'USER' && (
              <>
                <Link
                  to="/submit-claim"
                  className="flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <span className="mr-2">⚡</span>
                  Quick Claim
                </Link>
                <Link
                  to="/user/compare"
                  className="flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                >
                  <span className="mr-2">🔍</span>
                  Compare Plans
                </Link>
              </>
            )}
            {user?.role === 'BROKER' && (
              <>
                <Link
                  to="/broker/upload"
                  className="flex items-center px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  <span className="mr-2">📤</span>
                  Upload Policy
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
                >
                  <span className="mr-2">📈</span>
                  View Analytics
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/approvals"
                  className="flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  <span className="mr-2">⚡</span>
                  Pending Approvals
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                >
                  <span className="mr-2">📊</span>
                  System Analytics
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
            user?.role === 'BROKER' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            <span className="mr-1">
              {user?.role === 'ADMIN' ? '👑' : user?.role === 'BROKER' ? '💼' : '👤'}
            </span>
            {user?.role}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {user?.role === 'ADMIN' ? 'System Administrator' :
             user?.role === 'BROKER' ? 'Insurance Broker' :
             'Policy Holder'}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            to="/chatbot"
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <span className="mr-2">💬</span>
            Need Help? Chat with AI
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;