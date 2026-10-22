'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { useTheme } from '../theme-provider'
import { fetchPublishedEvents, ProgramData, formatDate, isEventSoon, getFallbackImageUrl, getGoogleDriveUrls, CITY_LABELS, getEventLink } from '../utils/sheetsApi'
import { CITY_VALUES, type CityValue } from '@/lib/cities'

interface ProgramCardProps {
  program: ProgramData;
  isPast?: boolean;
}

function ProgramCard({ program, isPast = false }: ProgramCardProps) {
  const isComingSoon = !isPast && isEventSoon(program.date);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get multiple URL formats for Google Drive images
  // Flagship events without their own image fall back to the Elevate artwork
  const fallbackImage = program.is_flagship ? '/elevate_new.jpg' : getFallbackImageUrl();
  const imageUrls = program.image_url ? getGoogleDriveUrls(program.image_url) : [fallbackImage];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrls[0]);

  const handleImageError = () => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < imageUrls.length) {
      setCurrentUrlIndex(nextIndex);
      setImageSrc(imageUrls[nextIndex]);
    } else {
      setImageSrc(fallbackImage);
    }
  };

  const eventLink = getEventLink(program);
  const hasLinkedIn = !!eventLink;

  return (
    <div
      onClick={() => {
        if (hasLinkedIn) window.open(eventLink, '_blank', 'noopener,noreferrer');
      }}
      className={`rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-strong hover:-translate-y-2 ${hasLinkedIn ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)', borderWidth: '1px' }}
    >
      {/* Event Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={program.title}
            fill
            className="object-cover keep-colors transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {program.is_flagship && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow">
            ✦ Elevate
          </div>
        )}
        {isComingSoon && (
          <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full text-xs font-bold dark:bg-white dark:text-black">
            Coming Soon
          </div>
        )}
        {isPast && (
          <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            Completed
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6">
        {program.is_flagship && program.highlight && (
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-600 dark:text-amber-400">
            {program.highlight}
          </p>
        )}
        <h4 className="text-xl font-bold mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {program.title}
        </h4>
        
        <div className="flex items-center text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{formatDate(program.date)} • {program.time}</span>
        </div>

        <div className="flex items-center text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="line-clamp-1">
            {[program.location, program.city ? CITY_LABELS[program.city] : null].filter(Boolean).join(', ')}
          </span>
        </div>

        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {program.description}
        </p>

        {isPast && program.is_flagship && eventLink && (
          <span className="inline-flex items-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Visit the event site →
          </span>
        )}

        {!isPast && program.registration_url && (
          <a
            href={program.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block text-center py-2 px-4 rounded-lg font-bold transition-all duration-200"
            style={{
              backgroundColor: isDark ? '#ffffff' : '#000000',
              color: isDark ? '#000000' : '#ffffff',
              border: 'none',
              textDecoration: 'none',
              WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
            }}
          >
            <span style={{ color: isDark ? '#000000' : '#ffffff' }}>
              Register
            </span>
          </a>
        )}
      </div>

    </div>
  )
}

export default function EventsPage() {
  const [programs, setPrograms] = useState<{ upcoming: ProgramData[]; past: ProgramData[] }>({ 
    upcoming: [], 
    past: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cityFilter, setCityFilter] = useState<'all' | CityValue>('all');
  const [programType, setProgramType] = useState<'monthly' | 'flagship'>('monthly');

  const filterByCity = (list: ProgramData[]) =>
    cityFilter === 'all' ? list : list.filter((program) => program.city === cityFilter);

  const typeFiltered = {
    upcoming: programs.upcoming.filter((program) => program.is_flagship === (programType === 'flagship')),
    past: programs.past.filter((program) => program.is_flagship === (programType === 'flagship')),
  };

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPublishedEvents();
      setPrograms(data);
      setError(null);
    } catch (err) {
      console.error('Error loading programs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load programs. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();

    // Deep link from the homepage Elevate section: /events?type=flagship
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'flagship') {
      setProgramType('flagship');
    }
    // Deep link from a chapter page's "View all": /events?tab=past&city=TRIVANDRUM
    if (params.get('tab') === 'past') {
      setActiveTab('past');
    }
    const cityParam = params.get('city');
    if (cityParam && Object.keys(CITY_LABELS).includes(cityParam)) {
      setCityFilter(cityParam as CityValue);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary transition-colors duration-300">
        {/* Header Spacer */}
        <div className="h-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-secondary">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary transition-colors duration-300">
        {/* Header Spacer */}
        <div className="h-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
              Unable to Load Events
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SiteHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <Link 
            href="/"
            className="inline-flex items-center transition-colors duration-200 mb-4 hover:opacity-80 text-sm sm:text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {programType === 'flagship' ? 'Elevate' : 'Monthly Programs'}
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            {programType === 'flagship'
              ? "HR Evolve's flagship conclave. It started in Trivandrum in 2024, reached Kochi for the first time in 2026, and every edition brings the region's people leaders into one room for a day of bold ideas and real conversations."
              : 'Browse all our upcoming and past HR events, workshops, and conferences'}
          </p>
        </div>

        {/* Program Switch */}
        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="rounded-xl p-1.5 flex flex-col sm:flex-row w-full sm:w-auto gap-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-custom)' }}>
            <button
              onClick={() => setProgramType('monthly')}
              className="px-5 sm:px-7 py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base"
              style={
                programType === 'monthly'
                  ? { backgroundColor: 'var(--accent-color)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span style={programType === 'monthly' ? { color: 'var(--bg-primary)' } : undefined}>
                Monthly Programs
              </span>
            </button>
            <button
              onClick={() => setProgramType('flagship')}
              className="px-5 sm:px-7 py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base"
              style={
                programType === 'flagship'
                  ? { backgroundColor: 'var(--accent-color)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span style={programType === 'flagship' ? { color: 'var(--bg-primary)' } : undefined}>
                Flagship · Elevate
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="rounded-lg p-1 flex flex-col sm:flex-row w-full sm:w-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 sm:px-6 py-3 sm:py-2 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'upcoming' 
                  ? 'shadow-sm' 
                  : 'hover:opacity-80'
              }`}
              style={activeTab === 'upcoming' 
                ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              Upcoming Events ({filterByCity(typeFiltered.upcoming).length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 sm:px-6 py-3 sm:py-2 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'past'
                  ? 'shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={activeTab === 'past'
                ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              Past Events ({filterByCity(typeFiltered.past).length})
            </button>
          </div>
        </div>

        {/* City Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10 px-4">
          {(['all', ...CITY_VALUES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200"
              style={
                cityFilter === c
                  ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }
                  : { color: 'var(--text-secondary)', borderColor: 'var(--border-custom)' }
              }
            >
              <span style={cityFilter === c ? { color: 'var(--bg-primary)' } : undefined}>
                {c === 'all' ? 'All Cities' : CITY_LABELS[c]}
              </span>
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {activeTab === 'upcoming' && (
          <div>
            {filterByCity(typeFiltered.upcoming).length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                {filterByCity(typeFiltered.upcoming).map((program, index) => (
                  <div key={`${program.title}-${program.date}-${index}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)]">
                    <ProgramCard
                      program={program}
                      isPast={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-4">📅</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Upcoming Events</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {cityFilter === 'all' ? 'Check back soon for new events!' : `No upcoming events in ${CITY_LABELS[cityFilter]} right now.`}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div>
            {filterByCity(typeFiltered.past).length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                {filterByCity(typeFiltered.past).map((program, index) => (
                  <div key={`${program.title}-${program.date}-${index}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)]">
                    <ProgramCard
                      program={program}
                      isPast={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Past Events</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {cityFilter === 'all' ? 'Past events will appear here once we have some!' : `No past events in ${CITY_LABELS[cityFilter]}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}