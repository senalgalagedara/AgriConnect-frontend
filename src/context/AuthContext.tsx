"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { apiRequest, ApiError } from '@/lib/api';

export interface AuthUser {
  // Auth user id now strictly number
  id: number;
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
  const hasLoggedInitial401 = useRef(false);

  function normalizeUser(raw: any | null): AuthUser | null {
    if (!raw) return null;
    const numericId = typeof raw.id === 'number' ? raw.id : parseInt(raw.id, 10);
    if (Number.isNaN(numericId)) {
      console.warn('normalizeUser: received non-numeric id, defaulting to 0', raw.id);
    }
    const u: AuthUser = {
      id: Number.isNaN(numericId) ? 0 : numericId,
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

  // Sessions removed. Auth state is driven by explicit login/logout responses.
  // Initial state remains unauthenticated until login action populates it.
  useEffect(() => { setLoading(false); }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<{ user: any }>(`/auth/login`, { method: 'POST', body: { email, password } });
      // Expect login endpoint to return user object on success. Store it in memory.
      if (data && (data as any).user) {
        setUser(normalizeUser((data as any).user));
      } else {
        // If backend no longer returns user, keep user null and rely on token-based flows elsewhere
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Attempt to notify backend about logout if endpoint exists; ignore failures.
      try { await apiRequest(`/auth/logout`, { method: 'POST' }); } catch (e) { /* ignore */ }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    // Sessions removed; refresh is a no-op. If you implement a token-based refresh endpoint,
    // replace this with an API call that returns the current user.
    return Promise.resolve();
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
