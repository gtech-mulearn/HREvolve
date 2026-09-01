'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'
import RoleBadge from './RoleBadge'

export default function AdminUserMenu({
  name,
  email,
  role,
}: {
  name?: string | null
  email?: string | null
  role: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const close = (e: Event) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (buttonRef.current?.contains(target)) return
      setIsOpen(false)
    }

    // capture phase so this runs before any child stopPropagation, and both
    // events so it's robust across touch/mouse and any intervening handlers
    document.addEventListener('pointerdown', close, true)
    document.addEventListener('click', close, true)

    return () => {
      document.removeEventListener('pointerdown', close, true)
      document.removeEventListener('click', close, true)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Avatar name={name} email={email} size={28} />
        <span className="text-sm font-medium truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>
          {name}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-custom)' }}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {name}
            </p>
            <p className="text-xs truncate mb-2" style={{ color: 'var(--text-secondary)' }}>
              {email}
            </p>
            <RoleBadge role={role} />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
