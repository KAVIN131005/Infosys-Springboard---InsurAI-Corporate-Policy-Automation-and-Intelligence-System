import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

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
        { path: '/broker/compare', label: 'Compare' },
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
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold text-blue-600">InsurAI</span>
            </Link>
            
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="hidden sm:block">
                <div className="text-sm text-gray-700 font-medium">
                  {user.firstName || user.username}
                </div>
                <div className={`text-xs ${
                  user.role === 'ADMIN' ? 'text-red-600' :
                  user.role === 'BROKER' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {user.role}
                </div>
              </div>
            )}

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
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors duration-200"
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