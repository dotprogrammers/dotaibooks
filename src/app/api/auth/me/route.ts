import { NextResponse } from 'next/server'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const token = getSessionToken(req.headers.get('cookie'))
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user })
}
