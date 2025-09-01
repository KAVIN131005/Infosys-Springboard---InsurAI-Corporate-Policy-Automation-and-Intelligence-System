import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await signUp(username, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create account</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
      <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded w-full mt-2">
        <option value="USER">User</option>
        <option value="UPLOADER">Uploader</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button onClick={handleRegister} disabled={loading} className="mt-3 w-full">{loading ? 'Creating...' : 'Create account'}</Button>
      <div className="mt-3 text-sm">
        Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;