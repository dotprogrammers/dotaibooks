'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Brain, Video, ClipboardList, CheckCircle2, BarChart3, ArrowRight, Star, Sparkles, Shield, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useParallax, useInView } from '@/hooks/use-parallax'

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
  const heroOffset = useParallax(0.15)

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
      {/* Hero with parallax mesh background */}
      <section className="relative overflow-hidden mesh-bg text-white">
        {/* Animated floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/30 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '4s' }} />

        {/* Parallax dot grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)',
            backgroundSize: '32px 32px, 48px 48px',
            transform: `translateY(${heroOffset}px)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl animate-slide-up">
            <Badge className="mb-4 bg-white/15 text-white border-white/30 hover:bg-white/20 backdrop-blur">
              <Sparkles className="h-3 w-3 mr-1" /> {String(heroContent.badge || 'AI-Powered Learning')}
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
              {hero?.title?.split(' ').slice(0, -2).join(' ') || 'Master ITIL & DevOps'}{' '}
              <span className="bg-gradient-to-r from-amber-200 via-white to-teal-200 bg-clip-text text-transparent animate-gradient">
                {hero?.title?.split(' ').slice(-2).join(' ') || 'Certifications with AI'}
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-xl text-white/85 max-w-2xl leading-relaxed">
              {hero?.subtitle || 'AI-powered study platform with smart topics, visual explainers, video animations, and unlimited practice exams.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setView(user ? 'dashboard' : 'register')} className="bg-white text-teal-700 hover:bg-white/90 shadow-xl shadow-teal-900/20 group">
                {String(heroContent.primaryCta || 'Start Free')}
                <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView('pricing')} className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white backdrop-blur">
                {String(heroContent.secondaryCta || 'View Pricing')}
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-teal-300" /> No credit card</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-teal-300" /> 3 certifications</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-teal-300" /> AI-powered</div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      {/* Stats */}
      {statsContent.stats && (
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsContent.stats.map((s, i) => (
                <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="text-4xl sm:text-5xl font-bold gradient-text">{s.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      {data?.certifications && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionTitle badge="Certifications" title="Choose your certification path" subtitle="Three industry-recognized certifications, each with AI-generated study materials and unlimited practice exams." />
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              {data.certifications.map((c, i) => (
                <Card key={c.id} className="card-lift cursor-pointer overflow-hidden group animate-scale-in" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}80)` }} />
                  <CardContent className="p-6" onClick={() => { setActiveCert(c.slug, c.id); setView(user ? 'topics' : 'register') }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: c.color + '20' }}>{c.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{c.shortName}</h3>
                        <p className="text-[11px] text-muted-foreground">{c.provider}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: c.color }}>
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
        <section className="py-16 sm:py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionTitle title={features?.title} subtitle={features?.subtitle} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
              {featuresContent.features.map((f, i) => {
                const Icon = ICONS[f.icon] || Brain
                return (
                  <Card key={i} className="card-lift h-full relative overflow-hidden group">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-teal-100 to-violet-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <CardContent className="p-6 relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform"><Icon className="h-6 w-6" /></div>
                      <h3 className="font-bold text-lg mb-1.5">{f.title}</h3>
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
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionTitle badge="Testimonials" title="Loved by certification candidates" />
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              {data.testimonials.map((t, i) => (
                <Card key={t.id} className="card-lift animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm mb-5 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-semibold shadow">{t.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
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
      <section className="py-16 sm:py-20 relative overflow-hidden mesh-bg text-white">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-glow" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">{cta?.title || 'Ready to ace your certification?'}</h2>
          <p className="mt-3 text-white/90 text-lg">{cta?.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button size="lg" onClick={() => setView(user ? 'dashboard' : 'register')} className="bg-white text-teal-700 hover:bg-white/90 shadow-xl group">
              {String(cta?.content?.primaryCta || 'Get Started Free')}
              <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
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

function SectionTitle({ badge, title, subtitle }: { badge?: string; title?: string; subtitle?: string }) {
  return (
    <div className="text-center mb-2">
      {badge && <Badge variant="secondary" className="mb-2 bg-teal-50 text-teal-700 border-teal-200"><Sparkles className="h-3 w-3 mr-1" /> {badge}</Badge>}
      {title && <h2 className="text-2xl sm:text-4xl font-bold">{title}</h2>}
      {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}
