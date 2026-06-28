/**
 * ITIL 5 Trainer - Database Seed Script
 *
 * Stages:
 * 1. Resources: Seed from extracted PDF text (fast, no AI)
 * 2. Topics: Generate study topics via LLM (one per subtopic, batched by category)
 * 3. Questions: Generate question bank via LLM (batched per category)
 * 4. Visuals: Generate visual representations via image generation (one per category)
 *
 * Usage: bun run scripts/seed.ts [stage]
 *   stage: "resources" | "topics" | "questions" | "visuals" | "all" (default: all)
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()

const EXTRACTED_DIR = path.join(process.cwd(), 'extracted')
const UPLOAD_DIR = path.join(process.cwd(), 'upload')

// ─── Resource Seeding ───────────────────────────────────────────────────────

interface ResourceSeed {
  fileName: string
  title: string
  category: string
  description: string
}

const RESOURCE_SEEDS: ResourceSeed[] = [
  { fileName: 'ITIL_Product_Syllabus_EN_v5.0.pdf', title: 'ITIL Product Syllabus', category: 'syllabus', description: 'Official ITIL Product (Version 5) syllabus with learning outcomes, assessment criteria, and exam specification.' },
  { fileName: 'ITIL_Product_SamplePaper1_EN_v5.0.pdf', title: 'Sample Paper 1 - Questions', category: 'sample-paper', description: 'Official sample exam paper 1 with 40 multiple-choice questions.' },
  { fileName: 'ITIL_Product_SP1_Answers-Rationales_EN_v5.0.pdf', title: 'Sample Paper 1 - Answers & Rationales', category: 'answers', description: 'Answers and rationales for sample paper 1, explaining why each option is correct or incorrect.' },
  { fileName: 'ITIL_Product_SamplePaper2_EN_v5.0.pdf', title: 'Sample Paper 2 - Questions', category: 'sample-paper', description: 'Official sample exam paper 2 with 40 multiple-choice questions.' },
  { fileName: 'ITIL_Product_SP2_Answers-Rationales_EN_v5.0.pdf', title: 'Sample Paper 2 - Answers & Rationales', category: 'answers', description: 'Answers and rationales for sample paper 2.' },
  { fileName: 'ITIL_Product_Glossary_EN_v5.0.pdf', title: 'ITIL Product Glossary', category: 'glossary', description: 'Comprehensive glossary of ITIL Product (Version 5) terms and definitions.' },
  { fileName: '0.0_START-HERE_ITIL_Version5_ReleaseNotes_EN.pdf', title: 'ITIL Version 5 Release Notes', category: 'release-notes', description: 'Release notes for ITIL Version 5.' },
  { fileName: '0.1_START-HERE_ITIL_Version5_ReleaseNotes_Prod-Serv-XP_ComLaunch_EN.pdf', title: 'ITIL v5 Product & Service XP Launch Notes', category: 'release-notes', description: 'Product and Service Experience launch notes for ITIL Version 5.' },
]

async function seedResources() {
  console.log('\n📚 Stage 1: Seeding Resources...')
  let count = 0
  for (const seed of RESOURCE_SEEDS) {
    const pdfPath = path.join(UPLOAD_DIR, seed.fileName)
    const txtPath = path.join(EXTRACTED_DIR, seed.fileName.replace('.pdf', '.txt'))
    // Try extracted txt first, else extract
    let content = ''
    let pageCount = 0
    if (fs.existsSync(txtPath)) {
      content = fs.readFileSync(txtPath, 'utf-8')
    } else if (fs.existsSync(path.join(EXTRACTED_DIR, path.basename(seed.fileName).replace('.pdf', '.txt')))) {
      content = fs.readFileSync(path.join(EXTRACTED_DIR, path.basename(seed.fileName).replace('.pdf', '.txt')), 'utf-8')
    }
    if (!content && fs.existsSync(pdfPath)) {
      try {
        const { execSync } = await import('child_process')
        const out = pdfPath + '.seed.txt'
        execSync(`pdftotext -layout "${pdfPath}" "${out}"`, { timeout: 60000 })
        content = fs.readFileSync(out, 'utf-8')
        fs.unlinkSync(out)
      } catch { /* ignore */ }
    }
    pageCount = content.split('\f').length - 1 || Math.ceil(content.length / 3000)
    const fileSize = fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : content.length

    const existing = await db.resource.findFirst({ where: { fileName: seed.fileName } })
    if (existing) {
      await db.resource.update({
        where: { id: existing.id },
        data: { title: seed.title, category: seed.category, description: seed.description, content, pageCount: Math.max(1, pageCount), fileSize, status: 'processed', fileType: 'application/pdf' },
      })
      console.log(`  ✓ Updated: ${seed.title}`)
    } else {
      await db.resource.create({
        data: { fileName: seed.fileName, title: seed.title, category: seed.category, description: seed.description, content, pageCount: Math.max(1, pageCount), fileSize, status: 'processed', fileType: 'application/pdf' },
      })
      console.log(`  ✓ Created: ${seed.title}`)
    }
    count++
  }
  console.log(`  ✅ Seeded ${count} resources`)
}

