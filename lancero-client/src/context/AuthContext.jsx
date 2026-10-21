import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists in localStorage, verify it against
  // the server and restore the session instead of forcing a re-login
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // The axios interceptor fires this when the server says our token is invalid/expired
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async ({ name, email }) => {
  const res = await api.put('/user/me/profile', { name, email });

  const updatedUser = { ...user, name: res.data.name, email: res.data.email };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  setUser(updatedUser);

  return updatedUser;
};

const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.put('/user/me/password', { currentPassword, newPassword });
  return res.data;
};

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};