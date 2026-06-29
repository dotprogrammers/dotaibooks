'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, FileText, ClipboardList, DollarSign, FileEdit, CreditCard, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats { users: number; certs: number; topics: number; questions: number; resources: number; exams: number; payments: number; blogs: number; plans: number; revenue: number }
interface RecentAttempt { id: string; score: number; totalMarks: number; percentage: number; passed: boolean; completedAt: string; user: { email: string; name: string | null }; exam: { title: string } }
interface RecentUser { id: string; email: string; name: string | null; role: string; createdAt: string }

export function AdminDashboard() {
  const [data, setData] = useState<{ stats: Stats; recentAttempts: RecentAttempt[]; recentUsers: RecentUser[] } | null>(null)
  useEffect(() => { fetch('/api/admin/stats').then((r) => r.json()).then(setData) }, [])

  if (!data) return <div className="p-6">Loading...</div>
  const s = data.stats
  const cards = [
    { label: 'Users', value: s.users, icon: Users, color: 'text-sky-600 bg-sky-50' },
    { label: 'Certifications', value: s.certs, icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
    { label: 'Topics', value: s.topics, icon: FileEdit, color: 'text-violet-600 bg-violet-50' },
    { label: 'Questions', value: s.questions, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
    { label: 'Resources', value: s.resources, icon: FileText, color: 'text-rose-600 bg-rose-50' },
    { label: 'Exams Taken', value: s.exams, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Payments', value: s.payments, icon: CreditCard, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Revenue', value: `$${s.revenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Blog Posts', value: s.blogs, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-sm text-muted-foreground mt-1">Platform overview and recent activity.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          return <Card key={c.label}><CardContent className="p-4"><div className="flex items-center justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}><Icon className="h-4 w-4" /></div><div className="text-2xl font-bold">{c.value}</div></div><div className="text-xs text-muted-foreground mt-2">{c.label}</div></CardContent></Card>
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Recent Exam Attempts</CardTitle></CardHeader>
          <CardContent>{data.recentAttempts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No attempts yet.</p> : <div className="space-y-2 max-h-80 overflow-y-auto">{data.recentAttempts.map((a) => <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5"><div className="min-w-0"><div className="text-sm font-medium truncate">{a.exam.title}</div><div className="text-[11px] text-muted-foreground">{a.user.name || a.user.email} · {new Date(a.completedAt).toLocaleDateString()}</div></div><div className="flex items-center gap-2 shrink-0"><span className={`text-sm font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>{a.percentage.toFixed(0)}%</span><Badge variant={a.passed ? 'default' : 'destructive'} className="text-[9px]">{a.passed ? 'PASS' : 'FAIL'}</Badge></div></div>)}</div>}</CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">New Users</CardTitle></CardHeader>
          <CardContent>{data.recentUsers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No users yet.</p> : <div className="space-y-2 max-h-80 overflow-y-auto">{data.recentUsers.map((u) => <div key={u.id} className="flex items-center justify-between rounded-lg border p-2.5"><div className="min-w-0"><div className="text-sm font-medium truncate">{u.name || u.email}</div><div className="text-[11px] text-muted-foreground">{u.email} · {new Date(u.createdAt).toLocaleDateString()}</div></div><Badge variant={u.role === 'SUPER_ADMIN' ? 'default' : u.role === 'ADMIN' ? 'secondary' : 'outline'} className="text-[9px]">{u.role}</Badge></div>)}</div>}</CardContent>
        </Card>
      </div>
    </div>
  )
}
