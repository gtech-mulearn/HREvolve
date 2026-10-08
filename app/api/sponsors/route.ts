import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const assignments = await prisma.sponsorMonth.findMany({
    where: { month, year },
    include: { sponsor: true },
    orderBy: { sponsor: { createdAt: 'asc' } },
  })

  const sponsors = assignments.map((a) => ({
    id: a.sponsor.id,
    name: a.sponsor.name,
    logoUrl: a.sponsor.logoUrl,
    websiteUrl: a.sponsor.websiteUrl,
  }))

  return NextResponse.json({ sponsors })
}
