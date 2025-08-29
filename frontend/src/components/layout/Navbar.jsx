import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <ul className="flex space-x-4">
        <li><Link to="/dashboard">Dashboard</Link></li>
        {user.role === 'ADMIN' && <li><Link to="/admin/dashboard">Admin</Link></li>}
        { (user.role === 'UPLOADER' || user.role === 'ADMIN') && <li><Link to="/broker/upload">Upload Policy</Link></li>}
        <li><Link to="/chatbot">Chatbot</Link></li>
        <li><button onClick={logout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;