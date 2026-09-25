import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, url: true, caption: true, createdAt: true },
  })

  return NextResponse.json({ images })
}
