'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ThemeToggle from './theme-toggle'
import ProgramsSection from './components/ProgramsSection'
import UserButton from '../components/UserButton'
import { useSession, signIn } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Modal functionality
    const modal = document.getElementById("registerModal")
    const span = document.getElementsByClassName("close-btn")[0] as HTMLElement

    if (span) {
      span.onclick = function () {
        if (modal) modal.style.display = "none"
      }
    }

    window.onclick = function (event: Event) {
      if (event.target == modal) {
        if (modal) modal.style.display = "none"
      }
    }

    // Slideshow functionality
    const slides = document.querySelectorAll(".slide")
    let currentIndex = 0

    function showSlide(index: number) {
      const offset = -index * 100
      const slidesContainer = document.querySelector(".slides") as HTMLElement
      if (slidesContainer) {
        slidesContainer.style.transform = `translateX(${offset}%)`
      }
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length
      showSlide(currentIndex)
    }

    const slideInterval = setInterval(nextSlide, 3000)

    // Mobile navigation
    const mobileNav = document.querySelector(".mobile-nav")
    let isMenuOpen = false

    // @ts-ignore
    window.toggleMenu = function() {
      if (typeof window !== 'undefined' && window.gsap) {
        if (isMenuOpen) {
          window.gsap.to(mobileNav, { right: "-100%", duration: 0.1 })
        } else {
          window.gsap.to(mobileNav, { right: "0%", duration: 0.1 })
        }
        isMenuOpen = !isMenuOpen
      }
    }

    // Close the mobile nav when a link is clicked
    document.querySelectorAll(".mobile-nav ul li a").forEach((link) => {
      link.addEventListener("click", () => {
        if (typeof window !== 'undefined' && window.gsap) {
          window.gsap.to(mobileNav, { right: "-100%", duration: 0.1 })
          isMenuOpen = false
        }
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
    
    // Call once on initial load to set correct state
    handleScroll()

    // Gallery carousel auto-scroll functionality
    const galleryImages = document.querySelectorAll('.gallery img')
    let galleryCurrentIndex = 0
    // Responsive images per view based on screen size
    const getImagesPerView = () => {
      if (window.innerWidth <= 475) return 1.5 // Extra small mobile
      if (window.innerWidth <= 640) return 2   // Mobile
      if (window.innerWidth <= 768) return 2.5 // Large mobile
      if (window.innerWidth <= 1024) return 3  // Tablet
      return 4 // Desktop
    }

    function showGallerySlide(index: number) {
      const gallery = document.querySelector('.gallery') as HTMLElement
      if (gallery && galleryImages.length > 0) {
        const imageWidth = galleryImages[0].clientWidth + (window.innerWidth <= 640 ? 12 : 16) // Image width + responsive gap
        const offset = -index * imageWidth
        gallery.style.transform = `translateX(${offset}px)`
      }
    }

    function nextGallerySlide() {
      const imagesPerView = getImagesPerView()
      const maxIndex = Math.max(0, galleryImages.length - Math.floor(imagesPerView))
      galleryCurrentIndex = galleryCurrentIndex >= maxIndex ? 0 : galleryCurrentIndex + 1
      showGallerySlide(galleryCurrentIndex)
    }

    // Auto-scroll every 3 seconds
    const galleryInterval = setInterval(nextGallerySlide, 3000)

    return () => {
      clearInterval(slideInterval)
      clearInterval(galleryInterval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="main-page">
      {/* Modal */}
      <div id="registerModal" className="hidden fixed z-[1000] left-0 top-0 w-full h-full overflow-auto bg-black bg-opacity-40">
        <div className="bg-primary mx-auto mt-[15%] p-5 border border-custom w-1/2 text-center text-primary rounded-lg shadow-custom">
          <span className="text-muted float-right text-[28px] font-bold transition-colors duration-300 ease-out hover:text-primary focus:text-primary cursor-pointer">&times;</span>
          <h2 className="text-2xl font-bold mb-4">Welcome to HR Evolve</h2>
          <p className="mb-6">
            Join us for our upcoming events and be a part of our dynamic network
            of HR professionals.
          </p>
          <a href="https://makemypass.com/elevate-2024" className="inline-block px-5 py-2.5 mt-5 bg-accent !text-white dark:!text-black no-underline rounded transition-colors duration-300 ease-out hover:bg-accent-hover">
            Register Now
          </a>
        </div>
      </div>

      {/* Header section */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-transparent transition-all duration-300 ease-out">
        <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 lg:px-12">
          <div className="flex justify-between items-center">
            <a href="#" className="flex items-center">
              <Image
                src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
                alt="HR Evolve Logo"
                className="h-8 sm:h-10 md:h-12 w-auto keep-colors"
                width={50}
                height={50}
              />
            </a>
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
              <a href="#about" className="nav-link no-underline font-medium md:font-semibold text-sm md:text-base transition-all duration-300 hover:opacity-80">
                About
              </a>
              <a href="#programs" className="nav-link no-underline font-medium md:font-semibold text-sm md:text-base transition-all duration-300 hover:opacity-80">
                Programs
              </a>
              <a href="#contact" className="nav-link no-underline font-medium md:font-semibold text-sm md:text-base transition-all duration-300 hover:opacity-80">
                Contact
              </a>
              <div className="flex items-center space-x-4 ml-2 lg:ml-4">
                <UserButton />
                <ThemeToggle />
              </div>
            </nav>
            <div className="flex items-center md:hidden space-x-2">
              <UserButton />
              <ThemeToggle />
              <svg
                className="hamburger-menu cursor-pointer transition-all duration-300"
                width="20"
                height="20"
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
      <nav className="mobile-nav fixed top-0 right-[-100%] w-72 sm:w-80 h-full bg-primary z-[1001] p-4 sm:p-6 shadow-custom transition-all duration-100 ease-out md:hidden">
        <svg
          className="text-muted float-right transition-colors duration-300 ease-out hover:text-primary focus:text-primary cursor-pointer"
          width="28"
          height="28"
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
        <ul className="list-none p-0 mt-12 sm:mt-16 space-y-2">
          <li>
            <a href="#about" className="block text-primary no-underline py-4 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-lg font-medium">
              About
            </a>
          </li>
          <li>
            <a href="#programs" className="block text-primary no-underline py-4 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-lg font-medium">
              Programs
            </a>
          </li>
          <li>
            <a href="#contact" className="block text-primary no-underline py-4 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-lg font-medium">
              Contact
            </a>
          </li>
        </ul>
        <div className="p-4 sm:p-5 mt-8 border-t border-custom">
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
        <div className="slides absolute inset-0 flex transition-transform duration-500 ease-in-out">
          <div className="slide flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("/s1.jpg")'}}></div>
          <div className="slide flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("/s2.jpg")'}}></div>
          <div className="slide flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("/s3.jpg")'}}></div>
          <div className="slide flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("/s4.jpg")'}}></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 md:mb-12 text-white drop-shadow-2xl leading-tight tracking-tight">
            Unlock big ideas shaping the future of Business
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 md:mb-12 text-white/95 drop-shadow-lg font-medium leading-relaxed max-w-5xl mx-auto px-2">
            Connect, Inspire, Transform: HR Leading the Way
          </p>
          <div className="text-center">
            <a href="https://makemypass.com/event/elevate25-hr-conclave" className="inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white !text-black no-underline rounded-xl text-base sm:text-lg font-bold transition-all duration-300 ease-out hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 shadow-2xl">
              Registration Open
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-primary text-primary transition-colors duration-300">
        <div className="container-width">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-primary text-balance">About HR Evolve</h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-secondary max-w-4xl mx-auto text-balance">
            Welcome to <strong>HR Evolve</strong>, a vibrant community for HR
            professionals and enthusiasts dedicated to reshaping the future of
            human resources. Our platform encourages collaboration and open
            dialogue, allowing members to exchange ideas and insights on the
            latest industry trends. With a focus on innovation and continuous
            learning, we empower our members to stay ahead in a rapidly changing
            landscape.
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-secondary max-w-4xl mx-auto">
            Every <strong>third Thursday</strong>, we host interactive, expert-led
            sessions that tackle evolving HR challenges and opportunities. From
            leadership strategies to emerging technologies, we explore key topics
            that drive the profession forward. Whether you&apos;re looking to expand
            your network, develop new skills, or stay informed about industry
            changes, <strong>HR Evolve</strong> is here to help you grow and
            succeed. If you want to stay on top of the current HR tech trends and
            understand what companies in the region are doing for their people, HR
            EVOLVE is the place to be! . Learn from industry thought leaders that
            are revolutionizing work places, meet up with C level peers with
            similar challenges, foster deeper connections, find the right
            technology partner, forge lifelong partnerships, hear regional case
            studies, and gain practical takeaways and actionable applications of
            how HR technology can support better workplaces!
          </p>
        </div>
      </section>

      {/* Programs Section - Dynamic from Google Sheets */}
      <ProgramsSection />

      {/* Membership and Partnership Boxes - Only show if user is not signed in or hasn't completed profile */}
      {(!session || !session.user?.profileCompleted) && (
        <div className="max-w-6xl mx-auto my-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Be a Member Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-primary border-2 border-custom text-primary shadow-custom text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--text-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="mt-0 text-2xl sm:text-3xl font-bold tracking-wide mb-3 sm:mb-4">Be a Member!</h2>
              <p className="text-base sm:text-lg mb-6 sm:mb-8">Join our exclusive HR community and unlock personalized experiences, networking opportunities, and cutting-edge insights.</p>
              <button
                onClick={() => {
                  if (session) {
                    // If logged in, go to member profile completion
                    router.push('/member/complete-profile')
                  } else {
                    // If not logged in, sign in first
                    signIn()
                  }
                }}
                className="inline-block px-6 sm:px-8 py-3 bg-primary text-primary rounded-full font-bold text-base sm:text-lg transition-all duration-300 ease-out border-2 border-solid border-current hover:bg-transparent hover:text-primary hover:scale-110 shadow-lg">
                {session ? 'Complete Profile' : 'Join Community'}
              </button>
            </div>

            {/* Be a Partner Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-secondary border-2 border-custom text-primary shadow-custom text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--text-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="mt-0 text-2xl sm:text-3xl font-bold tracking-wide mb-3 sm:mb-4">Be a Partner!</h2>
              <p className="text-base sm:text-lg mb-6 sm:mb-8">Join our strategic partner network and collaborate with us to shape the future of HR innovation and excellence.</p>
              <button
                onClick={() => {
                  if (session) {
                    // If logged in, go to partner profile completion
                    router.push('/partner/complete-profile')
                  } else {
                    // If not logged in, sign in first
                    signIn()
                  }
                }}
                className="inline-block px-6 sm:px-8 py-3 bg-secondary text-primary rounded-full font-bold text-base sm:text-lg transition-all duration-300 ease-out border-2 border-solid border-current hover:bg-transparent hover:text-primary hover:scale-110 shadow-lg">
                {session ? 'Become Partner' : 'Partner With Us'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact section */}
      <section id="contact" className="bg-secondary py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8 sm:mb-10 md:mb-12 text-primary">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-12">
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <i className="fas fa-envelope text-2xl sm:text-3xl text-primary"></i>
              <div className="text-center">
                <p className="text-base sm:text-lg text-primary mb-1">Email:</p>
                <a href="mailto:info@hrevolve.org" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base break-all no-underline">info@hrevolve.org</a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <i className="fas fa-phone-alt text-2xl sm:text-3xl text-primary"></i>
              <div className="text-center">
                <p className="text-base sm:text-lg text-primary mb-1">Phone:</p>
                <a href="tel:+91 623535592" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base no-underline">+91 623535592</a>
                <br />
                <a href="tel:+91 99468 79255" className="!text-black dark:!text-white hover:!text-gray-700 dark:hover:!text-gray-300 transition-colors duration-300 text-sm sm:text-base no-underline">+91 99468 79255</a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4">
              <i className="fas fa-map-marker-alt text-2xl sm:text-3xl text-primary"></i>
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
            ><i className="fab fa-linkedin"></i></a>
            <a
              href="https://www.instagram.com/hr_evolve?igsh=MXg4cXZweWFrc3UwZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-lg sm:text-xl transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
            ><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </section>

      {/* Footer section */}
      <footer className="bg-tertiary text-primary pt-8 sm:pt-12 pb-0 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Company info and logo */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Image
              src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
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
                ><i className="fab fa-linkedin"></i></a>
                <a
                  href="https://www.instagram.com/hr_evolve?igsh=MXg4cXZweWFrc3UwZA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary border-2 border-custom rounded-full flex items-center justify-center text-primary text-sm sm:text-lg transition-all duration-300 ease-out hover:bg-secondary hover:scale-110 shadow-custom"
                ><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom text */}
        <div className="border-t border-custom mt-8 sm:mt-12 pt-4 pb-4 text-center">
          <p className="text-xs sm:text-sm text-muted">&copy; 2024 HR Evolve India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
