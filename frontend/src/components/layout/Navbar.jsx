import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">Insur</Link>
            <Link to="/policy/compare" className="text-sm text-gray-600 hover:text-gray-800">Compare</Link>
            <Link to="/chatbot" className="text-sm text-gray-600 hover:text-gray-800">Chatbot</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && <div className="text-sm text-gray-700">{user.username} ({user.role})</div>}
            <button onClick={logout} className="px-3 py-1 bg-gray-100 rounded text-sm">Sign out</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;