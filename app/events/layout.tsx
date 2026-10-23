import type { Metadata } from 'next'

// The events page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Programs',
  description: 'Upcoming and past HR Evolve monthly sessions and Elevate, our flagship HR conclave, across Trivandrum, Kochi and Kozhikode.',
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
