/**
 * Regenerate all topic images with transparent backgrounds.
 * Uses generateTransparentImage (generates + removes background via sharp).
 * Usage: bun run scripts/regen-transparent.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const { generateTransparentImage } = await import('../src/lib/ai')
  const topics = await db.topic.findMany({ where: { visualPrompt: { not: null } }, orderBy: [{ certificationId: 'asc' }, { order: 'asc' }] })
  console.log(`🎨 Regenerating ${topics.length} topic images with transparent backgrounds...`)

  let done = 0
  for (const t of topics) {
    console.log(`\n  📌 [${t.categoryIdNum}] ${t.title}`)
    const filename = `topic-${t.categoryIdNum}-${t.certificationId.slice(-4)}.png`
    try {
      const url = await generateTransparentImage(t.visualPrompt!, filename)
      await db.topic.update({ where: { id: t.id }, data: { imageUrl: url } })
      console.log(`    ✅ ${url}`)
      done++
    } catch (e) {
      console.error(`    ❌ ${(e as Error).message}`)
    }
  }
  console.log(`\n✅ Done: ${done}/${topics.length} images regenerated with transparency`)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
