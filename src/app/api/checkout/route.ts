import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

// POST /api/checkout — subscribe current user to a plan, create payment record, grant membership
interface Body { planSlug: string; billingCycle: 'monthly' | 'yearly'; certificationId?: string }

export async function POST(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const body = (await req.json()) as Body
    const plan = await db.plan.findUnique({ where: { slug: body.planSlug } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const amount = body.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly

    // Create payment record (simulated success — real gateway would be configured in settings)
    const payment = await db.payment.create({ data: { userId: user.id, planId: plan.id, amount, currency: plan.currency, billingCycle: body.billingCycle, status: 'completed', method: 'card', transactionId: `sim_${Date.now()}` } })

    // Create subscription
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + (body.billingCycle === 'yearly' ? 365 : 30))
    await db.subscription.create({ data: { userId: user.id, planId: plan.id, status: 'active', paymentMethod: 'card', currentPeriodEnd: periodEnd } })

    // Grant membership to a certification if specified, or all certs for non-free plans
    if (body.certificationId) {
      const expiresAt = new Date(periodEnd)
      const existing = await db.membership.findFirst({ where: { userId: user.id, certificationId: body.certificationId } })
      if (existing) {
        await db.membership.update({ where: { id: existing.id }, data: { planId: plan.id, status: 'active', expiresAt } })
      } else {
        await db.membership.create({ data: { userId: user.id, certificationId: body.certificationId, planId: plan.id, status: 'active', expiresAt } })
      }
    } else if (plan.slug !== 'free') {
      const certs = await db.certification.findMany()
      for (const c of certs) {
        const existing = await db.membership.findFirst({ where: { userId: user.id, certificationId: c.id } })
        if (existing) await db.membership.update({ where: { id: existing.id }, data: { planId: plan.id, status: 'active', expiresAt: periodEnd } })
        else await db.membership.create({ data: { userId: user.id, certificationId: c.id, planId: plan.id, status: 'active', expiresAt: periodEnd } })
      }
    }

    return NextResponse.json({ success: true, paymentId: payment.id, transactionId: payment.transactionId, message: `Successfully subscribed to ${plan.name}!` })
  } catch (e) {
    return NextResponse.json({ error: 'Checkout failed: ' + (e as Error).message }, { status: 500 })
  }
}
