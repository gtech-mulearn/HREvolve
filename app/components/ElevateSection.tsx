import Link from 'next/link'
import { ELEVATE_CURRENT } from '@/lib/elevate'
import { CITY_LABELS } from '@/lib/cities'
import { getEventLink, type ProgramData, type ProcessedPrograms } from '../utils/sheetsApi'

interface Edition {
  key: string
  year: string
  city: string
  title: string
  line: string
  link: string
  isNext: boolean
}

// Builds the Elevate timeline from published flagship events, adding the current
// edition (lib/elevate.ts) as "Next up" if it isn't in the events list yet.
function buildEditions(upcoming: ProgramData[], past: ProgramData[]): Edition[] {
  const toEdition = (p: ProgramData, isNext: boolean): Edition => ({
    key: `${p.title}-${p.date}`,
    year: p.date.slice(0, 4),
    city: CITY_LABELS[p.city] || p.location,
    title: p.title,
    line: p.highlight || (isNext ? 'Coming up' : ''),
    link: getEventLink(p),
    isNext,
  })

  const editions = [
    ...past.filter((p) => p.is_flagship).reverse().map((p) => toEdition(p, false)),
    ...upcoming.filter((p) => p.is_flagship).map((p) => toEdition(p, true)),
  ]

  const currentListed = upcoming.some((p) => p.is_flagship && p.city === ELEVATE_CURRENT.city)
  if (!currentListed) {
    editions.push({
      key: 'current',
      year: `20${ELEVATE_CURRENT.name.match(/'(\d{2})/)?.[1] ?? ''}`,
      city: CITY_LABELS[ELEVATE_CURRENT.city],
      title: `${ELEVATE_CURRENT.name} · ${ELEVATE_CURRENT.edition}`,
      line: `Next up · ${ELEVATE_CURRENT.status}`,
      link: ELEVATE_CURRENT.url,
      isNext: true,
    })
  }

  return editions
}

export default function ElevateSection({ programs }: { programs: ProcessedPrograms }) {
  const editions = buildEditions(programs.upcoming, programs.past)

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-primary transition-colors duration-300">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("/elevate_new.jpg")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 mb-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-amber-400 to-orange-500 text-black">
              Our Flagship
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold !text-white mb-4">Elevate</h2>
            <p className="text-lg sm:text-xl font-semibold !text-white mb-3">One day a year, the HR conversation gets bigger.</p>
            <p className="text-base sm:text-lg !text-white/75 mb-8">
              Keynotes from people who&apos;ve led the change, honest panels, and a room full of HR leaders who face
              the same challenges you do. Elevate began in Trivandrum in 2024, made its first-ever stop in Kochi in 2026,
              and keeps growing every edition.
            </p>
          </div>

          {editions.length > 0 && (
            <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 list-none p-0">
              {editions.map((edition) => {
                const content = (
                  <>
                    {edition.isNext && (
                      <span aria-hidden="true" className="elevate-sparkle absolute top-2 right-3 text-lg !text-amber-300">
                        ✦
                      </span>
                    )}
                    <span className={`block text-3xl sm:text-4xl font-extrabold ${edition.isNext ? 'bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent' : '!text-white'}`}>
                      {edition.year}
                    </span>
                    <span className="block text-sm font-semibold !text-white mt-1">{edition.city}</span>
                    {edition.line && <span className="block text-xs !text-white/70 mt-1">{edition.line}</span>}
                  </>
                )
                const className = `relative block h-full rounded-2xl p-4 sm:p-5 border transition-colors ${
                  edition.isNext ? 'border-amber-400/70 bg-amber-400/10' : 'border-white/15 bg-white/5'
                }`
                return (
                  <li key={edition.key}>
                    {edition.link ? (
                      <a href={edition.link} target="_blank" rel="noopener noreferrer" title={edition.title} className={`${className} hover:bg-white/10`}>
                        {content}
                      </a>
                    ) : (
                      <div title={edition.title} className={className}>
                        {content}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href={ELEVATE_CURRENT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 !text-black transition-transform hover:-translate-y-0.5"
            >
              Explore {ELEVATE_CURRENT.name} →
            </a>
            <Link
              href="/events?type=flagship"
              className="px-6 py-3 rounded-xl font-semibold border border-white/50 !text-white transition-colors hover:bg-white/10"
            >
              All editions
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
