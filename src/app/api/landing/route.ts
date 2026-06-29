import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
export async function GET() {
  const sections = await db.landingSection.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } })
  const testimonials = await db.testimonial.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } })
  const certs = await db.certification.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } })
  const parsed = sections.map((s) => ({ ...s, content: safeParse(s.content, {}) }))
  return NextResponse.json({ sections: parsed, testimonials, certifications: certs })
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
