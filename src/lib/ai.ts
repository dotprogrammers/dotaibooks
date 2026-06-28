import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

/**
 * Call the LLM with a system prompt and user message.
 * Returns the text response.
 */
export async function chat(systemPrompt: string, userMessage: string, retries = 3): Promise<string> {
  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const zai = await getZAI()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        thinking: { type: 'disabled' },
      })
      const content = completion.choices[0]?.message?.content
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from AI')
      }
      return content
    } catch (error) {
      lastError = error
      console.error(`[AI chat] Attempt ${attempt} failed:`, (error as Error).message)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AI chat failed')
}

/**
 * Call the LLM and parse the response as JSON.
 * Strips markdown code fences if present.
 */
export async function chatJSON<T = unknown>(systemPrompt: string, userMessage: string, retries = 3): Promise<T> {
  const raw = await chat(systemPrompt, userMessage, retries)
  // Strip markdown code fences
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  }
  // Find the first { and last } to extract JSON object
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try array extraction
    const firstBracket = raw.indexOf('[')
    const lastBracket = raw.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1) {
      return JSON.parse(raw.slice(firstBracket, lastBracket + 1)) as T
    }
    throw new Error('Failed to parse AI response as JSON: ' + raw.slice(0, 200))
  }
}

/**
 * Generate an image from a text prompt and save to the public folder.
 * Returns the relative URL path for the image.
 */
export async function generateImage(prompt: string, filename: string): Promise<string> {
  const fs = await import('fs')
  const path = await import('path')
  const zai = await getZAI()
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1344x768',
  })
  const imageBase64 = response.data[0].base64
  const buffer = Buffer.from(imageBase64, 'base64')
  const outputDir = path.join(process.cwd(), 'public', 'visuals')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  const outputPath = path.join(outputDir, filename)
  fs.writeFileSync(outputPath, buffer)
  return `/visuals/${filename}`
}

/**
 * Generate a premium, high-quality educational image with an enhanced prompt.
 * Returns the relative URL path for the image.
 */
export async function generatePremiumImage(prompt: string, filename: string): Promise<string> {
  // Enhance the prompt for a premium, professional educational visual
  const enhanced = `${prompt}. Premium quality, professional educational infographic, clean modern flat design, vibrant teal and emerald color palette, clear hierarchy, labeled elements, high detail, 4k, no text errors, crisp vector-like illustration style`
  return generateImage(enhanced, filename)
}

/**
 * Generate a short video (5-10 seconds) from a text prompt using the video generation API.
 * Polls the async task until complete, then downloads the video to the public folder.
 * Returns the relative URL path for the video, or null if generation fails.
 */
export async function generateVideo(prompt: string, filename: string, durationSeconds = 6): Promise<string | null> {
  const fs = await import('fs')
  const path = await import('path')
  const zai = await getZAI()

  try {
    // Create the video generation task
    const createRes = await zai.video.generations.create({
      prompt: prompt,
      quality: 'quality',
      with_audio: false,
      duration: durationSeconds,
      size: '1280x720',
    })

    const taskId = createRes.id
    if (!taskId) {
      console.error('[generateVideo] No task ID returned')
      return null
    }

    // Poll for completion (video generation takes time, up to ~5 min)
    const maxAttempts = 100
    const pollInterval = 5000 // 5 seconds
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, pollInterval))
      const result = await zai.async.result.query(taskId)

      if (result.task_status === 'SUCCESS') {
        // Extract video URL from possible fields
        const videoUrl =
          result.video_url ||
          result.url ||
          result.video ||
          (result.video_result && result.video_result[0]?.url)

        if (!videoUrl) {
          console.error('[generateVideo] Success but no video URL', JSON.stringify(result))
          return null
        }

        // Download the video
        const videoBuffer = await fetch(videoUrl as string).then((r) => r.arrayBuffer())
        const outputDir = path.join(process.cwd(), 'public', 'visuals')
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        const outputPath = path.join(outputDir, filename)
        fs.writeFileSync(outputPath, Buffer.from(videoBuffer))
        return `/visuals/${filename}`
      }

      if (result.task_status === 'FAIL') {
        console.error('[generateVideo] Generation failed')
        return null
      }
      // still PROCESSING, keep polling
    }
    console.error('[generateVideo] Timed out waiting for completion')
    return null
  } catch (err) {
    console.error('[generateVideo] Error:', (err as Error).message)
    return null
  }
}
