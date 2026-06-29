'use client'

import { useAppStore, type View } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, GraduationCap, ClipboardList, CheckCircle2, User, CreditCard, LogOut, Menu, Shield, Home } from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { view: View; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'certifications', label: 'Certifications', icon: GraduationCap },
  { view: 'practice', label: 'Practice Exams', icon: ClipboardList },
  { view: 'readiness', label: 'Readiness', icon: CheckCircle2 },
  { view: 'membership', label: 'Membership', icon: CreditCard },
]

function NavList({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  return (
    <nav className="flex flex-col lg:flex-row gap-1 lg:gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = view === item.view
        return (
          <button key={item.view} onClick={() => onNavigate(item.view)} className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent', active && 'bg-primary text-primary-foreground hover:bg-primary')}>
            <Icon className="h-4 w-4 shrink-0" /><span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function UserHeader() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const handleNav = (v: View) => { setView(v); setOpen(false) }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button onClick={() => handleNav('dashboard')} className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 text-white font-bold text-xs shadow-sm">DOT</div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-sm leading-tight">DOTAIBOOKS</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{user?.name || user?.email}</div>
            </div>
          </button>
          <div className="hidden lg:flex items-center"><NavList view={view} onNavigate={handleNav} /></div>
          <div className="flex items-center gap-2">
            {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
              <Button variant="ghost" size="sm" onClick={() => setView('admin-dashboard')} className="hidden sm:flex gap-1.5"><Shield className="h-4 w-4" /> Admin</Button>
            ) : null}
            <Button variant="ghost" size="icon" onClick={() => handleNav('profile')} className="hidden sm:flex"><User className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={async () => { await logout(); setView('landing') }} className="hidden sm:flex"><LogOut className="h-4 w-4" /></Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-6"><NavList view={view} onNavigate={handleNav} /></div>
                <div className="h-px bg-border my-2" />
                <div className="flex flex-col gap-1 px-2">
                  <Button variant="ghost" onClick={() => handleNav('profile')} className="justify-start gap-2"><User className="h-4 w-4" /> Profile</Button>
                  <Button variant="ghost" onClick={() => { setView('landing'); setOpen(false) }} className="justify-start gap-2"><Home className="h-4 w-4" /> Public Site</Button>
                  <Button variant="outline" onClick={async () => { await logout(); setView('landing'); setOpen(false) }} className="justify-start gap-2"><LogOut className="h-4 w-4" /> Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
