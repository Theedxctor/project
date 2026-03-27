'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface User { id: number; name: string; email: string; role: 'Admin' | 'Vendor_Staff' | 'Student'; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; isLoading: boolean; }

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sf_token');
    const storedUser = localStorage.getItem('sf_user');
    if (storedToken && storedUser) { setToken(storedToken); setUser(JSON.parse(storedUser)); }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('sf_token', t);
    localStorage.setItem('sf_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('sf_token'); localStorage.removeItem('sf_user');
    setToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
