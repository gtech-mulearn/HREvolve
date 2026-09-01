import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { prisma } from '@/lib/prisma'
import EventsTable from './EventsTable'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Events
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage, publish, and organize your events.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <PlusIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
          <span style={{ color: 'var(--bg-primary)' }}>New Event</span>
        </Link>
      </div>

      <EventsTable
        events={events.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        }))}
      />
    </div>
  )
}
