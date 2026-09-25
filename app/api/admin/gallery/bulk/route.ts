import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, GALLERY_IMAGES_BUCKET } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const body = await request.json()
  const { ids, action } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
  }

  if (action === 'approve') {
    const result = await prisma.galleryImage.updateMany({
      where: { id: { in: ids } },
      data: { isPublished: true },
    })
    return NextResponse.json({ updated: result.count })
  }

  if (action === 'delete') {
    const images = await prisma.galleryImage.findMany({ where: { id: { in: ids } } })
    await prisma.galleryImage.deleteMany({ where: { id: { in: ids } } })

    const paths = images.map((image) => image.path)
    if (paths.length > 0) {
      try {
        await supabaseAdmin.storage.from(GALLERY_IMAGES_BUCKET).remove(paths)
      } catch (cleanupError) {
        console.error('Failed to clean up gallery images from storage:', cleanupError)
      }
    }

    return NextResponse.json({ deleted: images.length })
  }

  return NextResponse.json({ error: 'action must be "approve" or "delete"' }, { status: 400 })
}
