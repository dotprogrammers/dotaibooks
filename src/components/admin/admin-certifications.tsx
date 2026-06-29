'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Cert { id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; provider: string; totalQuestions: number; examDuration: number; passPercentage: number; isPublished: boolean; _count: { topics: number; questions: number; categories: number } }

export function AdminCertifications() {
  const setView = useAppStore((s) => s.setView)
  const [certs, setCerts] = useState<Cert[]>([])
  useEffect(() => { fetch('/api/certifications').then((r) => r.json()).then((d) => setCerts(d.certifications || [])) }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Certifications</h1><p className="text-sm text-muted-foreground mt-1">Manage certification content. Upload PDFs to generate topics & questions via AI.</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((c) => (
          <Card key={c.id}><CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
              <div className="flex-1 min-w-0"><h3 className="font-bold leading-tight">{c.shortName}</h3><p className="text-[11px] text-muted-foreground">{c.provider}</p></div>
              <Badge variant={c.isPublished ? 'default' : 'secondary'} className="text-[9px]">{c.isPublished ? 'Live' : 'Hidden'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.name}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="outline" className="text-[10px]">{c._count.topics} topics</Badge>
              <Badge variant="outline" className="text-[10px]">{c._count.questions} questions</Badge>
              <Badge variant="outline" className="text-[10px]">{c._count.categories} categories</Badge>
              <Badge variant="outline" className="text-[10px]">{c.totalQuestions}Q · {c.examDuration}m</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => setView('admin-resources')} className="w-full"><BookOpen className="h-4 w-4 mr-1.5" /> Manage Resources <ArrowRight className="h-3.5 w-3.5" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
