import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  // Define navigation items for each role
  const getNavigationItems = () => {
    const role = user?.role;
    
    if (role === 'ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/policies', label: 'All Policies', icon: '📋' },
        { path: '/admin/upload-policy', label: 'Upload Policy', icon: '📤' },
        { path: '/admin/compare', label: 'Compare Policies', icon: '⚖️' },
        { path: '/admin/claims', label: 'All Claims', icon: '📝' },
        { path: '/admin/submit-claim', label: 'Submit Claim', icon: '✍️' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
      ];
    } else if (role === 'BROKER') {
      return [
        { path: '/broker/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/broker/policies', label: 'My Policies', icon: '📋' },
        { path: '/broker/upload', label: 'Upload Policy', icon: '📤' },
        { path: '/broker/compare', label: 'Compare Policies', icon: '⚖️' },
        { path: '/broker/claims', label: 'Claims', icon: '📝' },
        { path: '/broker/submit-claim', label: 'Submit Claim', icon: '✍️' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
        { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
      ];
    } else { // USER
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        // USER-facing policies route should map to the public consumer view
        { path: '/policies', label: 'Available Policies', icon: '📋' },
        { path: '/user/compare', label: 'Compare Policies', icon: '⚖️' },
        { path: '/user/claims', label: 'My Claims', icon: '📝' },
        { path: '/user/submit-claim', label: 'Submit Claim', icon: '✍️' },
        { path: '/user/chatbot', label: 'AI Assistant', icon: '🤖' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-sm">
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
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
            >
              <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Role Badge */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
            user?.role === 'BROKER' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user?.role}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;