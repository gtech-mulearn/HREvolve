import { ELEVATE_CURRENT } from '@/lib/elevate'
import { CITY_LABELS } from '@/lib/cities'

// Sparkles scattered over the card: [top, left, size, delay]
const SPARKLES: [string, string, string, string][] = [
  ['8%', '6%', 'text-lg', '0s'],
  ['18%', '88%', 'text-2xl', '0.6s'],
  ['70%', '92%', 'text-base', '1.2s'],
  ['82%', '4%', 'text-xl', '1.8s'],
  ['40%', '52%', 'text-sm', '0.9s'],
  ['12%', '62%', 'text-xs', '1.5s'],
]

// Featured "upcoming" card for the current Elevate edition while it has no dated
// event in the CMS (see lib/elevate.ts). Server-safe: no hooks.
export default function ElevateUpcomingCard() {
  return (
    <a
      href={ELEVATE_CURRENT.url}
      target="_blank"
      rel="noopener noreferrer"
      className="elevate-glow group block rounded-3xl p-[2px] shadow-strong transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-black px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-300 group-hover:opacity-40"
          style={{ backgroundImage: 'url("/elevate_new.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        {SPARKLES.map(([top, left, size, delay]) => (
          <span
            key={`${top}-${left}`}
            aria-hidden="true"
            className={`elevate-sparkle absolute ${size} !text-amber-300 pointer-events-none`}
            style={{ top, left, animationDelay: delay }}
          >
            ✦
          </span>
        ))}

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.18em] bg-gradient-to-r from-amber-400 to-orange-500 text-black">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Upcoming Flagship
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-amber-300/50 !text-amber-200">
                {ELEVATE_CURRENT.status}
              </span>
            </div>
            <h3 className="!text-3xl sm:!text-4xl lg:!text-5xl font-extrabold !text-white leading-tight mb-2">
              {ELEVATE_CURRENT.name}{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                {ELEVATE_CURRENT.edition}
              </span>
            </h3>
            <p className="text-lg sm:text-xl font-semibold !text-white mb-1">{ELEVATE_CURRENT.theme}</p>
            <p className="text-sm sm:text-base !text-white/70 mb-5">{ELEVATE_CURRENT.tagline}</p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm !text-white/85">
              <span>📅 {ELEVATE_CURRENT.dateLabel}</span>
              <span>
                📍 {ELEVATE_CURRENT.venue}, {CITY_LABELS[ELEVATE_CURRENT.city]}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-white !text-black whitespace-nowrap self-start lg:self-auto transition-transform duration-300 group-hover:translate-x-1">
            Explore {ELEVATE_CURRENT.name} →
          </span>
        </div>
      </div>
    </a>
  )
}
