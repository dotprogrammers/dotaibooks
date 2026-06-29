'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Shield, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'

interface UserRow { id: string; email: string; name: string | null; role: string; avatar: string | null; isActive: boolean; createdAt: string }

export function AdminUsers() {
  const { toast } = useToast()
  const { user: me } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(d.users || [])).finally(() => setLoading(false)) }, [])

  async function updateRole(id: string, role: string) {
    await fetch(`/api/admin/users?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    setUsers((u) => u.map((x) => x.id === id ? { ...x, role } : x))
    toast({ title: 'Role updated' })
  }
  async function toggleActive(u: UserRow) {
    await fetch(`/api/admin/users?id=${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !u.isActive }) })
    setUsers((us) => us.map((x) => x.id === u.id ? { ...x, isActive: !x.isActive } : x))
  }
  async function del(id: string) {
    if (!confirm('Delete this user?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    setUsers((u) => u.filter((x) => x.id !== id))
    toast({ title: 'User deleted' })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <div><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-muted-foreground mt-1">Manage user roles and access.</p></div>
      {loading ? <div>Loading...</div> : (
        <Card><CardContent className="p-0">
          <div className="divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-sm shrink-0">{u.name?.charAt(0) || u.email.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name || '—'} {u.id === me?.id && <Badge variant="outline" className="text-[9px] ml-1">You</Badge>}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                </div>
                <Badge variant={u.isActive ? 'default' : 'outline'} className="text-[9px]">{u.isActive ? 'Active' : 'Disabled'}</Badge>
                <Select value={u.role} onValueChange={(r) => updateRole(u.id, r)} disabled={u.id === me?.id}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="MEMBER">Member</SelectItem><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="SUPER_ADMIN">Super Admin</SelectItem></SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(u)} disabled={u.id === me?.id}>{u.isActive ? 'Disable' : 'Enable'}</Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => del(u.id)} disabled={u.id === me?.id}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </div>
  )
}
