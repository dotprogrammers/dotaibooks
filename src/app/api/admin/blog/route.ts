import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ posts: posts.map((p) => ({ ...p, tags: safeParse(p.tags, []) })) })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const body = await req.json()
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const post = await db.blogPost.create({ data: { title: body.title, slug, excerpt: body.excerpt || '', content: body.content || '', coverImage: body.coverImage || null, tags: JSON.stringify(body.tags || []), authorId: user.id, authorName: user.name || user.email, status: body.status || 'draft', publishedAt: body.status === 'published' ? new Date() : null, seoTitle: body.seoTitle || null, seoDescription: body.seoDescription || null } })
    return NextResponse.json({ post })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const update: Record<string, unknown> = { ...data }
    if (data.tags) update.tags = JSON.stringify(data.tags)
    if (data.status === 'published' && !data.publishedAt) update.publishedAt = new Date()
    await db.blogPost.update({ where: { id }, data: update })
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
    await db.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
