import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const certificationId = searchParams.get('certificationId')
    if (!certificationId) return NextResponse.json({ error: 'certificationId required' }, { status: 400 })

    const cert = await db.certification.findUnique({ where: { id: certificationId }, include: { categories: true } })
    if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const readiness = await db.readiness.findUnique({ where: { userId_certificationId: { userId: user.id, certificationId } } })
    const attempts = await db.examAttempt.count({ where: { userId: user.id, certificationId, status: 'completed' } })

    if (!readiness) {
      return NextResponse.json({ ready: false, totalAttempts: 0, passedAttempts: 0, averageScore: 0, bestScore: 0, recentScores: [], categoryMastery: {}, recommendation: attempts === 0 ? 'Welcome! Start by exploring the study topics, then take practice exams. Complete at least 3 exams for a readiness assessment.' : 'Complete more practice exams.', categories: cert.categories, config: { totalQuestions: cert.totalQuestions, durationMinutes: cert.examDuration, passMark: cert.passMark, passPercentage: cert.passPercentage } })
    }
    return NextResponse.json({ ...readiness, recentScores: safeParse(readiness.recentScores, []), categoryMastery: safeParse(readiness.categoryMastery, {}), categories: cert.categories, config: { totalQuestions: cert.totalQuestions, durationMinutes: cert.examDuration, passMark: cert.passMark, passPercentage: cert.passPercentage } })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
