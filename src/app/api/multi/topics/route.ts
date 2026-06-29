import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/multi/topics?certificationId=xxx&categoryId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const certificationId = searchParams.get('certificationId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    if (!certificationId) return NextResponse.json({ topics: [] })

    const where: Record<string, unknown> = { certificationId }
    if (categoryId) where.categoryIdNum = categoryId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
      ]
    }
    const topics = await db.topic.findMany({ where, orderBy: [{ categoryIdNum: 'asc' }, { order: 'asc' }] })
    const parsed = topics.map((t) => ({ ...t, keyConcepts: safeParse(t.keyConcepts, []) }))
    return NextResponse.json({ topics: parsed })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
