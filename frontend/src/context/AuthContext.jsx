import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vivimart_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vivimart_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('vivimart_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('vivimart_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('vivimart_token');
          localStorage.removeItem('vivimart_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('vivimart_token', newToken);
      localStorage.setItem('vivimart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role = 'BUYER') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('vivimart_token', newToken);
      localStorage.setItem('vivimart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      showToast('Account created successfully!', 'success');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('vivimart_token');
    localStorage.removeItem('vivimart_user');
    setToken(null);
    setUser(null);
    if (notify) {
      showToast('Logged out successfully', 'info');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
