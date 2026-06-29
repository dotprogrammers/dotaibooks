/**
 * Seed demo credentials for each role (Super Admin, Admin, Member).
 * Usage: bun run scripts/seed-demo-users.ts
 */
import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const DEMO_USERS = [
  { email: 'superadmin@dotaibooks.com', name: 'Super Admin', role: 'SUPER_ADMIN', password: 'Demo@2025' },
  { email: 'admin@dotaibooks.com', name: 'Admin User', role: 'ADMIN', password: 'Demo@2025' },
  { email: 'member@dotaibooks.com', name: 'Demo Member', role: 'MEMBER', password: 'Demo@2025' },
]

async function main() {
  console.log('👥 Seeding demo users...')
  for (const u of DEMO_USERS) {
    const existing = await db.user.findUnique({ where: { email: u.email } })
    if (existing) {
      await db.user.update({ where: { id: existing.id }, data: { name: u.name, role: u.role, passwordHash: hashPassword(u.password), isActive: true } })
      console.log(`  ✓ Updated: ${u.email} (${u.role})`)
    } else {
      await db.user.create({ data: { email: u.email, name: u.name, role: u.role, passwordHash: hashPassword(u.password) } })
      console.log(`  ✓ Created: ${u.email} (${u.role})`)
    }
  }
  console.log('\n✅ Demo credentials ready:')
  console.log('   Super Admin: superadmin@dotaibooks.com / Demo@2025')
  console.log('   Admin:       admin@dotaibooks.com / Demo@2025')
  console.log('   Member:      member@dotaibooks.com / Demo@2025')
  await db.$disconnect()
}
main()
