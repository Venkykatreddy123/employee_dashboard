import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          fetchMe();
        } catch (e) {
          console.error('[AuthContext] Identity Refresh Failed:', e);
          fetchMe();
        }
      } else {
        fetchMe();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('[AuthContext] Lifecycle Identity Fetch Failure:', error);
      logout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Identity Handshake through Production Proxy
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      navigate('/');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed - Neural connection broken';
      console.error('[AuthContext] Login Handshake Integrity Failure:', message);
      return { 
        success: false, 
        message: message 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
