import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, url: true, caption: true, createdAt: true },
  })

  return NextResponse.json({ images }, { headers: PUBLIC_CACHE_HEADERS })
}
