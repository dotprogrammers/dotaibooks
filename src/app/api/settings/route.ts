import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
// GET all settings (grouped)
export async function GET() {
  const settings = await db.setting.findMany()
  const grouped: Record<string, Record<string, unknown>> = {}
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {}
    grouped[s.group][s.key] = safeParse(s.value, null)
  }
  return NextResponse.json({ settings: grouped })
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
