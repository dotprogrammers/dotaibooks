'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { PublicSite } from '@/components/public/public-site'
import { UserApp } from '@/components/user/user-app'
import { AdminPanel } from '@/components/admin/admin-panel'
import { ExamView } from '@/components/views/exam-view'
import { ResultsView } from '@/components/views/results-view'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const view = useAppStore((s) => s.view)
  const activeExam = useAppStore((s) => s.activeExam)
  const resultData = useAppStore((s) => s.resultData)
  const { user, loading } = useAuth()

  // Exam and Results are global overlays regardless of which "site" you're in
  if (activeExam) return <ExamView />
  if (resultData) return <ResultsView />

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  // Admin views require admin role
  if (view.startsWith('admin-')) {
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return <PublicSite />
    }
    return <AdminPanel />
  }

  // User views require login
  if (['dashboard', 'certifications', 'topics', 'topic-detail', 'practice', 'readiness', 'profile', 'membership'].includes(view)) {
    if (!user) return <PublicSite />
    return <UserApp />
  }

  // Public views
  return <PublicSite />
}
