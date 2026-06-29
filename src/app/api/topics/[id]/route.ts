import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/topics/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const topic = await db.topic.findUnique({ where: { id } })
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return NextResponse.json({
      topic: {
        ...topic,
        keyConcepts: safeParse(topic.keyConcepts, []),
      },
    })
  } catch (error) {
    console.error('[GET /api/topics/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 })
  }
}

function safeParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
