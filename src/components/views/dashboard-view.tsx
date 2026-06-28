'use client'

import { useAppStore } from '@/lib/store'
import { SYLLABUS_CATEGORIES, EXAM_CONFIG, LIFECYCLE_ACTIVITIES } from '@/lib/itil-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, GraduationCap, ClipboardList, CheckCircle2, ArrowRight, BookOpen, Clock, Target, TrendingUp, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface DashStats {
  resourceCount: number
  topicCount: number
  questionCount: number
  attemptCount: number
  bestScore: number
  avgScore: number
  ready: boolean
  recentAttempts: Array<{ id: string; examTitle: string; percentage: number; passed: boolean; completedAt: string }>
}

export function DashboardView() {
  const setView = useAppStore((s) => s.setView)
  const { toast } = useToast()
  const [stats, setStats] = useState<DashStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [resR, topR, qR, attR, readR] = await Promise.all([
        fetch('/api/resources'),
        fetch('/api/topics'),
        fetch('/api/questions?limit=1'),
        fetch('/api/exam/attempts'),
        fetch('/api/readiness'),
      ])
      const resData = await resR.json()
      const topData = await topR.json()
      const qData = await qR.json()
      const attData = await attR.json()
      const readData = await readR.json()

      const attempts = attData.attempts || []
      const scores = attempts.map((a: { percentage: number }) => a.percentage)
      setStats({
        resourceCount: resData.resources?.length || 0,
        topicCount: topData.topics?.length || 0,
        questionCount: qData.total || 0,
        attemptCount: attempts.length,
        bestScore: scores.length ? Math.max(...scores) : 0,
        avgScore: scores.length ? scores.reduce((s: number, v: number) => s + v, 0) / scores.length : 0,
        ready: readData.ready || false,
        recentAttempts: attempts.slice(0, 3),
      })
    } catch {
      toast({ title: 'Failed to load stats', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Study Materials', value: stats?.resourceCount ?? 0, icon: FolderOpen, color: 'text-sky-600 bg-sky-50', view: 'resources' as const },
    { label: 'Learn Topics', value: stats?.topicCount ?? 0, icon: GraduationCap, color: 'text-teal-600 bg-teal-50', view: 'topics' as const },
    { label: 'Question Bank', value: stats?.questionCount ?? 0, icon: BookOpen, color: 'text-violet-600 bg-violet-50', view: 'topics' as const },
    { label: 'Exams Taken', value: stats?.attemptCount ?? 0, icon: ClipboardList, color: 'text-amber-600 bg-amber-50', view: 'practice' as const },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative">
          <Badge className="mb-3 bg-white/20 text-white border-white/30 hover:bg-white/20">
            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered Learning
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Master ITIL Product (Version 5)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
            Upload your study materials, learn with AI-generated topics & visual aids, then practice with
            25+ random exam sets. The system tracks your progress and tells you when you're ready for the real exam.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setView('topics')} variant="secondary" size="sm" className="bg-white text-teal-700 hover:bg-white/90">
              <GraduationCap className="h-4 w-4 mr-1.5" /> Start Learning
            </Button>
            <Button onClick={() => setView('practice')} variant="outline" size="sm" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
              <ClipboardList className="h-4 w-4 mr-1.5" /> Take a Practice Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Exam info banner */}
      <Card className="border-teal-200 bg-teal-50/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 font-medium text-teal-800">
              <Target className="h-4 w-4" /> Exam Format:
            </div>
            <span className="text-muted-foreground"><strong className="text-foreground">{EXAM_CONFIG.totalQuestions}</strong> questions</span>
            <span className="text-muted-foreground"><strong className="text-foreground">{EXAM_CONFIG.durationMinutes} min</strong> duration</span>
            <span className="text-muted-foreground"><strong className="text-foreground">{EXAM_CONFIG.passPercentage}%</strong> to pass</span>
            <span className="text-muted-foreground"><strong className="text-foreground">65% BL2</strong> / <strong className="text-foreground">35% BL3</strong></span>
            <span className="text-muted-foreground">Multiple choice · Open book</span>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView(s.view)}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {loading ? (
                    <div className="h-7 w-10 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{s.value}</div>
                  )}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Readiness summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              Exam Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
              </div>
            ) : stats?.ready ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Ready for Exam!
                </div>
                <p className="text-xs text-green-600 mt-1">You've shown consistent performance. Take the final exam with confidence.</p>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                  <Clock className="h-4 w-4" /> Keep Practicing
                </div>
                <p className="text-xs text-amber-600 mt-1">Complete 3+ exams with 75%+ average to be exam-ready.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-lg font-bold">{stats?.bestScore.toFixed(0) ?? 0}%</div>
                <div className="text-[11px] text-muted-foreground">Best Score</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="text-lg font-bold">{stats?.avgScore.toFixed(0) ?? 0}%</div>
                <div className="text-[11px] text-muted-foreground">Average</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setView('readiness')}>
              View Readiness <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Lifecycle activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">The 8 Lifecycle Activities</CardTitle>
            <CardDescription className="text-xs">Core of the ITIL Product and Service Lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LIFECYCLE_ACTIVITIES.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setView('topics')}
                  className="group flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left hover:shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ borderColor: a.color + '40' }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold" style={{ backgroundColor: a.color }}>
                    {i + 1}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: a.color }}>{a.name}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2">{a.purpose}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity + categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-amber-600" /> Recent Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
              </div>
            ) : stats?.recentAttempts.length ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {stats.recentAttempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{a.examTitle}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(a.completedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                        {a.percentage.toFixed(0)}%
                      </span>
                      <Badge variant={a.passed ? 'default' : 'destructive'} className="text-[10px]">
                        {a.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No exams taken yet. Start practicing!
                <div className="mt-3">
                  <Button size="sm" onClick={() => setView('practice')}>Take First Exam</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Syllabus Categories</CardTitle>
            <CardDescription className="text-xs">10 categories with exam weightings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {SYLLABUS_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setView('topics')}
                  className="w-full flex items-center gap-2 rounded-lg border p-2 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: c.color }}>
                    {c.number}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{c.name}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{c.weighting}%</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
