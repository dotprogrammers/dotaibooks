'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Save, Trash2, Edit3, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Post { id: string; title: string; slug: string; excerpt: string; content: string; tags: string[]; status: string; coverImage: string | null; seoTitle: string | null; seoDescription: string | null }

export function AdminBlog() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [editing, setEditing] = useState<Post | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetch('/api/admin/blog').then((r) => r.json()).then((d) => setPosts(d.posts || [])) }, [])

  async function save(p: Post) {
    const res = await fetch('/api/admin/blog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
    if (res.ok) { toast({ title: 'Post saved' }); setEditing(null); fetch('/api/admin/blog').then((r) => r.json()).then((d) => setPosts(d.posts || [])) }
  }
  async function create(data: Partial<Post>) {
    const res = await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) { toast({ title: 'Post created' }); setCreating(false); fetch('/api/admin/blog').then((r) => r.json()).then((d) => setPosts(d.posts || [])) }
  }
  async function del(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
    setPosts((p) => p.filter((x) => x.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Blog</h1><p className="text-sm text-muted-foreground mt-1">Manage blog posts.</p></div><Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1.5" /> New Post</Button></div>
      {creating && <PostEditor onSave={create} onCancel={() => setCreating(false)} />}
      {editing && <PostEditor post={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="space-y-2">
        {posts.map((p) => (
          <Card key={p.id}><CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="text-sm font-medium truncate">{p.title}</span><Badge variant={p.status === 'published' ? 'default' : 'secondary'} className="text-[9px]">{p.status}</Badge></div>
              <div className="text-[11px] text-muted-foreground truncate">{p.excerpt}</div>
            </div>
            <div className="flex gap-1 shrink-0"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(p)}><Edit3 className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}

function PostEditor({ post, onSave, onCancel }: { post?: Post; onSave: (p: Post | Partial<Post>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState((post?.tags || []).join(', '))
  const [status, setStatus] = useState(post?.status || 'draft')
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || '')

  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-semibold">{post ? 'Edit Post' : 'New Post'}</h3><Button size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button></div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div><Label className="text-[11px]">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label className="text-[11px]">Slug (optional)</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" /></div>
      </div>
      <div><Label className="text-[11px]">Excerpt</Label><Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} /></div>
      <div><Label className="text-[11px]">Content (Markdown)</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} className="h-40 text-xs font-mono" /></div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div><Label className="text-[11px]">Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
        <div><Label className="text-[11px]">Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
      </div>
      <div><Label className="text-[11px]">SEO Title</Label><Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></div>
      <div><Label className="text-[11px]">SEO Description</Label><Input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></div>
      <Button onClick={() => onSave({ ...(post || {}), title, slug, excerpt, content, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), status, seoTitle, seoDescription })}><Save className="h-4 w-4 mr-1.5" /> Save Post</Button>
    </CardContent></Card>
  )
}
