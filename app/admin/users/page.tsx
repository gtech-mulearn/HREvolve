import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { UsersIcon, ShieldCheckIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersTable from './UsersTable'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (session?.user.role !== 'ADMIN') {
    redirect('/admin')
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, userType: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const stats = [
    { label: 'Total Users', value: users.length, icon: UsersIcon, tint: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
    { label: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length, icon: ShieldCheckIcon, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
    { label: 'Hosts', value: users.filter((u) => u.role === 'HOST').length, icon: MegaphoneIcon, tint: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  ]

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Users
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage account access and roles.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8 max-w-xl">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 border shadow-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.tint}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <UsersTable
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        currentUserId={session.user.id}
      />
    </div>
  )
}
