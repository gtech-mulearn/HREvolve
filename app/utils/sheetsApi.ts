// Events data utility functions - reads published events from the CMS-backed /api/events route
export interface ProgramData {
  title: string;
  date: string;
  time: string;
  description: string;
  image_url: string;
  linkedin_url: string;
  location: string;
  city: string;
  category: string;
  status: string;
  registration_url?: string;
  is_flagship: boolean;
  highlight: string;
}

export interface ProcessedPrograms {
  upcoming: ProgramData[];
  past: ProgramData[];
}

interface ApiEvent {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  date: string;
  time: string | null;
  location: string | null;
  city: string | null;
  category: string | null;
  linkedinUrl: string | null;
  registrationUrl: string | null;
  isFlagship: boolean;
  highlight: string | null;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Event dates are stored as UTC midnight of the intended calendar day, so they are
// compared as YYYY-MM-DD strings against today's date in IST (the audience's timezone),
// independent of the visitor's own timezone. Matches the chapter pages and the cron.
export function todayIst(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().split('T')[0];
}

// The homepage renders several sections from the same event list; share one request
// per page load instead of fetching /api/events once per component.
const EVENTS_REUSE_MS = 60 * 1000;
let eventsRequest: { promise: Promise<ProcessedPrograms>; startedAt: number } | null = null;

export function fetchPublishedEvents(): Promise<ProcessedPrograms> {
  if (!eventsRequest || Date.now() - eventsRequest.startedAt > EVENTS_REUSE_MS) {
    const promise = loadPublishedEvents().catch((error) => {
      eventsRequest = null;
      throw error;
    });
    eventsRequest = { promise, startedAt: Date.now() };
  }
  return eventsRequest.promise;
}

async function loadPublishedEvents(): Promise<ProcessedPrograms> {
  const response = await fetch('/api/events', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load events (status ${response.status})`);
  }

  const { events }: { events: ApiEvent[] } = await response.json();

  const today = todayIst();

  const upcoming: ProgramData[] = [];
  const past: ProgramData[] = [];

  events.forEach((event) => {
    const program: ProgramData = {
      title: event.title,
      date: event.date.split('T')[0],
      time: event.time || '',
      description: event.description || '',
      image_url: convertGoogleDriveUrl(event.image || ''),
      linkedin_url: event.linkedinUrl || '',
      location: event.location || '',
      city: event.city || '',
      category: event.category || '',
      status: '',
      registration_url: event.registrationUrl || undefined,
      is_flagship: !!event.isFlagship,
      highlight: event.highlight || '',
    };

    if (program.date >= today) {
      upcoming.push(program);
    } else {
      past.push(program);
    }
  });

  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  past.sort((a, b) => b.date.localeCompare(a.date));

  return { upcoming, past };
}

// Helper function to format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Dates are UTC-midnight calendar days; format in UTC so visitors in negative-offset
    // timezones don't see the previous day.
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Helper function to check if event is happening soon (within 7 days)
export function isEventSoon(dateString: string): boolean {
  try {
    const eventDate = new Date(dateString.split('T')[0] + 'T00:00:00Z');
    const currentDate = new Date(todayIst() + 'T00:00:00Z');
    const diffDays = Math.round((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  } catch (error) {
    return false;
  }
}

// Helper function to convert Google Drive URLs to direct image URLs
// (still needed for events migrated from the old sheet whose image is a Drive link)
export function convertGoogleDriveUrl(url: string, format: 'uc' | 'thumbnail' | 'proxy' = 'uc'): string {
  if (!url || !url.includes('drive.google.com')) {
    return url; // Return as-is if not a Google Drive URL
  }

  // Extract file ID from Google Drive URL
  let fileId = '';

  // Pattern 1: /file/d/FILE_ID/view
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    fileId = fileIdMatch[1];
  }

  // Pattern 2: id=FILE_ID
  if (!fileId) {
    const alternativeMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (alternativeMatch && alternativeMatch[1]) {
      fileId = alternativeMatch[1];
    }
  }

  // Pattern 3: /open?id=FILE_ID
  if (!fileId) {
    const openMatch = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
      fileId = openMatch[1];
    }
  }

  if (!fileId) {
    console.warn('Could not extract file ID from Google Drive URL:', url);
    return url; // Return original URL if no file ID found
  }

  // Convert based on format preference
  switch (format) {
    case 'uc':
      // Standard direct view URL (best for images)
      return `https://drive.google.com/uc?export=view&id=${fileId}`;

    case 'thumbnail':
      // Thumbnail URL (good for smaller images, faster loading)
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    case 'proxy':
      // Alternative proxy method (sometimes more reliable)
      return `https://lh3.googleusercontent.com/d/${fileId}`;

    default:
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
}

// Helper function to get multiple Google Drive URL formats for fallback
export function getGoogleDriveUrls(url: string): string[] {
  if (!url || !url.includes('drive.google.com')) {
    return [url];
  }

  return [
    convertGoogleDriveUrl(url, 'uc'),        // Primary: Direct view
    convertGoogleDriveUrl(url, 'thumbnail'), // Secondary: Thumbnail
    convertGoogleDriveUrl(url, 'proxy'),     // Tertiary: Proxy
  ].filter(Boolean);
}

// Helper function to get a fallback image URL if the main image fails
export function getFallbackImageUrl(): string {
  return '/logo.png'; // Use the logo as fallback, or you can use a placeholder image
}

export { CITY_LABELS } from '@/lib/cities';

// Where clicking an event card goes: its LinkedIn post, or failing that its own
// site/registration page (e.g. an Elevate edition's microsite).
export function getEventLink(program: ProgramData): string {
  return program.linkedin_url || program.registration_url || '';
}
