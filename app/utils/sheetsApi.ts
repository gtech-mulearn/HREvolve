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

// Simple CSV parser function
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
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

    // Parse CSV data
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      console.warn('Only header row found or no data');
      return { upcoming: [], past: [] };
    }

    // Skip header row and parse data
    const programs: ProgramData[] = lines.slice(1).map((line, index) => {
      // Simple CSV parsing (handling quoted values)
      const row = parseCSVLine(line);
      console.log(`Row ${index + 2}:`, row);
      
      return {
        title: row[0] || '',
        date: row[1] || '',
        time: row[2] || '',
        description: row[3] || '',
        image_url: row[4] || '',
        linkedin_url: row[5] || '',
        location: row[6] || '',
        category: row[7] || '',
        status: row[8] || '',
        registration_url: row[9] || ''
      };
    }).filter(program => program.title && program.date); // Filter out empty rows

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