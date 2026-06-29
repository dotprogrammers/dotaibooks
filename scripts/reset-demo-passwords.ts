/**
 * Reset demo user passwords so the login form's demo credentials work.
 * Usage: bun run scripts/reset-demo-passwords.ts
 */
import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const DEMO_PASSWORD = 'Demo@2025'

const DEMO_USERS = [
  { email: 'superadmin@dotaibooks.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
  { email: 'admin@dotaibooks.com', name: 'Admin User', role: 'ADMIN' },
  { email: 'member@dotaibooks.com', name: 'Demo Member', role: 'MEMBER' },
]

async function main() {
  console.log('🔐 Resetting demo user passwords...')
  for (const u of DEMO_USERS) {
    const existing = await db.user.findUnique({ where: { email: u.email } })
    if (existing) {
      await db.user.update({ where: { id: existing.id }, data: { passwordHash: hashPassword(DEMO_PASSWORD), name: u.name, role: u.role, isActive: true } })
      console.log(`  ✓ Reset: ${u.email} → ${u.role}`)
    } else {
      await db.user.create({ data: { email: u.email, name: u.name, role: u.role, passwordHash: hashPassword(DEMO_PASSWORD) } })
      console.log(`  ✓ Created: ${u.email} → ${u.role}`)
    }
  }
  console.log('\n✅ All demo passwords set to: Demo@2025')
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
