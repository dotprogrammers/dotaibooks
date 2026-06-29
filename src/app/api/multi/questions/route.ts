import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const certificationId = searchParams.get('certificationId')
    if (!certificationId) return NextResponse.json({ total: 0, stats: [] })
    const total = await db.question.count({ where: { certificationId } })
    const categories = await db.category.findMany({ where: { certificationId }, orderBy: { number: 'asc' } })
    const stats = []
    for (const c of categories) {
      const count = await db.question.count({ where: { certificationId, categoryIdNum: String(c.number) } })
      stats.push({ categoryId: c.id, categoryIdNum: String(c.number), categoryName: c.name, count })
    }
    return NextResponse.json({ total, stats })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
