'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/app/theme-toggle'
import UserButton from './UserButton'

const NAV_LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#chapters', label: 'Chapters' },
  { href: '/events', label: 'Programs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
]

// Fixed site header for pages with a full-bleed hero. Wrap the page in `.main-page`
// so the header shows white text until the user scrolls (see globals.css).
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] bg-transparent transition-all duration-300 ease-out ${scrolled ? 'header-scrolled' : ''}`}
      >
        <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 lg:px-12">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="HR Evolve Logo" className="h-8 sm:h-10 md:h-12 w-auto keep-colors" width={50} height={50} />
            </Link>
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link no-underline font-medium md:font-semibold text-sm md:text-base transition-all duration-300 hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center space-x-4 ml-2 lg:ml-4">
                <UserButton />
                <ThemeToggle />
              </div>
            </nav>
            <div className="flex items-center md:hidden space-x-2">
              <UserButton />
              <ThemeToggle />
              <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="hamburger-menu p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="3" fill="currentColor" />
                  <rect x="2" y="11" width="20" height="3" fill="currentColor" />
                  <rect x="2" y="17" width="20" height="3" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav
        className={`fixed top-0 h-full w-72 sm:w-80 bg-primary z-[1001] p-4 sm:p-6 shadow-custom transition-all duration-200 ease-out md:hidden ${menuOpen ? 'right-0' : 'right-[-100%]'}`}
      >
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="float-right text-muted hover:text-primary">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="4" />
            <line x1="4.5" y1="19.5" x2="19.5" y2="4.5" stroke="currentColor" strokeWidth="4" />
          </svg>
        </button>
        <ul className="list-none p-0 mt-12 sm:mt-16 space-y-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-primary no-underline py-4 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-lg font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
