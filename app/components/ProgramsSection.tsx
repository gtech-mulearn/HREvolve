'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '../theme-provider';
import { fetchPublishedEvents, ProgramData, formatDate, isEventSoon, getFallbackImageUrl, getGoogleDriveUrls, CITY_LABELS } from '../utils/sheetsApi';

interface ProgramCardProps {
  program: ProgramData;
  isPast?: boolean;
}

interface PastEventImageProps {
  program: ProgramData;
  className?: string;
  width: number;
  height: number;
}

function PastEventImage({ program, className, width, height }: PastEventImageProps) {
  // Get multiple URL formats for Google Drive images
  const imageUrls = program.image_url ? getGoogleDriveUrls(program.image_url) : [getFallbackImageUrl()];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrls[0]);

  const handleImageError = () => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < imageUrls.length) {
      console.log(`Past event image failed, trying fallback ${nextIndex}:`, imageUrls[nextIndex]);
      setCurrentUrlIndex(nextIndex);
      setImageSrc(imageUrls[nextIndex]);
    } else {
      console.log('All past event image URLs failed, using fallback');
      setImageSrc(getFallbackImageUrl());
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={program.title}
      className={className}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
}

function ProgramCard({ program, isPast = false }: ProgramCardProps) {
  const isComingSoon = !isPast && isEventSoon(program.date);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get multiple URL formats for Google Drive images
  const imageUrls = program.image_url ? getGoogleDriveUrls(program.image_url) : [getFallbackImageUrl()];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrls[0]);

  const handleImageError = () => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < imageUrls.length) {
      console.log(`Image failed, trying fallback ${nextIndex}:`, imageUrls[nextIndex]);
      setCurrentUrlIndex(nextIndex);
      setImageSrc(imageUrls[nextIndex]);
    } else {
      console.log('All image URLs failed, using fallback');
      setImageSrc(getFallbackImageUrl());
    }
  };

  const hasLinkedIn = !!program.linkedin_url;

  return (
    <div
      onClick={() => {
        if (hasLinkedIn) window.open(program.linkedin_url, '_blank', 'noopener,noreferrer');
      }}
      className={`bg-primary rounded-xl border border-custom shadow-soft overflow-hidden transition-all duration-300 hover:shadow-strong hover:-translate-y-2 h-full flex flex-col ${hasLinkedIn ? 'cursor-pointer' : ''}`}
    >
      {/* Event Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={program.title}
            fill
            className="object-cover keep-colors transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {isComingSoon && (
          <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full text-xs font-bold dark:bg-white dark:text-black">
            Coming Soon!
          </div>
        )}
        {isPast && (
          <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold dark:bg-gray-400 dark:text-black">
            Completed
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <span className="bg-secondary text-secondary px-3 py-1 rounded-full text-xs font-semibold tracking-wide w-fit">
            {program.category}
          </span>
          <span className="text-sm text-muted font-medium">
            {program.location}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 line-clamp-2 leading-tight">
          {program.title}
        </h3>

        <div className="text-sm text-secondary mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted">📅</span>
            <span className="font-medium">{formatDate(program.date)}</span>
          </div>
          {program.time && (
            <div className="flex items-center gap-2">
              <span className="text-muted">🕒</span>
              <span className="font-medium">{program.time}</span>
            </div>
          )}
        </div>

        <p className="text-secondary text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed flex-grow">
          {program.description}
        </p>

        {/* Action Buttons */}
        {!isPast && program.registration_url && (
          <div className="mt-auto">
            <a
              href={program.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block px-4 py-2.5 rounded-lg text-center text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
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
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramsSection() {
  const [programs, setPrograms] = useState<{ upcoming: ProgramData[]; past: ProgramData[] }>({
    upcoming: [], 
    past: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<'all' | 'TRIVANDRUM' | 'KOCHI'>('all');

  const filterByCity = (list: ProgramData[]) =>
    cityFilter === 'all' ? list : list.filter((program) => program.city === cityFilter);

  const filteredUpcoming = filterByCity(programs.upcoming);
  const filteredPast = filterByCity(programs.past);

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
  }, []);

  // Continuous auto-scroll carousel for past events - only worth sliding
  // once there are enough events that they wouldn't all fit statically
  const isPastSliding = filteredPast.length > 4;

  useEffect(() => {
    if (!isPastSliding) return;

    let animationId: number | null = null;
    let gallery: HTMLElement | null = null;
    let handleMouseEnter: (() => void) | null = null;
    let handleMouseLeave: (() => void) | null = null;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      gallery = document.querySelector('.gallery') as HTMLElement;
      if (!gallery) return;

      let scrollPosition = 0;
      let isPaused = false;
      const scrollSpeed = 0.3; // Reduced speed - pixels per frame
      const imageWidth = 250 + 16; // Image width + gap
      const totalWidth = filteredPast.length * imageWidth;

      function smoothScroll() {
        if (!isPaused) {
          scrollPosition += scrollSpeed;

          // Reset position when we've scrolled past all images
          if (scrollPosition >= totalWidth) {
            scrollPosition = 0;
          }

          gallery!.style.transform = `translateX(-${scrollPosition}px)`;
        }

        animationId = requestAnimationFrame(smoothScroll);
      }

      // Hover event listeners for pause/resume
      handleMouseEnter = () => {
        isPaused = true;
      };

      handleMouseLeave = () => {
        isPaused = false;
      };

      // Add hover listeners to the gallery container
      gallery.addEventListener('mouseenter', handleMouseEnter);
      gallery.addEventListener('mouseleave', handleMouseLeave);

      // Start continuous scroll
      animationId = requestAnimationFrame(smoothScroll);
    }, 500);

    // This is the real cleanup React actually runs - on dependency change
    // (e.g. switching the city filter) and on unmount. Stops the animation
    // frame loop and detaches listeners regardless of whether the initial
    // setTimeout above has fired yet, and resets any transform it applied.
    return () => {
      clearTimeout(timer);
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      if (gallery) {
        gallery.style.transform = '';
        if (handleMouseEnter) gallery.removeEventListener('mouseenter', handleMouseEnter);
        if (handleMouseLeave) gallery.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isPastSliding, filteredPast.length]);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-primary transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Section Header Skeleton */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="h-8 sm:h-10 bg-primary/10 rounded-lg w-64 sm:w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-5 sm:h-6 bg-primary/10 rounded-lg w-full max-w-2xl mx-auto animate-pulse"></div>
          </div>

          {/* Upcoming Events Skeleton */}
          <div className="mb-16">
            <div className="h-8 bg-primary/10 rounded-lg w-48 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-primary/5 rounded-xl border border-custom/20 p-4 sm:p-6 animate-pulse">
                  <div className="h-40 sm:h-48 bg-primary/10 rounded-lg mb-4"></div>
                  <div className="h-5 sm:h-6 bg-primary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary/10 rounded w-1/2 mb-4"></div>
                  <div className="h-3 sm:h-4 bg-primary/10 rounded w-full mb-2"></div>
                  <div className="h-3 sm:h-4 bg-primary/10 rounded w-2/3 mb-4"></div>
                  <div className="h-9 sm:h-10 bg-primary/10 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 text-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Loading upcoming events...</span>
              </div>
            </div>
          </div>

          {/* Past Events Skeleton */}
          <div>
            <div className="h-8 bg-primary/10 rounded-lg w-48 mb-8 animate-pulse"></div>
            <div className="relative overflow-hidden bg-primary/5 rounded-xl p-8">
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-40 bg-primary/10 rounded-lg animate-pulse"></div>
                ))}
              </div>
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 text-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Loading past events...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-primary transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              HR Programs & Events
            </h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">
              Join our community events, workshops, and conferences designed to elevate HR professionals
            </p>
          </div>
          
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
            <p className="text-sm text-red-500 dark:text-red-400 mt-4">
              If the problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="programs" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-primary transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            HR Programs & Events
          </h2>
          <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto px-4">
            Join our community events, workshops, and conferences designed to elevate HR professionals
          </p>
        </div>

        {/* City Filter */}
        {(programs.upcoming.length > 0 || programs.past.length > 0) && (
          <div className="flex justify-center gap-2 mb-8 sm:mb-10 px-4">
            {(['all', 'TRIVANDRUM', 'KOCHI'] as const).map((c) => (
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
        )}

        {/* Upcoming Events Section */}
        {filteredUpcoming.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center">
              Upcoming Events
            </h3>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {filteredUpcoming.slice(0, 3).map((program, index) => (
                <div key={`${program.title}-${program.date}-${index}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)]">
                  <ProgramCard
                    program={program}
                    isPast={false}
                  />
                </div>
              ))}
            </div>
            {filteredUpcoming.length > 3 && (
              <div className="text-center mt-6 sm:mt-8">
                <a 
                  href="/events"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-primary text-primary border-2 border-custom rounded-lg font-semibold transition-all duration-300 hover:bg-secondary hover:scale-105 shadow-custom text-sm sm:text-base"
                >
                  <span>View All Upcoming Events</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Past Events Section - Carousel */}
        {filteredPast.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center">
              Past Events
            </h3>
            <div className={`relative mt-4 sm:mt-6 flex items-center ${isPastSliding ? 'h-56 sm:h-64 md:h-80 lg:h-[320px]' : ''}`}>
              <div className={`w-full flex items-center px-2 sm:px-0 ${isPastSliding ? 'h-full overflow-hidden' : 'justify-center'}`}>
                <div
                  className={`gallery flex gap-3 sm:gap-4 items-center ${isPastSliding ? 'h-full flex-nowrap' : 'flex-wrap justify-center py-2'}`}
                  style={{ transition: 'none' }}
                >
                  {/* Original images */}
                  {filteredPast.map((program, index) => (
                    <div key={`original-${program.title}-${program.date}-${index}`} className="flex-shrink-0">
                      <a
                        href={program.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <PastEventImage
                          program={program}
                          className="w-[160px] h-[160px] xs:w-[180px] xs:h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] object-cover rounded-lg sm:rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-75 keep-colors cursor-pointer shadow-sm"
                          width={250}
                          height={250}
                        />
                      </a>
                      <div className="mt-2 text-center max-w-[160px] xs:max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px]">
                        <h4 className="text-xs sm:text-sm font-semibold text-text-primary truncate" title={program.title}>
                          {program.title}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {formatDate(program.date)} • {program.city ? CITY_LABELS[program.city] : program.location}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Duplicate images for seamless loop - only needed when actually sliding */}
                  {isPastSliding && filteredPast.map((program, index) => (
                    <div key={`duplicate-${program.title}-${program.date}-${index}`} className="flex-shrink-0">
                      <a
                        href={program.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <PastEventImage
                          program={program}
                          className="w-[160px] h-[160px] xs:w-[180px] xs:h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] object-cover rounded-lg sm:rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-75 keep-colors cursor-pointer shadow-sm"
                          width={250}
                          height={250}
                        />
                      </a>
                      <div className="mt-2 text-center max-w-[160px] xs:max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px]">
                        <h4 className="text-xs sm:text-sm font-semibold text-text-primary truncate" title={program.title}>
                          {program.title}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {formatDate(program.date)} • {program.city ? CITY_LABELS[program.city] : program.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Events Message */}
        {filteredUpcoming.length === 0 && filteredPast.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Events Found
            </h3>
            <p className="text-text-secondary">
              {cityFilter === 'all'
                ? 'Events will appear here once they are published.'
                : `No events in ${CITY_LABELS[cityFilter]} right now.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}