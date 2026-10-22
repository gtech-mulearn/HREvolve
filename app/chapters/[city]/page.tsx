import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CITIES, getCityBySlug } from '@/lib/cities'
import { ELEVATE_CURRENT } from '@/lib/elevate'
import { getCurrentMonthSponsors } from '@/lib/sponsors'
import { convertGoogleDriveUrl, formatDate } from '@/app/utils/sheetsApi'
import SiteHeader from '@/components/SiteHeader'
import { LinkedinIcon } from '@/components/icons'
import SponsorSlider from '@/app/components/SponsorSlider'
import { getAvatarColor, getUserInitials } from '@/lib/avatar-utils'

export const dynamic = 'force-dynamic'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

// Event dates are stored as UTC midnight of the intended calendar day, so "today"
// is the current IST date expressed as UTC midnight.
function todayAsUtcMidnightIst() {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS)
  return new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()))
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = getCityBySlug(params.city)
  if (!city) return {}
  return {
    title: `${city.label} Chapter | HR Evolve`,
    description: `Meet the HR Evolve ${city.label} core team, see upcoming events and our chapter sponsors.`,
  }
}

export default async function ChapterPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city)
  if (!city) notFound()

  const today = todayAsUtcMidnightIst()

  const [team, upcoming, past, pastElevate, sponsors] = await Promise.all([
    prisma.teamMember.findMany({
      where: { city: city.value },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.event.findMany({
      where: { city: city.value, isPublished: true, date: { gte: today } },
      orderBy: { date: 'asc' },
    }),
    prisma.event.findMany({
      where: { city: city.value, isPublished: true, isFlagship: false, date: { lt: today } },
      orderBy: { date: 'desc' },
      take: 8,
    }),
    // Every past Elevate edition in this city, shown separately so they never get
    // pushed out by the most-recent-8 cap on monthly sessions.
    prisma.event.findMany({
      where: { city: city.value, isPublished: true, isFlagship: true, date: { lt: today } },
      orderBy: { date: 'desc' },
    }),
    getCurrentMonthSponsors(city.value),
  ])

  const hostsElevate = ELEVATE_CURRENT.city === city.value
  const otherCities = CITIES.filter((c) => c.value !== city.value)

  return (
    <div className="main-page min-h-screen bg-primary">
      <SiteHeader />

      {/* Hero */}
      <section
        className="relative min-h-[70vh] flex items-end bg-cover bg-center"
        style={{ backgroundImage: `url("${city.image}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 pt-32">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-white/70 mb-3">
            HR Evolve Chapter
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4">
            {city.label}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8">{city.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#events"
              className="px-5 py-2.5 rounded-full bg-white !text-black font-semibold text-sm transition-transform hover:-translate-y-0.5"
            >
              {upcoming.length > 0 ? `${upcoming.length} upcoming event${upcoming.length === 1 ? '' : 's'}` : 'Our events'}
            </a>
            <a
              href="#team"
              className="px-5 py-2.5 rounded-full border border-white/60 !text-white font-semibold text-sm transition-colors hover:bg-white/10"
            >
              Meet the team
            </a>
            {hostsElevate && (
              <a
                href={ELEVATE_CURRENT.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full font-semibold text-sm bg-gradient-to-r from-amber-400 to-orange-500 !text-black transition-transform hover:-translate-y-0.5"
              >
                ✦ {ELEVATE_CURRENT.name} is here →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Core team */}
      <section id="team" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Core Team</h2>
          <p className="text-secondary mb-10">The people who make HR Evolve {city.label} happen.</p>

          {team.length === 0 ? (
            <p className="text-secondary">Team details coming soon.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="group rounded-2xl border border-custom bg-secondary p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-strong"
                >
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto mb-4 keep-colors"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-semibold"
                      style={{ backgroundColor: getAvatarColor(member.name, null) }}
                    >
                      {getUserInitials(member.name, null)}
                    </div>
                  )}
                  <h3 className="!text-base sm:!text-lg font-bold text-primary">{member.name}</h3>
                  {member.role && <p className="text-sm text-secondary mt-0.5">{member.role}</p>}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="inline-flex items-center justify-center w-9 h-9 mt-3 rounded-full border border-custom text-primary transition-colors hover:bg-primary"
                    >
                      <LinkedinIcon />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Events in {city.label}</h2>
              <p className="text-secondary">Monthly sessions and flagship programs from this chapter.</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-primary hover:opacity-70">
              All programs →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-custom bg-primary p-8 text-center mb-12">
              <p className="text-secondary">No upcoming events right now - check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {upcoming.map((event) => (
                <article key={event.id} className="rounded-2xl border border-custom bg-primary overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-tertiary">
                    {(event.image || event.isFlagship) && (
                      <img
                        src={event.image ? convertGoogleDriveUrl(event.image) : '/elevate_new.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover keep-colors"
                        loading="lazy"
                      />
                    )}
                    {event.isFlagship && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black">
                        ✦ Elevate
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    {event.isFlagship && event.highlight && (
                      <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-amber-600 dark:text-amber-400">
                        {event.highlight}
                      </p>
                    )}
                    <h3 className="!text-lg font-bold text-primary mb-1 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-secondary mb-3">
                      {formatDate(event.date.toISOString().split('T')[0])}
                      {event.time ? ` · ${event.time}` : ''}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                    {event.description && <p className="text-sm text-secondary line-clamp-3 mb-4">{event.description}</p>}
                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto block text-center py-2 rounded-lg font-semibold text-sm bg-accent"
                      >
                        <span style={{ color: 'var(--bg-primary)' }}>Register</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {pastElevate.length > 0 && (
            <div className="mb-12">
              <h3 className="!text-xl font-bold text-primary mb-1">Elevate in {city.label}</h3>
              <p className="text-sm text-secondary mb-5">Our flagship conclave&apos;s editions in this city.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastElevate.map((event) => {
                  const link = event.registrationUrl || event.linkedinUrl
                  const card = (
                    <>
                      <img
                        src={event.image ? convertGoogleDriveUrl(event.image) : '/elevate_new.jpg'}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover keep-colors"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                      <div className="relative z-10 h-full flex flex-col justify-end p-5">
                        <span className="text-3xl font-extrabold !text-white">{event.date.getUTCFullYear()}</span>
                        <span className="text-sm font-semibold !text-white">{event.title}</span>
                        {event.highlight && <span className="text-xs font-bold uppercase tracking-wider !text-amber-300 mt-1">{event.highlight}</span>}
                      </div>
                    </>
                  )
                  const className = 'relative h-52 rounded-2xl overflow-hidden border border-amber-400/40 block'
                  return link ? (
                    <a key={event.id} href={link} target="_blank" rel="noopener noreferrer" className={`${className} transition-transform hover:-translate-y-1`}>
                      {card}
                    </a>
                  ) : (
                    <div key={event.id} className={className}>
                      {card}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <>
              <div className="flex items-end justify-between gap-4 mb-5">
                <h3 className="!text-xl font-bold text-primary">Past events</h3>
                <Link
                  href={`/events?tab=past&city=${city.value}`}
                  className="text-sm font-semibold text-primary hover:opacity-70"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {past.map((event) => {
                  const card = (
                    <>
                      <div className="relative h-28 bg-tertiary">
                        {event.isFlagship && (
                          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black">
                            ✦ Elevate
                          </span>
                        )}
                        {(event.image || event.isFlagship) && (
                          <img
                            src={event.image ? convertGoogleDriveUrl(event.image) : '/elevate_new.jpg'}
                            alt={event.title}
                            className="w-full h-full object-cover keep-colors"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-primary truncate" title={event.title}>
                          {event.title}
                        </p>
                        <p className="text-xs text-secondary">
                          {event.isFlagship && event.highlight ? event.highlight : formatDate(event.date.toISOString().split('T')[0])}
                        </p>
                      </div>
                    </>
                  )
                  const link = event.linkedinUrl || event.registrationUrl
                  return link ? (
                    <a
                      key={event.id}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-custom bg-primary overflow-hidden transition-transform hover:-translate-y-1"
                    >
                      {card}
                    </a>
                  ) : (
                    <div key={event.id} className="rounded-xl border border-custom bg-primary overflow-hidden">
                      {card}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section className="pt-16 sm:pt-20 pb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{city.label} Sponsors</h2>
            <p className="text-secondary">Thank you to the partners backing our {city.label} chapter.</p>
          </div>
          <SponsorSlider sponsors={sponsors} />
        </section>
      )}

      {/* Other chapters */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Other chapters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {otherCities.map((c) => (
              <Link
                key={c.value}
                href={`/chapters/${c.slug}`}
                className="relative h-40 rounded-2xl overflow-hidden bg-cover bg-center group"
                style={{ backgroundImage: `url("${c.image}")` }}
              >
                <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/40" />
                <div className="relative z-10 h-full flex flex-col justify-end p-5">
                  <span className="text-2xl font-bold !text-white">{c.label} →</span>
                  <span className="text-sm !text-white/80">{c.tagline}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-tertiary border-t border-custom py-6 text-center">
        <p className="text-xs sm:text-sm text-muted">
          &copy; {new Date().getFullYear()} HR Evolve India ·{' '}
          <Link href="/" className="hover:opacity-70">
            Home
          </Link>
        </p>
      </footer>
    </div>
  )
}
