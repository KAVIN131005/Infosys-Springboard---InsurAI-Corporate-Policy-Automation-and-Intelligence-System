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
  // Force light theme permanently. Keep provider to avoid changing many files.
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Always enforce light theme styles. Keep DOM classes stable for any CSS relying on them.
    try {
      const html = document.documentElement;
      const body = document.body;
      html.classList.remove('dark');
      body.classList.remove('theme-dark');
      if (!html.classList.contains('light')) html.classList.add('light');
      if (!body.classList.contains('theme-light')) body.classList.add('theme-light');
      const root = document.documentElement;
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
    } catch (err) {
      // ignore if running outside browser environment (SSR/tests)
    }
  }, [theme]);

  // No-op toggle to keep API surface but prevent switching to dark mode
  const toggleTheme = () => {};

  const value = {
    theme,
    toggleTheme,
    isDark: false,
    isLight: true
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};