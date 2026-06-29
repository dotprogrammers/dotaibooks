import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const certs = await db.certification.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { topics: true, questions: true, categories: true } } },
    })
    return NextResponse.json({ certifications: certs })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
