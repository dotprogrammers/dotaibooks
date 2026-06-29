'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, CreditCard, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Plan { id: string; name: string; slug: string; description: string; priceMonthly: number; priceYearly: number; features: string[]; isPopular: boolean }
interface MembershipData { memberships: Array<{ id: string; status: string; expiresAt: string | null; certification: { shortName: string } }>[]; subscription: { id: string; status: string; currentPeriodEnd: string | null; plan: { name: string; slug: string } } | null }

export function MembershipView() {
  const { toast } = useToast()
  const setView = useAppStore((s) => s.setView)
  const [plans, setPlans] = useState<Plan[]>([])
  const [data, setData] = useState<MembershipData | null>(null)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/plans').then((r) => r.json()).then((d) => setPlans(d.plans || []))
    fetch('/api/membership').then((r) => r.json()).then(setData)
  }, [])

  async function subscribe(slug: string) {
    setLoading(slug)
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planSlug: slug, billingCycle: cycle }) })
      const d = await res.json()
      if (res.ok) { toast({ title: 'Subscription active!', description: d.message }); setView('dashboard') }
      else toast({ title: 'Failed', description: d.error, variant: 'destructive' })
    } finally { setLoading(null) }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Membership</h1><p className="text-sm text-muted-foreground mt-1">Manage your subscription and access.</p></div>

      {data?.subscription && (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700"><CreditCard className="h-6 w-6" /></div>
                <div>
                  <div className="font-semibold text-lg">{data.subscription.plan.name} Plan</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><Badge variant="default" className="text-[10px] capitalize">{data.subscription.status}</Badge>{data.subscription.currentPeriodEnd && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Renews {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</span>}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.memberships && data.memberships.length > 0 && (
        <Card><CardHeader><h3 className="font-semibold">Your Certifications Access</h3></CardHeader><CardContent><div className="space-y-2">{data.memberships.map((m) => <div key={m.id} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm font-medium">{m.certification.shortName}</span><Badge variant={m.status === 'active' ? 'default' : 'outline'} className="text-[10px] capitalize">{m.status}</Badge></div>)}</div></CardContent></Card>
      )}

      <div className="text-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button onClick={() => setCycle('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${cycle === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Monthly</button>
          <button onClick={() => setCycle('yearly')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${cycle === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Yearly <span className="text-[10px] text-teal-600 font-bold">SAVE 17%</span></button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className={p.isPopular ? 'border-teal-500 border-2 shadow-lg relative' : ''}>
            {p.isPopular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600">Most Popular</Badge>}
            <CardHeader className="pb-2"><h3 className="font-bold text-lg">{p.name}</h3><p className="text-xs text-muted-foreground">{p.description}</p></CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-1"><span className="text-3xl font-bold">${cycle === 'monthly' ? p.priceMonthly : p.priceYearly}</span><span className="text-sm text-muted-foreground">/{cycle === 'monthly' ? 'mo' : 'yr'}</span></div>
              {data?.subscription?.plan.slug === p.slug ? <Badge className="w-full justify-center py-2 bg-green-600">Current Plan</Badge> : <Button className="w-full mt-3" disabled={loading === p.slug} variant={p.isPopular ? 'default' : 'outline'} onClick={() => subscribe(p.slug)}>{loading === p.slug ? 'Processing...' : p.priceMonthly === 0 ? 'Start Free' : 'Subscribe'}</Button>}
              <ul className="mt-4 space-y-2">{p.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" /><span>{f}</span></li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
