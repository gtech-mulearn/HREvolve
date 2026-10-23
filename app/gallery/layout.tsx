import type { Metadata } from 'next'

// The gallery page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from HR Evolve sessions, Elevate conclaves and community moments.',
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
