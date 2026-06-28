'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SYLLABUS_CATEGORIES } from '@/lib/itil-data'

export function ExamView() {
  const activeExam = useAppStore((s) => s.activeExam)
  const endExam = useAppStore((s) => s.endExam)
  const showResults = useAppStore((s) => s.showResults)
  const setView = useAppStore((s) => s.setView)
  const { toast } = useToast()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(activeExam ? activeExam.duration * 60 : 0)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)

  const questions = activeExam?.questions || []
  const total = questions.length

  const submitExam = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    const timeSpent = activeExam ? activeExam.duration * 60 - timeLeft : 0
    try {
      const res = await fetch(`/api/exam/${activeExam?.examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: activeExam?.attemptId,
          answers,
          timeSpent,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showResults(data)
      } else {
        toast({ title: 'Submission failed', description: data.error, variant: 'destructive' })
        submittedRef.current = false
      }
    } catch (err) {
      toast({ title: 'Submission failed', description: (err as Error).message, variant: 'destructive' })
      submittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [activeExam, answers, timeLeft, showResults, toast])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      toast({ title: 'Time is up!', description: 'Submitting your exam automatically.', variant: 'destructive' })
      submitExam()
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, submitExam, toast])

  if (!activeExam) {
    setView('practice')
    return null
  }

  const q = questions[currentIdx]
  if (!q) return null
  const cat = SYLLABUS_CATEGORIES.find((c) => c.id === q.categoryId)
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / total) * 100

  function selectAnswer(qId: string, optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  function toggleFlag(qId: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const isLowTime = timeLeft < 300 // less than 5 min

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Exam header bar */}
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant={activeExam.type === 'final' ? 'default' : 'secondary'} className="shrink-0">
              {activeExam.type === 'final' ? 'Final Exam' : 'Practice'}
            </Badge>
            <span className="text-sm font-medium truncate hidden sm:inline">{activeExam.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${isLowTime ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-muted'}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                  Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit your exam?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You've answered {answeredCount} of {total} questions.
                    {answeredCount < total && ` ${total - answeredCount} unanswered questions will be marked as incorrect.`}
                    {' '}This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={submitting}>Keep Going</AlertDialogCancel>
                  <AlertDialogAction onClick={submitExam} disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 grid lg:grid-cols-[1fr_240px] gap-5">
        {/* Question area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Question {currentIdx + 1} of {total}</span>
              <Badge variant="outline" className="text-[10px]" style={{ color: cat?.color, borderColor: cat?.color + '40' }}>
                {q.categoryName}
              </Badge>
              <Badge variant="outline" className="text-[10px]">BL{q.bloomsLevel}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">{q.questionType.replace('-', ' ')}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFlag(q.questionId)}
              className={flagged.has(q.questionId) ? 'text-amber-600' : ''}
            >
              <Flag className={`h-4 w-4 mr-1 ${flagged.has(q.questionId) ? 'fill-amber-400' : ''}`} />
              {flagged.has(q.questionId) ? 'Flagged' : 'Flag'}
            </Button>
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6">
              {/* Scenario context */}
              {q.scenarioContext && (
                <div className="mb-4 rounded-lg bg-sky-50 border border-sky-200 p-3 text-sm">
                  <div className="text-[11px] font-semibold text-sky-700 mb-1">SCENARIO CONTEXT</div>
                  <p className="text-sky-900 text-sm">{q.scenarioContext}</p>
                </div>
              )}

              <p className="text-base font-medium leading-relaxed">{q.questionText}</p>

              <div className="mt-5 space-y-2.5">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.questionId] === idx
                  const letter = String.fromCharCode(65 + idx)
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(q.questionId, idx)}
                      className={`w-full flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                        selected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-border hover:border-teal-300 hover:bg-accent/50'
                      }`}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                        selected ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {letter}
                      </div>
                      <span className="text-sm pt-0.5">{opt}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {answeredCount} answered · {flagged.size} flagged
            </span>
            {currentIdx === total - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">Finish & Submit</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit your exam?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You've reached the last question. You've answered {answeredCount} of {total} questions.
                      {answeredCount < total && ` ${total - answeredCount} unanswered.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Review Answers</AlertDialogCancel>
                    <AlertDialogAction onClick={submitExam} className="bg-teal-600 hover:bg-teal-700">Submit Exam</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <div className="hidden lg:block">
          <Card className="sticky top-32">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Question Palette</h3>
              <div className="grid grid-cols-6 gap-1.5">
                {questions.map((qq, i) => {
                  const answered = answers[qq.questionId] !== undefined
                  const isFlagged = flagged.has(qq.questionId)
                  const isCurrent = i === currentIdx
                  return (
                    <button
                      key={qq.questionId}
                      onClick={() => setCurrentIdx(i)}
                      className={`aspect-square rounded text-xs font-medium transition-all relative ${
                        isCurrent
                          ? 'ring-2 ring-teal-500 ring-offset-1'
                          : ''
                      } ${
                        answered
                          ? 'bg-teal-500 text-white hover:bg-teal-600'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={`Question ${i + 1}${answered ? ' (answered)' : ''}${isFlagged ? ' (flagged)' : ''}`}
                    >
                      {i + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-teal-500" /> Answered ({answeredCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded bg-muted" /> Unanswered ({total - answeredCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <Flag className="h-3 w-3 fill-amber-400 text-amber-500" /> Flagged ({flagged.size})
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile palette toggle - bottom nav */}
      <div className="lg:hidden sticky bottom-0 border-t bg-background/95 backdrop-blur px-4 py-2 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">{currentIdx + 1}/{total} · {answeredCount} answered</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))} disabled={currentIdx === total - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
