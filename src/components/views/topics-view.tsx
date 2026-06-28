'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SYLLABUS_CATEGORIES } from '@/lib/itil-data'
import { GraduationCap, Search, ArrowLeft, ImageIcon, Lightbulb, BookOpen, Loader2, Sparkles, Layers, PlayCircle, Film } from 'lucide-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

interface Topic {
  id: string
  categoryId: string
  categoryName: string
  subTopicId: string
  title: string
  summary: string
  keyConcepts: string[]
  content: string
  bloomsLevel: number
  syllabusRef: string | null
  difficulty: string
  imageUrl: string | null
  videoUrl: string | null
  visualPrompt: string | null
  order: number
}

export function TopicsView() {
  const { toast } = useToast()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  useEffect(() => {
    loadTopics()
  }, [])

  async function loadTopics() {
    try {
      const res = await fetch('/api/topics')
      const data = await res.json()
      setTopics(data.topics || [])
    } catch {
      toast({ title: 'Failed to load topics', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
      }
      return true
    })
  }, [topics, selectedCategory, search])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    topics.forEach((t) => { counts[t.categoryId] = (counts[t.categoryId] || 0) + 1 })
    return counts
  }, [topics])

  if (selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learn Topics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated study topics with explanations, key concepts, and visual aids to help you memorize the ITIL 5 framework.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No topics generated yet.</p>
            <p className="text-xs mt-1">Topics are generated from your uploaded study materials using AI.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All ({topics.length})
            </Button>
            {SYLLABUS_CATEGORIES.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={selectedCategory === c.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(c.id)}
                className="gap-1.5"
                style={selectedCategory === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold" style={{ backgroundColor: selectedCategory === c.id ? 'rgba(255,255,255,0.3)' : c.color, color: selectedCategory === c.id ? 'white' : 'white' }}>
                  {c.number}
                </span>
                <span className="hidden sm:inline">{c.name}</span>
                <span className="sm:hidden">{c.number}</span>
                <Badge variant="secondary" className="text-[9px] ml-0.5">{categoryCounts[c.id] || 0}</Badge>
              </Button>
            ))}
          </div>

          {/* Topics grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No topics match your filters.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((t) => {
                const cat = SYLLABUS_CATEGORIES.find((c) => c.id === t.categoryId)
                return (
                  <Card
                    key={t.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                    onClick={() => setSelectedTopic(t)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: cat?.color || '#64748b' }}
                        >
                          {t.subTopicId}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight">{t.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.summary}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: (cat?.color || '#64748b') + '20', color: cat?.color }}>
                              {t.categoryName}
                            </Badge>
                            {t.videoUrl && (
                              <Badge variant="outline" className="text-[10px] gap-1 border-teal-300 text-teal-700">
                                <Film className="h-2.5 w-2.5" /> Video
                              </Badge>
                            )}
                            {t.imageUrl && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <ImageIcon className="h-2.5 w-2.5" /> Visual
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">BL{t.bloomsLevel}</Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">{t.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TopicDetail({ topic, onBack }: { topic: Topic; onBack: () => void }) {
  const cat = SYLLABUS_CATEGORIES.find((c) => c.id === topic.categoryId)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)

  function toggleVideo() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setVideoPlaying(true)
    } else {
      v.pause()
      setVideoPlaying(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-1">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Topics
      </Button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold shrink-0" style={{ backgroundColor: cat?.color || '#64748b' }}>
          {topic.subTopicId}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: (cat?.color || '#64748b') + '20', color: cat?.color }}>
              {topic.categoryName}
            </Badge>
            <Badge variant="outline" className="text-[10px]">Bloom's Level {topic.bloomsLevel}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{topic.difficulty}</Badge>
            {topic.syllabusRef && <Badge variant="outline" className="text-[10px]">Ref: {topic.syllabusRef}</Badge>}
            {topic.videoUrl && (
              <Badge className="text-[10px] bg-teal-600 hover:bg-teal-600 gap-1">
                <Film className="h-2.5 w-2.5" /> Video Explainer
              </Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{topic.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{topic.summary}</p>
        </div>
      </div>

      {/* Premium Video Explainer - featured prominently */}
      {topic.videoUrl && (
        <Card className="overflow-hidden border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PlayCircle className="h-4 w-4 text-teal-600" /> Watch: 6-Second Video Explainer
            </CardTitle>
            <CardDescription className="text-xs">AI-generated short animation to help you visualize and memorize this topic</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative group bg-black">
              <video
                ref={videoRef}
                src={topic.videoUrl}
                poster={topic.imageUrl || undefined}
                className="w-full aspect-video object-cover"
                controls
                loop
                playsInline
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => setVideoPlaying(false)}
              />
              {!videoPlaying && (
                <button
                  onClick={toggleVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
                  aria-label="Play video"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600/90 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-9 w-9" />
                  </span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Visual Image - shown if no video, or as supplementary */}
      {topic.imageUrl && !topic.videoUrl && (
        <Card className="overflow-hidden border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-teal-600" /> Visual Memory Aid
            </CardTitle>
            <CardDescription className="text-xs">AI-generated premium visual to help you memorize this topic</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <img src={topic.imageUrl} alt={`Visual representation of ${topic.title}`} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Key concepts */}
      {topic.keyConcepts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Key Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {topic.keyConcepts.map((kc, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm">{kc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-teal-600" /> Detailed Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-sm leading-relaxed space-y-3">
            {topic.content.split('\n').map((line, i) => {
              if (!line.trim()) return null
              if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-base mt-3">{line.slice(4)}</h4>
              if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3">{line.slice(3)}</h3>
              if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3">{line.slice(2)}</h2>
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>
              return <p key={i} className="text-sm">{line}</p>
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
        <Sparkles className="h-3 w-3" /> Generated by AI from your study materials
      </div>
    </div>
  )
}
