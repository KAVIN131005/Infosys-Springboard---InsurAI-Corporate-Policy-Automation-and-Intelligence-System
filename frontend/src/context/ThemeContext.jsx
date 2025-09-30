import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('insurAI-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('insurAI-theme', theme);
    
    // Apply theme class to document body
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Update CSS custom properties based on theme
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-color', '#475569');
      root.style.setProperty('--blue-primary', '#3b82f6');
      root.style.setProperty('--blue-secondary', '#1d4ed8');
      root.style.setProperty('--blue-accent', '#60a5fa');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--blue-primary', '#3b82f6');
      root.style.setProperty('--blue-secondary', '#1d4ed8');
      root.style.setProperty('--blue-accent', '#60a5fa');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};