// ─── Content chunks for AI context ──────────────────────────────────────────

function loadExtracted(name: string): string {
  const p = path.join(EXTRACTED_DIR, name)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : ''
}

const SYLLABUS_TEXT = loadExtracted('syllabus.txt')
const GLOSSARY_TEXT = loadExtracted('glossary.txt')
const SAMPLE1_TEXT = loadExtracted('sample1.txt')
const ANSWERS1_TEXT = loadExtracted('answers1.txt')
const SAMPLE2_TEXT = loadExtracted('sample2.txt')
const ANSWERS2_TEXT = loadExtracted('answers2.txt')
const RELNOTES_TEXT = loadExtracted('relnotes.txt')

// ─── Topic Generation ───────────────────────────────────────────────────────

interface SubTopicDef {
  categoryId: string
  categoryName: string
  subTopicId: string
  title: string
  bloomsLevels: number[]
  refPrefix: string
}

function buildSubTopicDefs(): SubTopicDef[] {
  const defs: SubTopicDef[] = []
  const cats: Array<[string, string, string, number[]]> = [
    ['1', 'Digital Products and Services', 'Introduction to digital products and services; the digital product and service lifecycle management activities', [2]],
    ['2', 'Discover', 'Key concepts; steps and outputs; success factors and metrics of the discover activity', [2, 3]],
    ['3', 'Design', 'Key concepts; steps and outputs; success factors and metrics of the design activity', [2, 3]],
    ['4', 'Acquire', 'Key concepts; steps and outputs; success factors and metrics of the acquire activity', [2, 3]],
    ['5', 'Build', 'Key concepts; steps and outputs; success factors and metrics of the build activity', [2, 3]],
    ['6', 'Transition', 'Key concepts; steps and outputs; success factors and metrics of the transition activity', [2, 3]],
    ['7', 'Operate', 'Key concepts; steps and outputs; success factors and metrics of the operate activity', [2, 3]],
    ['8', 'Deliver', 'Key concepts; steps and outputs; success factors and metrics of the deliver activity', [2, 3]],
    ['9', 'Support', 'Key concepts; steps and outputs; success factors and metrics of the support activity', [2, 3]],
    ['10', 'The ITIL Product and Service Lifecycle', 'Managing the end-to-end lifecycle; ITIL, AI and other frameworks', [2, 3]],
  ]
  for (const [catId, catName, title, levels] of cats) {
    defs.push({ categoryId: catId, categoryName: catName, subTopicId: catId, title, bloomsLevels: levels, refPrefix: catId })
  }
  return defs
}

