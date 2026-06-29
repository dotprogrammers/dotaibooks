import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const users = await db.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true, createdAt: true }, take: 200 })
    return NextResponse.json({ users })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

// PATCH /api/admin/users?id=xxx — update role/active
export async function PATCH(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.role) data.role = body.role
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive
    if (body.name) data.name = body.name
    await db.user.update({ where: { id }, data })
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
    await db.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
