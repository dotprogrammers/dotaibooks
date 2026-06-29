'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminResources } from '@/components/admin/admin-resources'
import { AdminUsers } from '@/components/admin/admin-users'
import { AdminPlans } from '@/components/admin/admin-plans'
import { AdminContent } from '@/components/admin/admin-content'
import { AdminBlog } from '@/components/admin/admin-blog'
import { AdminSettings } from '@/components/admin/admin-settings'
import { AdminCertifications } from '@/components/admin/admin-certifications'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function AdminPanel() {
  const view = useAppStore((s) => s.view)
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return <div className="min-h-screen flex items-center justify-center"><Card><CardContent className="p-8 text-center"><p className="text-sm text-muted-foreground">Admin access required.</p></CardContent></Card></div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <AdminHeader />
      <main className="flex-1">
        {view === 'admin-dashboard' && <AdminDashboard />}
        {view === 'admin-certifications' && <AdminCertifications />}
        {view === 'admin-resources' && <AdminResources />}
        {view === 'admin-users' && <AdminUsers />}
        {view === 'admin-plans' && <AdminPlans />}
        {view === 'admin-content' && <AdminContent />}
        {view === 'admin-blog' && <AdminBlog />}
        {(view === 'admin-settings' || view === 'admin-seo' || view === 'admin-email' || view === 'admin-notifications') && <AdminSettings />}
        {view === 'admin-topics' && <AdminResources />}
        {view === 'admin-questions' && <AdminResources />}
        {view === 'admin-payments' && <AdminDashboard />}
      </main>
    </div>
  )
}
