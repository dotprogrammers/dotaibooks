'use client'

import { useAppStore } from '@/lib/store'
import { LandingView } from '@/components/public/landing-view'
import { PricingView } from '@/components/public/pricing-view'
import { BlogView } from '@/components/public/blog-view'
import { BlogPostView } from '@/components/public/blog-post-view'
import { LoginView } from '@/components/public/login-view'
import { RegisterView } from '@/components/public/register-view'
import { PublicHeader } from '@/components/public/public-header'
import { AppFooter } from '@/components/app-footer'

export function PublicSite() {
  const view = useAppStore((s) => s.view)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        {view === 'login' && <LoginView />}
        {view === 'register' && <RegisterView />}
        {(view === 'landing' || !view) && <LandingView />}
        {view === 'pricing' && <PricingView />}
        {view === 'blog' && <BlogView />}
        {view === 'blog-post' && <BlogPostView />}
      </main>
      <AppFooter />
    </div>
  )
}
