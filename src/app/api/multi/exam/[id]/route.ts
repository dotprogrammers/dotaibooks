import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

interface Body { attemptId: string; answers: Record<string, number>; timeSpent: number }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const examId = (await params).id
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

    const body = (await req.json()) as Body
    const exam = await db.exam.findUnique({ where: { id: examId } })
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    const attempt = await db.examAttempt.findUnique({ where: { id: body.attemptId } })
    if (!attempt || attempt.userId !== user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })

    const questionIds = safeParse<string[]>(exam.questionIds, [])
    const questions = await db.question.findMany({ where: { id: { in: questionIds } } })
    const cert = await db.certification.findUnique({ where: { id: exam.certificationId } })

    let correct = 0
    const breakdown: Record<string, { correct: number; total: number; name: string }> = {}
    const results = []
    for (const qId of questionIds) {
      const q = questions.find((x) => x.id === qId)
      if (!q) continue
      const options = safeParse<string[]>(q.options, [])
      const rationales = safeParse<Record<string, string>>(q.rationales, {})
      const userAnswer = body.answers[qId] ?? null
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) correct++
      if (!breakdown[q.categoryIdNum]) breakdown[q.categoryIdNum] = { correct: 0, total: 0, name: q.categoryName }
      breakdown[q.categoryIdNum].total++
      if (isCorrect) breakdown[q.categoryIdNum].correct++
      results.push({ questionId: q.id, categoryId: q.categoryIdNum, categoryName: q.categoryName, questionText: q.questionText, questionType: q.questionType, options, correctAnswer: q.correctAnswer, userAnswer, isCorrect, explanation: q.explanation, rationales, bloomsLevel: q.bloomsLevel, scenarioContext: q.scenarioContext, sourceRef: q.sourceRef })
    }
    const total = questionIds.length
    const percentage = total > 0 ? (correct / total) * 100 : 0
    const passed = correct >= exam.passMark
    const weakAreas = Object.entries(breakdown).filter(([, v]) => v.total > 0 && v.correct / v.total < 0.7).map(([k]) => k)

    await db.examAttempt.update({ where: { id: body.attemptId }, data: { answers: JSON.stringify(body.answers), score: correct, totalMarks: total, percentage, passed, timeSpent: body.timeSpent, completedAt: new Date(), status: 'completed', categoryBreakdown: JSON.stringify(breakdown), weakAreas: JSON.stringify(weakAreas) } })
    await updateReadiness(user.id, exam.certificationId)

    return NextResponse.json({ attemptId: body.attemptId, examId, examTitle: exam.title, score: correct, totalMarks: total, percentage, passed, passMark: exam.passMark, passPercentage: cert?.passPercentage || 65, timeSpent: body.timeSpent, categoryBreakdown: breakdown, weakAreas, results, config: { totalQuestions: cert?.totalQuestions || 40, durationMinutes: cert?.examDuration || 60, passMark: exam.passMark, passPercentage: cert?.passPercentage || 65 } })
  } catch (e) {
    return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 })
  }
}

function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }

async function updateReadiness(userId: string, certificationId: string) {
  try {
    const attempts = await db.examAttempt.findMany({ where: { userId, certificationId, status: 'completed' }, orderBy: { completedAt: 'asc' } })
    if (attempts.length === 0) return
    const passed = attempts.filter((a) => a.passed).length
    const scores = attempts.map((a) => a.percentage)
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length
    const best = Math.max(...scores)
    const recent = scores.slice(-5)
    const cert = await db.certification.findUnique({ where: { id: certificationId }, include: { categories: true } })
    const mastery: Record<string, { attempts: number; correct: number; total: number; mastery: number }> = {}
    for (const c of cert?.categories || []) mastery[String(c.number)] = { attempts: 0, correct: 0, total: 0, mastery: 0 }
    for (const a of attempts) {
      const bd = safeParse<Record<string, { correct: number; total: number; name: string }>>(a.categoryBreakdown || '{}', {})
      for (const [cid, d] of Object.entries(bd)) { if (!mastery[cid]) mastery[cid] = { attempts: 0, correct: 0, total: 0, mastery: 0 }; mastery[cid].attempts++; mastery[cid].correct += d.correct; mastery[cid].total += d.total }
    }
    for (const m of Object.values(mastery)) m.mastery = m.total > 0 ? (m.correct / m.total) * 100 : 0
    const last3 = recent.slice(-3)
    const recentAvg = last3.length > 0 ? last3.reduce((s, v) => s + v, 0) / last3.length : 0
    const minMastery = Math.min(...Object.values(mastery).map((c) => c.mastery))
    const allCovered = Object.values(mastery).every((c) => c.total > 0)
    const ready = attempts.length >= 3 && recentAvg >= 75 && minMastery >= 65 && allCovered
    let recommendation: string
    if (ready) recommendation = `You are READY for the ${cert?.shortName} exam! ${attempts.length} attempts, ${avg.toFixed(1)}% average, recent ${recentAvg.toFixed(1)}%.`
    else if (attempts.length < 3) recommendation = `Complete at least 3 practice exams. Done: ${attempts.length}.`
    else if (recentAvg < 75) recommendation = `Recent average ${recentAvg.toFixed(1)}%. Aim for 75%+ on last 3 exams.`
    else if (minMastery < 65) { const weak = Object.entries(mastery).filter(([, c]) => c.mastery < 65).map(([id]) => cert?.categories.find((c) => String(c.number) === id)?.name).filter(Boolean); recommendation = `Weak areas: ${weak.join(', ')}. Review these topics.` }
    else recommendation = 'Keep practicing for consistency.'
    await db.readiness.upsert({ where: { userId_certificationId: { userId, certificationId } }, create: { userId, certificationId, totalAttempts: attempts.length, passedAttempts: passed, averageScore: avg, bestScore: best, recentScores: JSON.stringify(recent), categoryMastery: JSON.stringify(mastery), ready, recommendation }, update: { totalAttempts: attempts.length, passedAttempts: passed, averageScore: avg, bestScore: best, recentScores: JSON.stringify(recent), categoryMastery: JSON.stringify(mastery), ready, recommendation } })
  } catch (e) { console.error('[updateReadiness]', e) }
}
