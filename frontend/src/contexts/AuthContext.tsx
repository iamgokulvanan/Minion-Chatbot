import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EmailNotification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  lastEmailNotification: EmailNotification | null;
  dismissEmailNotification: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('minion_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastEmailNotification, setLastEmailNotification] = useState<EmailNotification | null>(null);

  const initAuth = async () => {
    setIsLoading(true);
    try {
      if (token) {
        const u = await api.getMe();
        setUser(u);
      } else {
        // Auto-provision demo account 'Rolex' for zero-friction launch
        const res = await api.loginDemo();
        localStorage.setItem('minion_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        if (res.email_notification) {
          setLastEmailNotification(res.email_notification);
        }
      }
    } catch (e) {
      // Fallback to demo
      try {
        const res = await api.loginDemo();
        localStorage.setItem('minion_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        if (res.email_notification) {
          setLastEmailNotification(res.email_notification);
        }
      } catch (err) {
        console.error('Failed to init auth', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('minion_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.email_notification) {
      setLastEmailNotification(res.email_notification);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    localStorage.setItem('minion_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.email_notification) {
      setLastEmailNotification(res.email_notification);
    }
  };

  const loginDemo = async () => {
    const res = await api.loginDemo();
    localStorage.setItem('minion_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.email_notification) {
      setLastEmailNotification(res.email_notification);
    }
  };

  const logout = () => {
    localStorage.removeItem('minion_token');
    setToken(null);
    setUser(null);
    setLastEmailNotification(null);
    loginDemo();
  };

  const dismissEmailNotification = () => {
    setLastEmailNotification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        lastEmailNotification,
        dismissEmailNotification,
        login,
        register,
        loginDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
