import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'USER' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) { // Reduced for demo
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call with mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const mockUsers = {
        'admin': { username: 'admin', role: 'ADMIN', email: 'admin@insur.com', id: 1 },
        'broker': { username: 'broker', role: 'BROKER', email: 'broker@insur.com', id: 2 },
        'user': { username: 'user', role: 'USER', email: 'user@insur.com', id: 3 }
      };

      const user = mockUsers[formData.username.toLowerCase()];
      
      if (user && (formData.password === 'password' || formData.password === 'password123')) {
        // Store token and user data
        localStorage.setItem('token', `mock_token_${user.username}`);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on role
        let redirectTo;
        switch (user.role) {
          case 'ADMIN':
            redirectTo = '/admin';
            break;
          case 'BROKER':
            redirectTo = '/broker/policies';
            break;
          default:
            redirectTo = '/dashboard';
        }
        
        window.location.href = redirectTo;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      'ADMIN': { username: 'admin', password: 'password' },
      'BROKER': { username: 'broker', password: 'password' },
      'USER': { username: 'user', password: 'password' }
    };
    
    const creds = demoCredentials[role];
    setFormData({
      username: creds.username,
      password: creds.password,
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your InsurAI account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Login As
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="USER">👤 User</option>
                <option value="BROKER">🏢 Broker</option>
                <option value="ADMIN">⚙️ Admin</option>
              </select>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  📧
                </span>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ {errors.password}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  ❌ {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner size={5} />
                  <span className="ml-2">Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-600 text-center font-medium">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('ADMIN')}
                className="text-xs px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                disabled={isLoading}
              >
                ⚙️ Admin
              </button>
              <button
                onClick={() => handleDemoLogin('BROKER')}
                className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                🏢 Broker
              </button>
              <button
                onClick={() => handleDemoLogin('USER')}
                className="text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                👤 User
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Demo Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> admin / password</div>
            <div><strong>Broker:</strong> broker / password</div>
            <div><strong>User:</strong> user / password</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;