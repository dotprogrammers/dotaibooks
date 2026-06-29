'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

type Settings = Record<string, Record<string, unknown>>

export function AdminSettings() {
  const view = useAppStore((s) => s.view)
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/admin/settings').then((r) => r.json()).then((d) => setSettings(d.settings || {})) }, [])

  function get(group: string, key: string): string {
    return String(settings[group]?.[key] ?? '')
  }
  function set(group: string, key: string, value: unknown) {
    setSettings((s) => ({ ...s, [group]: { ...(s[group] || {}), [key]: value } }))
  }
  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) })
    setSaving(false)
    toast({ title: 'Settings saved' })
  }

  const group = view === 'admin-seo' ? 'seo' : view === 'admin-email' ? 'email' : view === 'admin-notifications' ? 'notifications' : view === 'admin-payment' ? 'payment' : 'general'
  const groupLabel = { general: 'General', seo: 'SEO', email: 'Email', notifications: 'Notifications', payment: 'Payment Gateway', social: 'Social' }[group] || 'Settings'

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">{groupLabel} Settings</h1><p className="text-sm text-muted-foreground mt-1">Configure {groupLabel.toLowerCase()} for the platform.</p></div><Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1.5" /> {saving ? 'Saving...' : 'Save'}</Button></div>
      <Card><CardContent className="p-4 space-y-3">
        {group === 'general' && (<>
          <Field label="Site Name" value={get('general', 'site.name')} onChange={(v) => set('general', 'site.name', v)} />
          <Field label="Tagline" value={get('general', 'site.tagline')} onChange={(v) => set('general', 'site.tagline', v)} />
          <Field label="Description" value={get('general', 'site.description')} onChange={(v) => set('general', 'site.description', v)} textarea />
          <Field label="Footer Text" value={get('general', 'site.footer')} onChange={(v) => set('general', 'site.footer', v)} />
        </>)}
        {group === 'seo' && (<>
          <Field label="SEO Title" value={get('seo', 'seo.title')} onChange={(v) => set('seo', 'seo.title', v)} />
          <Field label="Meta Description" value={get('seo', 'seo.description')} onChange={(v) => set('seo', 'seo.description', v)} textarea />
          <Field label="Keywords (comma separated)" value={get('seo', 'seo.keywords')} onChange={(v) => set('seo', 'seo.keywords', v)} />
        </>)}
        {group === 'email' && (<>
          <Field label="From Email" value={get('email', 'email.from')} onChange={(v) => set('email', 'email.from', v)} />
          <div><Label className="text-[11px]">Provider</Label><Select value={get('email', 'email.provider')} onValueChange={(v) => set('email', 'email.provider', v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="smtp">SMTP</SelectItem><SelectItem value="sendgrid">SendGrid</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select></div>
          <Field label="SMTP Host" value={get('email', 'email.smtpHost')} onChange={(v) => set('email', 'email.smtpHost', v)} />
          <Field label="SMTP Port" value={get('email', 'email.smtpPort')} onChange={(v) => set('email', 'email.smtpPort', v)} />
          <Field label="SMTP User" value={get('email', 'email.smtpUser')} onChange={(v) => set('email', 'email.smtpUser', v)} />
          <Field label="SMTP Password" value={get('email', 'email.smtpPass')} onChange={(v) => set('email', 'email.smtpPass', v)} type="password" />
        </>)}
        {group === 'notifications' && (<>
          <Toggle label="Exam results notifications" checked={get('notifications', 'notifications.examResults') === 'true'} onChange={(v) => set('notifications', 'notifications.examResults', String(v))} />
          <Toggle label="Readiness alerts" checked={get('notifications', 'notifications.readiness') === 'true'} onChange={(v) => set('notifications', 'notifications.readiness', String(v))} />
          <Toggle label="Marketing emails" checked={get('notifications', 'notifications.marketing') === 'true'} onChange={(v) => set('notifications', 'notifications.marketing', String(v))} />
        </>)}
        {group === 'payment' && (<>
          <div><Label className="text-[11px]">Provider</Label><Select value={get('payment', 'payment.provider')} onValueChange={(v) => set('payment', 'payment.provider', v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="stripe">Stripe</SelectItem><SelectItem value="paypal">PayPal</SelectItem><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="none">None (Free)</SelectItem></SelectContent></Select></div>
          <Field label="Stripe Public Key" value={get('payment', 'payment.stripeKey')} onChange={(v) => set('payment', 'payment.stripeKey', v)} />
          <Field label="Stripe Secret Key" value={get('payment', 'payment.stripeSecret')} onChange={(v) => set('payment', 'payment.stripeSecret', v)} type="password" />
          <Field label="PayPal Client ID" value={get('payment', 'payment.paypalClient')} onChange={(v) => set('payment', 'payment.paypalClient', v)} />
          <Field label="Currency" value={get('payment', 'payment.currency')} onChange={(v) => set('payment', 'payment.currency', v)} />
        </>)}
        {group === 'social' && (<>
          <Field label="Twitter URL" value={get('social', 'social.twitter')} onChange={(v) => set('social', 'social.twitter', v)} />
          <Field label="LinkedIn URL" value={get('social', 'social.linkedin')} onChange={(v) => set('social', 'social.linkedin', v)} />
        </>)}
      </CardContent></Card>
    </div>
  )
}

function Field({ label, value, onChange, textarea, type }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return <div><Label className="text-[11px]">{label}</Label>{textarea ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="text-xs" /> : <Input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-xs" />}</div>
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between rounded-lg border p-3"><Label className="text-sm">{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>
}