async function generateTopics() {
  console.log('\n🧠 Stage 2: Generating Study Topics via LLM...')

  // Import AI helper
  const { chatJSON } = await import('../src/lib/ai')

  const defs = buildSubTopicDefs()
  // Get relevant syllabus excerpt for each category
  const existingTopics = await db.topic.count()
  if (existingTopics >= defs.length) {
    console.log(`  ℹ️  ${existingTopics} topics already exist. Skipping topic generation.`)
    return
  }

  let order = 0
  for (const def of defs) {
    order++
    console.log(`  ⏳ Generating topic ${def.categoryId}: ${def.categoryName}...`)

    // Build context from syllabus + glossary relevant to this category
    const catSection = extractCategorySection(def.categoryId)
    const glossaryExcerpt = GLOSSARY_TEXT.slice(0, 3000)

    const systemPrompt = `You are an expert ITIL 5 Product trainer and instructional designer. You create clear, memorable study materials for ITIL Product (Version 5) certification candidates.

The exam has 40 multiple-choice questions, 90 minutes, 70% to pass (28/40). Bloom's Level 2 = understand concepts, Level 3 = apply concepts.

Create a comprehensive study topic. Respond with ONLY valid JSON (no markdown fences).`

    const userPrompt = `Create a detailed study topic for the following ITIL 5 syllabus category.

CATEGORY: ${def.categoryId}. ${def.categoryName}
SUBTOPIC: ${def.title}
BLOOM'S LEVELS covered: ${def.bloomsLevels.join(', ')}

SYLLABUS EXCERPT for this category:
${catSection}

GLOSSARY (relevant terms):
${glossaryExcerpt}

Create a study topic that helps a candidate understand and memorize this area. The topic should include:
- A clear title
- A 1-2 sentence summary
- 4-6 key concepts as an array of short memorable phrases
- Detailed content in markdown (use ## for sections, - for bullets) covering: key concepts and practices, steps and outputs, success factors/metrics, and real-world examples. Make it memorable with analogies.
- A visualPrompt: a detailed text description for an AI image generator to create a memorable visual diagram/infographic summarizing this topic (should be an educational diagram style, not a photo)
- difficulty: "easy", "medium", or "hard"
- syllabusRef: the category number

Respond with this exact JSON structure:
{
  "title": "string",
  "summary": "string",
  "keyConcepts": ["string", ...],
  "content": "markdown string with ## sections and - bullets",
  "visualPrompt": "string describing an educational diagram to generate",
  "difficulty": "easy|medium|hard",
  "syllabusRef": "${def.categoryId}"
}`

    try {
      const result = await chatJSON<{
        title: string
        summary: string
        keyConcepts: string[]
        content: string
        visualPrompt: string
        difficulty: string
        syllabusRef: string
      }>(systemPrompt, userPrompt, 3)

      await db.topic.create({
        data: {
          categoryId: def.categoryId,
          categoryName: def.categoryName,
          subTopicId: def.subTopicId,
          title: result.title || def.categoryName,
          summary: result.summary || '',
          keyConcepts: JSON.stringify(result.keyConcepts || []),
          content: result.content || '',
          bloomsLevel: Math.min(...def.bloomsLevels),
          syllabusRef: result.syllabusRef || def.categoryId,
          difficulty: result.difficulty || 'medium',
          visualPrompt: result.visualPrompt || '',
          order,
        },
      })
      console.log(`    ✅ Created: ${result.title}`)
    } catch (err) {
      console.error(`    ❌ Failed for ${def.categoryName}:`, (err as Error).message)
    }
  }
  console.log('  ✅ Topic generation complete')
}

