'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, Trophy, Target, TrendingUp, Award, BookOpen, ClipboardList, ArrowRight, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { SYLLABUS_CATEGORIES, EXAM_CONFIG } from '@/lib/itil-data'

interface Readiness {
  totalAttempts: number
  passedAttempts: number
  averageScore: number
  bestScore: number
  recentScores: number[]
  categoryMastery: Record<string, { attempts: number; correct: number; total: number; mastery: number }>
  ready: boolean
  recommendation: string
}

export function ReadinessView() {
  const { toast } = useToast()
  const setView = useAppStore((s) => s.setView)
  const [data, setData] = useState<Readiness | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReadiness()
  }, [])

  async function loadReadiness() {
    try {
      const res = await fetch('/api/readiness')
      const d = await res.json()
      setData(d)
    } catch {
      toast({ title: 'Failed to load readiness', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
      </div>
    )
  }

  const d = data!
  const passRate = d.totalAttempts > 0 ? (d.passedAttempts / d.totalAttempts) * 100 : 0
  const masteryValues = Object.values(d.categoryMastery).map((c) => c.mastery)
  const minMastery = masteryValues.length ? Math.min(...masteryValues) : 0
  const allAttempted = Object.values(d.categoryMastery).every((c) => c.total > 0)

  // Readiness checklist
  const checklist = [
    { label: 'Complete at least 3 practice exams', done: d.totalAttempts >= 3, detail: `${d.totalAttempts}/3 completed` },
    { label: 'Average 75%+ on last 3 exams', done: d.recentScores.slice(-3).reduce((s, v) => s + v, 0) / Math.max(d.recentScores.slice(-3).length, 1) >= 75, detail: `${d.recentScores.length > 0 ? (d.recentScores.slice(-3).reduce((s, v) => s + v, 0) / Math.max(d.recentScores.slice(-3).length, 1)).toFixed(0) : 0}% recent average` },
    { label: '70%+ mastery in all categories', done: minMastery >= 70 && allAttempted, detail: `${minMastery.toFixed(0)}% weakest category` },
    { label: 'Practice all 10 syllabus categories', done: allAttempted, detail: allAttempted ? 'All categories covered' : 'Some categories not yet tested' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Readiness Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The system analyzes your practice exam performance to determine when you're ready to sit the official ITIL Product (Version 5) exam.
        </p>
      </div>

      {/* Big readiness status */}
      <Card className={d.ready ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full ${d.ready ? 'bg-green-100' : 'bg-amber-100'}`}>
              {d.ready ? (
                <Trophy className="h-12 w-12 text-green-600" />
              ) : (
                <Clock className="h-12 w-12 text-amber-600" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <Badge variant={d.ready ? 'default' : 'secondary'} className={`mb-2 ${d.ready ? 'bg-green-600' : 'bg-amber-500'} text-white`}>
                {d.ready ? 'READY' : 'NOT READY YET'}
              </Badge>
              <h2 className={`text-2xl font-bold ${d.ready ? 'text-green-700' : 'text-amber-700'}`}>
                {d.ready ? "You're Ready for the Final Exam!" : 'Keep Practicing'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">{d.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><ClipboardList className="h-3.5 w-3.5" /> Total Exams</div>
            <div className="text-2xl font-bold mt-1">{d.totalAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Pass Rate</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{passRate.toFixed(0)}%</div>
            <div className="text-[10px] text-muted-foreground">{d.passedAttempts}/{d.totalAttempts} passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><TrendingUp className="h-3.5 w-3.5" /> Average Score</div>
            <div className="text-2xl font-bold mt-1">{d.averageScore.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><Award className="h-3.5 w-3.5" /> Best Score</div>
            <div className="text-2xl font-bold mt-1 text-amber-600">{d.bestScore.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-teal-600" /> Readiness Checklist
          </CardTitle>
          <CardDescription className="text-xs">Complete these milestones to be exam-ready</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${item.done ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {item.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
                <Badge variant={item.done ? 'default' : 'outline'} className="text-[10px]">
                  {item.done ? 'Done' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category mastery */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Category Mastery</CardTitle>
          <CardDescription className="text-xs">Your performance across all 10 syllabus categories (aim for 70%+)</CardDescription>
        </CardHeader>
        <CardContent>
          {d.totalAttempts === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Take practice exams to see your category mastery.
            </div>
          ) : (
            <div className="space-y-3">
              {SYLLABUS_CATEGORIES.map((c) => {
                const m = d.categoryMastery[c.id] || { attempts: 0, correct: 0, total: 0, mastery: 0 }
                const pct = m.mastery
                const status = pct >= 75 ? 'strong' : pct >= 65 ? 'fair' : pct > 0 ? 'weak' : 'none'
                const colors = { strong: 'bg-green-500', fair: 'bg-amber-500', weak: 'bg-red-400', none: 'bg-muted' }
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: c.color }}>
                      {c.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{c.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{m.correct}/{m.total}</span>
                          <span className={`text-xs font-semibold ${status === 'strong' ? 'text-green-600' : status === 'fair' ? 'text-amber-600' : status === 'weak' ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                        <div className={`h-full ${colors[status]} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score trend */}
      {d.recentScores.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Score Trend</CardTitle>
            <CardDescription className="text-xs">Your recent exam scores (last {d.recentScores.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-32">
              {d.recentScores.map((score, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end h-full">
                    <div
                      className={`w-full rounded-t ${score >= 70 ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ height: `${Math.max(score, 5)}%` }}
                      title={`${score.toFixed(0)}%`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{score.toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Pass mark: {EXAM_CONFIG.passPercentage}%</span>
              <span>Trend: {d.recentScores[d.recentScores.length - 1] >= d.recentScores[0] ? '↗ Improving' : '↘ Needs work'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!d.ready && (
          <Button onClick={() => setView('practice')} className="bg-teal-600 hover:bg-teal-700">
            <ClipboardList className="h-4 w-4 mr-2" /> Take a Practice Exam
          </Button>
        )}
        {d.ready && (
          <Button onClick={() => setView('practice')} className="bg-amber-600 hover:bg-amber-700">
            <Trophy className="h-4 w-4 mr-2" /> Take Final Exam Simulation
          </Button>
        )}
        <Button variant="outline" onClick={() => setView('topics')}>
          <BookOpen className="h-4 w-4 mr-2" /> Review Weak Topics
        </Button>
        <Button variant="outline" onClick={() => setView('dashboard')}>
          <ArrowRight className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
