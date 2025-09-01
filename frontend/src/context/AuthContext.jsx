import React, { createContext, useState, useEffect } from 'react';
import { login, register } from '../api/authService';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // fetch profile
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const signIn = async (username, password) => {
    const data = await login(username, password);
    localStorage.setItem('token', data.token);
    // fetch profile
    const res = await apiClient.get('/auth/me');
    setUser(res.data);
  };

  const signUp = async (username, password, role) => {
    const data = await register(username, password, role);
    localStorage.setItem('token', data.token);
    const res = await apiClient.get('/auth/me');
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;