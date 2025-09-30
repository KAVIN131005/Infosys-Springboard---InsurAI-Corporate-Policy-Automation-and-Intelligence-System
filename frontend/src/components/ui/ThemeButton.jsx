import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const { isDark } = useTheme();

  const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const variantClasses = {
    primary: isDark
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-blue-500'
      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-blue-500',
    secondary: isDark
      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500 focus:ring-slate-500'
      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 focus:ring-gray-500',
    success: isDark
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-green-500'
      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-green-500',
    danger: isDark
      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-red-500'
      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-red-500',
    warning: isDark
      ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-yellow-500'
      : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-yellow-500',
    ghost: isDark
      ? 'text-slate-300 hover:text-white hover:bg-slate-800 focus:ring-slate-500'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    outline: isDark
      ? 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white focus:ring-blue-500'
      : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white focus:ring-blue-500'
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemeButton;