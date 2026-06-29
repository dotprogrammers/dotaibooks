import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const cert = await db.certification.findUnique({
      where: { slug },
      include: { categories: { orderBy: { number: 'asc' } }, _count: { select: { topics: true, questions: true } } },
    })
    if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ certification: cert })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
