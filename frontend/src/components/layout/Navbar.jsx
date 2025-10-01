import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from '../notifications/NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const getQuickActions = () => {
    const role = user?.role;
    
    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/policies', label: 'Policies' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/chatbot', label: 'AI Assistant' },
      ];
    } else if (role === 'BROKER') {
      return [
        { path: '/broker/dashboard', label: 'Dashboard' },
        { path: '/broker/policies', label: 'Policies' },
        { path: '/chatbot', label: 'AI Assistant' },
      ];
    } else { // USER
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/user/compare', label: 'Compare' },
        { path: '/user/chatbot', label: 'AI Assistant' },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <nav className={`w-full border-b shadow-sm transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🛡️</span>
              <span className={`text-xl font-bold ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>InsurAI</span>
            </Link>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`text-sm transition-colors duration-200 ${
                    isDark 
                      ? 'text-slate-300 hover:text-blue-400' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle removed */}

            {/* User Info */}
            {user && (
              <div className="hidden sm:block">
                <div className={`text-sm font-medium ${
                  isDark ? 'text-slate-200' : 'text-gray-700'
                }`}>
                  {user.firstName || user.username}
                </div>
                <div className={`text-xs ${
                  user.role === 'ADMIN' ? 'text-red-400' :
                  user.role === 'BROKER' ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {user.role}
                </div>
              </div>
            )}

            {/* Notifications */}
            {user && <NotificationBell user={user} />}

            {/* Profile Dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  user?.role === 'ADMIN' ? 'bg-red-500' :
                  user?.role === 'BROKER' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}>
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <button 
                  onClick={logout} 
                  className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;