function extractCategorySection(catId: string): string {
  // Find the category section in the syllabus text
  const catNum = parseInt(catId, 10)
  const lines = SYLLABUS_TEXT.split('\n')
  let start = -1
  let end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^\\s*${catNum}\\.`)) || lines[i].match(new RegExp(`Category.*${catId}\\.`))) {
      if (start === -1) start = i
    }
    // Find next category
    if (start !== -1 && i > start) {
      const nextCat = catNum + 1
      if (lines[i].match(new RegExp(`^\\s*${nextCat}\\.`)) || lines[i].match(new RegExp(`^\\s*${nextCat}\\s+`))) {
        end = i
        break
      }
    }
  }
  if (start === -1) {
    // Fallback: return a chunk of syllabus
    return SYLLABUS_TEXT.slice(0, 4000)
  }
  return lines.slice(start, Math.min(end, start + 60)).join('\n')
}

// ─── Question Generation ────────────────────────────────────────────────────

interface QuestionCategory {
  categoryId: string
  categoryName: string
  count: number
}

const QUESTION_TARGETS: QuestionCategory[] = [
  { categoryId: '1', categoryName: 'Digital Products and Services', count: 12 },
  { categoryId: '2', categoryName: 'Discover', count: 9 },
  { categoryId: '3', categoryName: 'Design', count: 9 },
  { categoryId: '4', categoryName: 'Acquire', count: 9 },
  { categoryId: '5', categoryName: 'Build', count: 9 },
  { categoryId: '6', categoryName: 'Transition', count: 7 },
  { categoryId: '7', categoryName: 'Operate', count: 7 },
  { categoryId: '8', categoryName: 'Deliver', count: 7 },
  { categoryId: '9', categoryName: 'Support', count: 7 },
  { categoryId: '10', categoryName: 'The ITIL Product and Service Lifecycle', count: 12 },
]

async function generateQuestions() {
  console.log('\n❓ Stage 3: Generating Question Bank via LLM...')

  const { chatJSON } = await import('../src/lib/ai')

  const existing = await db.question.count()
  const targetTotal = QUESTION_TARGETS.reduce((s, c) => s + c.count, 0)
  if (existing >= targetTotal) {
    console.log(`  ℹ️  ${existing} questions already exist (target ${targetTotal}). Skipping.`)
    return
  }

  // Sample question example for style reference (trimmed)
  const sampleExcerpt = SAMPLE1_TEXT.slice(0, 1200)

  for (const target of QUESTION_TARGETS) {
    const catExisting = await db.question.count({ where: { categoryId: target.categoryId } })
    const needed = target.count - catExisting
    if (needed <= 0) {
      console.log(`  ℹ️  Category ${target.categoryId} has ${catExisting} questions (target ${target.count}). Skip.`)
      continue
    }

    const catSection = extractCategorySection(target.categoryId).slice(0, 1500)

    // Generate in batches of 3 to keep prompt small
    const batches = Math.ceil(needed / 3)
    for (let b = 0; b < batches; b++) {
      const batchSize = Math.min(3, needed - b * 3)
      console.log(`  ⏳ Category ${target.categoryId} (${target.categoryName}): batch ${b + 1}/${batches} (${batchSize} questions)...`)

      const systemPrompt = `You are an expert ITIL 5 Product exam writer. Create exam-style MCQs matching the official ITIL Product (v5) format. 4 options (A-D), one correct answer, 70% to pass. Bloom's Level 2 = understand, Level 3 = apply. Respond with ONLY valid JSON.`

      const userPrompt = `Create ${batchSize} ITIL 5 exam questions for category ${target.categoryId}: ${target.categoryName}.

SYLLABUS:
${catSection}

EXAMPLE QUESTION STYLE:
${sampleExcerpt}

For each question provide: questionText, questionType (standard/missing-word/negative), 4 options, correctAnswer (0-3), explanation, rationales (object with keys "0"-"3"), bloomsLevel (2 or 3), difficulty, scenarioContext (or null), sourceRef.

JSON format:
{"questions":[{"questionText":"","questionType":"standard","options":["","","",""],"correctAnswer":0,"explanation":"","rationales":{"0":"","1":"","2":"","3":""},"bloomsLevel":2,"difficulty":"medium","scenarioContext":null,"sourceRef":"${target.categoryId}"}]}`

      try {
        const result = await chatJSON<{ questions: Array<{
          questionText: string
          questionType: string
          options: string[]
          correctAnswer: number
          explanation: string
          rationales: Record<string, string>
          bloomsLevel: number
          difficulty: string
          scenarioContext: string | null
          sourceRef: string
        }> }>(systemPrompt, userPrompt, 3)

        for (const q of result.questions || []) {
          // Validate
          if (!q.questionText || !q.options || q.options.length !== 4 || q.correctAnswer < 0 || q.correctAnswer > 3) {
            console.log(`    ⚠️  Skipping invalid question`)
            continue
          }
          await db.question.create({
            data: {
              categoryId: target.categoryId,
              categoryName: target.categoryName,
              questionText: q.questionText,
              questionType: q.questionType || 'standard',
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || '',
              rationales: JSON.stringify(q.rationales || {}),
              bloomsLevel: q.bloomsLevel || 2,
              difficulty: q.difficulty || 'medium',
              scenarioContext: q.scenarioContext || null,
              sourceRef: q.sourceRef || target.categoryId,
            },
          })
        }
        console.log(`    ✅ Created ${result.questions?.length || 0} questions for category ${target.categoryId}`)
      } catch (err) {
        console.error(`    ❌ Batch failed for category ${target.categoryId}:`, (err as Error).message)
      }
    }
  }
  console.log('  ✅ Question generation complete')
}

// ─── Visual Generation ──────────────────────────────────────────────────────

