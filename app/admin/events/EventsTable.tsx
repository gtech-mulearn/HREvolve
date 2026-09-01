'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import StatusBadge from '../_components/StatusBadge'
import ConfirmDialog from '../_components/ConfirmDialog'
import EmptyState from '../_components/EmptyState'
import { useToast } from '../_components/Toast'

interface EventRow {
  id: string
  title: string
  image: string | null
  date: string
  location: string | null
  city: string | null
  category: string | null
  isPublished: boolean
  createdBy: { name: string | null; email: string | null } | null
}

type FilterTab = 'all' | 'published' | 'draft'
type CityFilter = 'all' | 'TRIVANDRUM' | 'KOCHI'

const CITY_LABELS: Record<string, string> = {
  TRIVANDRUM: 'Trivandrum',
  KOCHI: 'Kochi',
}

const PAGE_SIZE = 10

export default function EventsTable({ events }: { events: EventRow[] }) {
  const router = useRouter()
  const { show } = useToast()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [cityFilter, setCityFilter] = useState<CityFilter>('all')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null)

  const counts = useMemo(
    () => ({
      all: events.length,
      published: events.filter((e) => e.isPublished).length,
      draft: events.filter((e) => !e.isPublished).length,
    }),
    [events]
  )

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (tab === 'published' && !event.isPublished) return false
      if (tab === 'draft' && event.isPublished) return false
      if (cityFilter !== 'all' && event.city !== cityFilter) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        return (
          event.title.toLowerCase().includes(q) ||
          (event.location || '').toLowerCase().includes(q) ||
          (event.category || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [events, tab, cityFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetToFirstPage = () => setPage(1)

  const togglePublish = async (event: EventRow) => {
    setBusyId(event.id)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !event.isPublished }),
      })
      if (!res.ok) throw new Error()
      show(event.isPublished ? 'Event unpublished' : 'Event published')
      router.refresh()
    } catch {
      show('Failed to update event', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      show('Event deleted')
      router.refresh()
    } catch {
      show('Failed to delete event', 'error')
    } finally {
      setBusyId(null)
      setDeleteTarget(null)
    }
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDaysIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
        title="No events yet"
        description="Create your first event to get it in front of your audience."
        action={
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <PlusIcon className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
            <span style={{ color: 'var(--bg-primary)' }}>New Event</span>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-grow max-w-sm">
          <MagnifyingGlassIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-secondary)' }}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              resetToFirstPage()
            }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {(['all', 'published', 'draft'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                resetToFirstPage()
              }}
              className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors duration-150"
              style={
                tab === t
                  ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {t} <span className="opacity-60">({counts[t]})</span>
            </button>
          ))}
        </div>

        <select
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value as CityFilter)
            resetToFirstPage()
          }}
          className="px-3 py-2 rounded-lg border text-sm font-medium"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Cities</option>
          <option value="TRIVANDRUM">Trivandrum</option>
          <option value="KOCHI">Kochi</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />}
          title="No matching events"
          description="Try a different search term or filter."
        />
      ) : (
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-custom)' }}>
                  <th className="text-left font-semibold px-5 py-3" style={{ color: 'var(--text-secondary)' }}>
                    Event
                  </th>
                  <th className="text-left font-semibold px-5 py-3 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    Date &amp; Location
                  </th>
                  <th className="text-left font-semibold px-5 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                  <th className="text-right font-semibold px-5 py-3" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((event) => (
                  <tr
                    key={event.id}
                    className="transition-colors duration-150 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    style={{ borderBottom: '1px solid var(--border-custom)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {event.image ? (
                          <img src={event.image} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'var(--bg-primary)' }}
                          >
                            <CalendarDaysIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[220px] sm:max-w-xs" style={{ color: 'var(--text-primary)' }}>
                            {event.title}
                          </p>
                          {event.category && (
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                              {event.category}
                            </p>
                          )}
                          <div className="sm:hidden mt-1">
                            <StatusBadge isPublished={event.isPublished} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                        <CalendarDaysIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {(event.location || event.city) && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <MapPinIcon className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">
                            {[event.location, event.city ? CITY_LABELS[event.city] : null].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <StatusBadge isPublished={event.isPublished} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePublish(event)}
                          disabled={busyId === event.id}
                          title={event.isPublished ? 'Unpublish' : 'Publish'}
                          className="p-2 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40"
                        >
                          {event.isPublished ? (
                            <EyeSlashIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          ) : (
                            <EyeIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                          )}
                        </button>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          title="Edit"
                          className="p-2 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10 inline-flex"
                        >
                          <PencilSquareIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          disabled={busyId === event.id}
                          title="Delete"
                          className="p-2 rounded-lg transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: '1px solid var(--border-custom)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages} &middot; {filtered.length} events
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors duration-150 disabled:opacity-30"
                  style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors duration-150 disabled:opacity-30"
                  style={{ borderColor: 'var(--border-custom)', color: 'var(--text-primary)' }}
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete event?"
        description={`"${deleteTarget?.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        danger
        busy={busyId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
