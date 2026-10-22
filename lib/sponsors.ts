import { prisma } from '@/lib/prisma'
import type { CityValue } from '@/lib/cities'

// Sponsors assigned to the current month. `city = null` means homepage sponsors.
export async function getCurrentMonthSponsors(city: CityValue | null) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const assignments = await prisma.sponsorMonth.findMany({
    where: { month, year, sponsor: { city } },
    select: { sponsor: { select: { id: true, name: true, logoUrl: true, websiteUrl: true } } },
    orderBy: { sponsor: { createdAt: 'asc' } },
  })

  return assignments.map((a) => ({
    id: a.sponsor.id,
    name: a.sponsor.name,
    logoUrl: a.sponsor.logoUrl,
    websiteUrl: a.sponsor.websiteUrl,
  }))
}
