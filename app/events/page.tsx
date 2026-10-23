import { getPublishedPrograms } from '@/lib/public-data'
import type { ProcessedPrograms } from '../utils/sheetsApi'
import EventsView from './EventsView'

// Statically generated; refreshed every minute and on admin changes (revalidatePublicPages)
export const revalidate = 60

export default async function EventsPage() {
  let programs: ProcessedPrograms = { upcoming: [], past: [] }
  try {
    programs = await getPublishedPrograms()
  } catch (error) {
    console.error('Failed to load events for /events:', error)
  }

  return <EventsView programs={programs} />
}
