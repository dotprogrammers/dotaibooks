import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })

    const [users, certs, topics, questions, resources, exams, payments, blogs, plans] = await Promise.all([
      db.user.count(),
      db.certification.count(),
      db.topic.count(),
      db.question.count(),
      db.resource.count(),
      db.examAttempt.count({ where: { status: 'completed' } }),
      db.payment.count(),
      db.blogPost.count(),
      db.plan.count(),
    ])
    const revenue = await db.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } })
    const recentAttempts = await db.examAttempt.findMany({ where: { status: 'completed' }, include: { user: true, exam: true }, orderBy: { completedAt: 'desc' }, take: 8 })
    const recentUsers = await db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, email: true, name: true, role: true, createdAt: true } })

    return NextResponse.json({ stats: { users, certs, topics, questions, resources, exams, payments, blogs, plans, revenue: revenue._sum.amount || 0 }, recentAttempts, recentUsers })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
