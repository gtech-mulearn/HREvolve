import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const { session, error, status } = await requireAdminSession(['ADMIN'])
  if (!session) {
    return NextResponse.json({ error }, { status })
  }

  const body = await request.json()
  const { sponsorId, month, year, assigned } = body

  if (!sponsorId || !month || !year || typeof assigned !== 'boolean') {
    return NextResponse.json({ error: 'sponsorId, month, year, and assigned are required' }, { status: 400 })
  }

  const sponsor = await prisma.sponsor.findUnique({ where: { id: sponsorId } })
  if (!sponsor) {
    return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
  }

  if (assigned) {
    await prisma.sponsorMonth.upsert({
      where: { sponsorId_month_year: { sponsorId, month, year } },
      update: {},
      create: { sponsorId, month, year },
    })
  } else {
    await prisma.sponsorMonth
      .delete({ where: { sponsorId_month_year: { sponsorId, month, year } } })
      .catch(() => {})
  }

  return NextResponse.json({ message: 'Updated' })
}
