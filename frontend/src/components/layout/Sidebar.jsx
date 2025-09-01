import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden md:block w-64 bg-gray-50 border-r">
      <div className="p-4">
        <nav className="space-y-2">
          <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/policy/compare" className="block px-3 py-2 rounded hover:bg-gray-100">Compare Policies</Link>
          <Link to="/claim/submit" className="block px-3 py-2 rounded hover:bg-gray-100">Submit Claim</Link>
          <Link to="/claim/status" className="block px-3 py-2 rounded hover:bg-gray-100">Claim Status</Link>
          {(user?.role === 'UPLOADER' || user?.role === 'ADMIN') && (
            <Link to="/broker/upload" className="block px-3 py-2 rounded hover:bg-gray-100">Upload Policy</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/analytics" className="block px-3 py-2 rounded hover:bg-gray-100">Analytics</Link>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;