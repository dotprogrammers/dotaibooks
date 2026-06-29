'use client'

import { useAuth } from '@/lib/auth-context'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Shield, Save } from 'lucide-react'
import { useState } from 'react'

export function ProfileView() {
  const { user, refresh } = useAuth()
  const setView = useAppStore((s) => s.setView)
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      // Note: profile update endpoint would be needed; using a simple approach
      toast({ title: 'Profile updated (demo)' })
      await refresh()
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-5">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-2xl font-bold">{user?.name?.charAt(0) || user?.email.charAt(0)}</div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <Badge className="mt-1 text-[10px]" variant={user?.role === 'SUPER_ADMIN' ? 'default' : user?.role === 'ADMIN' ? 'secondary' : 'outline'}>
                <Shield className="h-2.5 w-2.5 mr-1" /> {user?.role}
              </Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ''} disabled />
          </div>
          <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1.5" /> Save Changes</Button>
        </CardContent>
      </Card>
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
        <Card><CardContent className="p-4 flex items-center justify-between"><div><div className="font-medium">Admin Access</div><div className="text-sm text-muted-foreground">Manage the platform from the admin panel</div></div><Button onClick={() => setView('admin-dashboard')}>Open Admin Panel</Button></CardContent></Card>
      )}
    </div>
  )
}
