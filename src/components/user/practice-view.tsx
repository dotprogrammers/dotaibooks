'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Clock, CheckCircle2, XCircle, Play, Loader2, Trophy, RotateCcw, TrendingUp, Award, Shuffle, ArrowLeft } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Cert { id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; examDuration: number; totalQuestions: number; passPercentage: number }
interface Attempt { id: string; examTitle: string; examType: string; certificationId: string; score: number; totalMarks: number; percentage: number; passed: boolean; timeSpent: number; completedAt: string }

const TOTAL_SETS = 25

export function PracticeView() {
  const { toast } = useToast()
  const setView = useAppStore((s) => s.setView)
  const startExam = useAppStore((s) => s.startExam)
  const certId = useAppStore((s) => s.activeCertId)
  const certSlug = useAppStore((s) => s.activeCertSlug)
  const [certs, setCerts] = useState<Cert[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/certifications').then((r) => r.json()).then((d) => {
      if (cancelled) return
      const all = d.certifications || []
      setCerts(all)
      if (!certId && all.length > 0) {
        useAppStore.getState().setActiveCert(all[0].slug, all[0].id)
      }
    })
    loadAttempts()
    return () => { cancelled = true }
  }, [certId])

  async function loadAttempts() {
    try {
      const cid = certId || useAppStore.getState().activeCertId
      const url = cid ? `/api/multi/exam/attempts?certificationId=${cid}` : '/api/multi/exam/attempts'
      const res = await fetch(url)
      const data = await res.json()
      setAttempts(data.attempts || [])
    } catch { toast({ title: 'Failed to load', variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const activeCert = certs.find((c) => c.id === certId) || certs[0]

  async function createExam(type: 'practice' | 'final', setNumber: number) {
    if (!activeCert) return
    setCreating(true)
    try {
      const res = await fetch('/api/multi/exam/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, setNumber, certificationId: activeCert.id }) })
      const data = await res.json()
      if (res.ok) {
        startExam({ examId: data.exam.id, attemptId: data.attemptId, title: data.exam.title, type: data.exam.type, duration: data.exam.duration, totalMarks: data.exam.totalMarks, passMark: data.exam.passMark, certificationId: activeCert.id, certificationName: activeCert.name, questions: data.questions, startTime: Date.now() })
      } else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch (e) { toast({ title: 'Failed', description: (e as Error).message, variant: 'destructive' }) }
    finally { setCreating(false) }
  }

  const stats = useMemo(() => {
    if (!attempts.length) return { taken: 0, passed: 0, avg: 0, best: 0 }
    return { taken: attempts.length, passed: attempts.filter((a) => a.passed).length, avg: attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length, best: Math.max(...attempts.map((a) => a.percentage)) }
  }, [attempts])

  function fmt(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s` }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => setView('certifications')}><ArrowLeft className="h-4 w-4 mr-1" /> Certifications</Button>
      <div><h1 className="text-2xl font-bold">Practice Exams</h1><p className="text-sm text-muted-foreground mt-1">Take {TOTAL_SETS}+ random practice exams per certification.</p></div>

      {certs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {certs.map((c) => (
            <Button key={c.id} size="sm" variant={c.id === activeCert?.id ? 'default' : 'outline'} onClick={() => useAppStore.getState().setActiveCert(c.slug, c.id)} className="gap-1.5">
              <span className="text-base">{c.icon}</span> {c.shortName}
            </Button>
          ))}
        </div>
      )}

      {activeCert && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Exams Taken</div><div className="text-2xl font-bold mt-1">{stats.taken}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Passed</div><div className="text-2xl font-bold mt-1 text-green-600">{stats.passed}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Average</div><div className="text-2xl font-bold mt-1">{stats.avg.toFixed(0)}%</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Best</div><div className="text-2xl font-bold mt-1 text-amber-600">{stats.best.toFixed(0)}%</div></CardContent></Card>
          </div>

          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div><h3 className="font-semibold flex items-center gap-2"><Shuffle className="h-4 w-4 text-teal-600" /> Start New Random Exam</h3><p className="text-sm text-muted-foreground mt-1">{activeCert.totalQuestions} questions · {activeCert.examDuration} min · {activeCert.passPercentage}% to pass</p></div>
              <Button size="lg" onClick={() => createExam('practice', Math.floor(Math.random() * TOTAL_SETS) + 1)} disabled={creating} className="bg-teal-600 hover:bg-teal-700 shrink-0">{creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Start Exam</Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div><h3 className="font-semibold flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-600" /> Final Exam Simulation</h3><p className="text-sm text-muted-foreground mt-1">Test under real exam conditions.</p></div>
              <Button size="lg" variant="outline" onClick={() => createExam('final', Math.floor(Math.random() * TOTAL_SETS) + 1)} disabled={creating} className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0"><Trophy className="h-4 w-4 mr-2" />Take Final</Button>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardContent className="p-4"><h3 className="font-semibold mb-3 text-sm">Available Sets ({TOTAL_SETS})</h3><div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-72 overflow-y-auto">{Array.from({ length: TOTAL_SETS }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => createExam('practice', n)} disabled={creating} className="aspect-square rounded-lg border-2 flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all"><span className="text-base font-bold">{n}</span><span className="text-[8px] text-muted-foreground">SET</span></button>)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><h3 className="font-semibold mb-3 text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Exam History</h3>{loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded" />)}</div> : attempts.length === 0 ? <div className="text-center py-6 text-sm text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />No exams yet.</div> : <div className="space-y-2 max-h-72 overflow-y-auto">{attempts.map((a) => <div key={a.id} className="rounded-lg border p-2.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5">{a.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}<span className="text-sm font-medium truncate">{a.examTitle}</span></div><div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2"><span>{new Date(a.completedAt).toLocaleDateString()}</span><span>·</span><span>{fmt(a.timeSpent)}</span></div></div><div className="text-right shrink-0"><div className={`text-lg font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>{a.percentage.toFixed(0)}%</div><div className="text-[10px] text-muted-foreground">{a.score}/{a.totalMarks}</div></div></div></div>)}</div>}</CardContent></Card>
          </div>
        </>
      )}
    </div>
  )
}
