'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function AdminContent() {
  const { toast } = useToast()
  const [sections, setSections] = useState<Array<{ sectionKey: string; title: string; subtitle: string | null; content: Record<string, unknown>; isVisible: boolean; sortOrder: number }>>([])
  const [testimonials, setTestimonials] = useState<Array<{ id: string; name: string; role: string | null; company: string | null; content: string; rating: number; isVisible: boolean }>>([])

  useEffect(() => { fetch('/api/admin/landing').then((r) => r.json()).then((d) => { setSections(d.sections || []); setTestimonials(d.testimonials || []) }) }, [])

  async function saveSection(s: typeof sections[0]) {
    await fetch('/api/admin/landing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    toast({ title: 'Section saved' })
  }

  function updateContent(s: typeof sections[0], key: string, value: unknown) {
    setSections((arr) => arr.map((x) => x.sectionKey === s.sectionKey ? { ...x, content: { ...x.content, [key]: value } } : x))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Landing Page Content</h1><p className="text-sm text-muted-foreground mt-1">Edit hero, features, stats, and CTA sections.</p></div>
      {sections.map((s) => (
        <Card key={s.sectionKey}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base capitalize">{s.sectionKey}</CardTitle><div className="flex items-center gap-2"><Switch checked={s.isVisible} onCheckedChange={(v) => setSections((arr) => arr.map((x) => x.sectionKey === s.sectionKey ? { ...x, isVisible: v } : x))} /><Button size="sm" onClick={() => saveSection(s)}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button></div></div></CardHeader>
          <CardContent className="space-y-2">
            <div><Label className="text-[11px]">Title</Label><Input value={s.title} onChange={(e) => setSections((arr) => arr.map((x) => x.sectionKey === s.sectionKey ? { ...x, title: e.target.value } : x))} /></div>
            <div><Label className="text-[11px]">Subtitle</Label><Input value={s.subtitle || ''} onChange={(e) => setSections((arr) => arr.map((x) => x.sectionKey === s.sectionKey ? { ...x, subtitle: e.target.value } : x))} /></div>
            {s.sectionKey === 'hero' && (<>
              <div><Label className="text-[11px]">Badge text</Label><Input value={String((s.content as { badge?: string }).badge || '')} onChange={(e) => updateContent(s, 'badge', e.target.value)} /></div>
              <div><Label className="text-[11px]">Primary button text</Label><Input value={String((s.content as { primaryCta?: string }).primaryCta || '')} onChange={(e) => updateContent(s, 'primaryCta', e.target.value)} /></div>
              <div><Label className="text-[11px]">Secondary button text</Label><Input value={String((s.content as { secondaryCta?: string }).secondaryCta || '')} onChange={(e) => updateContent(s, 'secondaryCta', e.target.value)} /></div>
            </>)}
            {s.sectionKey === 'cta' && (<>
              <div><Label className="text-[11px]">Primary CTA</Label><Input value={String((s.content as { primaryCta?: string }).primaryCta || '')} onChange={(e) => updateContent(s, 'primaryCta', e.target.value)} /></div>
              <div><Label className="text-[11px]">Secondary CTA</Label><Input value={String((s.content as { secondaryCta?: string }).secondaryCta || '')} onChange={(e) => updateContent(s, 'secondaryCta', e.target.value)} /></div>
            </>)}
            {s.sectionKey === 'stats' && (
              <div><Label className="text-[11px]">Stats (JSON)</Label><Textarea className="h-24 text-xs font-mono" value={JSON.stringify((s.content as { stats?: unknown }).stats || [], null, 2)} onChange={(e) => { try { updateContent(s, 'stats', JSON.parse(e.target.value)) } catch { /* ignore */ } }} /></div>
            )}
            {s.sectionKey === 'features' && (
              <div><Label className="text-[11px]">Features (JSON)</Label><Textarea className="h-40 text-xs font-mono" value={JSON.stringify((s.content as { features?: unknown }).features || [], null, 2)} onChange={(e) => { try { updateContent(s, 'features', JSON.parse(e.target.value)) } catch { /* ignore */ } }} /></div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
