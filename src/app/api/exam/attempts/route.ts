import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/exam/attempts - list all completed attempts
export async function GET() {
  try {
    const attempts = await db.examAttempt.findMany({
      where: { status: 'completed' },
      include: { exam: true },
      orderBy: { completedAt: 'desc' },
      take: 50,
    })

    const parsed = attempts.map((a) => ({
      id: a.id,
      examId: a.examId,
      examTitle: a.exam.title,
      examType: a.exam.type,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      passed: a.passed,
      timeSpent: a.timeSpent,
      completedAt: a.completedAt,
      categoryBreakdown: safeParse(a.categoryBreakdown || '{}', {}),
      weakAreas: safeParse(a.weakAreas || '[]', []),
    }))

    return NextResponse.json({ attempts: parsed })
  } catch (error) {
    console.error('[GET /api/exam/attempts]', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
