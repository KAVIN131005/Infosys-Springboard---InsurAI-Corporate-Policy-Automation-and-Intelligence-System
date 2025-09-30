import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeCard = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  ...props 
}) => {
  const { isDark } = useTheme();

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: ''
  };

  const baseClasses = `rounded-xl border transition-all duration-300 ${
    hover ? 'hover:scale-105 cursor-pointer' : ''
  }`;

  const themeClasses = isDark
    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
    : 'bg-white border-gray-200 hover:shadow-xl shadow-lg';

  const combinedClasses = `${baseClasses} ${themeClasses} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default ThemeCard;