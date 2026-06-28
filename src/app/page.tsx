'use client'

import { useAppStore } from '@/lib/store'
import { DashboardView } from '@/components/views/dashboard-view'
import { ResourcesView } from '@/components/views/resources-view'
import { TopicsView } from '@/components/views/topics-view'
import { PracticeView } from '@/components/views/practice-view'
import { ExamView } from '@/components/views/exam-view'
import { ResultsView } from '@/components/views/results-view'
import { ReadinessView } from '@/components/views/readiness-view'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { useEffect } from 'react'

export default function Home() {
  const view = useAppStore((s) => s.view)

  useEffect(() => {
    document.title = 'ITIL 5 Trainer - AI-Powered Study & Exam Practice'
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1 w-full">
        {view === 'dashboard' && <DashboardView />}
        {view === 'resources' && <ResourcesView />}
        {view === 'topics' && <TopicsView />}
        {view === 'practice' && <PracticeView />}
        {view === 'exam' && <ExamView />}
        {view === 'results' && <ResultsView />}
        {view === 'readiness' && <ReadinessView />}
      </main>
      <AppFooter />
    </div>
  )
}
