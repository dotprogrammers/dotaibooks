import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const topics = await db.topic.findMany({ orderBy: { categoryId: 'asc' }, select: { categoryId: true, title: true, videoPrompt: true, videoUrl: true, imageUrl: true } })
for (const t of topics) {
  console.log(`Topic ${t.categoryId}: img=${t.imageUrl ? '✓' : '✗'} vid=${t.videoUrl ? '✓' : '✗'} vp=${t.videoPrompt ? '"'+t.videoPrompt.slice(0,60)+'..."' : 'null'}`)
}
await db.$disconnect()
