'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, ClipboardList, CheckCircle2, BookOpen, ArrowRight, Clock, TrendingUp, Sparkles, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Cert { id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; description: string; _count: { topics: number; questions: number } }

export function DashboardView() {
  const setView = useAppStore((s) => s.setView)
  const setActiveCert = useAppStore((s) => s.setActiveCert)
  const { user } = useAuth()
  const [certs, setCerts] = useState<Cert[]>([])
  const [membership, setMembership] = useState<{ memberships: unknown[]; subscription: { plan: { name: string } } | null } | null>(null)
  const [attempts, setAttempts] = useState<Array<{ id: string; examTitle: string; percentage: number; passed: boolean; completedAt: string; certificationId: string }>>([])

  useEffect(() => {
    fetch('/api/certifications').then((r) => r.json()).then((d) => setCerts(d.certifications || []))
    fetch('/api/membership').then((r) => r.json()).then(setMembership)
    fetch('/api/multi/exam/attempts').then((r) => r.json()).then((d) => setAttempts(d.attempts || []))
  }, [])

  const totalAttempts = attempts.length
  const passed = attempts.filter((a) => a.passed).length
  const avg = attempts.length ? attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length : 0

  function openCert(c: Cert) { setActiveCert(c.slug, c.id); setView('topics') }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Learner'}!</h1>
            <p className="text-sm text-white/90 mt-1">Continue your certification journey. Pick up where you left off.</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {membership?.subscription ? `${membership.subscription.plan.name} Member` : 'Free Plan'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs"><BookOpen className="h-3.5 w-3.5" /> Certifications</div><div className="text-2xl font-bold mt-1">{certs.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs"><ClipboardList className="h-3.5 w-3.5" /> Exams Taken</div><div className="text-2xl font-bold mt-1">{totalAttempts}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Passed</div><div className="text-2xl font-bold mt-1 text-green-600">{passed}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="h-3.5 w-3.5" /> Average</div><div className="text-2xl font-bold mt-1">{avg.toFixed(0)}%</div></CardContent></Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Certifications</h2>
          <Button variant="ghost" size="sm" onClick={() => setView('certifications')}>View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {certs.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openCert(c)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-tight">{c.shortName}</h3>
                    <p className="text-[11px] text-muted-foreground">{c.name}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">{c._count.topics} topics</Badge>
                  <Badge variant="secondary" className="text-[10px]">{c._count.questions} questions</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {attempts.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Recent Exams</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {attempts.slice(0, 8).map((a) => {
                const cert = certs.find((c) => c.id === a.certificationId)
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="min-w-0"><div className="text-sm font-medium truncate">{a.examTitle}</div><div className="text-[11px] text-muted-foreground">{cert?.shortName} · {new Date(a.completedAt).toLocaleDateString()}</div></div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>{a.percentage.toFixed(0)}%</span>
                      <Badge variant={a.passed ? 'default' : 'destructive'} className="text-[10px]">{a.passed ? 'PASS' : 'FAIL'}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!membership?.subscription && (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-teal-600" />
              <div><h3 className="font-semibold">Upgrade to Pro</h3><p className="text-sm text-muted-foreground">Unlock all certifications, AI video explainers, and unlimited exams.</p></div>
            </div>
            <Button onClick={() => setView('membership')} className="bg-teal-600 hover:bg-teal-700 shrink-0"><CreditCard className="h-4 w-4 mr-1.5" /> View Plans</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
