'use client'

import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { UserHeader } from '@/components/user/user-header'
import { AppFooter } from '@/components/app-footer'
import { DashboardView } from '@/components/user/dashboard-view'
import { CertificationsView } from '@/components/user/certifications-view'
import { TopicsView } from '@/components/user/topics-view'
import { PracticeView } from '@/components/user/practice-view'
import { ReadinessView } from '@/components/user/readiness-view'
import { ProfileView } from '@/components/user/profile-view'
import { MembershipView } from '@/components/user/membership-view'

export function UserApp() {
  const view = useAppStore((s) => s.view)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UserHeader />
      <main className="flex-1">
        {view === 'dashboard' && <DashboardView />}
        {view === 'certifications' && <CertificationsView />}
        {view === 'topics' && <TopicsView />}
        {view === 'practice' && <PracticeView />}
        {view === 'readiness' && <ReadinessView />}
        {view === 'profile' && <ProfileView />}
        {view === 'membership' && <MembershipView />}
      </main>
      <AppFooter />
    </div>
  )
}
