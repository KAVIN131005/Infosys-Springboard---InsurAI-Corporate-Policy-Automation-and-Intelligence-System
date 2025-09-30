import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { login } from '../../api/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      console.log('Attempting login with:', { username: formData.username });
      
      const result = await login(formData.username, formData.password);
      console.log('Login successful:', { ...result, password: '[HIDDEN]' });
      
      // Update auth context immediately
      loginUser(result.user, result.token);
      
      // Navigate to the intended location or role-based default
      if (from && from !== '/login' && from !== '/register') {
        navigate(from);
      } else {
        // Navigate based on role
        const userRole = result.user.role;
        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else if (userRole === 'BROKER') {
          navigate('/broker/policies');
        } else {
          navigate('/dashboard');
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Invalid username or password';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDark ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <span className="text-white text-2xl">🔐</span>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome Back
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            Sign in to your InsurAI account
          </p>
        </div>

        {/* Login Form */}
        <div className={`rounded-xl shadow-lg p-8 transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white border border-gray-100'
        }`}>
          {/* Success Message from Registration */}
          {location.state?.message && (
            <div className={`mb-6 rounded-lg p-4 border ${
              isDark 
                ? 'bg-green-900/20 border-green-700/30 text-green-300' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✅</span>
                <div>
                  <p className="text-sm font-medium">
                    {location.state.message}
                  </p>
                  {location.state?.registeredUser && (
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      You can now log in with username: <strong>{location.state.registeredUser.username}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username 
                      ? 'border-red-500' 
                      : isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your username or email"
                  disabled={isLoading}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  📧
                </span>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  ⚠️ {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password 
                      ? 'border-red-500' 
                      : isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
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
                <p className="mt-1 text-sm text-red-500">
                  ⚠️ {errors.password}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className={`rounded-lg p-3 border ${
                isDark 
                  ? 'bg-red-900/20 border-red-700/30 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <p className="text-sm">
                  ❌ {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Spinner size={5} />
                  <span className="ml-2">Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/forgot-password" 
              className={`text-sm hover:underline ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Register Link */}
          <div className={`mt-8 pt-6 border-t text-center ${
            isDark ? 'border-slate-600' : 'border-gray-200'
          }`}>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className={`font-medium hover:underline ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;