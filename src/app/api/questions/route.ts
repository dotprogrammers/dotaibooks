import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SYLLABUS_CATEGORIES } from '@/lib/itil-data'

export const runtime = 'nodejs'

// GET /api/questions?categoryId=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '0', 10)

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId

    const questions = await db.question.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      ...(limit > 0 ? { take: limit } : {}),
    })

    const parsed = questions.map((q) => ({
      ...q,
      options: safeParse(q.options, []),
      rationales: safeParse(q.rationales, {}),
    }))

    // Stats per category
    const stats = await Promise.all(
      SYLLABUS_CATEGORIES.map(async (c) => {
        const count = await db.question.count({ where: { categoryId: c.id } })
        return { categoryId: c.id, categoryName: c.name, count }
      })
    )

    // True total count across all questions (not limited by `take`)
    const total = categoryId
      ? await db.question.count({ where: { categoryId } })
      : await db.question.count()

    return NextResponse.json({ questions: parsed, stats, total })
  } catch (error) {
    console.error('[GET /api/questions]', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
