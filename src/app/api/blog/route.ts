import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
export async function GET() {
  const posts = await db.blogPost.findMany({ where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true, authorName: true, publishedAt: true, views: true } })
  return NextResponse.json({ posts: posts.map((p) => ({ ...p, tags: safeParse(p.tags, []) })) })
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
