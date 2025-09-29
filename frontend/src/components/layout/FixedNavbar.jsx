import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from '../notifications/NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getQuickActions = () => {
    const role = user?.role;
    
    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/policies', label: 'Policies' },
        { path: '/admin/approvals', label: 'Approvals' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/chatbot', label: 'AI Assistant' },
      ];
    } else if (role === 'BROKER') {
      return [
        { path: '/broker/dashboard', label: 'Dashboard' },
        { path: '/broker/policies', label: 'Policies' },
        { path: '/broker/upload', label: 'Upload' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/chatbot', label: 'AI Assistant' },
      ];
    } else { // USER
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/policies', label: 'Policies' },
        { path: '/user/compare', label: 'Compare' },
        { path: '/submit-claim', label: 'Claims' },
        { path: '/chatbot', label: 'AI Assistant' },
      ];
    }
  };

  const quickActions = getQuickActions();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (user) {
      // Navigate to appropriate dashboard based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'BROKER':
          navigate('/broker/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold text-blue-600">InsurAI</span>
            </button>
            
            {/* Quick Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-md ${
                    isActivePath(action.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Indicators */}
            {user && (
              <div className="hidden lg:flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">Online</span>
                </div>
                <div className="text-gray-400">|</div>
                <div className={`font-medium ${
                  user.role === 'ADMIN' ? 'text-red-600' :
                  user.role === 'BROKER' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {user.role}
                </div>
              </div>
            )}

            {/* User Info */}
            {user && (
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-700 font-medium">
                  {user.firstName || user.username}
                </div>
                <div className="text-xs text-gray-500">
                  {user.email || `${user.role.toLowerCase()}@insurai.com`}
                </div>
              </div>
            )}

            {/* Notifications */}
            {user && <NotificationBell user={user} />}

            {/* Profile Dropdown */}
            <div className="relative flex items-center space-x-2">
              {/* Profile Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                user?.role === 'ADMIN' ? 'bg-red-500' :
                user?.role === 'BROKER' ? 'bg-blue-500' :
                'bg-green-500'
              }`}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Quick Access - Mobile */}
                <div className="md:hidden">
                  <button
                    onClick={() => {
                      const targetPath = user?.role === 'ADMIN' ? '/admin/dashboard' :
                                       user?.role === 'BROKER' ? '/broker/dashboard' : '/dashboard';
                      navigate(targetPath);
                    }}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs text-blue-700 transition-colors"
                  >
                    Dashboard
                  </button>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                  isActivePath(action.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;