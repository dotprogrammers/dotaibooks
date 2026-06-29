import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken, getSessionToken, isAdmin } from '@/lib/auth'
import { extractPdfText, saveUploadedFile, categorizeFile, MAX_UPLOAD_SIZE } from '@/lib/pdf'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const resources = await db.resource.findMany({ orderBy: { uploadedAt: 'desc' }, include: { certification: { select: { shortName: true } } } })
    return NextResponse.json({ resources })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const certificationId = formData.get('certificationId') as string | null
    if (!files?.length) return NextResponse.json({ error: 'No files' }, { status: 400 })
    const totalSize = files.reduce((s, f) => s + f.size, 0)
    if (totalSize > MAX_UPLOAD_SIZE) return NextResponse.json({ error: 'Exceeds 500MB' }, { status: 413 })

    const created = []
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const filePath = await saveUploadedFile(buffer, `${Date.now()}-${file.name}`)
      const { text, pageCount } = await extractPdfText(filePath)
      const { category, title } = categorizeFile(file.name)
      const existing = await db.resource.findFirst({ where: { fileName: file.name } })
      if (existing) {
        await db.resource.update({ where: { id: existing.id }, data: { title, category, certificationId: certificationId || existing.certificationId, fileSize: file.size, content: text, pageCount, status: 'processed', uploadedBy: user.id } })
      } else {
        const r = await db.resource.create({ data: { fileName: file.name, fileType: file.type || 'application/pdf', fileSize: file.size, category, title, content: text, pageCount, status: 'processed', certificationId: certificationId || null, uploadedBy: user.id } })
        created.push(r)
      }
    }
    return NextResponse.json({ success: true, count: created.length })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getSessionToken(req.headers.get('cookie'))
    const user = await getUserFromToken(token)
    if (!user || !isAdmin(user.role)) return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.resource.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Failed: ' + (e as Error).message }, { status: 500 }) }
}
