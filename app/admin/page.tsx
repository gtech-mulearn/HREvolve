import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatusBadge from './_components/StatusBadge'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentIcon,
  UsersIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN'

  const [totalEvents, publishedEvents, draftEvents, staffCount, recentEvents] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { isPublished: true } }),
    prisma.event.count({ where: { isPublished: false } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HOST'] } } }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const stats = [
    { label: 'Total Events', value: totalEvents, icon: CalendarDaysIcon, tint: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
    { label: 'Published', value: publishedEvents, icon: CheckCircleIcon, tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { label: 'Drafts', value: draftEvents, icon: DocumentIcon, tint: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
    ...(isAdmin
      ? [{ label: 'Admins & Hosts', value: staffCount, icon: UsersIcon, tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' }]
      : []),
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back{session?.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening with your events.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 shadow-sm w-fit"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <PlusIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
          <span style={{ color: 'var(--bg-primary)' }}>New Event</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 border shadow-sm transition-shadow duration-200 hover:shadow-md"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.tint}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
      >
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-custom)' }}
        >
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Recent Events
          </h2>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            View all
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No events created yet.
            </p>
          </div>
        ) : (
          <div>
            {recentEvents.map((event, i) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                className="flex items-center gap-4 px-5 sm:px-6 py-3.5 transition-colors duration-150 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                style={i > 0 ? { borderTop: '1px solid var(--border-custom)' } : undefined}
              >
                {event.image ? (
                  <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-primary)' }}
                  >
                    <CalendarDaysIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                )}
                <div className="min-w-0 flex-grow">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {event.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge isPublished={event.isPublished} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
