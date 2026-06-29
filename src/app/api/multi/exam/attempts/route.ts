import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ attempts: [] })
    const { searchParams } = new URL(req.url)
    const certificationId = searchParams.get('certificationId')
    const where: Record<string, unknown> = { userId: user.id, status: 'completed' }
    if (certificationId) where.certificationId = certificationId
    const attempts = await db.examAttempt.findMany({ where, include: { exam: true }, orderBy: { completedAt: 'desc' }, take: 50 })
    return NextResponse.json({ attempts: attempts.map((a) => ({ id: a.id, examId: a.examId, examTitle: a.exam.title, examType: a.exam.type, certificationId: a.certificationId, score: a.score, totalMarks: a.totalMarks, percentage: a.percentage, passed: a.passed, timeSpent: a.timeSpent, completedAt: a.completedAt, categoryBreakdown: safeParse(a.categoryBreakdown || '{}', {}), weakAreas: safeParse(a.weakAreas || '[]', []) })) })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
