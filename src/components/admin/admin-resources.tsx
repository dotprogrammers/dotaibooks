'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Trash2, FileStack, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Resource { id: string; fileName: string; title: string; category: string; fileSize: number; pageCount: number; status: string; uploadedAt: string; certification: { shortName: string } | null }
interface Cert { id: string; shortName: string }

export function AdminResources() {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [certId, setCertId] = useState<string>('all')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/resources').then((r) => r.json()).then((d) => setResources(d.resources || [])).finally(() => setLoading(false))
    fetch('/api/certifications').then((r) => r.json()).then((d) => setCerts(d.certifications || []))
  }, [])

  async function handleFiles(files: FileList | File[]) {
    const pdfs = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) { toast({ title: 'PDF files only', variant: 'destructive' }); return }
    setUploading(true)
    const fd = new FormData()
    pdfs.forEach((f) => fd.append('files', f))
    if (certId !== 'all') fd.append('certificationId', certId)
    try {
      const res = await fetch('/api/admin/resources', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) { toast({ title: `${data.count} file(s) uploaded` }); fetch('/api/admin/resources').then((r) => r.json()).then((d) => setResources(d.resources || [])) }
      else toast({ title: 'Upload failed', description: data.error, variant: 'destructive' })
    } finally { setUploading(false) }
  }

  async function del(id: string) {
    if (!confirm('Delete this resource?')) return
    await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' })
    setResources((r) => r.filter((x) => x.id !== id))
    toast({ title: 'Deleted' })
  }

  function fmt(b: number) { return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB` }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Resources</h1><p className="text-sm text-muted-foreground mt-1">Upload syllabus, sample papers, and study PDFs (up to 500MB).</p></div>
      <Card className={dragActive ? 'border-teal-500 border-2' : 'border-dashed'}>
        <CardContent className="p-6" onDragOver={(e) => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files) }}>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">{uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}</div>
            <p className="font-medium text-sm">{uploading ? 'Uploading & extracting...' : 'Drag & drop PDFs or click to browse'}</p>
            <div className="flex items-center gap-2">
              <Select value={certId} onValueChange={setCertId}>
                <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All certifications</SelectItem>{certs.map((c) => <SelectItem key={c.id} value={c.id}>{c.shortName}</SelectItem>)}</SelectContent>
              </Select>
              <input ref={inputRef} type="file" multiple accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}><FileStack className="h-4 w-4 mr-1.5" /> Select PDFs</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between"><h2 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Files <Badge variant="secondary">{resources.length}</Badge></h2></div>
      {loading ? <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div> : resources.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No resources yet.</CardContent></Card> :
        <div className="grid sm:grid-cols-2 gap-3">
          {resources.map((r) => (
            <Card key={r.id}><CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-medium text-sm leading-tight">{r.title}</h3><Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
                  <p className="text-[11px] text-muted-foreground truncate">{r.fileName}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2"><Badge variant="secondary" className="text-[9px]">{r.certification?.shortName || '—'}</Badge><Badge variant="outline" className="text-[9px]">{r.pageCount}p</Badge><Badge variant="outline" className="text-[9px]">{fmt(r.fileSize)}</Badge><Badge variant="outline" className="text-[9px] capitalize">{r.category}</Badge></div>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>}
    </div>
  )
}
