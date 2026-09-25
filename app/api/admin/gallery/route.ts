import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, GALLERY_IMAGES_BUCKET, ensureGalleryImagesBucket } from '@/lib/supabase-admin'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export async function GET(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const statusParam = request.nextUrl.searchParams.get('status')
  const where: any = {}
  if (statusParam === 'pending') where.isPublished = false
  if (statusParam === 'published') where.isPublished = true

  const images = await prisma.galleryImage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ images })
}

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const formData = await request.formData()
  const files = formData.getAll('files')

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  try {
    await ensureGalleryImagesBucket()
  } catch (bucketError) {
    console.error('Failed to ensure gallery bucket:', bucketError)
    return NextResponse.json({ error: 'Failed to prepare storage' }, { status: 500 })
  }

  const isPublished = session.user.role === 'ADMIN'
  const created: { id: string; url: string }[] = []
  const failed: { filename: string; error: string }[] = []

  for (const entry of files) {
    if (!(entry instanceof File)) continue

    if (!entry.type.startsWith('image/')) {
      failed.push({ filename: entry.name, error: 'File must be an image' })
      continue
    }
    if (entry.size > MAX_SIZE_BYTES) {
      failed.push({ filename: entry.name, error: 'Image must be 5MB or smaller' })
      continue
    }

    try {
      const sanitizedName = entry.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `gallery/${randomUUID()}-${sanitizedName}`
      const buffer = Buffer.from(await entry.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage
        .from(GALLERY_IMAGES_BUCKET)
        .upload(path, buffer, { contentType: entry.type })

      if (uploadError) throw uploadError

      const { data } = supabaseAdmin.storage.from(GALLERY_IMAGES_BUCKET).getPublicUrl(path)

      const image = await prisma.galleryImage.create({
        data: {
          url: data.publicUrl,
          path,
          isPublished,
          createdById: session.user.id,
        },
      })

      created.push({ id: image.id, url: image.url })
    } catch (uploadError) {
      console.error('Gallery image upload failed:', uploadError)
      failed.push({ filename: entry.name, error: 'Upload failed' })
    }
  }

  return NextResponse.json({ created, failed }, { status: created.length > 0 ? 201 : 400 })
}
