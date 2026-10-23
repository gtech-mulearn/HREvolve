import Image from 'next/image'
import ProgramsSection from './components/ProgramsSection'
import SponsorSlider from './components/SponsorSlider'
import ElevateSection from './components/ElevateSection'
import HomeMembershipCards from './components/HomeMembershipCards'
import HeroSlideshow from './components/HeroSlideshow'
import SiteHeader from '@/components/SiteHeader'
import { EnvelopeIcon, PhoneIcon, MapMarkerIcon, LinkedinIcon, InstagramIcon } from '@/components/icons'
import Link from 'next/link'
import { CITIES } from '@/lib/cities'
import { ELEVATE_CURRENT } from '@/lib/elevate'
import { getPublishedPrograms } from '@/lib/public-data'
import { getCurrentMonthSponsors } from '@/lib/sponsors'
import type { ProcessedPrograms } from './utils/sheetsApi'

// Statically generated and refreshed at most once a minute; admin changes also
// trigger an immediate refresh via revalidatePublicPages().
export const revalidate = 60

async function loadHomeData() {
  try {
    const [programs, sponsors] = await Promise.all([getPublishedPrograms(), getCurrentMonthSponsors(null)])
    return { programs, sponsors }
  } catch (error) {
    // Don't fail the build/render if the DB is unreachable; sections show their empty states
    console.error('Failed to load homepage data:', error)
    const programs: ProcessedPrograms = { upcoming: [], past: [] }
    return { programs, sponsors: [] }
  }
}

