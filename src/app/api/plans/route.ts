import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
export async function GET() {
  const plans = await db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ plans: plans.map((p) => ({ ...p, features: safeParse(p.features, []) })) })
}
function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
