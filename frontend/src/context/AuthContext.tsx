import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, saveToken, getToken, clearToken } from '@/src/api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  dob?: string | null;
  anniversary?: string | null;
  address?: string | null;
  kids?: Array<{ name?: string; gender?: string; age?: number; dob?: string }>;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const data = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      await clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; user: User }>(
      '/auth/login',
      { email, password },
      { auth: false }
    );
    await saveToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const data = await api.post<{ access_token: string; user: User }>(
      '/auth/register',
      { name, email, phone, password },
      { auth: false }
    );
    await saveToken(data.access_token);
    setUser(data.user);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const updateProfile = async (patch: Partial<User>) => {
    const data = await api.put<User>('/auth/profile', patch);
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