export default async function Home() {
  const { programs, sponsors } = await loadHomeData()

  return (
    <div className="main-page">
      <SiteHeader />

      {/* Hero section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
        <HeroSlideshow images={['/s1.jpg', '/s2.jpg', '/s3.jpg', '/s4.jpg']} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <a
            href={ELEVATE_CURRENT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 sm:mb-8 rounded-full border border-amber-300/60 bg-black/30 backdrop-blur-sm text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] !text-amber-200 transition-colors hover:bg-black/50"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {ELEVATE_CURRENT.name} · {ELEVATE_CURRENT.edition}
          </a>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 text-white drop-shadow-2xl leading-[1.05] tracking-tight">
            The future of work
            <br />
            takes the stage in{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Trivandrum
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 text-white/90 drop-shadow-lg font-medium leading-relaxed max-w-3xl mx-auto px-2">
            Bold ideas. Real stories. The people leaders shaping Kerala&apos;s workplaces - all in one room.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href={ELEVATE_CURRENT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 !text-black no-underline shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-orange-500/40"
            >
              Get your pass for {ELEVATE_CURRENT.name} →
            </a>
            <a
              href="#about"
              className="inline-block px-7 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold border border-white/60 !text-white no-underline transition-colors duration-300 hover:bg-white/10"
            >
              Discover HR Evolve
            </a>
          </div>
        </div>
      </section>

      <SponsorSlider sponsors={sponsors} />

      {/* About Section */}
      <section id="about" className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-primary text-primary transition-colors duration-300">
        <div className="container-width">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-primary text-balance">About HR Evolve</h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-secondary max-w-4xl mx-auto text-justify hyphens-auto">
            Welcome to <strong>HR Evolve</strong>, a vibrant community for HR
            professionals and enthusiasts dedicated to reshaping the future of
            human resources. Our platform encourages collaboration and open
            dialogue, allowing members to exchange ideas and insights on the
            latest industry trends. With a focus on innovation and continuous
            learning, we empower our members to stay ahead in a rapidly changing
            landscape.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-secondary max-w-4xl mx-auto text-justify hyphens-auto">
            Every <strong>third Thursday</strong>, we host interactive, expert-led
            sessions that tackle evolving HR challenges and opportunities. From
            leadership strategies to emerging technologies, we explore key topics
            that drive the profession forward. Whether you&apos;re looking to expand
            your network, develop new skills, or stay informed about industry
            changes, <strong>HR Evolve</strong> is here to help you grow and
            succeed. If you want to stay on top of the current HR tech trends and
            understand what companies in the region are doing for their people, HR
            EVOLVE is the place to be! Learn from industry thought leaders that
            are revolutionizing work places, meet up with C level peers with
            similar challenges, foster deeper connections, find the right
            technology partner, forge lifelong partnerships, hear regional case
            studies, and gain practical takeaways and actionable applications of
            how HR technology can support better workplaces!
          </p>
        </div>
      </section>

      {/* Chapters */}
      <section id="chapters" className="py-16 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-secondary transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-primary">Our Chapters</h2>
          <p className="text-center text-secondary max-w-2xl mx-auto mb-10 sm:mb-12">
            HR Evolve runs across three cities in Kerala. Meet each chapter&apos;s core team, events and sponsors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {CITIES.map((city) => (
              <Link
                key={city.value}
                href={`/chapters/${city.slug}`}
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-cover bg-center shadow-custom"
                style={{ backgroundImage: `url("${city.image}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] !text-white/70 mb-1">Chapter</span>
                  <span className="text-2xl sm:text-3xl font-bold !text-white mb-1">{city.label}</span>
                  <span className="text-sm !text-white/80 mb-3">{city.tagline}</span>
                  <span className="text-sm font-semibold !text-white transition-transform duration-300 group-hover:translate-x-1">
                    Explore chapter →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section - Dynamic from Google Sheets */}
      <ProgramsSection programs={programs} />

      {/* Flagship: Elevate */}
      <ElevateSection programs={programs} />

      {/* Membership and Partnership Boxes - only shown if not signed in or profile incomplete */}
      <HomeMembershipCards />

      {/* Contact section */}
      {/* <section id="contact" className="bg-secondary py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8 sm:mb-10 md:mb-12 text-primary">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-12">
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <EnvelopeIcon className="text-2xl sm:text-3xl text-primary" />
              <div className="text-center">
                <p className="text-base sm:text-lg text-primary mb-1">Email:</p>
                <a href="mailto:info@hrevolve.org" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base break-all no-underline">info@hrevolve.org</a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <PhoneIcon className="text-2xl sm:text-3xl text-primary" />
              <div className="text-center">
                <p className="text-base sm:text-lg text-primary mb-1">Phone:</p>
                        <a href="tel:+91 6235355926" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base no-underline">+91 6235355926</a>
                <br />
                <a href="tel:+91 99468 79255" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base no-underline">+91 99468 79255</a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <MapMarkerIcon className="text-2xl sm:text-3xl text-primary" />
              <div className="text-center">
                <p className="text-base sm:text-lg text-primary mb-1">Address:</p>
                <a href="https://maps.app.goo.gl/QSXn2bYVzeQwVpDj9" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base no-underline">
                  Technopark Trivandrum, Kerala, India</a>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 sm:gap-6">
            <a
              href="https://www.linkedin.com/company/hr-evolve-india/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-lg sm:text-xl transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
            ><LinkedinIcon /></a>
            <a
              href="https://www.instagram.com/hr_evolve?igsh=MXg4cXZweWFrc3UwZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-lg sm:text-xl transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
            ><InstagramIcon /></a>
          </div>
        </div>
      </section> */}

      {/* Footer section */}
      <footer className="bg-tertiary text-primary pt-8 sm:pt-12 pb-0 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Company info and logo */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Image
              src="/logo.png"
              alt="HR Evolve Logo"
              className="w-12 h-12 sm:w-15 sm:h-15 mb-4 keep-colors"
              width={60}
              height={60}
            />
            <p className="text-sm leading-6 text-secondary max-w-xs">
              It is a non-profit and self-funded event for HR professionals to
              keep abreast with the trends, best practices and to strengthen their
              network.
            </p>
          </div>

          {/* Useful Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-primary">Useful Links</h3>
            <div className="space-y-2">
              <p>
                <a href="#about" className="text-secondary hover:text-primary transition-colors duration-300 text-sm sm:text-base">About Us</a>
              </p>
              <p>
                <a href="/events" className="text-secondary hover:text-primary transition-colors duration-300 text-sm sm:text-base">Events</a>
              </p>
              <p>
                <a href="#contact" className="text-secondary hover:text-primary transition-colors duration-300 text-sm sm:text-base">Contact</a>
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-primary">Get in Touch</h3>
            <div className="space-y-2 text-sm">
              <p className="text-secondary break-all">
                Email: <a href="mailto:info@hrevolve.org" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 no-underline">info@hrevolve.org</a>
              </p>
              <p className="text-secondary">
                Phone: <a href="tel:+91 6235355926" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 no-underline">+91 6235355926</a> / <a href="tel:+91 99468 79255" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 no-underline">+91 99468 79255</a>
              </p>
              <p className="text-secondary mb-4">
                Address: <a href="https://maps.app.goo.gl/QSXn2bYVzeQwVpDj9" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 no-underline">
                  Technopark Trivandrum, Kerala, India</a>
              </p>

              {/* Social Media Icons */}
              <div className="flex justify-center sm:justify-start gap-3 mt-4">
                <a
                  href="https://www.linkedin.com/company/hr-evolve-india/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-sm sm:text-lg transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
                ><LinkedinIcon /></a>
                <a
                  href="https://www.instagram.com/hr_evolve?igsh=MXg4cXZweWFrc3UwZA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-sm sm:text-lg transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
                ><InstagramIcon /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom text */}
        <div className="border-t border-custom mt-8 sm:mt-12 pt-4 pb-4 text-center">
          <p className="text-xs sm:text-sm text-muted">&copy; {new Date().getFullYear()} HR Evolve India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