async function generateVisuals() {
  console.log('\n🎨 Stage 4: Generating Premium Visuals & Short Videos...')

  const { generatePremiumImage, generateVideo, chat } = await import('../src/lib/ai')

  const topics = await db.topic.findMany({ orderBy: { categoryId: 'asc' } })
  let imgCount = 0
  let vidCount = 0

  for (const topic of topics) {
    console.log(`\n  📌 Topic ${topic.categoryId}: ${topic.title}`)

    // --- Generate video prompt via LLM if not present ---
    let videoPrompt = topic.videoPrompt || ''
    if (!videoPrompt) {
      console.log(`    ⏳ Generating video prompt via LLM...`)
      try {
        videoPrompt = await chat(
          'You are a video director creating short 6-second educational explainer videos. Respond with ONLY the video prompt, no extra text.',
          `Create a short 6-second animated explainer video prompt for this ITIL 5 topic. The video should visually communicate the core concept in a memorable way.

Topic: ${topic.title}
Summary: ${topic.summary}
Key concepts: ${topic.keyConcepts}

Write a single concise video prompt (2-3 sentences) describing the visual scene, motion, and transitions. Make it a clean, modern 2D motion graphics style with teal/emerald colors. No text-on-screen requirements. Just the visual action.`
        )
        await db.topic.update({ where: { id: topic.id }, data: { videoPrompt } })
        console.log(`    ✅ Video prompt generated`)
      } catch (err) {
        console.error(`    ❌ Video prompt failed:`, (err as Error).message)
        videoPrompt = `Animated motion graphics explaining ${topic.title}. Clean modern 2D illustration with teal and emerald colors showing the key concepts flowing and connecting together.`
      }
    }

    // --- Generate premium image ---
    if (!topic.imageUrl) {
      if (topic.visualPrompt) {
        console.log(`    ⏳ Generating premium image...`)
        try {
          const filename = `topic-${topic.categoryId}.png`
          const imageUrl = await generatePremiumImage(topic.visualPrompt, filename)
          await db.topic.update({ where: { id: topic.id }, data: { imageUrl } })
          console.log(`    ✅ Image: ${imageUrl}`)
          imgCount++
        } catch (err) {
          console.error(`    ❌ Image failed:`, (err as Error).message)
        }
      } else {
        console.log(`    ⚠️  No visual prompt, skipping image`)
      }
    } else {
      console.log(`    ℹ️  Image already exists`)
    }

    // --- Generate short video (5-10 seconds) ---
    if (!topic.videoUrl) {
      console.log(`    ⏳ Generating 6-second explainer video (this takes a few minutes)...`)
      try {
        const filename = `topic-${topic.categoryId}.mp4`
        const videoUrl = await generateVideo(videoPrompt, filename, 6)
        if (videoUrl) {
          await db.topic.update({ where: { id: topic.id }, data: { videoUrl } })
          console.log(`    ✅ Video: ${videoUrl}`)
          vidCount++
        } else {
          console.log(`    ⚠️  Video generation returned null`)
        }
      } catch (err) {
        console.error(`    ❌ Video failed:`, (err as Error).message)
      }
    } else {
      console.log(`    ℹ️  Video already exists`)
    }
  }
  console.log(`\n  ✅ Generated ${imgCount} images and ${vidCount} videos`)
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const stage = process.argv[2] || 'all'
  console.log('🌱 ITIL 5 Trainer - Seed Script')
  console.log(`   Stage: ${stage}`)
  console.log(`   Database: ${process.env.DATABASE_URL}`)

  try {
    if (stage === 'all' || stage === 'resources') await seedResources()
    if (stage === 'all' || stage === 'topics') await generateTopics()
    if (stage === 'all' || stage === 'questions') await generateQuestions()
    if (stage === 'all' || stage === 'visuals') await generateVisuals()

    // Print summary
    const resCount = await db.resource.count()
    const topCount = await db.topic.count()
    const qCount = await db.question.count()
    console.log('\n📊 Database Summary:')
    console.log(`   Resources: ${resCount}`)
    console.log(`   Topics: ${topCount}`)
    console.log(`   Questions: ${qCount}`)
    console.log('\n✅ Seed complete!')
  } catch (err) {
    console.error('\n❌ Seed failed:', err)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
