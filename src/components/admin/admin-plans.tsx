'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save, Trash2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Plan { id: string; name: string; slug: string; description: string; priceMonthly: number; priceYearly: number; currency: string; features: string[]; isPopular: boolean; isActive: boolean; sortOrder: number }

export function AdminPlans() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  useEffect(() => { fetch('/api/admin/plans').then((r) => r.json()).then((d) => setPlans(d.plans || [])) }, [])

  function update(id: string, field: string, value: unknown) {
    setPlans((p) => p.map((x) => x.id === id ? { ...x, [field]: value } : x))
  }
  function updateFeature(id: string, i: number, value: string) {
    setPlans((p) => p.map((x) => { if (x.id !== id) return x; const f = [...x.features]; f[i] = value; return { ...x, features: f } }))
  }
  async function save(p: Plan) {
    const res = await fetch('/api/admin/plans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, features: p.features }) })
    if (res.ok) toast({ title: 'Plan saved' })
  }
  async function del(id: string) {
    if (!confirm('Delete this plan?')) return
    await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' })
    setPlans((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Membership Plans</h1><p className="text-sm text-muted-foreground mt-1">Configure pricing and features.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <Card key={p.id}><CardHeader className="pb-2"><div className="flex items-center justify-between"><h3 className="font-bold">{p.name}</h3><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => save(p)}><Save className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div></CardHeader>
            <CardContent className="space-y-2">
              <div><Label className="text-[11px]">Description</Label><Textarea value={p.description} onChange={(e) => update(p.id, 'description', e.target.value)} className="h-12 text-xs" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[11px]">Monthly ($)</Label><Input type="number" value={p.priceMonthly} onChange={(e) => update(p.id, 'priceMonthly', Number(e.target.value))} className="h-8 text-xs" /></div>
                <div><Label className="text-[11px]">Yearly ($)</Label><Input type="number" value={p.priceYearly} onChange={(e) => update(p.id, 'priceYearly', Number(e.target.value))} className="h-8 text-xs" /></div>
              </div>
              <div><Label className="text-[11px]">Features (one per line)</Label><Textarea value={p.features.join('\n')} onChange={(e) => update(p.id, 'features', e.target.value.split('\n'))} className="h-20 text-xs" /></div>
              <div className="flex items-center gap-4"><div className="flex items-center gap-2"><Switch checked={p.isPopular} onCheckedChange={(v) => update(p.id, 'isPopular', v)} /><Label className="text-xs">Popular</Label></div><div className="flex items-center gap-2"><Switch checked={p.isActive} onCheckedChange={(v) => update(p.id, 'isActive', v)} /><Label className="text-xs">Active</Label></div></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
