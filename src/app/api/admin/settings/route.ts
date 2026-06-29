import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// GET all settings (raw, for admin)
export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const settings = await db.setting.findMany()
    const grouped: Record<string, Record<string, unknown>> = {}
    for (const s of settings) { (grouped[s.group] ||= {})[s.key] = safeParse(s.value, null) }
    return NextResponse.json({ settings: grouped })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

// PUT — bulk update settings { settings: { group: { key: value } } }
export async function PUT(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const body = (await req.json()) as { settings: Record<string, Record<string, unknown>> }
    for (const [group, keys] of Object.entries(body.settings)) {
      for (const [key, value] of Object.entries(keys)) {
        await db.setting.upsert({ where: { key }, create: { key, value: JSON.stringify(value), group }, update: { value: JSON.stringify(value) } })
      }
    }
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
