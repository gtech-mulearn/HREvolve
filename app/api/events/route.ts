import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache'
import { PUBLIC_EVENT_SELECT } from '@/lib/public-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { date: 'asc' },
    select: PUBLIC_EVENT_SELECT,
  })

  return NextResponse.json({ events }, { headers: PUBLIC_CACHE_HEADERS })
}
