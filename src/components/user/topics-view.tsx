'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowLeft, ImageIcon, Lightbulb, BookOpen, Sparkles, Film, PlayCircle, GraduationCap, ClipboardList, CheckCircle2 } from 'lucide-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

interface Topic { id: string; categoryId: string | null; categoryIdNum: string; categoryName: string; subTopicId: string; title: string; summary: string; keyConcepts: string[]; content: string; bloomsLevel: number; syllabusRef: string | null; difficulty: string; imageUrl: string | null; videoUrl: string | null; order: number }
interface Cert { id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; categories: { id: string; number: number; name: string; color: string }[] }

export function TopicsView() {
  const { toast } = useToast()
  const certId = useAppStore((s) => s.activeCertId)
  const certSlug = useAppStore((s) => s.activeCertSlug)
  const setView = useAppStore((s) => s.setView)
  const setActiveTopic = useAppStore((s) => s.setActiveTopic)
  const [topics, setTopics] = useState<Topic[]>([])
  const [cert, setCert] = useState<Cert | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  useEffect(() => {
    if (!certSlug) { setView('certifications'); return }
    fetch(`/api/certifications/${certSlug}`).then((r) => r.json()).then((d) => setCert(d.certification || null))
    if (certId) fetch(`/api/multi/topics?certificationId=${certId}`).then((r) => r.json()).then((d) => setTopics(d.topics || [])).finally(() => setLoading(false))
  }, [certId, certSlug, setView])

  const filtered = useMemo(() => topics.filter((t) => {
    if (selectedCat !== 'all' && t.categoryIdNum !== selectedCat) return false
    if (search) { const q = search.toLowerCase(); return t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) }
    return true
  }), [topics, selectedCat, search])

  if (selectedTopic) return <TopicDetail topic={selectedTopic} cert={cert} onBack={() => setSelectedTopic(null)} onViewTopic={(t) => { setSelectedTopic(t); setActiveTopic(t.id) }} />

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => setView('certifications')}><ArrowLeft className="h-4 w-4 mr-1" /> All Certifications</Button>
      <div className="flex items-start gap-3">
        {cert && <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0" style={{ backgroundColor: cert.color + '20' }}>{cert.icon}</div>}
        <div><h1 className="text-2xl font-bold">{cert?.shortName} — Study Topics</h1><p className="text-sm text-muted-foreground">{cert?.name}</p></div>
      </div>

      {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div> :
        topics.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" /><p>Topics are being generated. Check back soon!</p></CardContent></Card> :
        <>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={selectedCat === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCat('all')}>All ({topics.length})</Button>
            {cert?.categories.map((c) => <Button key={c.id} size="sm" variant={selectedCat === String(c.number) ? 'default' : 'outline'} onClick={() => setSelectedCat(String(c.number))} style={selectedCat === String(c.number) ? { backgroundColor: c.color, borderColor: c.color } : {}}>{c.number}. {c.name}</Button>)}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((t) => {
              const cat = cert?.categories.find((c) => String(c.number) === t.categoryIdNum)
              return (
                <Card key={t.id} className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5" onClick={() => { setSelectedTopic(t); setActiveTopic(t.id) }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0" style={{ backgroundColor: cat?.color || '#64748b' }}>{t.categoryIdNum}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight">{t.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.summary}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: (cat?.color || '#64748b') + '20', color: cat?.color }}>{t.categoryName}</Badge>
                          {t.videoUrl && <Badge variant="outline" className="text-[10px] gap-1 border-teal-300 text-teal-700"><Film className="h-2.5 w-2.5" /> Video</Badge>}
                          {t.imageUrl && <Badge variant="outline" className="text-[10px] gap-1"><ImageIcon className="h-2.5 w-2.5" /> Visual</Badge>}
                          <Badge variant="outline" className="text-[10px]">BL{t.bloomsLevel}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>}
      <div className="flex gap-2 pt-4">
        <Button onClick={() => setView('practice')} variant="outline"><ClipboardList className="h-4 w-4 mr-1.5" /> Practice Exams</Button>
        <Button onClick={() => setView('readiness')} variant="outline"><CheckCircle2 className="h-4 w-4 mr-1.5" /> Readiness</Button>
      </div>
    </div>
  )
}

function TopicDetail({ topic, cert, onBack }: { topic: Topic; cert: Cert | null; onBack: () => void; onViewTopic: (t: Topic) => void }) {
  const cat = cert?.categories.find((c) => String(c.number) === topic.categoryIdNum)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Topics</Button>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold shrink-0" style={{ backgroundColor: cat?.color || '#64748b' }}>{topic.categoryIdNum}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: (cat?.color || '#64748b') + '20', color: cat?.color }}>{topic.categoryName}</Badge>
            <Badge variant="outline" className="text-[10px]">BL{topic.bloomsLevel}</Badge>
            {topic.videoUrl && <Badge className="text-[10px] bg-teal-600 gap-1"><Film className="h-2.5 w-2.5" /> Video</Badge>}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{topic.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{topic.summary}</p>
        </div>
      </div>
      {topic.videoUrl && (
        <Card className="overflow-hidden border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-emerald-50"><CardTitle className="flex items-center gap-2 text-sm"><PlayCircle className="h-4 w-4 text-teal-600" /> Video Explainer</CardTitle><CardDescription className="text-xs">AI-generated short animation</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="relative group bg-black">
              <video ref={videoRef} src={topic.videoUrl} poster={topic.imageUrl || undefined} className="w-full aspect-video object-cover" controls loop playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
              {!playing && <button onClick={() => { videoRef.current?.play(); setPlaying(true) }} className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600/90 text-white shadow-lg group-hover:scale-110 transition-transform"><PlayCircle className="h-9 w-9" /></span></button>}
            </div>
          </CardContent>
        </Card>
      )}
      {topic.imageUrl && !topic.videoUrl && (
        <Card className="overflow-hidden border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-emerald-50"><CardTitle className="flex items-center gap-2 text-sm"><ImageIcon className="h-4 w-4 text-teal-600" /> Visual Memory Aid</CardTitle><CardDescription className="text-xs">Transparent AI-generated illustration — adapts to light/dark mode</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="image-frame w-full flex items-center justify-center p-4 sm:p-8">
              <img src={topic.imageUrl} alt={topic.title} className="w-full max-w-2xl mx-auto drop-shadow-2xl animate-scale-in" />
            </div>
          </CardContent>
        </Card>
      )}
      {topic.keyConcepts.length > 0 && (
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Lightbulb className="h-4 w-4 text-amber-500" /> Key Concepts</CardTitle></CardHeader>
          <CardContent><div className="grid sm:grid-cols-2 gap-2">{topic.keyConcepts.map((kc, i) => <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div><span className="text-sm">{kc}</span></div>)}</div></CardContent>
        </Card>
      )}
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-teal-600" /> Detailed Explanation</CardTitle></CardHeader>
        <CardContent><div className="prose prose-sm max-w-none text-sm leading-relaxed space-y-3">{topic.content.split('\n').map((line, i) => { if (!line.trim()) return null; if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-base mt-3">{line.slice(4)}</h4>; if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3">{line.slice(3)}</h3>; if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3">{line.slice(2)}</h2>; if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>; return <p key={i} className="text-sm">{line}</p> })}</div></CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2"><Sparkles className="h-3 w-3" /> Generated by AI</div>
    </div>
  )
}
