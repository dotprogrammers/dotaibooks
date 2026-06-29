import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { EXAM_CONFIG, SYLLABUS_CATEGORIES } from '@/lib/itil-data'

export const runtime = 'nodejs'

interface CreateExamBody {
  type?: 'practice' | 'final'
  setNumber?: number // which of the 25-30 sets
  seed?: number // for reproducibility
}

// POST /api/exam/create
// Creates a random 40-question exam following the syllabus weighting.
// Each call generates a fresh random set (supports 25-30+ unique practice sets).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateExamBody
    const type = body.type || 'practice'
    const setNumber = body.setNumber || 1

    // Use seed for reproducibility if provided
    const seed = body.seed ?? Date.now()
    const rng = mulberry32(seed)

    // Target question count per category based on weighting (40 total)
    const targetCounts: Record<string, number> = {}
    let allocated = 0
    const remainders: { id: string; remainder: number }[] = []
    for (const cat of SYLLABUS_CATEGORIES) {
      const exact = (cat.weighting / 100) * EXAM_CONFIG.totalQuestions
      const floor = Math.floor(exact)
      targetCounts[cat.id] = floor
      allocated += floor
      remainders.push({ id: cat.id, remainder: exact - floor })
    }
    // Distribute remaining slots by largest remainder
    const remaining = EXAM_CONFIG.totalQuestions - allocated
    remainders
      .sort((a, b) => b.remainder - a.remainder)
      .slice(0, remaining)
      .forEach((r) => {
        targetCounts[r.id] += 1
      })

    // Fetch all questions grouped by category
    const allQuestions = await db.question.findMany()
    const byCategory: Record<string, typeof allQuestions> = {}
    for (const q of allQuestions) {
      if (!byCategory[q.categoryId]) byCategory[q.categoryId] = []
      byCategory[q.categoryId].push(q)
    }

    const selected: typeof allQuestions = []
    for (const cat of SYLLABUS_CATEGORIES) {
      const pool = byCategory[cat.id] || []
      const need = targetCounts[cat.id] || 0
      if (pool.length === 0) continue
      // Shuffle pool and take `need` questions
      const shuffled = shuffleWithRng([...pool], rng)
      selected.push(...shuffled.slice(0, Math.min(need, shuffled.length)))
    }

    // If we don't have enough, fill from any remaining
    while (selected.length < EXAM_CONFIG.totalQuestions) {
      const allRemaining = allQuestions.filter((q) => !selected.find((s) => s.id === q.id))
      if (allRemaining.length === 0) break
      selected.push(allRemaining[Math.floor(rng() * allRemaining.length)])
    }

    // Shuffle the selected questions for variety
    const shuffledSelected = shuffleWithRng([...selected], rng)

    // For each question, shuffle the answer options (track correct index)
    const examQuestions = shuffledSelected.map((q, idx) => {
      const options = safeParse<string[]>(q.options, [])
      const correctText = options[q.correctAnswer]
      const shuffledOptions = shuffleWithRng([...options], rng)
      const newCorrect = shuffledOptions.indexOf(correctText)
      const rationales = safeParse<Record<string, string>>(q.rationales, {})
      // Map rationales by option text
      const newRationales: Record<string, string> = {}
      for (let i = 0; i < shuffledOptions.length; i++) {
        const opt = shuffledOptions[i]
        newRationales[i] = rationales[opt] || rationales[i.toString()] || ''
      }
      return {
        questionId: q.id,
        order: idx + 1,
        categoryId: q.categoryId,
        categoryName: q.categoryName,
        questionText: q.questionText,
        questionType: q.questionType,
        options: shuffledOptions,
        correctAnswer: newCorrect,
        explanation: q.explanation,
        rationales: newRationales,
        bloomsLevel: q.bloomsLevel,
        scenarioContext: q.scenarioContext,
        sourceRef: q.sourceRef,
      }
    })

    // Create exam record
    const title =
      type === 'final'
        ? `Final Exam Simulation #${setNumber}`
        : `Practice Exam Set #${setNumber}`

    const exam = await db.exam.create({
      data: {
        title,
        type,
        duration: EXAM_CONFIG.durationMinutes,
        totalMarks: EXAM_CONFIG.totalMarks,
        passMark: EXAM_CONFIG.passMark,
        questionCount: examQuestions.length,
        questionIds: JSON.stringify(examQuestions.map((q) => q.questionId)),
      },
    })

    // Create an in-progress attempt
    const attempt = await db.examAttempt.create({
      data: {
        examId: exam.id,
        answers: '{}',
        status: 'in-progress',
        totalMarks: EXAM_CONFIG.totalMarks,
      },
    })

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passMark: exam.passMark,
        questionCount: exam.questionCount,
      },
      attemptId: attempt.id,
      questions: examQuestions.map((q) => ({
        questionId: q.questionId,
        order: q.order,
        categoryId: q.categoryId,
        categoryName: q.categoryName,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        bloomsLevel: q.bloomsLevel,
        scenarioContext: q.scenarioContext,
      })),
      // correct answers sent separately on submit to prevent cheating
      config: EXAM_CONFIG,
    })
  } catch (error) {
    console.error('[POST /api/exam/create]', error)
    return NextResponse.json(
      { error: 'Failed to create exam: ' + (error as Error).message },
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

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
