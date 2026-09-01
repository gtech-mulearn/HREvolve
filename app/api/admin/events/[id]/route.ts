import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin, EVENT_IMAGES_BUCKET } from '@/lib/supabase-admin'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({ event })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.event.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const body = await request.json()
  const {
    title,
    description,
    image,
    date,
    time,
    location,
    city,
    category,
    linkedinUrl,
    registrationUrl,
    isPublished,
  } = body

  if (city !== undefined && city !== null && city !== '' && city !== 'TRIVANDRUM' && city !== 'KOCHI') {
    return NextResponse.json({ error: 'city must be TRIVANDRUM or KOCHI' }, { status: 400 })
  }

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(time !== undefined && { time }),
      ...(location !== undefined && { location }),
      ...(city !== undefined && { city: city || null }),
      ...(category !== undefined && { category }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(registrationUrl !== undefined && { registrationUrl }),
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
    },
  })

  return NextResponse.json({ event })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const existing = await prisma.event.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  await prisma.event.delete({ where: { id: params.id } })

  if (existing.image && existing.image.includes(`/${EVENT_IMAGES_BUCKET}/`)) {
    try {
      const path = existing.image.split(`/${EVENT_IMAGES_BUCKET}/`)[1]
      if (path) {
        await supabaseAdmin.storage.from(EVENT_IMAGES_BUCKET).remove([path])
      }
    } catch (cleanupError) {
      console.error('Failed to clean up event image from storage:', cleanupError)
    }
  }

  return NextResponse.json({ message: 'Event deleted' })
}
