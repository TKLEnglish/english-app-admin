export interface AuthToken {
  access: string;
  refresh: string;
}

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const AUTH_TOKEN_CHANGE_EVENT = 'auth-token-change';

let refreshPromise: Promise<AuthToken | null> | null = null;

export function getStoredAuthToken(): AuthToken | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Partial<AuthToken>;
    if (!parsed.access || !parsed.refresh) return null;
    return { access: parsed.access, refresh: parsed.refresh };
  } catch {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return null;
  }
}

export function setStoredAuthToken(token: AuthToken) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, JSON.stringify(token));
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function subscribeToAuthTokenChange(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function authHeaders(options: RequestInit, token?: string) {
  const headers = new Headers(options.headers);
  const accessToken = token ?? getStoredAuthToken()?.access;

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

export async function refreshAccessToken(refreshTokenValue?: string) {
  if (refreshPromise) return refreshPromise;

  const storedToken = getStoredAuthToken();
  const refreshToken = refreshTokenValue ?? storedToken?.refresh;
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/common/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        if (res.status === 401) clearStoredAuthToken();
        return null;
      }

      const data = await res.json();
      const access = data.data?.accessToken || data.accessToken;
      if (!access) return null;

      const newTokens: AuthToken = {
        access,
        refresh: data.data?.refreshToken || data.refreshToken || refreshToken,
      };
      setStoredAuthToken(newTokens);
      return newTokens;
    } catch {
      clearStoredAuthToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authenticatedFetch(url: string, options: RequestInit = {}, token?: string) {
  const headers = authHeaders(options, token);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Fetch with automatic token refresh on 401
 * Pass the refreshToken callback from useAuth() to enable auto-refresh
 */
export async function authenticatedFetchWithRefresh(
  url: string,
  options: RequestInit = {},
  token?: string,
  onRefresh?: () => Promise<void>,
) {
  let response = await authenticatedFetch(url, options, token);

  if (response.status === 401) {
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshAccessToken();
      }

      const newAccessToken = getStoredAuthToken()?.access;
      if (newAccessToken) {
        response = await authenticatedFetch(url, options, newAccessToken);
      }
    } catch {
      clearStoredAuthToken();
    }
  }

  return response;
}
