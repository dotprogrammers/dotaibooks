import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { extractPdfText, saveUploadedFile, categorizeFile, MAX_UPLOAD_SIZE } from '@/lib/pdf'

export const runtime = 'nodejs'
export const maxDuration = 300

// GET /api/resources - list all resources
export async function GET() {
  try {
    const resources = await db.resource.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        title: true,
        category: true,
        fileSize: true,
        pageCount: true,
        status: true,
        uploadedAt: true,
        description: true,
      },
    })
    return NextResponse.json({ resources })
  } catch (error) {
    console.error('[GET /api/resources]', error)
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

// POST /api/resources - upload one or more PDFs (up to 500MB total)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Check total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `Total upload size exceeds 500MB limit (received ${(totalSize / 1024 / 1024).toFixed(1)}MB)` },
        { status: 413 }
      )
    }

    const created = []
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        continue
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const filePath = await saveUploadedFile(buffer, `${Date.now()}-${file.name}`)
      const { text, pageCount } = await extractPdfText(filePath)
      const { category, title } = categorizeFile(file.name)

      // Check for duplicates by fileName
      const existing = await db.resource.findFirst({ where: { fileName: file.name } })
      if (existing) {
        const updated = await db.resource.update({
          where: { id: existing.id },
          data: {
            title,
            category,
            fileSize: file.size,
            content: text,
            pageCount,
            status: 'processed',
            fileType: file.type || 'application/pdf',
          },
        })
        created.push(updated)
      } else {
        const resource = await db.resource.create({
          data: {
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            fileSize: file.size,
            category,
            title,
            content: text,
            pageCount,
            status: 'processed',
          },
        })
        created.push(resource)
      }
    }

    return NextResponse.json({
      success: true,
      count: created.length,
      resources: created.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        title: r.title,
        category: r.category,
        pageCount: r.pageCount,
        status: r.status,
      })),
    })
  } catch (error) {
    console.error('[POST /api/resources]', error)
    return NextResponse.json(
      { error: 'Failed to upload resources: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE /api/resources?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.resource.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/resources]', error)
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
  }
}
