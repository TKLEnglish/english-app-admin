'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthToken {
  access: string
  refresh: string
}

interface AuthContextType {
  token: AuthToken | null
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<AuthToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('auth_token')
    if (saved) {
      try {
        setToken(JSON.parse(saved))
      } catch {
        localStorage.removeItem('auth_token')
      }
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/auth/login-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Login failed')
      }
      const data = await res.json()
      const tokens: AuthToken = {
        access: data.data?.accessToken || data.accessToken,
        refresh: data.data?.refreshToken || data.refreshToken,
      }
      setToken(tokens)
      localStorage.setItem('auth_token', JSON.stringify(tokens))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed'
      setError(msg)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ token, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
