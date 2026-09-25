import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, GALLERY_IMAGES_BUCKET } from '@/lib/supabase-admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.galleryImage.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const body = await request.json()
  const { isPublished, caption } = body

  const image = await prisma.galleryImage.update({
    where: { id: params.id },
    data: {
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
      ...(caption !== undefined && { caption }),
    },
  })

  return NextResponse.json({ image })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.galleryImage.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  await prisma.galleryImage.delete({ where: { id: params.id } })

  try {
    await supabaseAdmin.storage.from(GALLERY_IMAGES_BUCKET).remove([existing.path])
  } catch (cleanupError) {
    console.error('Failed to clean up gallery image from storage:', cleanupError)
  }

  return NextResponse.json({ message: 'Image deleted' })
}
