/**
 * DOTAIBOOKS - Multi-Certification Seed Script
 * Seeds: certifications, categories, plans, landing content, settings,
 * resources (from PDFs), topics & questions via AI.
 *
 * Usage: bun run scripts/seed-multi.ts [stage]
 *   stages: base | resources | topics | questions | all (default)
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()
const EXTRACTED_DIR = path.join(process.cwd(), 'extracted')
const UPLOAD_DIR = path.join(process.cwd(), 'upload')

// ─── Base data: certifications, categories, plans, landing, settings ─────────
async function seedBase() {
  console.log('\n📋 Stage: Base data (certifications, categories, plans, settings, landing)...')
  const { CERTIFICATIONS } = await import('../src/lib/certifications')

  for (const c of CERTIFICATIONS) {
    const cert = await db.certification.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug, name: c.name, shortName: c.shortName, provider: c.provider,
        description: c.description, longDescription: c.longDescription, icon: c.icon, color: c.color,
        examDuration: c.examDuration, totalQuestions: c.totalQuestions, passMark: c.passMark,
        passPercentage: c.passPercentage, bloomsLevels: c.bloomsLevels, sortOrder: c.sortOrder,
        isPublished: true,
      },
      update: {
        name: c.name, shortName: c.shortName, provider: c.provider,
        description: c.description, longDescription: c.longDescription, icon: c.icon, color: c.color,
        examDuration: c.examDuration, totalQuestions: c.totalQuestions, passMark: c.passMark,
        passPercentage: c.passPercentage, bloomsLevels: c.bloomsLevels, sortOrder: c.sortOrder,
      },
    })
    // Categories
    for (const cat of c.categories) {
      const existing = await db.category.findFirst({ where: { certificationId: cert.id, number: cat.number } })
      if (existing) {
        await db.category.update({ where: { id: existing.id }, data: { name: cat.name, weighting: cat.weighting, color: cat.color, description: cat.description, sortOrder: cat.number } })
      } else {
        await db.category.create({ data: { certificationId: cert.id, number: cat.number, name: cat.name, weighting: cat.weighting, color: cat.color, description: cat.description, sortOrder: cat.number } })
      }
    }
    console.log(`  ✓ Certification: ${c.name} (${c.categories.length} categories)`)
  }

  // Plans
  const plans = [
    { name: 'Free', slug: 'free', description: 'Get started with one certification and limited practice exams.', priceMonthly: 0, priceYearly: 0, features: JSON.stringify(['1 certification', '5 practice exams/month', 'Study topics access', 'Community support']), isPopular: false, sortOrder: 1 },
    { name: 'Pro', slug: 'pro', description: 'Unlock all certifications and unlimited practice with AI visuals.', priceMonthly: 19, priceYearly: 190, features: JSON.stringify(['All certifications', 'Unlimited practice exams', 'AI video explainers', 'Readiness assessment', 'Priority support']), isPopular: true, sortOrder: 2 },
    { name: 'Team', slug: 'team', description: 'For teams and organizations preparing multiple candidates.', priceMonthly: 49, priceYearly: 490, features: JSON.stringify(['Everything in Pro', 'Up to 10 members', 'Team analytics dashboard', 'Admin controls', 'Dedicated manager']), isPopular: false, sortOrder: 3 },
  ]
  for (const p of plans) {
    await db.plan.upsert({ where: { slug: p.slug }, create: p, update: p })
  }
  console.log(`  ✓ ${plans.length} membership plans`)

  // Landing sections
  const landingSections = [
    { sectionKey: 'hero', title: 'Master ITIL & DevOps Certifications with AI', subtitle: 'AI-powered study platform with smart topics, visual explainers, video animations, and unlimited practice exams.', content: JSON.stringify({ badge: 'AI-Powered Learning', primaryCta: 'Start Free Trial', secondaryCta: 'Browse Certifications' }), sortOrder: 1 },
    { sectionKey: 'stats', title: 'Trusted by certification candidates worldwide', subtitle: '', content: JSON.stringify({ stats: [{ value: '3', label: 'Certifications' }, { value: '250+', label: 'Practice Exams' }, { value: '92+', label: 'AI Study Topics' }, { value: '95%', label: 'Pass Rate' }] }), sortOrder: 2 },
    { sectionKey: 'features', title: 'Everything you need to pass your exam', subtitle: 'Our AI does the heavy lifting — from study materials to readiness assessment.', content: JSON.stringify({ features: [{ icon: 'upload', title: 'Upload Study Materials', desc: 'Upload PDFs up to 500MB. We extract and process everything.' }, { icon: 'brain', title: 'AI-Generated Topics', desc: 'Smart study topics with key concepts and detailed explanations.' }, { icon: 'video', title: 'Video Explainers', desc: 'Short AI-generated videos to help you visualize and memorize.' }, { icon: 'clipboard', title: 'Random Exam Sets', desc: '25+ random practice exams following official syllabus weighting.' }, { icon: 'check', title: 'Readiness Assessment', desc: 'The system tells you when you are ready for the real exam.' }, { icon: 'chart', title: 'Detailed Analytics', desc: 'Track mastery across every syllabus category.' }] }), sortOrder: 3 },
    { sectionKey: 'cta', title: 'Ready to ace your certification?', subtitle: 'Join thousands of candidates who passed with DOTAIBOOKS.', content: JSON.stringify({ primaryCta: 'Get Started Free', secondaryCta: 'View Pricing' }), sortOrder: 5 },
  ]
  for (const s of landingSections) {
    await db.landingSection.upsert({ where: { sectionKey: s.sectionKey }, create: s, update: s })
  }
  console.log(`  ✓ ${landingSections.length} landing sections`)

  // Testimonials
  const testimonials = [
    { name: 'Sarah Mitchell', role: 'IT Service Manager', company: 'TechCorp', content: 'DOTAIBOOKS helped me pass my ITIL 5 exam on the first try. The AI video explainers made complex topics easy to memorize.', rating: 5, sortOrder: 1 },
    { name: 'Raj Patel', role: 'DevOps Engineer', company: 'CloudScale', content: 'The DevOps Foundation practice exams were incredibly realistic. The readiness assessment told me exactly when I was ready.', rating: 5, sortOrder: 2 },
    { name: 'Emily Chen', role: 'Team Lead', company: 'FinTech Solutions', content: 'We used the Team plan to prepare 8 engineers for DevOps Leader. Everyone passed. The analytics dashboard is fantastic.', rating: 5, sortOrder: 3 },
  ]
  for (const t of testimonials) {
    const ex = await db.testimonial.findFirst({ where: { name: t.name } })
    if (!ex) await db.testimonial.create({ data: t })
  }
  console.log(`  ✓ ${testimonials.length} testimonials`)

  // Settings (defaults)
  const settings = [
    { key: 'site.name', value: JSON.stringify('DOTAIBOOKS'), group: 'general' },
    { key: 'site.tagline', value: JSON.stringify('AI-Powered Certification Training'), group: 'general' },
    { key: 'site.description', value: JSON.stringify('Master ITIL and DevOps certifications with AI-generated study topics, visual explainers, video animations, and unlimited practice exams.'), group: 'general' },
    { key: 'site.logo', value: JSON.stringify(''), group: 'general' },
    { key: 'site.footer', value: JSON.stringify('© 2025 DOTAIBOOKS. All rights reserved.'), group: 'general' },
    { key: 'seo.title', value: JSON.stringify('DOTAIBOOKS — AI-Powered ITIL & DevOps Certification Training'), group: 'seo' },
    { key: 'seo.description', value: JSON.stringify('Prepare for ITIL 5, DevOps Foundation, and DevOps Leader certifications with AI-generated study materials, video explainers, and unlimited practice exams.'), group: 'seo' },
    { key: 'seo.keywords', value: JSON.stringify('ITIL 5, DevOps Foundation, DevOps Leader, certification, exam practice, AI study'), group: 'seo' },
    { key: 'email.provider', value: JSON.stringify('smtp'), group: 'email' },
    { key: 'email.from', value: JSON.stringify('noreply@dotaibooks.com'), group: 'email' },
    { key: 'email.smtpHost', value: JSON.stringify(''), group: 'email' },
    { key: 'email.smtpPort', value: JSON.stringify('587'), group: 'email' },
    { key: 'email.smtpUser', value: JSON.stringify(''), group: 'email' },
    { key: 'payment.provider', value: JSON.stringify('stripe'), group: 'payment' },
    { key: 'payment.stripeKey', value: JSON.stringify(''), group: 'payment' },
    { key: 'payment.stripeSecret', value: JSON.stringify(''), group: 'payment' },
    { key: 'payment.paypalClient', value: JSON.stringify(''), group: 'payment' },
    { key: 'payment.currency', value: JSON.stringify('USD'), group: 'payment' },
    { key: 'notifications.examResults', value: JSON.stringify(true), group: 'notifications' },
    { key: 'notifications.readiness', value: JSON.stringify(true), group: 'notifications' },
    { key: 'notifications.marketing', value: JSON.stringify(false), group: 'notifications' },
    { key: 'social.twitter', value: JSON.stringify('https://twitter.com/dotaibooks'), group: 'social' },
    { key: 'social.linkedin', value: JSON.stringify('https://linkedin.com/company/dotaibooks'), group: 'social' },
  ]
  for (const s of settings) {
    await db.setting.upsert({ where: { key: s.key }, create: s, update: s })
  }
  console.log(`  ✓ ${settings.length} settings`)

  // Blog posts
  const blogs = [
    { title: 'How to Prepare for the ITIL Product (v5) Exam', slug: 'prepare-itil-5-exam', excerpt: 'A complete guide to passing the ITIL Product Version 5 certification exam.', content: '## Introduction\n\nThe ITIL Product (Version 5) certification validates your understanding of digital product and service lifecycle management...\n\n## Understand the Exam Format\n\nThe exam has 40 multiple-choice questions, 90 minutes, and requires 70% to pass...\n\n## Use AI-Powered Study Tools\n\nDOTAIBOOKS generates personalized study topics with video explainers...', tags: JSON.stringify(['ITIL 5', 'exam tips']), authorName: 'DOTAIBOOKS Team', status: 'published', publishedAt: new Date() },
    { title: 'DevOps Foundation: What You Need to Know', slug: 'devops-foundation-guide', excerpt: 'Everything you need to know about the DevOps Foundation certification.', content: '## What is DevOps Foundation?\n\nDevOps Foundation is the entry-level certification from the DevOps Institute...\n\n## The CALMS Framework\n\nCulture, Automation, Lean, Measurement, Sharing...\n\n## The Three Ways\n\nThe principles of flow, feedback, and continual learning...', tags: JSON.stringify(['DevOps', 'certification']), authorName: 'DOTAIBOOKS Team', status: 'published', publishedAt: new Date() },
    { title: '5 Habits of Successful DevOps Leaders', slug: 'devops-leader-habits', excerpt: 'Learn the key habits that make DevOps Leaders effective.', content: '## Introduction\n\nDevOps leadership is about more than tools — it is about culture and mindset...\n\n## 1. Embrace Transformational Leadership\n\n...\n\n## 2. Unlearn Outdated Behaviours\n\n...', tags: JSON.stringify(['DevOps Leader', 'leadership']), authorName: 'DOTAIBOOKS Team', status: 'published', publishedAt: new Date() },
  ]
  for (const b of blogs) {
    await db.blogPost.upsert({ where: { slug: b.slug }, create: b, update: b })
  }
  console.log(`  ✓ ${blogs.length} blog posts`)
  console.log('  ✅ Base data complete')
}

// ─── Resources from PDFs ────────────────────────────────────────────────────
const RESOURCE_SEEDS = [
  { fileName: 'ITIL_Product_Syllabus_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'ITIL Product Syllabus', category: 'syllabus', description: 'Official ITIL Product (Version 5) syllabus.' },
  { fileName: 'ITIL_Product_SamplePaper1_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'Sample Paper 1 - Questions', category: 'sample-paper', description: 'Official sample exam paper 1.' },
  { fileName: 'ITIL_Product_SP1_Answers-Rationales_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'Sample Paper 1 - Answers & Rationales', category: 'answers', description: 'Answers and rationales for sample paper 1.' },
  { fileName: 'ITIL_Product_SamplePaper2_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'Sample Paper 2 - Questions', category: 'sample-paper', description: 'Official sample exam paper 2.' },
  { fileName: 'ITIL_Product_SP2_Answers-Rationales_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'Sample Paper 2 - Answers & Rationales', category: 'answers', description: 'Answers and rationales for sample paper 2.' },
  { fileName: 'ITIL_Product_Glossary_EN_v5.0.pdf', certSlug: 'itil-5-product', title: 'ITIL Product Glossary', category: 'glossary', description: 'Glossary of ITIL Product v5 terms.' },
  { fileName: 'DevOps_FND_Syllabus_EN_v3_6_1.pdf', certSlug: 'devops-foundation', title: 'DevOps Foundation Syllabus', category: 'syllabus', description: 'Official DevOps Foundation syllabus v3.6.1.' },
  { fileName: 'DevOps_Leader_Syllabus_EN_v2_2_1.pdf', certSlug: 'devops-leader', title: 'DevOps Leader Syllabus', category: 'syllabus', description: 'Official DevOps Leader syllabus v2.2.1.' },
  { fileName: 'DevOps-Leader-Blueprint-v2-2.pdf', certSlug: 'devops-leader', title: 'DevOps Leader Blueprint', category: 'blueprint', description: 'DevOps Leader blueprint v2.2.' },
]

function loadExtracted(name: string): string {
  const p = path.join(EXTRACTED_DIR, name)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : ''
}

async function seedResources() {
  console.log('\n📚 Stage: Resources from PDFs...')
  const { execSync } = await import('child_process')
  let count = 0
  for (const seed of RESOURCE_SEEDS) {
    const cert = await db.certification.findUnique({ where: { slug: seed.certSlug } })
    if (!cert) continue
    const pdfPath = path.join(UPLOAD_DIR, seed.fileName)
    if (!fs.existsSync(pdfPath)) { console.log(`  ⚠️  Not found: ${seed.fileName}`); continue }

    let content = ''
    // Try extracted text variants
    const txtCandidates = [
      path.join(EXTRACTED_DIR, seed.fileName.replace('.pdf', '.txt')),
      path.join(EXTRACTED_DIR, seed.fileName.replace('.pdf', '').replace(/_/g, '-').toLowerCase() + '.txt'),
    ]
    for (const c of txtCandidates) { if (fs.existsSync(c)) { content = fs.readFileSync(c, 'utf-8'); break } }
    if (!content) {
      try { const out = pdfPath + '.s.txt'; execSync(`pdftotext -layout "${pdfPath}" "${out}"`, { timeout: 60000 }); content = fs.readFileSync(out, 'utf-8'); fs.unlinkSync(out) } catch { /* */ }
    }
    const pageCount = content.split('\f').length - 1 || Math.ceil(content.length / 3000)
    const fileSize = fs.statSync(pdfPath).size

    const existing = await db.resource.findFirst({ where: { fileName: seed.fileName } })
    if (existing) {
      await db.resource.update({ where: { id: existing.id }, data: { certificationId: cert.id, title: seed.title, category: seed.category, description: seed.description, content, pageCount: Math.max(1, pageCount), fileSize, status: 'processed' } })
    } else {
      await db.resource.create({ data: { certificationId: cert.id, fileName: seed.fileName, title: seed.title, category: seed.category, description: seed.description, content, pageCount: Math.max(1, pageCount), fileSize, status: 'processed', fileType: 'application/pdf' } })
    }
    console.log(`  ✓ ${seed.title} → ${cert.shortName}`)
    count++
  }
  console.log(`  ✅ Seeded ${count} resources`)
}

