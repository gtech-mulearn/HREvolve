'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProgramData, type ProcessedPrograms, formatDate, isEventSoon, getFallbackImageUrl, getGoogleDriveUrls, CITY_LABELS, getEventLink } from '../utils/sheetsApi';
import { CITY_VALUES, type CityValue } from '@/lib/cities'

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

const PAST_STRIP_LIMIT = 12;

function PastEventImage({ program, className, width, height }: PastEventImageProps) {
  // Get multiple URL formats for Google Drive images
  const imageUrls = program.image_url ? getGoogleDriveUrls(program.image_url) : [getFallbackImageUrl()];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrls[0]);

  const handleImageError = () => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < imageUrls.length) {
      setCurrentUrlIndex(nextIndex);
      setImageSrc(imageUrls[nextIndex]);
    } else {
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
      sizes="250px"
      loading="lazy"
      decoding="async"
      onError={handleImageError}
    />
  );
}

function ProgramCard({ program, isPast = false }: ProgramCardProps) {
  const isComingSoon = !isPast && isEventSoon(program.date);
  
  // Get multiple URL formats for Google Drive images
  const imageUrls = program.image_url ? getGoogleDriveUrls(program.image_url) : [getFallbackImageUrl()];
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrls[0]);

  const handleImageError = () => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < imageUrls.length) {
      setCurrentUrlIndex(nextIndex);
      setImageSrc(imageUrls[nextIndex]);
    } else {
      setImageSrc(getFallbackImageUrl());
    }
  };

  const eventLink = getEventLink(program);
  const hasLinkedIn = !!eventLink;

  return (
    <div
      onClick={() => {
        if (hasLinkedIn) window.open(eventLink, '_blank', 'noopener,noreferrer');
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
            loading="lazy"
            decoding="async"
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
                // Theme colours via CSS variables (not useTheme) so the server-rendered
                // markup matches on hydration in dark mode
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-primary)',
                border: 'none',
                textDecoration: 'none',
                WebkitTextFillColor: 'var(--bg-primary)',
              }}
            >
              <span style={{ color: 'var(--bg-primary)' }}>
                Register
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Events are loaded on the server (app/page.tsx) and passed in, so they're in the
// initial HTML; only the city filter runs client-side.
export default function ProgramsSection({ programs }: { programs: ProcessedPrograms }) {
  const [cityFilter, setCityFilter] = useState<'all' | CityValue>('all');

  const filterByCity = (list: ProgramData[]) =>
    cityFilter === 'all' ? list : list.filter((program) => program.city === cityFilter);

  const filteredUpcoming = filterByCity(programs.upcoming);
  const allFilteredPast = filterByCity(programs.past);
  // The homepage strip only shows the most recent past events (past is sorted
  // newest-first); the full archive lives on /events.
  const filteredPast = allFilteredPast.slice(0, PAST_STRIP_LIMIT);
  const hasMorePast = allFilteredPast.length > PAST_STRIP_LIMIT;

  // Continuous auto-scroll carousel for past events - only worth sliding
  // once there are enough events that they wouldn't all fit statically
  // Animated with the shared CSS marquee (globals.css) - the track holds the list twice,
  // so translating it by -50% loops seamlessly; hover pauses it.
  const isPastSliding = filteredPast.length > 4;
  const pastScrollDuration = filteredPast.length * 15;


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
                  className={`flex gap-3 sm:gap-4 items-center ${isPastSliding ? 'sponsor-marquee-track w-max h-full flex-nowrap' : 'flex-wrap justify-center py-2'}`}
                  style={isPastSliding ? { animationDuration: `${pastScrollDuration}s` } : undefined}
                >
                  {/* Original images */}
                  {filteredPast.map((program, index) => (
                    <div key={`original-${program.title}-${program.date}-${index}`} className="flex-shrink-0">
                      <a
                        href={getEventLink(program) || undefined}
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
                        href={getEventLink(program) || undefined}
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
            {hasMorePast && (
              <div className="text-center mt-6 sm:mt-8">
                <Link href="/events" className="text-sm sm:text-base font-semibold text-primary hover:opacity-70 transition-opacity">
                  See all past events →
                </Link>
              </div>
            )}
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