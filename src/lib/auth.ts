import { db } from '@/lib/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
}

const SESSION_COOKIE = 'dota_session'
const SESSIONS = new Map<string, { userId: string; expires: number }>()

// Simple in-memory session store (persists for the dev server lifetime)
export function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  SESSIONS.set(token, { userId, expires: Date.now() + 1000 * 60 * 60 * 24 * 7 }) // 7 days
  return token
}

export function getSession(token: string | undefined): SessionUser | null {
  if (!token) return null
  const session = SESSIONS.get(token)
  if (!session) return null
  if (session.expires < Date.now()) {
    SESSIONS.delete(token)
    return null
  }
  // We can't call async db here synchronously; callers should use getUserFromToken
  return null as unknown as SessionUser
}

export async function getUserFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const session = SESSIONS.get(token)
  if (!session) return null
  if (session.expires < Date.now()) {
    SESSIONS.delete(token)
    return null
  }
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true },
  })
  if (!user || !user.isActive) return null
  return user
}

export function destroySession(token: string | undefined) {
  if (token) SESSIONS.delete(token)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE

// Password hashing using scrypt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const testHash = scryptSync(password, salt, 64)
  const hashBuf = Buffer.from(hash, 'hex')
  return testHash.length === hashBuf.length && timingSafeEqual(testHash, hashBuf)
}

// Parse cookie from header
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=')
    if (k) cookies[k] = v.join('=')
  })
  return cookies
}

export function getSessionToken(cookieHeader: string | null): string | undefined {
  return parseCookies(cookieHeader)[SESSION_COOKIE]
}

export function isAdmin(role: string | undefined | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN'
}

export function isSuperAdmin(role: string | undefined | null): boolean {
  return role === 'SUPER_ADMIN'
}
