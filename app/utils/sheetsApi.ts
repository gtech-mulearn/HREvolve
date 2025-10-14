// Google Sheets API utility functions
export interface ProgramData {
  title: string;
  date: string;
  time: string;
  description: string;
  image_url: string;
  linkedin_url: string;
  location: string;
  category: string;
  status: string;
  registration_url?: string;
}

export interface ProcessedPrograms {
  upcoming: ProgramData[];
  past: ProgramData[];
}

// Replace with your Google Sheet ID
const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || 'YOUR_SHEET_ID_HERE';

// CSV export endpoint - works without API key for public sheets
const SHEETS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Enhanced CSV parser function to handle complex data including multiline fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes ("")
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else if (char === '\r' && !inQuotes) {
      // Skip carriage returns outside quotes
    } else if (char === '\n' && !inQuotes) {
      // Skip newlines outside quotes (end of record)
      break;
    } else {
      // Add character (including newlines within quotes)
      current += char;
    }
    i++;
  }
  
  // Add the last field
  result.push(current.trim());
  
  // Clean up the fields by removing outer quotes and normalizing whitespace
  return result.map(field => {
    field = field.trim();
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1);
      // Handle escaped quotes within the field
      field = field.replace(/""/g, '"');
    }
    // Normalize whitespace and remove extra line breaks
    field = field.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+/g, ' ').trim();
    return field;
  });
}

// Enhanced function to parse CSV data that might have multiline records
function parseCSVData(csvText: string): string[][] {
  const lines: string[] = [];
  const rawLines = csvText.split('\n');
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    currentLine += (currentLine ? '\n' : '') + line;
    
    // Count quotes to determine if we're inside a quoted field
    let quoteCount = 0;
    for (let char of currentLine) {
      if (char === '"') quoteCount++;
    }
    
    // If quote count is even, we're not inside quotes
    if (quoteCount % 2 === 0) {
      lines.push(currentLine);
      currentLine = '';
    }
  }
  
  // Add any remaining line
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.map(line => parseCSVLine(line));
}

// Cache duration in milliseconds (2 minutes for faster updates)
const CACHE_DURATION = 2 * 60 * 1000;
const CACHE_KEY = 'hr_evolve_programs_cache';

interface CachedData {
  data: ProcessedPrograms;
  timestamp: number;
}

// Check if cached data is still valid
function getCachedData(): ProcessedPrograms | null {
  if (typeof window === 'undefined') return null; // SSR check
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsedCache: CachedData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      console.log('Using cached data (age:', Math.round((now - parsedCache.timestamp) / 1000), 'seconds)');
      return parsedCache.data;
    } else {
      console.log('Cache expired, removing old data (age:', Math.round((now - parsedCache.timestamp) / 1000), 'seconds)');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  } catch (error) {
    console.error('Error reading cache:', error);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // Ignore localStorage errors in case it's not available
    }
    return null;
  }
}

// Get expired cache data as fallback
function getExpiredCacheData(): ProcessedPrograms | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsedCache: CachedData = JSON.parse(cached);
    console.log('Using expired cache as fallback');
    return parsedCache.data;
  } catch (error) {
    console.error('Error reading expired cache:', error);
    return null;
  }
}

// Save data to cache
function setCachedData(data: ProcessedPrograms): void {
  if (typeof window === 'undefined') return; // SSR check
  
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Data cached successfully at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

// Get cache timestamp for display
export function getCacheTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsedCache: CachedData = JSON.parse(cached);
    return new Date(parsedCache.timestamp).toLocaleTimeString();
  } catch (error) {
    return null;
  }
}

