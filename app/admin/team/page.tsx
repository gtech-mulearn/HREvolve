import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TeamManager from './TeamManager'

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin')
  }

  const members = await prisma.teamMember.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Core Team
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage the core team shown on each city&apos;s chapter page.
        </p>
      </div>

      <TeamManager
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          imageUrl: m.imageUrl,
          linkedinUrl: m.linkedinUrl,
          city: m.city,
          order: m.order,
        }))}
      />
    </div>
  )
}
