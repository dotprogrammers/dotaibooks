import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const users = await db.user.findMany({ select: { email: true, name: true, role: true } })
console.log('Users in DB:', users.length)
for (const u of users) console.log(`  ${u.email} (${u.role}) — ${u.name}`)
await db.$disconnect()
