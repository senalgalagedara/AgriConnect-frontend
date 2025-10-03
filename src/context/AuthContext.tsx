"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { apiRequest, ApiError } from '@/lib/api';

export interface AuthUser {
  id: string | number;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  displayName?: string; // derived
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function normalizeUser(raw: any | null): AuthUser | null {
    if (!raw) return null;
    const u: AuthUser = {
      id: raw.id,
      email: raw.email,
      role: raw.role,
      firstName: raw.first_name || raw.firstName,
      lastName: raw.last_name || raw.lastName,
      contactNumber: raw.contact_number || raw.contactNumber,
      address: raw.address,
      createdAt: raw.created_at ? new Date(raw.created_at) : (raw.createdAt ? new Date(raw.createdAt) : undefined),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : (raw.updatedAt ? new Date(raw.updatedAt) : undefined),
    };
    u.displayName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
    return u;
  }

  const fetchSession = useCallback(async () => {
    try {
      const data = await apiRequest<{ user: any | null }>(`/auth/session`);
      setUser(normalizeUser(data.user));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null); // session expired
      } else {
        // network or server error -> keep existing user state but could log
        console.warn('Session fetch failed', err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // Periodic refresh every 10 minutes & on window focus (if user present)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let interval: any;
    const startInterval = () => {
      interval = setInterval(() => {
        fetchSession();
      }, 10 * 60 * 1000);
    };
    startInterval();
    const onFocus = () => {
      fetchSession();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<{ user: any }>(`/auth/login`, { method: 'POST', body: { email, password } });
      setUser(normalizeUser(data.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest(`/auth/logout`, { method: 'POST' });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchSession();
  };

  const isAuthenticated = !!user;
  const hasRole = (...roles: string[]) => {
    if (!user?.role) return false;
    return roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
