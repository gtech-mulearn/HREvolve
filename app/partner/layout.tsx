import { Suspense } from 'react'

// Pages in this segment read the query string with useSearchParams(), which must sit
// inside a Suspense boundary for the page to be statically generated.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
