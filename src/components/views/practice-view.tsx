'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { EXAM_CONFIG, SYLLABUS_CATEGORIES } from '@/lib/itil-data'
import { ClipboardList, Clock, CheckCircle2, XCircle, Play, Loader2, Trophy, RotateCcw, TrendingUp, Award, Shuffle } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Attempt {
  id: string
  examId: string
  examTitle: string
  examType: string
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  timeSpent: number
  completedAt: string
  categoryBreakdown: Record<string, { correct: number; total: number; name: string }>
  weakAreas: string[]
}

const TOTAL_SETS = 28

export function PracticeView() {
  const { toast } = useToast()
  const setView = useAppStore((s) => s.setView)
  const startExam = useAppStore((s) => s.startExam)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [creatingSet, setCreatingSet] = useState<number | null>(null)

  useEffect(() => {
    loadAttempts()
  }, [])

  async function loadAttempts() {
    try {
      const res = await fetch('/api/exam/attempts')
      const data = await res.json()
      setAttempts(data.attempts || [])
    } catch {
      toast({ title: 'Failed to load exam history', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function createExam(type: 'practice' | 'final', setNumber: number) {
    setCreating(true)
    setCreatingSet(setNumber)
    try {
      const res = await fetch('/api/exam/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, setNumber }),
      })
      const data = await res.json()
      if (res.ok) {
        startExam({
          examId: data.exam.id,
          attemptId: data.attemptId,
          title: data.exam.title,
          type: data.exam.type,
          duration: data.exam.duration,
          totalMarks: data.exam.totalMarks,
          passMark: data.exam.passMark,
          questions: data.questions,
          startTime: Date.now(),
        })
      } else {
        toast({ title: 'Failed to create exam', description: data.error, variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Failed to create exam', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setCreating(false)
      setCreatingSet(null)
    }
  }

  const stats = useMemo(() => {
    if (attempts.length === 0) return { taken: 0, passed: 0, avg: 0, best: 0 }
    const passed = attempts.filter((a) => a.passed).length
    const scores = attempts.map((a) => a.percentage)
    return {
      taken: attempts.length,
      passed,
      avg: scores.reduce((s, v) => s + v, 0) / scores.length,
      best: Math.max(...scores),
    }
  }, [attempts])

  // Determine which sets have been attempted (by set number in title)
  const attemptedSetNumbers = useMemo(() => {
    const nums = new Set<number>()
    attempts.forEach((a) => {
      const match = a.examTitle.match(/#(\d+)/)
      if (match) nums.add(parseInt(match[1], 10))
    })
    return nums
  }, [attempts])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practice Exams</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Take {TOTAL_SETS}+ random practice exams. Each set generates a unique 40-question paper following the official syllabus weighting. Pass with 70% to be exam-ready.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <ClipboardList className="h-3.5 w-3.5" /> Exams Taken
            </div>
            <div className="text-2xl font-bold mt-1">{stats.taken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> Passed
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">{stats.passed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> Average
            </div>
            <div className="text-2xl font-bold mt-1">{stats.avg.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Award className="h-3.5 w-3.5" /> Best Score
            </div>
            <div className="text-2xl font-bold mt-1 text-amber-600">{stats.best.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick start */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-teal-600" /> Start a New Random Exam
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generates a fresh {EXAM_CONFIG.totalQuestions}-question paper · {EXAM_CONFIG.durationMinutes} min · {EXAM_CONFIG.passPercentage}% to pass
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => createExam('practice', Math.floor(Math.random() * TOTAL_SETS) + 1)}
            disabled={creating}
            className="bg-teal-600 hover:bg-teal-700 shrink-0"
          >
            {creating && creatingSet === null ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Start Random Exam
          </Button>
        </CardContent>
      </Card>

      {/* Final exam simulation */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" /> Final Exam Simulation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Test yourself under real exam conditions. Same format as the official ITIL Product (v5) exam.
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => createExam('final', Math.floor(Math.random() * TOTAL_SETS) + 1)}
            disabled={creating}
            className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0"
          >
            {creating && creatingSet === null ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trophy className="h-4 w-4 mr-2" />}
            Take Final Exam
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available sets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Available Practice Sets
            </CardTitle>
            <CardDescription className="text-xs">Each set is randomly generated — infinite unique combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
              {Array.from({ length: TOTAL_SETS }, (_, i) => i + 1).map((n) => {
                const attempted = attemptedSetNumbers.has(n)
                return (
                  <button
                    key={n}
                    onClick={() => createExam('practice', n)}
                    disabled={creating}
                    className="aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 hover:border-teal-500 hover:bg-teal-50 transition-all disabled:opacity-50 group"
                  >
                    {attempted && <CheckCircle2 className="absolute h-3 w-3 text-green-500 translate-x-3 -translate-y-3" />}
                    <span className="text-base font-bold group-hover:text-teal-600">{n}</span>
                    <span className="text-[8px] text-muted-foreground">SET</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent attempts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Exam History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No exams taken yet.
                <p className="text-xs mt-1">Start your first practice exam above!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {attempts.map((a) => (
                  <div key={a.id} className="rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {a.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                          <span className="text-sm font-medium truncate">{a.examTitle}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span>{new Date(a.completedAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatTime(a.timeSpent)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-lg font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                          {a.percentage.toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">{a.score}/{a.totalMarks}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
