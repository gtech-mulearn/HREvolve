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
}

export async function fetchPublishedEvents(): Promise<ProcessedPrograms> {
  const response = await fetch('/api/events', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load events (status ${response.status})`);
  }

  const { events }: { events: ApiEvent[] } = await response.json();

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

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
    };

    const eventDate = new Date(program.date + 'T00:00:00');
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate >= currentDate) {
      upcoming.push(program);
    } else {
      past.push(program);
    }
  });

  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { upcoming, past };
}

// Helper function to format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    const eventDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = eventDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

export const CITY_LABELS: Record<string, string> = {
  TRIVANDRUM: 'Trivandrum',
  KOCHI: 'Kochi',
};
