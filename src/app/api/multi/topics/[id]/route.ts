import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const topic = await db.topic.findUnique({ where: { id } })
    if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ topic: { ...topic, keyConcepts: safeParse(topic.keyConcepts, []) } })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function safeParse<T>(s: string, f: T): T { try { return JSON.parse(s) as T } catch { return f } }
