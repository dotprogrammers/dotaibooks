'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) { setUser(data.user); return { ok: true } }
    return { ok: false, error: data.error }
  }

  async function register(email: string, password: string, name: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (res.ok) { setUser(data.user); return { ok: true } }
    return { ok: false, error: data.error }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
}

export function useIsSuperAdmin() {
  const { user } = useAuth()
  return user?.role === 'SUPER_ADMIN'
}
