import React, { createContext, useState, useEffect } from 'react';
import { login, register } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode or fetch user info
      setUser({ role: localStorage.getItem('role') });
    }
  }, []);

  const signIn = async (username, password) => {
    const data = await login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setUser({ role: data.role });
  };

  const signUp = async (username, password, role) => {
    const data = await register(username, password, role);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setUser({ role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;