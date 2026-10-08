import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SponsorManager from './SponsorManager'

export default async function AdminSponsorsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin')
  }

  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: 'desc' },
    include: { months: true },
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Sponsors
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Upload sponsor logos and choose which ones appear on the homepage this month.
        </p>
      </div>

      <SponsorManager
        sponsors={sponsors.map((sponsor) => ({
          ...sponsor,
          createdAt: sponsor.createdAt.toISOString(),
          months: sponsor.months.map((m) => ({ month: m.month, year: m.year })),
        }))}
      />
    </div>
  )
}
