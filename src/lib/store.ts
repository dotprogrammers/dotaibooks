import { create } from 'zustand'

export type View = 'dashboard' | 'resources' | 'topics' | 'practice' | 'exam' | 'results' | 'readiness'

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
  activeExam: ActiveExam | null
  resultData: ResultData | null
  setView: (view: View) => void
  startExam: (exam: ActiveExam) => void
  endExam: () => void
  showResults: (data: ResultData) => void
  clearResults: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'dashboard',
  activeExam: null,
  resultData: null,
  setView: (view) => set({ view }),
  startExam: (exam) => set({ activeExam: exam, view: 'exam' }),
  endExam: () => set({ activeExam: null }),
  showResults: (data) => set({ resultData: data, view: 'results' }),
  clearResults: () => set({ resultData: null }),
}))
