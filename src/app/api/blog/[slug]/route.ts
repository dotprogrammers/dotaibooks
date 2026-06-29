import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug } })
  if (!post || post.status !== 'published') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.blogPost.update({ where: { id: post.id }, data: { views: post.views + 1 } })
  return NextResponse.json({ post: { ...post, tags: safeParse(post.tags, []) } })
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
