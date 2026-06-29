'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Cert { id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; description: string; longDescription: string | null; provider: string; examDuration: number; totalQuestions: number; passMark: number; passPercentage: number; bloomsLevels: string; _count: { topics: number; questions: number; categories: number } }

export function CertificationsView() {
  const setView = useAppStore((s) => s.setView)
  const setActiveCert = useAppStore((s) => s.setActiveCert)
  const [certs, setCerts] = useState<Cert[]>([])
  useEffect(() => { fetch('/api/certifications').then((r) => r.json()).then((d) => setCerts(d.certifications || [])) }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Certifications</h1><p className="text-sm text-muted-foreground mt-1">Choose a certification to start studying.</p></div>
      <div className="grid lg:grid-cols-2 gap-4">
        {certs.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl shrink-0" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg leading-tight">{c.shortName}</h3>
                    <Badge variant="secondary" className="text-[10px]">{c.provider}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{c.longDescription || c.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-[10px]">{c.totalQuestions} questions</Badge>
                <Badge variant="outline" className="text-[10px]">{c.examDuration} min</Badge>
                <Badge variant="outline" className="text-[10px]">{c.passPercentage}% to pass</Badge>
                <Badge variant="outline" className="text-[10px]">BL {c.bloomsLevels}</Badge>
                <Badge variant="outline" className="text-[10px]">{c._count.categories} categories</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setActiveCert(c.slug, c.id); setView('topics') }} className="bg-teal-600 hover:bg-teal-700"><BookOpen className="h-4 w-4 mr-1.5" /> Study <ArrowRight className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => { setActiveCert(c.slug, c.id); setView('practice') }}><ClipboardList className="h-4 w-4 mr-1.5" /> Practice</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
