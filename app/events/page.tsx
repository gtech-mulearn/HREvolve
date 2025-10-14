'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '../theme-toggle'
import { useTheme } from '../theme-provider'
import { fetchProgramsFromSheet, ProgramData, formatDate, isEventSoon, getFallbackImageUrl, getGoogleDriveUrls } from '../utils/sheetsApi'

interface ProgramCardProps {
  program: ProgramData;
  isPast?: boolean;
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

  return (
    <div className="rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-strong hover:-translate-y-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)', borderWidth: '1px' }}>
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
          <span className="line-clamp-1">{program.location}</span>
        </div>

        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {program.description}
        </p>

        <div className="flex gap-2">
          {program.linkedin_url && (
            <a
              href={program.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 border hover:opacity-80"
              style={{ 
                color: 'var(--text-primary)', 
                borderColor: 'var(--text-primary)' 
              }}
            >
              View on LinkedIn
            </a>
          )}
          
          {!isPast && program.registration_url && (
            <a
              href={program.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-4 rounded-lg font-bold transition-all duration-200"
              style={{
                backgroundColor: isDark ? '#ffffff' : '#000000',
                color: isDark ? '#000000' : '#ffffff',
                border: 'none',
                textDecoration: 'none',
                WebkitTextFillColor: isDark ? '#000000' : '#ffffff',
                display: 'block'
              }}
            >
              <span style={{ color: isDark ? '#000000' : '#ffffff' }}>
                Register Now
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Script for mobile navigation */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Mobile Navigation Toggle
          window.toggleMenu = function() {
            const mobileNav = document.querySelector('.mobile-nav');
            const hamburger = document.querySelector('.hamburger-menu');
            
            if (mobileNav.style.right === '0px' || mobileNav.style.right === '0%') {
              mobileNav.style.right = '-100%';
              hamburger.style.transform = 'rotate(0deg)';
            } else {
              mobileNav.style.right = '0px';
              hamburger.style.transform = 'rotate(90deg)';
            }
          };

          // Header scroll effect
          window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            
            if (window.scrollY > 50) {
              header.classList.add('header-scrolled');
            } else {
              header.classList.remove('header-scrolled');
            }
          });

          // Close mobile menu on link click
          document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', function() {
              const mobileNav = document.querySelector('.mobile-nav');
              const hamburger = document.querySelector('.hamburger-menu');
              mobileNav.style.right = '-100%';
              hamburger.style.transform = 'rotate(0deg)';
            });
          });
        `
      }} />
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

  const loadPrograms = async (forceRefresh = false) => {
    try {
      console.log('Starting to load programs...', { forceRefresh });
      setLoading(true);
      setError(null);
      
      const data = await fetchProgramsFromSheet(forceRefresh);
      console.log('Programs loaded successfully:', data);
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
    console.log('EventsPage component mounted');
    
    // Check if page was hard refreshed (F5 or Ctrl+F5)
    const wasHardRefresh = typeof window !== 'undefined' && 
      window.performance && 
      window.performance.navigation && 
      window.performance.navigation.type === 1; // TYPE_RELOAD
    
    if (wasHardRefresh) {
      console.log('Hard refresh detected, forcing cache bypass');
      loadPrograms(true); // Force refresh on F5
    } else {
      loadPrograms();
    }

    // Mobile navigation functionality
    const mobileNav = document.querySelector(".mobile-nav")
    let isMenuOpen = false

    // @ts-ignore
    window.toggleMenu = function() {
      isMenuOpen = !isMenuOpen
      if (isMenuOpen && mobileNav) {
        // @ts-ignore
        if (window.gsap) {
          // @ts-ignore
          window.gsap.to(mobileNav, { right: "0%", duration: 0.1 })
        }
      } else if (mobileNav) {
        // @ts-ignore
        if (window.gsap) {
          // @ts-ignore
          window.gsap.to(mobileNav, { right: "-100%", duration: 0.1 })
        }
      }
    }

    // Close the mobile nav when a link is clicked
    document.querySelectorAll(".mobile-nav ul li a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileNav) {
          // @ts-ignore
          if (window.gsap) {
            // @ts-ignore
            window.gsap.to(mobileNav, { right: "-100%", duration: 0.1 })
          }
        }
        isMenuOpen = false
      })
    })

    // Header scroll effect
    const header = document.querySelector('header')
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header?.classList.add('header-scrolled')
      } else {
        header?.classList.remove('header-scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
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
      {/* Header section */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-transparent transition-all duration-300 ease-out">
        <div className="container mx-auto px-6 py-5 md:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
                alt="HR Evolve Logo"
                className="h-12 w-auto keep-colors"
                width={50}
                height={50}
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-10">
              <Link href="/#about" className="nav-link no-underline font-semibold text-base transition-all duration-300 hover:opacity-80">
                About
              </Link>
              <Link href="/#programs" className="nav-link no-underline font-semibold text-base transition-all duration-300 hover:opacity-80">
                Programs
              </Link>
              <Link href="/#contact" className="nav-link no-underline font-semibold text-base transition-all duration-300 hover:opacity-80">
                Contact
              </Link>
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </nav>
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <svg
                className="ml-4 hamburger-menu cursor-pointer transition-all duration-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  // @ts-ignore
                  if (typeof window !== 'undefined' && window.toggleMenu) {
                    // @ts-ignore
                    window.toggleMenu()
                  }
                }}
              >
                <rect x="2" y="5" width="20" height="3" fill="currentColor" />
                <rect x="2" y="11" width="20" height="3" fill="currentColor" />
                <rect x="2" y="17" width="20" height="3" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="mobile-nav fixed top-0 right-[-100%] w-64 h-full z-[1001] p-6 shadow-custom transition-all duration-100 ease-out" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <svg
          className="text-muted float-right text-[28px] font-bold transition-colors duration-300 ease-out hover:text-primary focus:text-primary cursor-pointer"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.toggleMenu) {
              // @ts-ignore
              window.toggleMenu()
            }
          }}
        >
          <line
            x1="4.5"
            y1="4.5"
            x2="19.5"
            y2="19.5"
            stroke="currentColor"
            strokeWidth="4"
          />
          <line
            x1="4.5"
            y1="19.5"
            x2="19.5"
            y2="4.5"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
        <ul className="list-none p-0 mt-16">
          <li className="mb-4">
            <Link href="/#about" className="block no-underline py-3 px-4 rounded transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              About
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/#programs" className="block no-underline py-3 px-4 rounded transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              Programs
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/#contact" className="block no-underline py-3 px-4 rounded transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              Contact
            </Link>
          </li>
        </ul>
        <div className="p-5 border-t" style={{ borderColor: 'var(--border-custom)' }}>
          <ThemeToggle />
        </div>
      </nav>
      
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
            All Events
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Browse all our upcoming and past HR events, workshops, and conferences
          </p>
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
              Upcoming Events ({programs.upcoming.length})
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
              Past Events ({programs.past.length})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {activeTab === 'upcoming' && (
          <div>
            {programs.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {programs.upcoming.map((program, index) => (
                  <ProgramCard 
                    key={`${program.title}-${program.date}-${index}`}
                    program={program} 
                    isPast={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-4">📅</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Upcoming Events</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Check back soon for new events!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div>
            {programs.past.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {programs.past.map((program, index) => (
                  <ProgramCard 
                    key={`${program.title}-${program.date}-${index}`}
                    program={program} 
                    isPast={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Past Events</h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Past events will appear here once we have some!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}