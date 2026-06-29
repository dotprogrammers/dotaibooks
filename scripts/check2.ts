import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const certs = await db.certification.findMany({ orderBy: { sortOrder: 'asc' } })
for (const c of certs) {
  const t = await db.topic.count({ where: { certificationId: c.id } })
  const q = await db.question.count({ where: { certificationId: c.id } })
  console.log(`${c.shortName}: ${t} topics, ${q} questions`)
}
await db.$disconnect()
