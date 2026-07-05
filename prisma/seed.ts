import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  const users = [
    { email: 'superadmin@dotaibooks.com', name: 'Super Admin', role: 'SUPER_ADMIN', password: 'Demo@2025' },
    { email: 'admin@dotaibooks.com', name: 'Admin User', role: 'ADMIN', password: 'Demo@2025' },
    { email: 'member@dotaibooks.com', name: 'Member User', role: 'MEMBER', password: 'Demo@2025' },
  ]

  for (const u of users) {
    const existing = await db.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`)
      continue
    }
    await db.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: hashPassword(u.password),
        isActive: true,
      },
    })
    console.log(`Created ${u.role}: ${u.email}`)
  }

  // Seed default certifications
  const certs = [
    {
      slug: 'itil-5-product',
      name: 'ITIL 5 Product',
      shortName: 'ITIL 5',
      provider: 'PeopleCert',
      description: 'ITIL 5 Product certification for IT service management professionals',
      icon: '📘',
      color: '#7c3aed',
      examDuration: 60,
      totalQuestions: 40,
      passMark: 26,
      passPercentage: 65,
      bloomsLevels: '1,2',
      isPublished: true,
    },
    {
      slug: 'devops-foundation',
      name: 'DevOps Foundation',
      shortName: 'DevOps Fdn',
      provider: 'DevOps Institute',
      description: 'DevOps Foundation certification covering DevOps culture, practices, and tools',
      icon: '🚀',
      color: '#0d9488',
      examDuration: 60,
      totalQuestions: 40,
      passMark: 26,
      passPercentage: 65,
      bloomsLevels: '1,2',
      isPublished: true,
    },
    {
      slug: 'devops-leader',
      name: 'DevOps Leader',
      shortName: 'DevOps Ldr',
      provider: 'DevOps Institute',
      description: 'DevOps Leader certification for leading DevOps transformations',
      icon: '🏆',
      color: '#059669',
      examDuration: 60,
      totalQuestions: 40,
      passMark: 26,
      passPercentage: 65,
      bloomsLevels: '2,3',
      isPublished: true,
    },
  ]

  for (const c of certs) {
    const existing = await db.certification.findUnique({ where: { slug: c.slug } })
    if (existing) {
      console.log(`Certification ${c.slug} already exists, skipping`)
      continue
    }
    await db.certification.create({ data: c })
    console.log(`Created certification: ${c.name}`)
  }

  // Seed default plans
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Get started with basic access',
      priceMonthly: 0,
      priceYearly: 0,
      features: JSON.stringify(['Access to free topics', '1 practice exam', 'Community support']),
      isPopular: false,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Full access to all certifications',
      priceMonthly: 29.99,
      priceYearly: 299.99,
      features: JSON.stringify(['All certifications', 'Unlimited practice exams', 'AI study assistant', 'Progress tracking', 'Priority support']),
      isPopular: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For teams and organizations',
      priceMonthly: 99.99,
      priceYearly: 999.99,
      features: JSON.stringify(['Everything in Pro', 'Team management', 'Custom branding', 'API access', 'Dedicated support', 'SSO integration']),
      isPopular: false,
      isActive: true,
      sortOrder: 2,
    },
  ]

  for (const p of plans) {
    const existing = await db.plan.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`Plan ${p.slug} already exists, skipping`)
      continue
    }
    await db.plan.create({ data: p })
    console.log(`Created plan: ${p.name}`)
  }

  console.log('\nSeed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
