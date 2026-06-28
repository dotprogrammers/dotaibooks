'use client'

import { useAppStore, type View } from '@/lib/store'
import { BookOpen, LayoutDashboard, FolderOpen, GraduationCap, ClipboardList, Trophy, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'resources', label: 'Study Materials', icon: FolderOpen },
  { view: 'topics', label: 'Learn Topics', icon: GraduationCap },
  { view: 'practice', label: 'Practice Exams', icon: ClipboardList },
  { view: 'readiness', label: 'Readiness', icon: CheckCircle2 },
]

function NavList({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  return (
    <nav className="flex flex-col lg:flex-row gap-1 lg:gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = view === item.view
        return (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function AppHeader() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const activeExam = useAppStore((s) => s.activeExam)
  const [open, setOpen] = useState(false)

  const handleNav = (v: View) => {
    setView(v)
    setOpen(false)
  }

  // During exam, hide nav (exam must be completed)
  const showNav = !activeExam

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-sm shadow-sm">
              IT5
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-sm leading-tight">ITIL 5 Trainer</div>
              <div className="text-[11px] text-muted-foreground leading-tight">AI Study & Exam Practice</div>
            </div>
          </button>

          {showNav && (
            <div className="hidden lg:flex items-center">
              <NavList view={view} onNavigate={handleNav} />
            </div>
          )}

          <div className="flex items-center gap-2">
            {showNav ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="mt-6">
                    <NavList view={view} onNavigate={handleNav} />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <span className="text-xs font-medium text-muted-foreground px-2">Exam in progress</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
