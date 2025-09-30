import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
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
    <aside className={`hidden md:block w-64 border-r shadow-sm transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="mb-6">
          <h2 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {user?.role === 'ADMIN' ? 'Admin Panel' : 
             user?.role === 'BROKER' ? 'Broker Panel' : 'User Panel'}
          </h2>
          <p className={`text-sm ${
            isDark ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Welcome, {user?.firstName || user?.username}
          </p>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${
                isActivePath(item.path)
                  ? isDark
                    ? 'bg-blue-900/50 text-blue-300 border-r-2 border-blue-400'
                    : 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : isDark
                    ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
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

        {/* Role Badge */}
        <div className={`mt-6 pt-4 border-t ${
          isDark ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user?.role === 'ADMIN' 
              ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
              : user?.role === 'BROKER' 
                ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
          }`}>
            {user?.role}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;