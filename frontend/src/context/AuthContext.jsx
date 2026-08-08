import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    getMe().then((u) => setUser(u)).catch(() => localStorage.removeItem('accessToken')).finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => { localStorage.setItem('accessToken', token); setUser(userData); };
  const logout = () => { localStorage.removeItem('accessToken'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
