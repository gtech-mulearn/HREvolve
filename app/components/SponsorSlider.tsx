'use client'

import { useEffect, useState } from 'react'

interface Sponsor {
  id: string
  name: string | null
  logoUrl: string
  websiteUrl: string | null
}

export default function SponsorSlider() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const res = await fetch('/api/sponsors')
        if (!res.ok) return
        const data = await res.json()
        setSponsors(data.sponsors || [])
      } catch {
        // Silently fail - the slider simply won't render.
      }
    }

    loadSponsors()
  }, [])

  if (sponsors.length === 0) {
    return null
  }

  // A seamless loop needs the track to be exactly two identical halves (so
  // translateX(-50%) lines up perfectly), AND each half needs to be wide enough
  // to cover the viewport on its own - otherwise you see a gap of empty track
  // before the next half arrives, which reads as the loop "restarting". With
  // only a handful of logos, repeat the base sequence until it's comfortably wide.
  const MIN_BASE_LENGTH = 12
  const repeatFactor = Math.max(1, Math.ceil(MIN_BASE_LENGTH / sponsors.length))
  const base = Array.from({ length: repeatFactor }, () => sponsors).flat()
  const track = [...base, ...base]
  const duration = Math.max(base.length * 3.5, 20)

  return (
    <section className="py-6 sm:py-8 mt-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          className="sponsor-marquee-track flex items-center gap-12 sm:gap-20 w-max"
          style={{ animationDuration: `${duration}s` }}
        >
          {track.map((sponsor, i) => {
            const logo = (
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name || 'Sponsor'}
                className="h-9 sm:h-12 w-auto max-w-[140px] sm:max-w-[180px] object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
                loading="lazy"
              />
            )
            return (
              <div key={`${sponsor.id}-${i}`} className="flex-shrink-0">
                {sponsor.websiteUrl ? (
                  <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={sponsor.name || 'Sponsor'}>
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
