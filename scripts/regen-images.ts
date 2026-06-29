/**
 * Regenerate topic images with transparent / clean premium backgrounds.
 * Uses enhanced prompts requesting transparent or minimal background.
 * Usage: bun run scripts/regen-images.ts
 */
import { PrismaClient } from '@prisma/client'
import ZAI from 'z-ai-web-dev-sdk'

const db = new PrismaClient()

async function main() {
  const zai = await ZAI.create()
  const topics = await db.topic.findMany({ where: { NOT: { visualPrompt: null } }, orderBy: { categoryIdNum: 'asc' } })
  console.log(`🎨 Regenerating ${topics.length} premium images with transparent backgrounds...`)

  const fs = await import('fs')
  const path = await import('path')
  const outputDir = path.join(process.cwd(), 'public', 'visuals')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  let count = 0
  for (const t of topics) {
    if (!t.visualPrompt) continue
    console.log(`  ⏳ Topic ${t.categoryIdNum}: ${t.title}`)
    // Enhanced prompt for transparent / clean premium illustration
    const enhanced = `${t.visualPrompt}. Premium quality, transparent background (PNG with alpha), isolated subject with no background, clean modern flat illustration, vibrant teal emerald and violet gradient accents, crisp vector-like style, centered composition, high detail, no text, no border, educational infographic style`
    try {
      const response = await zai.images.generations.create({ prompt: enhanced, size: '1344x768' })
      const imageBase64 = response.data[0].base64
      const buffer = Buffer.from(imageBase64, 'base64')
      const filename = `topic-${t.certificationId}-${t.categoryIdNum}.png`
      fs.writeFileSync(path.join(outputDir, filename), buffer)
      await db.topic.update({ where: { id: t.id }, data: { imageUrl: `/visuals/${filename}` } })
      console.log(`    ✅ /visuals/${filename}`)
      count++
    } catch (e) {
      console.error(`    ❌ ${(e as Error).message}`)
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  console.log(`\n✅ Regenerated ${count} premium images`)
  await db.$disconnect()
}
main()
