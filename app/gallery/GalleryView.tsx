'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SiteHeader from '@/components/SiteHeader'

export interface GalleryImage {
  id: string
  url: string
  caption: string | null
  createdAt: string
}

// Client half of /gallery (masonry grid + lightbox). Images are loaded on the server
// (app/gallery/page.tsx) and passed in.
export default function GalleryView({ images }: { images: GalleryImage[] }) {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)

  // Fade the lightbox in after it mounts (CSS transition instead of framer-motion)
  const [lightboxVisible, setLightboxVisible] = useState(false)
  useEffect(() => {
    if (!lightboxImage) {
      setLightboxVisible(false)
      return
    }
    const frame = requestAnimationFrame(() => setLightboxVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [lightboxImage])

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
      <SiteHeader />

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

        {images.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Photos Yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back soon for photos from our events!</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setLightboxImage(image)}
                className="relative w-full mb-4 block break-inside-avoid rounded-xl overflow-hidden group shadow-soft hover:shadow-strong transition-shadow duration-300"
              >
                <img src={image.url} alt={image.caption || ''} className="w-full h-auto block transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
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
      {lightboxImage && (
        <div
          className={`fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 transition-opacity duration-200 ${lightboxVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.caption || ''}
            className={`max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 ${lightboxVisible ? 'scale-100' : 'scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImage.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 text-center">
              {lightboxImage.caption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
