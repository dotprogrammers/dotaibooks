'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Trash2, FileStack, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Resource {
  id: string
  fileName: string
  title: string
  category: string
  fileSize: number
  pageCount: number
  status: string
  uploadedAt: string
  description: string | null
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  syllabus: { label: 'Syllabus', color: 'bg-teal-100 text-teal-700' },
  'sample-paper': { label: 'Sample Paper', color: 'bg-sky-100 text-sky-700' },
  answers: { label: 'Answers & Rationales', color: 'bg-violet-100 text-violet-700' },
  glossary: { label: 'Glossary', color: 'bg-amber-100 text-amber-700' },
  'release-notes': { label: 'Release Notes', color: 'bg-slate-100 text-slate-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

const MAX_SIZE = 500 * 1024 * 1024

export function ResourcesView() {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadResources = useCallback(async () => {
    try {
      const res = await fetch('/api/resources')
      const data = await res.json()
      setResources(data.resources || [])
    } catch {
      toast({ title: 'Failed to load resources', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  async function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files)
    const pdfs = fileArr.filter((f) => f.name.toLowerCase().endsWith('.pdf'))
    if (pdfs.length === 0) {
      toast({ title: 'Please upload PDF files only', variant: 'destructive' })
      return
    }
    const totalSize = pdfs.reduce((s, f) => s + f.size, 0)
    if (totalSize > MAX_SIZE) {
      toast({
        title: 'Upload too large',
        description: `Total size ${(totalSize / 1024 / 1024).toFixed(1)}MB exceeds 500MB limit.`,
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    setProgress(0)
    const formData = new FormData()
    pdfs.forEach((f) => formData.append('files', f))

    // Simulate progress while uploading
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90))
    }, 500)

    try {
      const res = await fetch('/api/resources', { method: 'POST', body: formData })
      const data = await res.json()
      clearInterval(interval)
      setProgress(100)
      if (res.ok) {
        toast({
          title: `${data.count} resource(s) uploaded`,
          description: 'Text extracted and ready for AI processing.',
        })
        await loadResources()
      } else {
        toast({ title: 'Upload failed', description: data.error, variant: 'destructive' })
      }
    } catch (err) {
      clearInterval(interval)
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 800)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this resource?')) return
    try {
      await fetch(`/api/resources?id=${id}`, { method: 'DELETE' })
      toast({ title: 'Resource deleted' })
      await loadResources()
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const totalSize = resources.reduce((s, r) => s + r.fileSize, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload ITIL study PDFs (syllabus, sample papers, glossary). The system extracts text for AI-powered topic and question generation. Supports up to 500MB per upload.
        </p>
      </div>

      {/* Upload zone */}
      <Card className={dragActive ? 'border-teal-500 border-2' : 'border-dashed'}>
        <CardContent
          className="p-6 sm:p-10"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
          }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
            </div>
            <div>
              <p className="font-medium">
                {uploading ? 'Uploading & extracting text...' : 'Drag & drop PDF files here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse · Multiple PDFs up to 500MB total
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            {!uploading && (
              <Button onClick={() => inputRef.current?.click()} className="mt-1">
                <FileStack className="h-4 w-4 mr-1.5" /> Select PDF Files
              </Button>
            )}
            {uploading && (
              <div className="w-full max-w-sm space-y-1.5">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{progress.toFixed(0)}% · Extracting text from PDFs...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resources list */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Uploaded Resources
          <Badge variant="secondary">{resources.length}</Badge>
        </h2>
        {resources.length > 0 && (
          <span className="text-sm text-muted-foreground">Total: {formatSize(totalSize)}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No resources uploaded yet.</p>
            <p className="text-xs mt-1">Upload your ITIL study PDFs to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {resources.map((r) => {
            const cat = CATEGORY_LABELS[r.category] || CATEGORY_LABELS.other
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-tight">{r.title}</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{r.fileName}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge variant="secondary" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.pageCount} pages</Badge>
                        <Badge variant="outline" className="text-[10px]">{formatSize(r.fileSize)}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{r.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
