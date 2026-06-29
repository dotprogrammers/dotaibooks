'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function RegisterView() {
  const setView = useAppStore((s) => s.setView)
  const { register } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await register(email, password, name)
    setLoading(false)
    if (res.ok) { toast({ title: 'Account created!', description: 'Welcome to DOTAIBOOKS' }); setView('dashboard') }
    else toast({ title: 'Registration failed', description: res.error, variant: 'destructive' })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start your certification journey with AI-powered study</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              <p className="text-[11px] text-muted-foreground">Min 6 characters. The first registered account becomes Super Admin.</p>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <button onClick={() => setView('login')} className="text-teal-600 font-medium hover:underline">Sign in</button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
