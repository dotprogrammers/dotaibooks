import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } })
console.log('Users:', users.length)
for (const u of users) console.log(`  ${u.email} (${u.role}) - ${u.name}`)
const q = await db.question.groupBy({ by: ['certificationId'], _count: true })
const certs = await db.certification.findMany()
for (const c of certs) { const qc = q.find(x => x.certificationId === c.id)?._count || 0; console.log(`${c.shortName}: ${qc} questions`) }
await db.$disconnect()
