'use client'

import { create } from 'zustand'

export type PublicView = 'landing' | 'pricing' | 'blog' | 'blog-post' | 'login' | 'register'
export type UserView = 'dashboard' | 'certifications' | 'topics' | 'topic-detail' | 'practice' | 'exam' | 'results' | 'readiness' | 'profile' | 'membership'
export type AdminView =
  | 'admin-dashboard'
  | 'admin-certifications'
  | 'admin-resources'
  | 'admin-topics'
  | 'admin-questions'
  | 'admin-users'
  | 'admin-plans'
  | 'admin-payments'
  | 'admin-content'
  | 'admin-blog'
  | 'admin-settings'
  | 'admin-seo'
  | 'admin-email'
  | 'admin-notifications'

export type View = PublicView | UserView | AdminView

interface ExamQuestion {
  questionId: string
  order: number
  categoryId: string
  categoryName: string
  questionText: string
  questionType: string
  options: string[]
  bloomsLevel: number
  scenarioContext: string | null
}

interface ActiveExam {
  examId: string
  attemptId: string
  title: string
  type: string
  duration: number
  totalMarks: number
  passMark: number
  certificationId: string
  certificationName: string
  questions: ExamQuestion[]
  startTime: number
}

interface ResultData {
  attemptId: string
  examId: string
  examTitle: string
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  passMark: number
  passPercentage: number
  timeSpent: number
  categoryBreakdown: Record<string, { correct: number; total: number; name: string }>
  weakAreas: string[]
  results: Array<{
    questionId: string
    categoryId: string
    categoryName: string
    questionText: string
    questionType: string
    options: string[]
    correctAnswer: number
    userAnswer: number | null
    isCorrect: boolean
    explanation: string
    rationales: Record<string, string>
    bloomsLevel: number
    scenarioContext: string | null
    sourceRef: string | null
  }>
}

interface AppState {
  view: View
  activeCertSlug: string | null
  activeCertId: string | null
  activeTopicId: string | null
  activeBlogSlug: string | null
  activeExam: ActiveExam | null
  resultData: ResultData | null
  setView: (view: View) => void
  setActiveCert: (slug: string, id: string) => void
  setActiveTopic: (id: string) => void
  setActiveBlog: (slug: string) => void
  startExam: (exam: ActiveExam) => void
  endExam: () => void
  showResults: (data: ResultData) => void
  clearResults: () => void
  goPublic: () => void
  goUser: () => void
  goAdmin: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing',
  activeCertSlug: null,
  activeCertId: null,
  activeTopicId: null,
  activeBlogSlug: null,
  activeExam: null,
  resultData: null,
  setView: (view) => { set({ view }); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) },
  setActiveCert: (slug, id) => set({ activeCertSlug: slug, activeCertId: id }),
  setActiveTopic: (id) => set({ activeTopicId: id }),
  setActiveBlog: (slug) => set({ activeBlogSlug: slug }),
  startExam: (exam) => set({ activeExam: exam, view: 'exam' }),
  endExam: () => set({ activeExam: null }),
  showResults: (data) => set({ resultData: data, activeExam: null, view: 'results' }),
  clearResults: () => set({ resultData: null }),
  goPublic: () => set({ view: 'landing' }),
  goUser: () => set({ view: 'dashboard' }),
  goAdmin: () => set({ view: 'admin-dashboard' }),
}))
