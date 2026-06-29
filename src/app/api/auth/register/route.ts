import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'

interface RegisterBody {
  email: string
  password: string
  name: string
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = (await req.json()) as RegisterBody
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    // First user becomes super admin
    const userCount = await db.user.count()
    const role = userCount === 0 ? 'SUPER_ADMIN' : 'MEMBER'
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name: name || email.split('@')[0],
        role,
      },
    })
    const token = await createSession(user.id)
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
    console.error('[register]', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
