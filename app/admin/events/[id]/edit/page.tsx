import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { prisma } from '@/lib/prisma'
import EventForm from '../../EventForm'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } })

  if (!event) {
    notFound()
  }

  const initialData = {
    id: event.id,
    title: event.title,
    description: event.description || '',
    image: event.image || '',
    date: event.date.toISOString().split('T')[0],
    time: event.time || '',
    location: event.location || '',
    category: event.category || '',
    linkedinUrl: event.linkedinUrl || '',
    registrationUrl: event.registrationUrl || '',
    isPublished: event.isPublished,
  }

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
        Edit Event
      </h1>
      <EventForm initialData={initialData} />
    </div>
  )
}
