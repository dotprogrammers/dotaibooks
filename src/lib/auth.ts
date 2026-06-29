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
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

/**
 * Create a DB-backed session that survives server restarts.
 */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.session.create({ data: { token, userId, expiresAt } })
  return token
}

/**
 * Look up a session by token in the database and return the associated user.
 * Expired sessions are deleted on read.
 */
export async function getUserFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true } } },
  })
  if (!session) return null
  // Check expiry
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  if (!session.user || !session.user.isActive) return null
  return session.user
}

/**
 * Delete a session by token (logout).
 */
export async function destroySession(token: string | undefined): Promise<void> {
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
  }
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
