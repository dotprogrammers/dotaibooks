import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

interface Body { type?: 'practice' | 'final'; setNumber?: number; certificationId: string }

export async function POST(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = (await req.json()) as Body
    const cert = await db.certification.findUnique({ where: { id: body.certificationId }, include: { categories: { orderBy: { number: 'asc' } } } })
    if (!cert) return NextResponse.json({ error: 'Certification not found' }, { status: 404 })

    const type = body.type || 'practice'
    const setNumber = body.setNumber || 1
    const seed = Date.now()
    const rng = mulberry32(seed)

    // Allocate questions per category by weighting
    const targetCounts: Record<string, number> = {}
    let allocated = 0
    const remainders: { id: string; r: number }[] = []
    for (const cat of cert.categories) {
      const exact = (cat.weighting / 100) * cert.totalQuestions
      const fl = Math.floor(exact)
      targetCounts[String(cat.number)] = fl
      allocated += fl
      remainders.push({ id: String(cat.number), r: exact - fl })
    }
    remainders.sort((a, b) => b.r - a.r).slice(0, cert.totalQuestions - allocated).forEach((x) => { targetCounts[x.id] += 1 })

    const allQuestions = await db.question.findMany({ where: { certificationId: cert.id } })
    const byCat: Record<string, typeof allQuestions> = {}
    for (const q of allQuestions) { (byCat[q.categoryIdNum] ||= []).push(q) }
    const selected: typeof allQuestions = []
    for (const cat of cert.categories) {
      const pool = byCat[String(cat.number)] || []
      const need = targetCounts[String(cat.number)] || 0
      if (pool.length === 0) continue
      selected.push(...shuffle([...pool], rng).slice(0, Math.min(need, pool.length)))
    }
    while (selected.length < cert.totalQuestions) {
      const rest = allQuestions.filter((q) => !selected.find((s) => s.id === q.id))
      if (rest.length === 0) break
      selected.push(rest[Math.floor(rng() * rest.length)])
    }
    const shuffled = shuffle([...selected], rng)

    const examQuestions = shuffled.map((q, idx) => {
      const options = safeParse<string[]>(q.options, [])
      const correctText = options[q.correctAnswer]
      const shuffledOptions = shuffle([...options], rng)
      const newCorrect = shuffledOptions.indexOf(correctText)
      const rationales = safeParse<Record<string, string>>(q.rationales, {})
      const newRationales: Record<string, string> = {}
      for (let i = 0; i < shuffledOptions.length; i++) { newRationales[i] = rationales[shuffledOptions[i]] || rationales[i.toString()] || '' }
      return { questionId: q.id, order: idx + 1, categoryId: q.categoryIdNum, categoryName: q.categoryName, questionText: q.questionText, questionType: q.questionType, options: shuffledOptions, bloomsLevel: q.bloomsLevel, scenarioContext: q.scenarioContext }
    })

    const title = type === 'final' ? `Final Exam — ${cert.shortName} #${setNumber}` : `Practice — ${cert.shortName} #${setNumber}`
    const exam = await db.exam.create({ data: { certificationId: cert.id, title, type, duration: cert.examDuration, totalMarks: cert.totalQuestions, passMark: cert.passMark, questionCount: examQuestions.length, questionIds: JSON.stringify(examQuestions.map((q) => q.questionId)) } })
    const attempt = await db.examAttempt.create({ data: { examId: exam.id, userId: user.id, certificationId: cert.id, answers: '{}', status: 'in-progress', totalMarks: cert.totalQuestions } })

    return NextResponse.json({
      exam: { id: exam.id, title: exam.title, type: exam.type, duration: exam.duration, totalMarks: exam.totalMarks, passMark: exam.passMark, questionCount: exam.questionCount, certificationId: cert.id, certificationName: cert.name },
      attemptId: attempt.id,
      questions: examQuestions,
      config: { totalQuestions: cert.totalQuestions, durationMinutes: cert.examDuration, passMark: cert.passMark, passPercentage: cert.passPercentage },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 })
  }
}

function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
function mulberry32(a: number) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function shuffle<T>(arr: T[], rng: () => number): T[] { const r = [...arr]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }
