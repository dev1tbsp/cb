import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api';

type User = { id: string; name: string; email: string; role: string };

type AdminAuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AdminAuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const tok = await tokenStore.get();
    if (!tok) { setUser(null); setLoading(false); return; }
    try {
      const me = await api.get('/auth/me', true);
      if (me.role !== 'admin') {
        await tokenStore.clear();
        setUser(null);
      } else {
        setUser(me);
      }
    } catch {
      await tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.user.role !== 'admin') {
      throw new Error('Not an admin account');
    }
    await tokenStore.set(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() { return useContext(Ctx); }
