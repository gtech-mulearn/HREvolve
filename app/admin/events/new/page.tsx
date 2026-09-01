import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import EventForm from '../EventForm'

export default function NewEventPage() {
  return (
    <div>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Events
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
        New Event
      </h1>
      <EventForm />
    </div>
  )
}
