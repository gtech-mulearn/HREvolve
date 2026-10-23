'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

// The session is loaded client-side (from /api/auth/session) rather than in the root
// layout, so public pages can be statically generated and cached.
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
