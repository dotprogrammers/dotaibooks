'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Plan { id: string; name: string; slug: string; description: string; priceMonthly: number; priceYearly: number; currency: string; features: string[]; isPopular: boolean }

export function PricingView() {
  const setView = useAppStore((s) => s.setView)
  const { user } = useAuth()
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => { fetch('/api/plans').then((r) => r.json()).then((d) => setPlans(d.plans || [])) }, [])

  async function subscribe(slug: string) {
    if (!user) { setView('register'); return }
    setLoading(slug)
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planSlug: slug, billingCycle: cycle }) })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Subscription active!', description: data.message }); setView('dashboard') }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Failed', variant: 'destructive' }) }
    finally { setLoading(null) }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>
      <div className="text-center mb-8">
        <Badge className="mb-2 bg-teal-600"><Sparkles className="h-3 w-3 mr-1" /> Membership Plans</Badge>
        <h1 className="text-3xl font-bold">Choose your plan</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">Unlock AI-powered study materials, video explainers, and unlimited practice exams.</p>
        <div className="inline-flex items-center gap-1 mt-4 p-1 rounded-lg bg-muted">
          <button onClick={() => setCycle('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${cycle === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Monthly</button>
          <button onClick={() => setCycle('yearly')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${cycle === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Yearly <span className="text-[10px] text-teal-600 font-bold">SAVE 17%</span></button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((p) => (
          <Card key={p.id} className={p.isPopular ? 'border-teal-500 border-2 shadow-lg relative' : ''}>
            {p.isPopular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600">Most Popular</Badge>}
            <CardHeader className="pb-2">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">${cycle === 'monthly' ? p.priceMonthly : p.priceYearly}</span>
                <span className="text-sm text-muted-foreground">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <Button className="w-full mt-3" disabled={loading === p.slug} variant={p.isPopular ? 'default' : 'outline'} onClick={() => subscribe(p.slug)} >
                {loading === p.slug ? 'Processing...' : p.priceMonthly === 0 ? 'Start Free' : 'Subscribe'}
              </Button>
              <ul className="mt-4 space-y-2">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
