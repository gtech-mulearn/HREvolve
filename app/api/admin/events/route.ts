import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN', 'HOST'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const isPublishedParam = request.nextUrl.searchParams.get('isPublished')
  const cityParam = request.nextUrl.searchParams.get('city')

  const where: any = {}
  if (isPublishedParam === 'true') where.isPublished = true
  if (isPublishedParam === 'false') where.isPublished = false
  if (cityParam === 'TRIVANDRUM' || cityParam === 'KOCHI') where.city = cityParam

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
    city,
    category,
    linkedinUrl,
    registrationUrl,
    isPublished,
  } = body

  if (!title || !date) {
    return NextResponse.json({ error: 'title and date are required' }, { status: 400 })
  }

  if (city && city !== 'TRIVANDRUM' && city !== 'KOCHI') {
    return NextResponse.json({ error: 'city must be TRIVANDRUM or KOCHI' }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      image: image || null,
      date: new Date(date),
      time: time || null,
      location: location || null,
      city: city || null,
      category: category || null,
      linkedinUrl: linkedinUrl || null,
      registrationUrl: registrationUrl || null,
      isPublished: !!isPublished,
      createdById: session.user.id,
    },
  })

  return NextResponse.json({ event }, { status: 201 })
}
