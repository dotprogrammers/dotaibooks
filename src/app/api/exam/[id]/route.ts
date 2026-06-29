import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { EXAM_CONFIG, SYLLABUS_CATEGORIES } from '@/lib/itil-data'

export const runtime = 'nodejs'

interface SubmitBody {
  attemptId: string
  answers: Record<string, number> // questionId -> selected option index
  timeSpent: number // seconds
}

// POST /api/exam/[id]  with action=submit in body, or /api/exam/[id]/submit
// Here we implement GET (fetch exam detail) and POST (submit answers)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const exam = await db.exam.findUnique({
      where: { id },
      include: { attempts: { orderBy: { createdAt: 'desc' } } },
    })
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    return NextResponse.json({ exam })
  } catch (error) {
    console.error('[GET /api/exam/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: examId } = await params
    const body = (await req.json()) as SubmitBody

    const exam = await db.exam.findUnique({ where: { id: examId } })
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    const attempt = await db.examAttempt.findUnique({ where: { id: body.attemptId } })
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })

    // Fetch all questions for this exam
    const questionIds = safeParse<string[]>(exam.questionIds, [])
    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
    })

    // Build question map with original order and shuffled options
    // We need to reconstruct the shuffled options. Since we stored the original
    // question in the DB, we re-derive the exam presentation from the attempt.
    // For grading, we compare the user's selected option text to the correct option text.
    let correctCount = 0
    const categoryBreakdown: Record<string, { correct: number; total: number; name: string }> = {}
    const results: Array<{
      questionId: string
      categoryId: string
      categoryName: string
      questionText: string
      questionType: string
      options: string[]
      correctAnswer: number
      userAnswer: number | null
      isCorrect: boolean
      explanation: string
      rationales: Record<string, string>
      bloomsLevel: number
      scenarioContext: string | null
      sourceRef: string | null
    }> = []

    for (const qId of questionIds) {
      const q = questions.find((x) => x.id === qId)
      if (!q) continue
      const options = safeParse<string[]>(q.options, [])
      const rationales = safeParse<Record<string, string>>(q.rationales, {})
      const userAnswer = body.answers[qId] ?? null
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) correctCount++

      if (!categoryBreakdown[q.categoryId]) {
        categoryBreakdown[q.categoryId] = { correct: 0, total: 0, name: q.categoryName }
      }
      categoryBreakdown[q.categoryId].total++
      if (isCorrect) categoryBreakdown[q.categoryId].correct++

      results.push({
        questionId: q.id,
        categoryId: q.categoryId,
        categoryName: q.categoryName,
        questionText: q.questionText,
        questionType: q.questionType,
        options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer !== null ? userAnswer : null,
        isCorrect,
        explanation: q.explanation,
        rationales,
        bloomsLevel: q.bloomsLevel,
        scenarioContext: q.scenarioContext,
        sourceRef: q.sourceRef,
      })
    }

    const total = questionIds.length
    const percentage = total > 0 ? (correctCount / total) * 100 : 0
    const passed = correctCount >= exam.passMark

    // Determine weak areas (categories below 70%)
    const weakAreas = Object.entries(categoryBreakdown)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.7)
      .map(([k]) => k)

    // Update attempt
    await db.examAttempt.update({
      where: { id: body.attemptId },
      data: {
        answers: JSON.stringify(body.answers),
        score: correctCount,
        totalMarks: total,
        percentage,
        passed,
        timeSpent: body.timeSpent,
        completedAt: new Date(),
        status: 'completed',
        categoryBreakdown: JSON.stringify(categoryBreakdown),
        weakAreas: JSON.stringify(weakAreas),
      },
    })

    // Update readiness
    await updateReadiness()

    return NextResponse.json({
      attemptId: body.attemptId,
      examId,
      examTitle: exam.title,
      score: correctCount,
      totalMarks: total,
      percentage,
      passed,
      passMark: exam.passMark,
      passPercentage: EXAM_CONFIG.passPercentage,
      timeSpent: body.timeSpent,
      categoryBreakdown,
      weakAreas,
      results,
      config: EXAM_CONFIG,
    })
  } catch (error) {
    console.error('[POST /api/exam/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to submit exam: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

async function updateReadiness() {
  try {
    const attempts = await db.examAttempt.findMany({
      where: { status: 'completed' },
      orderBy: { completedAt: 'asc' },
    })

    if (attempts.length === 0) return

    const passed = attempts.filter((a) => a.passed).length
    const scores = attempts.map((a) => a.percentage)
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length
    const best = Math.max(...scores)
    const recent = scores.slice(-5)

    // Category mastery
    const categoryMastery: Record<string, { attempts: number; correct: number; total: number; mastery: number }> = {}
    for (const cat of SYLLABUS_CATEGORIES) {
      categoryMastery[cat.id] = { attempts: 0, correct: 0, total: 0, mastery: 0 }
    }
    for (const a of attempts) {
      const breakdown = safeParse<Record<string, { correct: number; total: number; name: string }>>(
        a.categoryBreakdown || '{}',
        {}
      )
      for (const [catId, data] of Object.entries(breakdown)) {
        if (!categoryMastery[catId]) categoryMastery[catId] = { attempts: 0, correct: 0, total: 0, mastery: 0 }
        categoryMastery[catId].attempts++
        categoryMastery[catId].correct += data.correct
        categoryMastery[catId].total += data.total
      }
    }
    for (const cat of Object.values(categoryMastery)) {
      cat.mastery = cat.total > 0 ? (cat.correct / cat.total) * 100 : 0
    }

    // Readiness logic:
    // Ready if: at least 3 attempts, average of last 3 >= 75%, and all category mastery >= 65%
    const last3 = recent.slice(-3)
    const recentAvg = last3.length > 0 ? last3.reduce((s, v) => s + v, 0) / last3.length : 0
    const minMastery = Math.min(...Object.values(categoryMastery).map((c) => c.mastery))
    const allCategoriesAttempted = Object.values(categoryMastery).every((c) => c.total > 0)

    const ready =
      attempts.length >= 3 &&
      recentAvg >= 75 &&
      minMastery >= 65 &&
      allCategoriesAttempted

    let recommendation: string
    if (ready) {
      recommendation = `Excellent! You are READY to sit the final ITIL Product (v5) exam. You've completed ${attempts.length} practice exams with an average score of ${avg.toFixed(1)}% (pass mark is 70%). Your recent average is ${recentAvg.toFixed(1)}% and all category mastery levels are above 65%. You can take the exam with confidence!`
    } else if (attempts.length < 3) {
      recommendation = `You've completed ${attempts.length} practice exam(s). Complete at least 3 exams so we can assess your readiness. Current best score: ${best.toFixed(1)}%.`
    } else if (recentAvg < 75) {
      recommendation = `Your recent average is ${recentAvg.toFixed(1)}%. Aim for a consistent 75%+ on your last 3 exams to be exam-ready. Focus on improving your weaker areas below.`
    } else if (minMastery < 65) {
      const weakCats = Object.entries(categoryMastery)
        .filter(([, c]) => c.mastery < 65)
        .map(([id]) => SYLLABUS_CATEGORIES.find((c) => c.id === id)?.name)
      recommendation = `Your overall scores are good (${recentAvg.toFixed(1)}% recent average), but mastery is below 65% in: ${weakCats.join(', ')}. Review these topics before sitting the final exam.`
    } else {
      recommendation = `You're making good progress with ${attempts.length} attempts. Keep practicing to build consistency across all categories.`
    }

    const existing = await db.readiness.findFirst()
    const data = {
      totalAttempts: attempts.length,
      passedAttempts: passed,
      averageScore: avg,
      bestScore: best,
      recentScores: JSON.stringify(recent),
      categoryMastery: JSON.stringify(categoryMastery),
      ready,
      recommendation,
    }
    if (existing) {
      await db.readiness.update({ where: { id: existing.id }, data })
    } else {
      await db.readiness.create({ data })
    }
  } catch (e) {
    console.error('[updateReadiness]', e)
  }
}