// ─── AI Topics & Questions ──────────────────────────────────────────────────
async function generateAIContent(stage: 'topics' | 'questions') {
  const { chatJSON } = await import('../src/lib/ai')
  const certs = await db.certification.findMany({ include: { categories: true }, orderBy: { sortOrder: 'asc' } })

  for (const cert of certs) {
    console.log(`\n  📦 Certification: ${cert.shortName}`)
    // Gather context: all resources for this cert
    const resources = await db.resource.findMany({ where: { certificationId: cert.id } })
    const syllabus = resources.find((r) => r.category === 'syllabus')?.content || ''
    const answers = resources.find((r) => r.category === 'answers')?.content || ''
    const contextSyllabus = syllabus.slice(0, 2500)
    const contextAnswers = answers.slice(0, 1200)

    if (stage === 'topics') {
      const existing = await db.topic.count({ where: { certificationId: cert.id } })
      if (existing >= cert.categories.length) { console.log(`    ℹ️  ${existing} topics exist, skip`); continue }
      for (const cat of cert.categories) {
        if (await db.topic.count({ where: { certificationId: cert.id, categoryIdNum: String(cat.number) } }) > 0) continue
        console.log(`    ⏳ Topic ${cat.number}: ${cat.name}...`)
        try {
          const result = await chatJSON<{
            title: string; summary: string; keyConcepts: string[]; content: string
            visualPrompt: string; difficulty: string; syllabusRef: string
          }>(
            `You are an expert ${cert.shortName} trainer. Create clear, memorable study materials. Respond with ONLY valid JSON.`,
            `Create a study topic for ${cert.name} category ${cat.number}: ${cat.name} (weighting ${cat.weighting}%).

SYLLABUS:
${contextSyllabus}

Category description: ${cat.description}

Create: title, summary (1-2 sentences), keyConcepts (4-6 short phrases), content (markdown with ## sections and - bullets), visualPrompt (educational infographic description), difficulty, syllabusRef.

JSON: {"title":"","summary":"","keyConcepts":[],"content":"","visualPrompt":"","difficulty":"medium","syllabusRef":"${cat.number}"}`
          , 3)
          await db.topic.create({ data: { certificationId: cert.id, categoryId: cat.id, categoryIdNum: String(cat.number), categoryName: cat.name, subTopicId: String(cat.number), title: result.title || cat.name, summary: result.summary || '', keyConcepts: JSON.stringify(result.keyConcepts || []), content: result.content || '', bloomsLevel: cat.number <= 2 ? 1 : 2, syllabusRef: result.syllabusRef || String(cat.number), difficulty: result.difficulty || 'medium', visualPrompt: result.visualPrompt || '', order: cat.number } })
          console.log(`      ✅ ${result.title}`)
        } catch (e) { console.error(`      ❌ ${(e as Error).message}`) }
      }
    }

    if (stage === 'questions') {
      // Target ~5 questions per 1% weighting, capped
      for (const cat of cert.categories) {
        const target = Math.max(6, Math.round(cat.weighting / 100 * 50))
        const existing = await db.question.count({ where: { certificationId: cert.id, categoryIdNum: String(cat.number) } })
        const needed = Math.max(0, target - existing)
        if (needed === 0) { console.log(`    ℹ️  Cat ${cat.number}: ${existing} questions, skip`); continue }
        const batches = Math.ceil(needed / 3)
        for (let b = 0; b < batches; b++) {
          const batchSize = Math.min(3, needed - b * 3)
          console.log(`    ⏳ Cat ${cat.number} batch ${b+1}/${batches} (${batchSize})...`)
          try {
            const result = await chatJSON<{ questions: Array<{ questionText: string; questionType: string; options: string[]; correctAnswer: number; explanation: string; rationales: Record<string,string>; bloomsLevel: number; difficulty: string; scenarioContext: string|null; sourceRef: string }> }>(
              `You are an expert ${cert.shortName} exam writer. Create MCQs matching the official exam format. Respond with ONLY valid JSON.`,
              `Create ${batchSize} exam questions for ${cert.name}, category ${cat.number}: ${cat.name}.

SYLLABUS:
${contextSyllabus}

EXAMPLES:
${contextAnswers}

Provide: questionText, questionType (standard/missing-word/negative), 4 options, correctAnswer (0-3), explanation, rationales (keys "0"-"3"), bloomsLevel (1 or 2), difficulty, scenarioContext (or null), sourceRef.

JSON: {"questions":[{"questionText":"","questionType":"standard","options":["","","",""],"correctAnswer":0,"explanation":"","rationales":{"0":"","1":"","2":"","3":""},"bloomsLevel":1,"difficulty":"medium","scenarioContext":null,"sourceRef":"${cat.number}"}]}`
            , 3)
            for (const q of result.questions || []) {
              if (!q.questionText || !q.options || q.options.length !== 4 || q.correctAnswer < 0 || q.correctAnswer > 3) continue
              await db.question.create({ data: { certificationId: cert.id, categoryId: cat.id, categoryIdNum: String(cat.number), categoryName: cat.name, questionText: q.questionText, questionType: q.questionType || 'standard', options: JSON.stringify(q.options), correctAnswer: q.correctAnswer, explanation: q.explanation || '', rationales: JSON.stringify(q.rationales || {}), bloomsLevel: q.bloomsLevel || 1, difficulty: q.difficulty || 'medium', scenarioContext: q.scenarioContext || null, sourceRef: q.sourceRef || String(cat.number) } })
            }
            console.log(`      ✅ ${result.questions?.length || 0} questions`)
          } catch (e) { console.error(`      ❌ ${(e as Error).message}`) }
        }
      }
    }
  }
}

async function main() {
  const stage = process.argv[2] || 'all'
  console.log('🌱 DOTAIBOOKS Multi-Cert Seed — stage:', stage)
  try {
    if (['all', 'base'].includes(stage)) await seedBase()
    if (['all', 'resources'].includes(stage)) await seedResources()
    if (['all', 'topics'].includes(stage)) await generateAIContent('topics')
    if (['all', 'questions'].includes(stage)) await generateAIContent('questions')
    const certs = await db.certification.count()
    const topics = await db.topic.count()
    const questions = await db.question.count()
    const resources = await db.resource.count()
    console.log(`\n📊 Summary: ${certs} certs, ${resources} resources, ${topics} topics, ${questions} questions`)
    console.log('✅ Done')
  } catch (e) { console.error('❌', e); process.exit(1) } finally { await db.$disconnect() }
}
main()
