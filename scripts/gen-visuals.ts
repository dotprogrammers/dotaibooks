/**
 * Generate premium images + short videos for all topics.
 * Usage: bun run scripts/gen-visuals.ts [images|videos|all]
 *
 * - images: generate premium images for topics missing them (fast, ~10s each)
 * - videos: create + poll video tasks for topics missing them (slow, ~2-5min each)
 * - all: both (default)
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()

async function genImages() {
  const { generatePremiumImage, chat } = await import('../src/lib/ai')
  const topics = await db.topic.findMany({ where: { imageUrl: null }, orderBy: { categoryId: 'asc' } })
  console.log(`\n🖼️  Generating ${topics.length} premium images...`)
  for (const t of topics) {
    console.log(`  ⏳ Topic ${t.categoryId}: ${t.title}`)
    try {
      const url = await generatePremiumImage(t.visualPrompt || `Educational infographic about ${t.title}: ${t.summary}`, `topic-${t.categoryId}.png`)
      await db.topic.update({ where: { id: t.id }, data: { imageUrl: url } })
      console.log(`    ✅ ${url}`)
    } catch (e) {
      console.error(`    ❌ ${(e as Error).message}`)
    }
  }
}

async function genVideoPrompts() {
  const { chat } = await import('../src/lib/ai')
  const topics = await db.topic.findMany({ where: { videoPrompt: null }, orderBy: { categoryId: 'asc' } })
  console.log(`\n📝 Generating ${topics.length} video prompts...`)
  for (const t of topics) {
    console.log(`  ⏳ Topic ${t.categoryId}: ${t.title}`)
    try {
      const prompt = await chat(
        'You are a video director creating short 6-second educational explainer videos. Respond with ONLY the video prompt, no extra text.',
        `Create a short 6-second animated explainer video prompt for this ITIL 5 topic.

Topic: ${t.title}
Summary: ${t.summary}
Key concepts: ${t.keyConcepts}

Write ONE concise video prompt (2-3 sentences) describing the visual scene, motion, transitions. Clean modern 2D motion graphics style, teal/emerald colors. No on-screen text requirements. Just visual action.`
      )
      await db.topic.update({ where: { id: t.id }, data: { videoPrompt: prompt } })
      console.log(`    ✅ Prompt saved`)
    } catch (e) {
      console.error(`    ❌ ${(e as Error).message}`)
      // fallback prompt
      const fallback = `Animated motion graphics explaining ${t.title}. Clean modern 2D illustration with teal and emerald colors showing the key concepts flowing and connecting together.`
      await db.topic.update({ where: { id: t.id }, data: { videoPrompt: fallback } })
      console.log(`    ✅ Fallback prompt saved`)
    }
  }
}

async function genVideos() {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  const topics = await db.topic.findMany({ where: { videoUrl: null }, orderBy: { categoryId: 'asc' } })
  console.log(`\n🎬 Generating ${topics.length} short videos (one at a time, rate-limit friendly)...`)

  const outputDir = path.join(process.cwd(), 'public', 'visuals')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  let success = 0
  for (const t of topics) {
    const prompt = t.videoPrompt || `Animated motion graphics explaining ${t.title}. Clean modern 2D illustration with teal and emerald colors.`
    const filename = `topic-${t.categoryId}.mp4`
    console.log(`\n  📌 Topic ${t.categoryId}: ${t.title}`)

    // Create task with retry on rate limit
    let taskId: string | null = null
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const res = await zai.video.generations.create({
          prompt,
          quality: 'speed',
          with_audio: false,
          duration: 5,
        })
        taskId = res.id
        console.log(`    📤 Task created: ${taskId}`)
        break
      } catch (e) {
        const msg = (e as Error).message
        if (msg.includes('429')) {
          const wait = 45000 * (attempt + 1)
          console.log(`    ⏳ Rate limited, waiting ${wait / 1000}s (attempt ${attempt + 1}/8)...`)
          await new Promise((r) => setTimeout(r, wait))
        } else {
          console.error(`    ❌ Create failed: ${msg}`)
          break
        }
      }
    }
    if (!taskId) {
      console.error(`    ❌ Could not create task for topic ${t.categoryId}, skipping`)
      continue
    }

    // Poll for completion
    let done = false
    for (let poll = 0; poll < 60; poll++) {
      await new Promise((r) => setTimeout(r, 8000))
      try {
        const result = await zai.async.result.query(taskId)
        if (result.task_status === 'SUCCESS') {
          const videoUrl = result.video_url || result.url || result.video || (result.video_result && result.video_result[0]?.url)
          if (videoUrl) {
            const buffer = await fetch(videoUrl as string).then((r) => r.arrayBuffer())
            fs.writeFileSync(path.join(outputDir, filename), Buffer.from(buffer))
            await db.topic.update({ where: { id: t.id }, data: { videoUrl: `/visuals/${filename}` } })
            console.log(`    ✅ Video ready: /visuals/${filename}`)
            success++
          } else {
            console.error(`    ⚠️  Success but no URL`)
          }
          done = true
          break
        } else if (result.task_status === 'FAIL') {
          console.error(`    ❌ Task FAILED`)
          done = true
          break
        }
        if (poll % 5 === 0) console.log(`    🔄 Polling... (${poll * 8}s elapsed)`)
      } catch (e) {
        console.error(`    ⚠️  Poll error: ${(e as Error).message}`)
      }
    }
    if (!done) console.error(`    ⏰ Timed out for topic ${t.categoryId}`)

    // Wait between videos to avoid rate limits
    console.log(`    ⏳ Waiting 15s before next video...`)
    await new Promise((r) => setTimeout(r, 15000))
  }
  console.log(`\n✅ Video generation complete: ${success}/${topics.length} videos`)
}

async function main() {
  const stage = process.argv[2] || 'all'
  console.log('🎨 Visual & Video Generation')
  console.log(`   Stage: ${stage}`)

  if (stage === 'all' || stage === 'images') await genImages()
  if (stage === 'all' || stage === 'videos') {
    if (stage === 'all' || stage === 'videos') await genVideoPrompts()
    await genVideos()
  }

  const withImg = await db.topic.count({ where: { NOT: { imageUrl: null } } })
  const withVid = await db.topic.count({ where: { NOT: { videoUrl: null } } })
  console.log(`\n📊 Summary: ${withImg}/10 images, ${withVid}/10 videos`)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
