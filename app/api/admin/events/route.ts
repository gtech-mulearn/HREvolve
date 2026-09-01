import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const isPublishedParam = request.nextUrl.searchParams.get('isPublished')
  const where =
    isPublishedParam === 'true'
      ? { isPublished: true }
      : isPublishedParam === 'false'
      ? { isPublished: false }
      : {}

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ events })
}

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const body = await request.json()
  const {
    title,
    description,
    image,
    date,
    time,
    location,
    category,
    linkedinUrl,
    registrationUrl,
    isPublished,
  } = body

  if (!title || !date) {
    return NextResponse.json({ error: 'title and date are required' }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      image: image || null,
      date: new Date(date),
      time: time || null,
      location: location || null,
      category: category || null,
      linkedinUrl: linkedinUrl || null,
      registrationUrl: registrationUrl || null,
      isPublished: !!isPublished,
      createdById: session.user.id,
    },
  })

  return NextResponse.json({ event }, { status: 201 })
}
