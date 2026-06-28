import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SYLLABUS_CATEGORIES } from '@/lib/itil-data'

export const runtime = 'nodejs'

// GET /api/topics?categoryId=1  or  /api/topics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const topics = await db.topic.findMany({
      where,
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
    })

    // Parse JSON fields
    const parsed = topics.map((t) => ({
      ...t,
      keyConcepts: safeParse(t.keyConcepts, []),
    }))

    return NextResponse.json({ topics: parsed, categories: SYLLABUS_CATEGORIES })
  } catch (error) {
    console.error('[GET /api/topics]', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
