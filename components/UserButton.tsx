'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function UserButton() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="nav-link p-2 transition-all duration-300 ease-out hover:scale-110 text-sm font-medium"
      >
        Be a Member
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full transition-all duration-300 ease-out hover:bg-black/10 dark:hover:bg-white/10"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-sm font-medium">
            {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="nav-link hidden sm:block text-sm font-medium">
          {session.user?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50">
          <div className="py-2">
            <div className="px-4 py-3 text-sm border-b border-gray-200">
              <p className="font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-gray-600 truncate">{session.user?.email}</p>
            </div>
            <a
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-black/5 transition-colors duration-200"
            >
              Dashboard
            </a>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-black/5 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}