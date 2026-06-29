import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, destroySession } from '@/lib/auth'
import { getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const token = getSessionToken(req.headers.get('cookie'))
  await destroySession(token)
  const res = NextResponse.json({ success: true })
  res.cookies.delete(SESSION_COOKIE_NAME)
  return res
}
