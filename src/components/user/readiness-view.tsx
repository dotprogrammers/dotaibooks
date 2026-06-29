'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Trophy, Target, TrendingUp, Award, BookOpen, ClipboardList, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ReadinessData { ready: boolean; totalAttempts: number; passedAttempts: number; averageScore: number; bestScore: number; recentScores: number[]; categoryMastery: Record<string, { attempts: number; correct: number; total: number; mastery: number }>; recommendation: string; categories: { id: string; number: number; name: string; color: string }[]; config: { totalQuestions: number; durationMinutes: number; passMark: number; passPercentage: number } }
interface Cert { id: string; slug: string; shortName: string; icon: string | null; color: string }

export function ReadinessView() {
  const { toast } = useToast()
  const setView = useAppStore((s) => s.setView)
  const certId = useAppStore((s) => s.activeCertId)
  const certSlug = useAppStore((s) => s.activeCertSlug)
  const [certs, setCerts] = useState<Cert[]>([])
  const [data, setData] = useState<ReadinessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certifications').then((r) => r.json()).then((d) => {
      const all = d.certifications || []
      setCerts(all)
      if (!certId && all[0]) useAppStore.getState().setActiveCert(all[0].slug, all[0].id)
    })
  }, [])

  useEffect(() => {
    const cid = certId || useAppStore.getState().activeCertId
    if (!cid) return
    let cancelled = false
    Promise.resolve().then(() => { if (!cancelled) setLoading(true) })
    fetch(`/api/multi/readiness?certificationId=${cid}`).then((r) => r.json()).then((d) => { if (!cancelled) setData(d.error ? null : d) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [certId])

  const activeCert = certs.find((c) => c.id === certId)

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10">Loading...</div>
  if (!data) return <div className="mx-auto max-w-5xl px-4 py-10 text-center"><p>Failed to load readiness.</p></div>

  const passRate = data.totalAttempts > 0 ? (data.passedAttempts / data.totalAttempts) * 100 : 0
  const masteryVals = Object.values(data.categoryMastery).map((c) => c.mastery)
  const minMastery = masteryVals.length ? Math.min(...masteryVals) : 0
  const allCovered = Object.values(data.categoryMastery).every((c) => c.total > 0)
  const checklist = [
    { label: 'Complete at least 3 exams', done: data.totalAttempts >= 3, detail: `${data.totalAttempts}/3` },
    { label: '75%+ on last 3 exams', done: data.recentScores.slice(-3).reduce((s, v) => s + v, 0) / Math.max(data.recentScores.slice(-3).length, 1) >= 75, detail: `${data.recentScores.length > 0 ? (data.recentScores.slice(-3).reduce((s, v) => s + v, 0) / Math.max(data.recentScores.slice(-3).length, 1)).toFixed(0) : 0}%` },
    { label: '65%+ in all categories', done: minMastery >= 65 && allCovered, detail: `${minMastery.toFixed(0)}%` },
    { label: 'Practice all categories', done: allCovered, detail: allCovered ? 'Yes' : 'No' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => setView('certifications')}><ArrowLeft className="h-4 w-4 mr-1" /> Certifications</Button>
      <div><h1 className="text-2xl font-bold">Readiness Assessment</h1><p className="text-sm text-muted-foreground mt-1">The system tells you when you are ready for the real exam.</p></div>

      {certs.length > 1 && <div className="flex flex-wrap gap-2">{certs.map((c) => <Button key={c.id} size="sm" variant={c.id === activeCert?.id ? 'default' : 'outline'} onClick={() => useAppStore.getState().setActiveCert(c.slug, c.id)} className="gap-1.5"><span>{c.icon}</span> {c.shortName}</Button>)}</div>}

      <Card className={data.ready ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50'}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full ${data.ready ? 'bg-green-100' : 'bg-amber-100'}`}>{data.ready ? <Trophy className="h-12 w-12 text-green-600" /> : <Clock className="h-12 w-12 text-amber-600" />}</div>
            <div className="flex-1 text-center sm:text-left">
              <Badge variant={data.ready ? 'default' : 'secondary'} className={`mb-2 ${data.ready ? 'bg-green-600' : 'bg-amber-500'} text-white`}>{data.ready ? 'READY' : 'NOT READY YET'}</Badge>
              <h2 className={`text-2xl font-bold ${data.ready ? 'text-green-700' : 'text-amber-700'}`}>{data.ready ? 'You are Ready!' : 'Keep Practicing'}</h2>
              <p className="text-sm text-muted-foreground mt-1.5">{data.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Exams</div><div className="text-2xl font-bold mt-1">{data.totalAttempts}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Pass Rate</div><div className="text-2xl font-bold mt-1 text-green-600">{passRate.toFixed(0)}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Average</div><div className="text-2xl font-bold mt-1">{data.averageScore.toFixed(0)}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Best</div><div className="text-2xl font-bold mt-1 text-amber-600">{data.bestScore.toFixed(0)}%</div></CardContent></Card>
      </div>

      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-teal-600" /> Readiness Checklist</CardTitle></CardHeader>
        <CardContent><div className="space-y-2">{checklist.map((item, i) => <div key={i} className="flex items-center gap-3 rounded-lg border p-3"><div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${item.done ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>{item.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}</div><div className="flex-1"><div className="text-sm font-medium">{item.label}</div><div className="text-xs text-muted-foreground">{item.detail}</div></div><Badge variant={item.done ? 'default' : 'outline'} className="text-[10px]">{item.done ? 'Done' : 'Pending'}</Badge></div>)}</div></CardContent>
      </Card>

      <Card><CardHeader className="pb-3"><CardTitle className="text-base">Category Mastery</CardTitle><CardDescription className="text-xs">Aim for 65%+ in all categories</CardDescription></CardHeader>
        <CardContent>{data.totalAttempts === 0 ? <div className="text-center py-6 text-sm text-muted-foreground">Take practice exams to see mastery.</div> : <div className="space-y-3">{data.categories.map((c) => { const m = data.categoryMastery[String(c.number)] || { attempts: 0, correct: 0, total: 0, mastery: 0 }; const pct = m.mastery; const status = pct >= 75 ? 'strong' : pct >= 65 ? 'fair' : pct > 0 ? 'weak' : 'none'; return <div key={c.id} className="flex items-center gap-3"><div className="flex h-7 w-7 items-center justify-center rounded text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: c.color }}>{c.number}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium truncate">{c.name}</span><span className={`text-xs font-semibold ${status === 'strong' ? 'text-green-600' : status === 'fair' ? 'text-amber-600' : status === 'weak' ? 'text-red-500' : 'text-muted-foreground'}`}>{pct.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-muted mt-1 overflow-hidden"><div className={`h-full ${status === 'strong' ? 'bg-green-500' : status === 'fair' ? 'bg-amber-500' : status === 'weak' ? 'bg-red-400' : 'bg-muted'} transition-all`} style={{ width: `${pct}%` }} /></div></div></div> })}</div>}</CardContent>
      </Card>

      {data.recentScores.length > 0 && (
        <Card><CardHeader className="pb-3"><CardTitle className="text-base">Score Trend</CardTitle></CardHeader>
          <CardContent><div className="flex items-end gap-1.5 h-32">{data.recentScores.map((score, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full flex items-end h-full"><div className={`w-full rounded-t ${score >= 70 ? 'bg-green-500' : 'bg-red-400'}`} style={{ height: `${Math.max(score, 5)}%` }} /></div><span className="text-[9px] text-muted-foreground">{score.toFixed(0)}</span></div>)}</div></CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        {!data.ready && <Button onClick={() => setView('practice')} className="bg-teal-600 hover:bg-teal-700"><ClipboardList className="h-4 w-4 mr-2" /> Take Practice Exam</Button>}
        {data.ready && <Button onClick={() => setView('practice')} className="bg-amber-600 hover:bg-amber-700"><Trophy className="h-4 w-4 mr-2" /> Final Exam</Button>}
        <Button variant="outline" onClick={() => setView('topics')}><BookOpen className="h-4 w-4 mr-2" /> Review Topics</Button>
      </div>
    </div>
  )
}
