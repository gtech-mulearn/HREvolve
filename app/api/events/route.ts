import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ events })
}
