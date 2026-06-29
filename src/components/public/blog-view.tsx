'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Post { id: string; title: string; slug: string; excerpt: string; coverImage: string | null; tags: string[]; authorName: string | null; publishedAt: string | null; views: number }

export function BlogView() {
  const setView = useAppStore((s) => s.setView)
  const setActiveBlog = useAppStore((s) => s.setActiveBlog)
  const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => { fetch('/api/blog').then((r) => r.json()).then((d) => setPosts(d.posts || [])) }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Button variant="ghost" size="sm" onClick={() => setView('landing')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button>
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-sm text-muted-foreground mb-8">Insights, tips, and guides for ITIL and DevOps certifications.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveBlog(p.slug); setView('blog-post') }}>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-1 mb-2">
                {p.tags.map((t, i) => <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.authorName || 'DOTAIBOOKS'}</span>
                {p.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.publishedAt).toLocaleDateString()}</span>}
                <span>{p.views} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
