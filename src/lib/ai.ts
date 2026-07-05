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
 * Generate an image from a text prompt and upload to Vercel Blob.
 * Returns the public URL for the image.
 */
export async function generateImage(prompt: string, filename: string): Promise<string> {
  const { put } = await import('@vercel/blob')
  const zai = await getZAI()
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1344x768',
  })
  const imageBase64 = response.data[0].base64
  const buffer = Buffer.from(imageBase64, 'base64')
  const blob = await put(`visuals/${filename}`, buffer, {
    access: 'public',
    contentType: 'image/png',
  })
  return blob.url
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
 * Remove the background from an image file using sharp.
 * Samples corner pixels to determine the background color, then makes
 * pixels within a threshold transparent (with feathered edges).
 * Returns the path to the processed (transparent) PNG.
 */
export async function removeBackground(inputPath: string, outputPath: string): Promise<string> {
  const sharp = (await import('sharp')).default
  const image = sharp(inputPath)
  const meta = await image.metadata()
  const width = meta.width || 1
  const height = meta.height || 1

  // Get raw RGBA pixels (ensure alpha channel)
  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const channels = 4

  // Sample the 4 corners (3x3 area each) to determine background color
  const samples: Array<[number, number, number]> = []
  const cornerOffsets = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
  ]
  for (const [cx, cy] of cornerOffsets) {
    for (let dy = 0; dy < 3 && cy + dy < height; dy++) {
      for (let dx = 0; dx < 3 && cx + dx < width; dx++) {
        const idx = ((cy + dy) * width + (cx + dx)) * channels
        samples.push([data[idx], data[idx + 1], data[idx + 2]])
      }
    }
  }
  // Average background color
  const bgR = Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length)
  const bgG = Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length)
  const bgB = Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length)

  // Threshold for background detection (Euclidean distance in RGB)
  const HARD_THRESHOLD = 30 // pixels within this distance → fully transparent
  const FEATHER_THRESHOLD = 80 // pixels up to this distance → partial alpha

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2)
    if (dist < HARD_THRESHOLD) {
      data[idx + 3] = 0 // fully transparent
    } else if (dist < FEATHER_THRESHOLD) {
      // Feather: partial transparency for anti-aliased edges
      const t = (dist - HARD_THRESHOLD) / (FEATHER_THRESHOLD - HARD_THRESHOLD)
      data[idx + 3] = Math.round(t * 255)
    } else {
      data[idx + 3] = 255 // fully opaque
    }
  }

  // Write the processed image as PNG with alpha
  await sharp(data, { raw: { width, height, channels } }).png().toFile(outputPath)
  return outputPath
}

/**
 * Generate a premium image with a transparent background.
 * Generates the image, removes the background using sharp, then uploads to Vercel Blob.
 */
export async function generateTransparentImage(prompt: string, filename: string): Promise<string> {
  const { put } = await import('@vercel/blob')
  const sharp = (await import('sharp')).default
  const zai = await getZAI()

  const enhanced = `${prompt}. Premium flat vector illustration, isolated on pure solid white background, no shadows, no gradient background, clean minimalist educational infographic, vibrant teal emerald and violet accents, crisp lines, high detail, professional 4k, centered composition`

  // Generate the image
  const response = await zai.images.generations.create({
    prompt: enhanced,
    size: '1344x768',
  })
  const imageBase64 = response.data[0].base64
  const inputBuffer = Buffer.from(imageBase64, 'base64')

  // Remove background
  const image = sharp(inputBuffer)
  const meta = await image.metadata()
  const width = meta.width || 1
  const height = meta.height || 1
  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const channels = 4

  const samples: Array<[number, number, number]> = []
  const cornerOffsets = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
  ]
  for (const [cx, cy] of cornerOffsets) {
    for (let dy = 0; dy < 3 && cy + dy < height; dy++) {
      for (let dx = 0; dx < 3 && cx + dx < width; dx++) {
        const idx = ((cy + dy) * width + (cx + dx)) * channels
        samples.push([data[idx], data[idx + 1], data[idx + 2]])
      }
    }
  }
  const bgR = Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length)
  const bgG = Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length)
  const bgB = Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length)

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2)
    if (dist < 30) data[idx + 3] = 0
    else if (dist < 80) data[idx + 3] = Math.round(((dist - 30) / 50) * 255)
    else data[idx + 3] = 255
  }

  const outputBuffer = await sharp(data, { raw: { width, height, channels } }).png().toBuffer()
  const blob = await put(`visuals/${filename}`, outputBuffer, {
    access: 'public',
    contentType: 'image/png',
  })
  return blob.url
}

/**
 * Generate a short video from a text prompt and upload to Vercel Blob.
 * Returns the public URL for the video, or null if generation fails.
 */
export async function generateVideo(prompt: string, filename: string, durationSeconds = 6): Promise<string | null> {
  const { put } = await import('@vercel/blob')
  const zai = await getZAI()

  try {
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

    const maxAttempts = 100
    const pollInterval = 5000
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, pollInterval))
      const result = await zai.async.result.query(taskId)

      if (result.task_status === 'SUCCESS') {
        const videoUrl =
          result.video_url ||
          result.url ||
          result.video ||
          (result.video_result && result.video_result[0]?.url)

        if (!videoUrl) {
          console.error('[generateVideo] Success but no video URL', JSON.stringify(result))
          return null
        }

        const videoBuffer = await fetch(videoUrl as string).then((r) => r.arrayBuffer())
        const blob = await put(`visuals/${filename}`, Buffer.from(videoBuffer), {
          access: 'public',
          contentType: 'video/mp4',
        })
        return blob.url
      }

      if (result.task_status === 'FAIL') {
        console.error('[generateVideo] Generation failed')
        return null
      }
    }
    console.error('[generateVideo] Timed out waiting for completion')
    return null
  } catch (err) {
    console.error('[generateVideo] Error:', (err as Error).message)
    return null
  }
}
