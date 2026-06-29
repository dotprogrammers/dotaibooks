import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const plans = await db.plan.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ plans: plans.map((p) => ({ ...p, features: safeParse(p.features, []) })) })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const body = await req.json()
    const { id, ...data } = body
    const update: Record<string, unknown> = { ...data }
    if (data.features) update.features = JSON.stringify(data.features)
    if (id) {
      await db.plan.update({ where: { id }, data: update })
    } else {
      await db.plan.create({ data: { name: data.name, slug: data.slug, description: data.description || '', priceMonthly: Number(data.priceMonthly) || 0, priceYearly: Number(data.priceYearly) || 0, currency: data.currency || 'USD', features: JSON.stringify(data.features || []), isPopular: data.isPopular || false, isActive: data.isActive ?? true, sortOrder: Number(data.sortOrder) || 0 } })
    }
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.plan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
