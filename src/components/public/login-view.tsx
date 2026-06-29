'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Copy, Check, Sparkles, Shield, User } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'superadmin@dotaibooks.com', password: 'Demo@2025', icon: Shield, color: 'from-violet-500 to-purple-600', desc: 'Full access to everything including user management' },
  { role: 'Admin', email: 'admin@dotaibooks.com', password: 'Demo@2025', icon: Sparkles, color: 'from-teal-500 to-emerald-600', desc: 'Manage content, resources, blog, settings' },
  { role: 'Member', email: 'member@dotaibooks.com', password: 'Demo@2025', icon: User, color: 'from-sky-500 to-cyan-600', desc: 'Study topics, practice exams, readiness tracking' },
]

export function LoginView() {
  const setView = useAppStore((s) => s.setView)
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) { toast({ title: 'Welcome back!' }); setView('dashboard') }
    else toast({ title: 'Login failed', description: res.error, variant: 'destructive' })
  }

  function applyCredential(c: typeof DEMO_CREDENTIALS[0]) {
    setEmail(c.email)
    setPassword(c.password)
    toast({ title: `${c.role} credentials applied`, description: 'Click Sign In to continue' })
  }

  async function copyCredential(c: typeof DEMO_CREDENTIALS[0]) {
    const text = `${c.email} / ${c.password}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(c.role)
      setTimeout(() => setCopied(null), 2000)
      toast({ title: 'Copied to clipboard' })
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>

      <Card className="animate-scale-in shadow-xl border-teal-100">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to <span className="gradient-text">DOTAIBOOKS</span></CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Sign In
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account? <button onClick={() => setView('register')} className="text-teal-600 font-medium hover:underline">Sign up</button>
          </p>
        </CardContent>
      </Card>

      {/* Demo credentials */}
      <div className="mt-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
          <Badge variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
            <Sparkles className="h-2.5 w-2.5 mr-1" /> Demo Credentials
          </Badge>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
        </div>
        <p className="text-center text-xs text-muted-foreground mb-3">Click a role to auto-fill the form, or copy credentials</p>
        <div className="space-y-2">
          {DEMO_CREDENTIALS.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.role} className="group rounded-xl border bg-card overflow-hidden card-lift">
                <div className={`h-1 bg-gradient-to-r ${c.color}`} />
                <div className="p-3 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} text-white shrink-0 shadow`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{c.role}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{c.email}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.desc}</div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="default" className="h-7 text-[11px] px-2 bg-gradient-to-r from-teal-600 to-emerald-600" onClick={() => applyCredential(c)}>
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => copyCredential(c)}>
                      {copied === c.role ? <Check className="h-3 w-3 mr-0.5 text-green-600" /> : <Copy className="h-3 w-3 mr-0.5" />}
                      {copied === c.role ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
