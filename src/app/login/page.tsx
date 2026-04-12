'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TextField } from '@/components/text-field/TextField'
import { Button } from '@/components/button/Button'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      router.push('/vocabulary')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--glass-shadow)',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
          Admin Login
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
          Sign in to manage vocabulary, categories, and users
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <TextField
            label="Email"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={setEmail}
            disabled={loading}
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={setPassword}
            disabled={loading}
            required
          />

          <Button
            variant="primary"
            type="submit"
            fullWidth
            loading={loading}
            disabled={!email || !password || loading}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
