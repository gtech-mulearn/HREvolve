'use client'

import { useTheme } from './theme-provider'
import { useEffect, useMemo } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const maskId = useMemo(() => `moon-mask-${Math.random().toString(36).substr(2, 9)}`, [])

  useEffect(() => {
    // Set the data-theme attribute on the document element
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button
      className="theme-toggle p-2 rounded-full transition-all duration-300 ease-out hover:bg-black/10 dark:hover:bg-white/10 text-white"
      onClick={toggleTheme}
      title="Toggles light & dark"
      aria-label={theme}
      aria-live="polite"
    >
      <svg className="sun-and-moon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle className="moon-cutout" cx="18" cy="8" r="5.5" fill="black" />
          </mask>
        </defs>
        <circle className="sun" cx="12" cy="12" r="6" mask={`url(#${maskId})`} fill="currentColor" />
        <g className="sun-beams" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}