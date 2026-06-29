import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

// GET current user's memberships & subscription
export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ memberships: [], subscription: null })
    const memberships = await db.membership.findMany({ where: { userId: user.id }, include: { certification: true, plan: true } })
    const subscription = await db.subscription.findFirst({ where: { userId: user.id, status: 'active' }, include: { plan: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ memberships, subscription })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
