import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const token = createSession(user.id)
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    })
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error('[login]', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
