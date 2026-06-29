import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SYLLABUS_CATEGORIES, EXAM_CONFIG } from '@/lib/itil-data'

export const runtime = 'nodejs'

// GET /api/readiness - readiness assessment
export async function GET() {
  try {
    const readiness = await db.readiness.findFirst()
    const attempts = await db.examAttempt.count({ where: { status: 'completed' } })

    if (!readiness) {
      return NextResponse.json({
        ready: false,
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        recentScores: [],
        categoryMastery: {},
        recommendation: attempts === 0
          ? 'Welcome! Start by exploring the Study Topics, then take practice exams. Complete at least 3 exams for a readiness assessment.'
          : 'Complete more practice exams to get a readiness assessment.',
        categories: SYLLABUS_CATEGORIES,
        config: EXAM_CONFIG,
      })
    }

    return NextResponse.json({
      ...readiness,
      recentScores: safeParse(readiness.recentScores, []),
      categoryMastery: safeParse(readiness.categoryMastery, {}),
      categories: SYLLABUS_CATEGORIES,
      config: EXAM_CONFIG,
    })
  } catch (error) {
    console.error('[GET /api/readiness]', error)
    return NextResponse.json({ error: 'Failed to fetch readiness' }, { status: 500 })
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
