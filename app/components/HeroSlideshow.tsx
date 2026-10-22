'use client'

import { useEffect, useState } from 'react'

const INTERVAL_MS = 3000

// Auto-advancing background slideshow. Pauses while the tab is hidden, and only
// requests each slide's image once it's next in line so the hero doesn't download
// every photo up front.
export default function HeroSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const [loadedUpTo, setLoadedUpTo] = useState(Math.min(1, images.length - 1))

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timer || images.length < 2) return
      timer = setInterval(() => setIndex((i) => (i + 1) % images.length), INTERVAL_MS)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }
    const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop())

    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [images.length])

  // Preload the slide after the current one
  useEffect(() => {
    setLoadedUpTo((n) => Math.max(n, Math.min(index + 1, images.length - 1)))
  }, [index, images.length])

  return (
    <div
      className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
      style={{ transform: `translateX(${-index * 100}%)` }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          className="flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={i <= loadedUpTo ? { backgroundImage: `url("${src}")` } : undefined}
        />
      ))}
    </div>
  )
}
