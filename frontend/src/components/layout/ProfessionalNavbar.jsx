import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const publicNavItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/contact', label: 'Contact', icon: '📞' },
  ];

  const authenticatedNavItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/policies', label: 'Policies', icon: '📋' },
    { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
  ] : [];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isDark 
        ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-700' 
        : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
    } shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className={`text-3xl transition-transform group-hover:scale-110 duration-300`}>
              🛡️
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent`}>
              InsurAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Public Navigation */}
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Authenticated Navigation */}
            {user && authenticatedNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className={`hidden sm:block text-right ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  <div className="text-sm font-medium">
                    {user.firstName || user.username}
                  </div>
                  <div className="text-xs capitalize">
                    {user.role?.toLowerCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t ${
            isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[...publicNavItems, ...(user ? authenticatedNavItems : [])].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;