'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Brain, Video, ClipboardList, CheckCircle2, BarChart3, ArrowRight, Star, Sparkles, Shield, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface LandingData {
  sections: Array<{ sectionKey: string; title: string; subtitle: string | null; content: Record<string, unknown> }>
  testimonials: Array<{ id: string; name: string; role: string | null; company: string | null; content: string; rating: number }>
  certifications: Array<{ id: string; slug: string; name: string; shortName: string; icon: string | null; color: string; description: string; provider: string }>
}

const ICONS: Record<string, typeof Upload> = { upload: Upload, brain: Brain, video: Video, clipboard: ClipboardList, check: CheckCircle2, chart: BarChart3 }

export function LandingView() {
  const setView = useAppStore((s) => s.setView)
  const setActiveCert = useAppStore((s) => s.setActiveCert)
  const { user } = useAuth()
  const [data, setData] = useState<LandingData | null>(null)

  useEffect(() => {
    fetch('/api/landing').then((r) => r.json()).then(setData).catch(() => {})
  }, [])

  const hero = data?.sections.find((s) => s.sectionKey === 'hero')
  const stats = data?.sections.find((s) => s.sectionKey === 'stats')
  const features = data?.sections.find((s) => s.sectionKey === 'features')
  const cta = data?.sections.find((s) => s.sectionKey === 'cta')
  const heroContent = hero?.content || {}
  const statsContent = (stats?.content as { stats?: { value: string; label: string }[] }) || {}
  const featuresContent = (features?.content as { features?: { icon: string; title: string; desc: string }[] }) || {}

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/20">
              <Sparkles className="h-3 w-3 mr-1" /> {String(heroContent.badge || 'AI-Powered Learning')}
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              {hero?.title || 'Master ITIL & DevOps Certifications with AI'}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl">
              {hero?.subtitle || 'AI-powered study platform with smart topics, visual explainers, video animations, and unlimited practice exams.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setView(user ? 'dashboard' : 'register')} className="bg-white text-teal-700 hover:bg-white/90">
                {String(heroContent.primaryCta || 'Start Free')} <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView('pricing')} className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                {String(heroContent.secondaryCta || 'View Pricing')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {statsContent.stats && (
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsContent.stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-teal-600">{s.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      {data?.certifications && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-2">Certifications</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">Choose your certification path</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">Three industry-recognized certifications, each with AI-generated study materials and unlimited practice exams.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {data.certifications.map((c) => (
                <Card key={c.id} className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden" >
                  <CardContent className="p-6" onClick={() => { setActiveCert(c.slug, c.id); setView(user ? 'topics' : 'register') }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
                      <div>
                        <h3 className="font-bold leading-tight">{c.shortName}</h3>
                        <p className="text-[11px] text-muted-foreground">{c.provider}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                    <div className="flex items-center gap-1 text-sm font-medium" style={{ color: c.color }}>
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {featuresContent.features && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">{features?.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">{features?.subtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuresContent.features.map((f, i) => {
                const Icon = ICONS[f.icon] || Brain
                return (
                  <Card key={i} className="h-full">
                    <CardContent className="p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-3"><Icon className="h-5 w-5" /></div>
                      <h3 className="font-semibold mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {data?.testimonials && data.testimonials.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-2">Testimonials</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">Loved by certification candidates</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {data.testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm mb-4">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-sm">{t.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{[t.role, t.company].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{cta?.title || 'Ready to ace your certification?'}</h2>
          <p className="mt-2 text-white/90">{cta?.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button size="lg" onClick={() => setView(user ? 'dashboard' : 'register')} className="bg-white text-teal-700 hover:bg-white/90">
              {String(cta?.content?.primaryCta || 'Get Started Free')} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setView('pricing')} className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
              {String(cta?.content?.secondaryCta || 'View Pricing')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
