'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Post { id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string | null; tags: string[]; authorName: string | null; publishedAt: string | null; views: number; seoTitle: string | null; seoDescription: string | null }

export function BlogPostView() {
  const setView = useAppStore((s) => s.setView)
  const slug = useAppStore((s) => s.activeBlogSlug)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog/${slug}`).then((r) => r.json()).then((d) => setPost(d.post || null)).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10">Loading...</div>
  if (!post) return <div className="mx-auto max-w-3xl px-4 py-10">Post not found. <Button variant="link" onClick={() => setView('blog')}>Back to blog</Button></div>

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <Button variant="ghost" size="sm" onClick={() => setView('blog')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> All posts</Button>
      <div className="flex flex-wrap gap-1 mb-3">
        {post.tags.map((t, i) => <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>)}
      </div>
      <h1 className="text-3xl font-bold leading-tight mb-3">{post.title}</h1>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b">
        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.authorName || 'DOTAIBOOKS'}</span>
        {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString()}</span>}
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
      </div>
      <div className="prose prose-sm max-w-none text-sm leading-relaxed space-y-3">
        {post.content.split('\n').map((line, i) => {
          if (!line.trim()) return null
          if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-base mt-4">{line.slice(4)}</h4>
          if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-lg mt-4">{line.slice(3)}</h3>
          if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-xl mt-4">{line.slice(2)}</h2>
          if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>
          return <p key={i} className="text-sm">{line}</p>
        })}
      </div>
    </div>
  )
}
