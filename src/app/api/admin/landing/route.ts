import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// GET all landing sections + testimonials
export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const sections = await db.landingSection.findMany({ orderBy: { sortOrder: 'asc' } })
    const testimonials = await db.testimonial.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ sections: sections.map((s) => ({ ...s, content: safeParse(s.content, {}) })), testimonials })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

// PUT — update a landing section { sectionKey, title, subtitle, content, isVisible }
export async function PUT(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const body = await req.json()
    if (body.sectionKey) {
      await db.landingSection.upsert({ where: { sectionKey: body.sectionKey }, create: { sectionKey: body.sectionKey, title: body.title || '', subtitle: body.subtitle || '', content: JSON.stringify(body.content || {}), isVisible: body.isVisible ?? true, sortOrder: body.sortOrder ?? 0 }, update: { title: body.title, subtitle: body.subtitle, content: JSON.stringify(body.content || {}), isVisible: body.isVisible, sortOrder: body.sortOrder } })
    }
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
