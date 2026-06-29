'use client'

import { useAppStore, type View } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, LayoutDashboard, LogOut, Menu, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function PublicHeader() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const navItems: { view: View; label: string }[] = [
    { view: 'landing', label: 'Home' },
    { view: 'pricing', label: 'Pricing' },
    { view: 'blog', label: 'Blog' },
  ]

  const handleNav = (v: View) => { setView(v); setOpen(false) }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button onClick={() => handleNav('landing')} className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 text-white font-bold text-xs shadow-sm">DOT</div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-sm leading-tight tracking-tight">DOTAIBOOKS</div>
              <div className="text-[10px] text-muted-foreground leading-tight">AI Certification Training</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button key={item.view} onClick={() => handleNav(item.view)} className={cn('px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent', view === item.view && 'text-teal-600')}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setView('dashboard')} className="hidden sm:flex gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
                {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                  <Button size="sm" variant="ghost" onClick={() => setView('admin-dashboard')} className="hidden sm:flex gap-1.5">
                    <Shield className="h-4 w-4" /> Admin
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={async () => { await logout(); setView('landing') }} className="hidden sm:flex gap-1.5">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setView('login')} className="hidden sm:inline-flex">Sign In</Button>
                <Button size="sm" onClick={() => setView('register')} className="hidden sm:inline-flex bg-teal-600 hover:bg-teal-700 gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Get Started
                </Button>
              </>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-6 flex flex-col gap-1">
                  {navItems.map((item) => (
                    <button key={item.view} onClick={() => handleNav(item.view)} className="text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">{item.label}</button>
                  ))}
                  <div className="h-px bg-border my-2" />
                  {user ? (
                    <>
                      <Button variant="ghost" onClick={() => { setView('dashboard'); setOpen(false) }} className="justify-start gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button>
                      {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <Button variant="ghost" onClick={() => { setView('admin-dashboard'); setOpen(false) }} className="justify-start gap-2"><Shield className="h-4 w-4" /> Admin</Button>}
                      <Button variant="outline" onClick={async () => { await logout(); setView('landing'); setOpen(false) }} className="justify-start gap-2"><LogOut className="h-4 w-4" /> Logout</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => { setView('login'); setOpen(false) }}>Sign In</Button>
                      <Button onClick={() => { setView('register'); setOpen(false) }} className="bg-teal-600 hover:bg-teal-700">Get Started</Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
