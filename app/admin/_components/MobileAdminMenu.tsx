'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { getAdminNavLinks } from './AdminNav'
import Avatar from './Avatar'
import RoleBadge from './RoleBadge'

export default function MobileAdminMenu({
  isAdmin,
  name,
  email,
  role,
}: {
  isAdmin: boolean
  name?: string | null
  email?: string | null
  role: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const links = getAdminNavLinks(isAdmin)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const panel = open && (
    <div className="fixed inset-0" style={{ zIndex: 1000 }}>
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div
        className="absolute top-0 right-0 w-72 max-w-[85%] h-full shadow-2xl p-4 flex flex-col bg-primary"
        style={{ backgroundColor: 'var(--bg-primary)', opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-4 flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <Avatar name={name} email={email} size={36} />
          <div className="min-w-0 flex-grow">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {name}
            </p>
            <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
              {email}
            </p>
            <RoleBadge role={role} />
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-grow overflow-y-auto min-h-0">
          {links.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            const Icon = isActive ? link.activeIcon : link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={isActive ? { backgroundColor: 'var(--accent-color)' } : { color: 'var(--text-secondary)' }}
              >
                <Icon className="w-4 h-4" style={isActive ? { color: 'var(--bg-primary)' } : undefined} />
                <span style={isActive ? { color: 'var(--bg-primary)' } : undefined}>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 mt-2 pt-4 border-t transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0"
          style={{ borderColor: 'var(--border-custom)' }}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
