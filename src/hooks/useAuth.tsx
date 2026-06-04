'use client';
import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';
import type { AuthToken } from '@/utils/api';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  refreshAccessToken as refreshStoredAccessToken,
  setStoredAuthToken,
  subscribeToAuthTokenChange,
} from '@/utils/api';

interface AuthContextType {
  token: AuthToken | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const syncToken = () => {
      const storedToken = getStoredAuthToken();
      setToken(storedToken);
      if (storedToken) scheduleRefresh(storedToken);
    };

    syncToken();
    setIsLoading(false);
    return subscribeToAuthTokenChange(syncToken);
  }, []);

  function scheduleRefresh(tok: AuthToken) {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

    try {
      // Decode JWT to get expiration time
      const parts = tok.access.split('.');
      if (parts.length !== 3) return;

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expiresAt = payload.exp ? payload.exp * 1000 : null;

      if (!expiresAt) return;

      // Schedule refresh 5 minutes before expiry
      const now = Date.now();
      const refreshAt = expiresAt - 5 * 60 * 1000;
      const timeUntilRefresh = Math.max(0, refreshAt - now);

      if (timeUntilRefresh > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken(tok.refresh);
        }, timeUntilRefresh);
      }
    } catch {
      // Silently fail — token decode errors don't prevent auth
    }
  }

  async function refreshAccessToken(refreshTokenValue: string) {
    try {
      const newTokens = await refreshStoredAccessToken(refreshTokenValue);
      if (!newTokens) throw new Error('Token refresh failed');
      setToken(newTokens);
      scheduleRefresh(newTokens);
    } catch (e) {
      console.error('Token refresh error:', e);
      logout();
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/common/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Login failed');
      }
      const data = await res.json();
      const tokens: AuthToken = {
        access: data.data?.accessToken || data.accessToken,
        refresh: data.data?.refreshToken || data.refreshToken,
      };
      setToken(tokens);
      setStoredAuthToken(tokens);
      scheduleRefresh(tokens);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshToken() {
    if (!token) throw new Error('No token available');
    await refreshAccessToken(token.refresh);
  }

  function logout() {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    setToken(null);
    clearStoredAuthToken();
  }

  return (
    <AuthContext.Provider value={{ token, isLoading, error, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
