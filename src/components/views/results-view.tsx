'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw, ArrowLeft, Lightbulb, AlertTriangle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { SYLLABUS_CATEGORIES } from '@/lib/itil-data'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function ResultsView() {
  const resultData = useAppStore((s) => s.resultData)
  const clearResults = useAppStore((s) => s.clearResults)
  const setView = useAppStore((s) => s.setView)

  if (!resultData) {
    setView('practice')
    return null
  }

  const passed = resultData.passed
  const correct = resultData.score
  const total = resultData.totalMarks
  const percentage = resultData.percentage

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={() => { clearResults(); setView('practice') }}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Practice
      </Button>

      {/* Score header */}
      <Card className={passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? <Trophy className="h-10 w-10 text-green-600" /> : <AlertTriangle className="h-10 w-10 text-red-500" />}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className={`text-2xl font-bold ${passed ? 'text-green-700' : 'text-red-600'}`}>
                {passed ? 'Congratulations! You Passed!' : 'Not Quite There Yet'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {passed
                  ? `You scored ${correct}/${total} (${percentage.toFixed(1)}%) — above the ${resultData.passPercentage}% pass mark.`
                  : `You scored ${correct}/${total} (${percentage.toFixed(1)}%) — you need ${resultData.passPercentage}% (${resultData.passMark} correct) to pass.`}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(resultData.timeSpent)}</span>
                </div>
                <Badge variant={passed ? 'default' : 'destructive'}>
                  {passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                {percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">{correct}/{total} correct</div>
            </div>
          </div>

          {/* Progress to pass */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Your Score</span>
              <span>Pass Mark: {resultData.passPercentage}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/40" style={{ left: `${resultData.passPercentage}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance by Category</CardTitle>
          <CardDescription className="text-xs">Identify your strengths and weaknesses across the syllabus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {Object.entries(resultData.categoryBreakdown)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([catId, data]) => {
                const cat = SYLLABUS_CATEGORIES.find((c) => c.id === catId)
                const pct = data.total > 0 ? (data.correct / data.total) * 100 : 0
                const isWeak = pct < 70
                return (
                  <div key={catId} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: cat?.color || '#64748b' }}>
                      {catId}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{data.name}</span>
                        <span className={`text-xs font-semibold ${isWeak ? 'text-red-500' : 'text-green-600'}`}>
                          {data.correct}/{data.total} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                        <div
                          className={`h-full ${isWeak ? 'bg-red-400' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Weak areas */}
      {resultData.weakAreas.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-amber-800">Areas to Focus On</h3>
                <p className="text-xs text-amber-700 mt-0.5">Review these topics before your next attempt:</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {resultData.weakAreas.map((id) => {
                    const cat = SYLLABUS_CATEGORIES.find((c) => c.id === id)
                    return (
                      <Badge key={id} variant="secondary" className="text-[10px]" style={{ backgroundColor: (cat?.color || '#64748b') + '20', color: cat?.color }}>
                        {cat?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => { clearResults(); setView('practice') }} className="bg-teal-600 hover:bg-teal-700">
          <RotateCcw className="h-4 w-4 mr-2" /> Take Another Exam
        </Button>
        <Button variant="outline" onClick={() => { clearResults(); setView('topics') }}>
          <BookOpen className="h-4 w-4 mr-2" /> Review Topics
        </Button>
        <Button variant="outline" onClick={() => { clearResults(); setView('readiness') }}>
          <Trophy className="h-4 w-4 mr-2" /> Check Readiness
        </Button>
      </div>

      {/* Detailed review */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Answer Review & Explanations
          <Badge variant="secondary" className="text-[10px]">{resultData.results.length} questions</Badge>
        </h2>
        <div className="space-y-3">
          {resultData.results.map((r, idx) => (
            <QuestionReview key={r.questionId} result={r} index={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}

function QuestionReview({ result, index }: { result: NonNullable<ReturnType<typeof useAppStore.getState>['resultData']>['results'][number]; index: number }) {
  const [open, setOpen] = useState(false)
  const cat = SYLLABUS_CATEGORIES.find((c) => c.id === result.categoryId)
  const userAnswerLetter = result.userAnswer !== null ? String.fromCharCode(65 + result.userAnswer) : null
  const correctLetter = String.fromCharCode(65 + result.correctAnswer)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={result.isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {result.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-muted-foreground">Q{index + 1}</span>
                    <Badge variant="outline" className="text-[9px]" style={{ color: cat?.color, borderColor: cat?.color + '40' }}>
                      {result.categoryName}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">BL{result.bloomsLevel}</Badge>
                    <Badge variant="outline" className="text-[9px] capitalize">{result.questionType.replace('-', ' ')}</Badge>
                    {result.userAnswer === null && <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">Unanswered</Badge>}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{result.questionText}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    {!result.isCorrect && userAnswerLetter && (
                      <span className="text-red-500">Your answer: {userAnswerLetter}</span>
                    )}
                    <span className="text-green-600 font-medium">Correct: {correctLetter}</span>
                  </div>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
              </div>
            </CardContent>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3 space-y-3">
            {result.scenarioContext && (
              <div className="rounded-lg bg-sky-50 border border-sky-200 p-2.5 text-xs">
                <div className="text-[10px] font-semibold text-sky-700 mb-0.5">SCENARIO</div>
                <p className="text-sky-900">{result.scenarioContext}</p>
              </div>
            )}
            <div className="space-y-1.5">
              {result.options.map((opt, idx) => {
                const isCorrect = idx === result.correctAnswer
                const isUser = idx === result.userAnswer
                const letter = String.fromCharCode(65 + idx)
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 rounded-lg border p-2 text-sm ${
                      isCorrect
                        ? 'border-green-300 bg-green-50'
                        : isUser
                        ? 'border-red-300 bg-red-50'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                      isCorrect ? 'bg-green-500 text-white' : isUser ? 'bg-red-500 text-white' : 'bg-muted-foreground/20'
                    }`}>
                      {letter}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                    {isUser && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  </div>
                )
              })}
            </div>

            {/* Explanation */}
            <div className="rounded-lg bg-teal-50 border border-teal-200 p-3">
              <div className="flex items-center gap-1.5 text-teal-700 font-semibold text-xs mb-1">
                <Lightbulb className="h-3.5 w-3.5" /> Explanation
              </div>
              <p className="text-sm text-teal-900">{result.explanation}</p>
            </div>

            {/* Rationales per option */}
            {Object.keys(result.rationales).length > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-1.5">Why each option is right/wrong:</div>
                <div className="space-y-1.5">
                  {result.options.map((_, idx) => {
                    const rationale = result.rationales[idx] || result.rationales[String.fromCharCode(65 + idx)]
                    if (!rationale) return null
                    const letter = String.fromCharCode(65 + idx)
                    const isCorrect = idx === result.correctAnswer
                    return (
                      <div key={idx} className="text-xs flex gap-1.5">
                        <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-muted-foreground'}`}>{letter}:</span>
                        <span className="text-muted-foreground">{rationale}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {result.sourceRef && (
              <div className="text-[11px] text-muted-foreground">
                <BookOpen className="h-3 w-3 inline mr-1" /> Syllabus reference: {result.sourceRef}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
