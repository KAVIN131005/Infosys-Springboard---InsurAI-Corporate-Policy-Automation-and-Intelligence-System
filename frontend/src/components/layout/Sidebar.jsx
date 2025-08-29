import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="bg-gray-200 p-4 w-64">
      <ul>
        <li><Link to="/policy/compare">Compare Policies</Link></li>
        <li><Link to="/claim/submit">Submit Claim</Link></li>
        <li><Link to="/claim/status">Claim Status</Link></li>
        {user.role === 'ADMIN' && <li><Link to="/analytics">Analytics</Link></li>}
      </ul>
    </aside>
  );
};

export default Sidebar;