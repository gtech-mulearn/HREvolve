import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      date: true,
      time: true,
      location: true,
      city: true,
      category: true,
      linkedinUrl: true,
      registrationUrl: true,
      isFlagship: true,
      highlight: true,
    },
  })

  return NextResponse.json({ events }, { headers: PUBLIC_CACHE_HEADERS })
}
