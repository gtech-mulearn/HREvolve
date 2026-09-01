'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Squares2X2Icon, CalendarDaysIcon, UsersIcon } from '@heroicons/react/24/outline'
import {
  Squares2X2Icon as Squares2X2IconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  UsersIcon as UsersIconSolid,
} from '@heroicons/react/24/solid'

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Squares2X2Icon, activeIcon: Squares2X2IconSolid, exact: true },
    { href: '/admin/events', label: 'Events', icon: CalendarDaysIcon, activeIcon: CalendarDaysIconSolid },
    ...(isAdmin
      ? [{ href: '/admin/users', label: 'Users', icon: UsersIcon, activeIcon: UsersIconSolid }]
      : []),
  ]

  return (
    <nav className="hidden sm:flex items-center gap-1">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        const Icon = isActive ? link.activeIcon : link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={
              isActive
                ? { backgroundColor: 'var(--accent-color)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            <Icon className="w-4 h-4" style={isActive ? { color: 'var(--bg-primary)' } : undefined} />
            <span style={isActive ? { color: 'var(--bg-primary)' } : undefined}>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
