'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ThemeToggle from '../theme-toggle'

interface GalleryImage {
  id: string
  url: string
  caption: string | null
  createdAt: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/gallery')
        if (!res.ok) throw new Error('Failed to load gallery')
        const data = await res.json()
        setImages(data.images || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadImages()

    // @ts-ignore
    window.toggleMenu = function () {
      const mobileNav = document.querySelector('.mobile-nav')
      // @ts-ignore
      if (mobileNav && window.gsap) {
        const isOpen = (mobileNav as HTMLElement).style.right === '0%' || (mobileNav as HTMLElement).style.right === '0px'
        // @ts-ignore
        window.gsap.to(mobileNav, { right: isOpen ? '-100%' : '0%', duration: 0.1 })
      }
    }

    document.querySelectorAll('.mobile-nav ul li a').forEach((link) => {
      link.addEventListener('click', () => {
        const mobileNav = document.querySelector('.mobile-nav')
        // @ts-ignore
        if (mobileNav && window.gsap) {
          // @ts-ignore
          window.gsap.to(mobileNav, { right: '-100%', duration: 0.1 })
        }
      })
    })

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
  }, [])

  useEffect(() => {
    if (!lightboxImage) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxImage])

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
              <Link href="/gallery" className="nav-link no-underline font-semibold text-base transition-all duration-300 hover:opacity-80">
                Gallery
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
          <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="4" />
          <line x1="4.5" y1="19.5" x2="19.5" y2="4.5" stroke="currentColor" strokeWidth="4" />
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
            <Link href="/gallery" className="block no-underline py-3 px-4 rounded transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              Gallery
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-28 sm:py-32">
        {/* Page Header */}
        <div className="text-center mb-10 sm:mb-14">
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
            Gallery
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            Moments from our events, workshops, and community gatherings
          </p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--text-primary)' }} />
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading gallery...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Unable to Load Gallery</h3>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Photos Yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back soon for photos from our events!</p>
          </div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setLightboxImage(image)}
                className="relative w-full mb-4 block break-inside-avoid rounded-xl overflow-hidden group shadow-soft hover:shadow-strong transition-shadow duration-300"
              >
                <img src={image.url} alt={image.caption || ''} className="w-full h-auto block transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {image.caption && (
                    <p className="text-white text-sm font-medium text-left">{image.caption}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={lightboxImage.url}
              alt={lightboxImage.caption || ''}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {lightboxImage.caption && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 text-center">
                {lightboxImage.caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
