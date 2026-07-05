import { put } from '@vercel/blob'

/**
 * Extract text from a PDF buffer using pdf-parse.
 * Returns the extracted text and page count.
 */
export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return { text: data.text, pageCount: data.numpages }
  } catch (err) {
    console.error('[PDF extract] Error:', (err as Error).message)
    return { text: '', pageCount: 0 }
  }
}

/**
 * Extract text from a PDF file using pdftotext (preferred) or pdf-parse fallback.
 * Returns the extracted text and page count.
 */
export async function extractPdfText(filePath: string): Promise<{ text: string; pageCount: number }> {
  try {
    const fs = await import('fs')
    const outPath = filePath + '.txt'
    const { execSync } = await import('child_process')
    execSync(`pdftotext -layout "${filePath}" "${outPath}"`, { timeout: 60000 })
    const text = fs.readFileSync(outPath, 'utf-8')
    fs.unlinkSync(outPath)
    const pageCount = text.split('\f').length - 1 || Math.ceil(text.length / 3000)
    return { text, pageCount: Math.max(1, pageCount) }
  } catch {
    try {
      const fs = await import('fs')
      const pdfParse = (await import('pdf-parse')).default
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      return { text: data.text, pageCount: data.numpages }
    } catch (err) {
      console.error('[PDF extract] Both methods failed:', (err as Error).message)
      return { text: '', pageCount: 0 }
    }
  }
}

/**
 * Save an uploaded file to Vercel Blob and return the public URL.
 */
export async function saveUploadedFile(buffer: Buffer, fileName: string): Promise<string> {
  const blob = await put(`uploads/${fileName}`, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  })
  return blob.url
}

/**
 * Categorize a file based on its name.
 */
export function categorizeFile(fileName: string): { category: string; title: string } {
  const lower = fileName.toLowerCase()
  let category = 'other'
  let title = fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ')

  if (lower.includes('syllabus')) {
    category = 'syllabus'
    title = 'ITIL Product Syllabus'
  } else if (lower.includes('samplepaper1') || lower.includes('sample_paper1')) {
    category = 'sample-paper'
    title = 'Sample Paper 1 - Questions'
  } else if (lower.includes('samplepaper2') || lower.includes('sample_paper2')) {
    category = 'sample-paper'
    title = 'Sample Paper 2 - Questions'
  } else if (lower.includes('sp1_answers') || lower.includes('answers1') || lower.includes('sp1answers')) {
    category = 'answers'
    title = 'Sample Paper 1 - Answers & Rationales'
  } else if (lower.includes('sp2_answers') || lower.includes('answers2') || lower.includes('sp2answers')) {
    category = 'answers'
    title = 'Sample Paper 2 - Answers & Rationales'
  } else if (lower.includes('glossary')) {
    category = 'glossary'
    title = 'ITIL Product Glossary'
  } else if (lower.includes('releasenotes')) {
    category = 'release-notes'
    title = fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ')
  }

  return { category, title }
}

export const MAX_UPLOAD_SIZE = 500 * 1024 * 1024 // 500MB