export async function fetchProgramsFromSheet(forceRefresh = false): Promise<ProcessedPrograms> {
  console.log('Fetching programs from sheet:', SHEET_ID, forceRefresh ? '(force refresh)' : '');
  
  // Check cache first (unless force refresh is requested)
  if (!forceRefresh) {
    const cachedData = getCachedData();
    if (cachedData) {
      return cachedData;
    }
  } else {
    console.log('Bypassing cache due to force refresh');
    // Clear cache when force refreshing
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(SHEETS_CSV_URL, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
    clearTimeout(timeoutId);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data received:', csvText.substring(0, 200) + '...');
    
    if (!csvText.trim()) {
      console.warn('No data found in the sheet');
      return { upcoming: [], past: [] };
    }

    // Parse CSV data using enhanced parser that handles multiline records
    console.log('Raw CSV length:', csvText.length, 'characters');
    const parsedRows = parseCSVData(csvText);
    console.log('Parsed rows count:', parsedRows.length);
    
    if (parsedRows.length <= 1) {
      console.warn('Only header row found or no data');
      return { upcoming: [], past: [] };
    }

    // Skip header row and parse data
    const programs: ProgramData[] = parsedRows.slice(1).map((row, index) => {
      try {
        console.log(`Row ${index + 2}:`, row);
        console.log(`Row ${index + 2} length:`, row.length);
        
        // Validate that we have enough columns
        if (row.length < 9) {
          console.warn(`Row ${index + 2} has insufficient columns (${row.length}):`, row);
          // Pad with empty strings if needed
          while (row.length < 10) {
            row.push('');
          }
        }
        
        const program = {
          title: (row[0] || '').trim(),
          date: (row[1] || '').trim(),
          time: (row[2] || '').trim(),
          description: (row[3] || '').trim(),
          image_url: convertGoogleDriveUrl((row[4] || '').trim()),
          linkedin_url: (row[5] || '').trim(),
          location: (row[6] || '').trim(),
          category: (row[7] || '').trim(),
          status: (row[8] || '').trim(),
          registration_url: (row[9] || '').trim()
        };
        
        console.log(`Parsed program:`, {
          title: program.title.substring(0, 50) + '...',
          date: program.date,
          location: program.location,
          status: program.status
        });
        
        return program;
      } catch (error) {
        console.error(`Error parsing row ${index + 2}:`, error);
        console.error('Problematic row data:', row);
        // Return empty program to be filtered out
        return {
          title: '',
          date: '',
          time: '',
          description: '',
          image_url: '',
          linkedin_url: '',
          location: '',
          category: '',
          status: ''
        };
      }
    }).filter(program => {
      const isValid = program.title && program.date;
      if (!isValid) {
        console.log('Filtering out invalid program:', program);
      }
      return isValid;
    }); // Filter out empty rows

    console.log('Parsed programs:', programs);

    // Sort programs by date and categorize
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    console.log('Current date for comparison:', currentDate.toISOString().split('T')[0]);

    const upcoming: ProgramData[] = [];
    const past: ProgramData[] = [];

    programs.forEach(program => {
      const programDate = new Date(program.date + 'T00:00:00'); // Add time to ensure proper parsing
      programDate.setHours(0, 0, 0, 0);
      
      console.log(`Program: ${program.title}`);
      console.log(`  Original Date: "${program.date}"`);
      console.log(`  Parsed Date: ${programDate.toISOString().split('T')[0]}`);
      console.log(`  Status: "${program.status}"`);
      console.log(`  Current Date: ${currentDate.toISOString().split('T')[0]}`);
      console.log(`  Date Comparison: programDate (${programDate.getTime()}) > currentDate (${currentDate.getTime()}) = ${programDate > currentDate}`);
      
      // Priority 1: If explicitly marked as Upcoming, respect that
      if (program.status === 'Upcoming') {
        console.log(`  → Adding to UPCOMING (status: Upcoming)`);
        upcoming.push(program);
      }
      // Priority 2: If explicitly marked as completed or cancelled
      else if (program.status === 'Completed' || program.status === 'Cancelled') {
        console.log(`  → Adding to PAST (status: ${program.status})`);
        past.push(program);
      }
      // Priority 3: Check if date is in the future and not cancelled
      else if (programDate > currentDate) {
        console.log(`  → Adding to UPCOMING (future date)`);
        upcoming.push(program);
      }
      // Everything else goes to past
      else {
        console.log(`  → Adding to PAST (past date)`);
        past.push(program);
      }
      console.log('---');
    });

    // Sort upcoming events chronologically (earliest first)
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Sort past events reverse chronologically (most recent first)
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Final categorization: ${upcoming.length} upcoming, ${past.length} past`);

    const result = { upcoming, past };
    
    // Cache the successful result
    setCachedData(result);
    
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out - taking too long to fetch data');
      throw new Error('Request timed out. Please check your internet connection.');
    }
    console.error('Error fetching programs from sheet:', error);
    
    // Try to return cached data even if expired, as fallback
    const expiredCache = getExpiredCacheData();
    if (expiredCache) {
      return expiredCache;
    }
    
    return { upcoming: [], past: [] };
  }
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

// Debug function to test Google Drive URL conversion
export function testGoogleDriveUrl(url: string): void {
  console.log('=== Google Drive URL Testing ===');
  console.log('Original URL:', url);
  console.log('Standard (uc):', convertGoogleDriveUrl(url, 'uc'));
  console.log('Thumbnail:', convertGoogleDriveUrl(url, 'thumbnail'));
  console.log('Proxy:', convertGoogleDriveUrl(url, 'proxy'));
  console.log('All URLs:', getGoogleDriveUrls(url));
  console.log('================================');
}