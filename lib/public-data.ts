import { prisma } from '@/lib/prisma'
import { processEvents, type ProcessedPrograms } from '@/app/utils/sheetsApi'

// Server-side loaders for the public pages, so they render with data in the first
// HTML response (and can be cached via ISR) instead of fetching after hydration.
// The public API routes use the same selects.

export const PUBLIC_EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  image: true,
  date: true,
  time: true,
  location: true,
  city: true,
  category: true,
  linkedinUrl: true,
  registrationUrl: true,
  isFlagship: true,
  highlight: true,
  siteUrl: true,
} as const

export const PUBLIC_GALLERY_SELECT = { id: true, url: true, caption: true, createdAt: true } as const

export async function getPublishedPrograms(): Promise<ProcessedPrograms> {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { date: 'asc' },
    select: PUBLIC_EVENT_SELECT,
  })
  return processEvents(events.map((e) => ({ ...e, date: e.date.toISOString() })))
}

export async function getPublishedGalleryImages() {
  const images = await prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: PUBLIC_GALLERY_SELECT,
  })
  return images.map((img) => ({ ...img, createdAt: img.createdAt.toISOString() }))
}
