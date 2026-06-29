'use client'

import { useAppStore, type AdminView } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FolderOpen, Users, CreditCard, FileText, Settings as SettingsIcon, BookOpen, Shield, LogOut, Home, Menu, FileEdit, Search } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV: { view: AdminView; label: string; icon: typeof LayoutDashboard; superOnly?: boolean }[] = [
  { view: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'admin-certifications', label: 'Certifications', icon: BookOpen },
  { view: 'admin-resources', label: 'Resources', icon: FolderOpen },
  { view: 'admin-topics', label: 'Topics & Questions', icon: FileEdit },
  { view: 'admin-users', label: 'Users', icon: Users, superOnly: true },
  { view: 'admin-plans', label: 'Plans', icon: CreditCard },
  { view: 'admin-content', label: 'Landing Content', icon: FileText },
  { view: 'admin-blog', label: 'Blog', icon: FileEdit },
  { view: 'admin-settings', label: 'Site Settings', icon: SettingsIcon },
  { view: 'admin-seo', label: 'SEO', icon: Search },
  { view: 'admin-email', label: 'Email', icon: FileText },
  { view: 'admin-notifications', label: 'Notifications', icon: FileText },
]

export function AdminHeader() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const isSuper = user?.role === 'SUPER_ADMIN'

  const items = NAV.filter((n) => !n.superOnly || isSuper)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3">
          <button onClick={() => setView('admin-dashboard')} className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-[10px]">DOT</div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm leading-tight">DOTAIBOOKS</div>
              <div className="text-[10px] text-slate-400 leading-tight flex items-center gap-1"><Shield className="h-2.5 w-2.5" /> Admin Panel</div>
            </div>
          </button>
          <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {items.map((item) => {
              const Icon = item.icon
              const active = view === item.view
              return <button key={item.view} onClick={() => setView(item.view)} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap', active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800')}><Icon className="h-3.5 w-3.5" />{item.label}</button>
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setView('dashboard')} className="hidden sm:flex text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5"><Home className="h-4 w-4" /> Site</Button>
            <Button size="sm" variant="ghost" onClick={async () => { await logout(); setView('landing') }} className="hidden sm:flex text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4" /></Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden text-slate-300 hover:bg-slate-800"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="w-64 bg-slate-900 text-slate-100 border-slate-700">
                <div className="mt-6 flex flex-col gap-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    const active = view === item.view
                    return <button key={item.view} onClick={() => { setView(item.view); setOpen(false) }} className={cn('flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-left', active ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800')}><Icon className="h-4 w-4" />{item.label}</button>
                  })}
                  <div className="h-px bg-slate-700 my-2" />
                  <Button variant="ghost" onClick={() => { setView('dashboard'); setOpen(false) }} className="justify-start gap-2 text-slate-300 hover:bg-slate-800"><Home className="h-4 w-4" /> Back to Site</Button>
                  <Button variant="ghost" onClick={async () => { await logout(); setView('landing'); setOpen(false) }} className="justify-start gap-2 text-slate-300 hover:bg-slate-800"><LogOut className="h-4 w-4" /> Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
