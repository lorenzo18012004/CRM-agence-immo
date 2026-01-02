import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  agencyCode: string | null;
  verifyAgency: (code: string) => Promise<any>;
  login: (email: string, password: string, agencyCode: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://votre-backend-url.vercel.app/api' : 'http://localhost:5000/api');

axios.defaults.baseURL = API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [agencyCode, setAgencyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyAgency = async (code: string) => {
    const response = await axios.post('/auth/verify-agency', { code });
    setAgencyCode(code);
    localStorage.setItem('agencyCode', code);
    return response.data.agency;
  };

  const login = async (email: string, password: string, agencyCode: string) => {
    const response = await axios.post('/auth/login', { email, password, agencyCode });
    const { user, token } = response.data;
    setUser(user);
    setToken(token);
    setAgencyCode(agencyCode);
    localStorage.setItem('token', token);
    localStorage.setItem('agencyCode', agencyCode);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAgencyCode(null);
    localStorage.removeItem('token');
    localStorage.removeItem('agencyCode');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const storedAgencyCode = localStorage.getItem('agencyCode');
    if (storedAgencyCode) {
      setAgencyCode(storedAgencyCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, agencyCode, verifyAgency, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

