'use client'

import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

// Member/Partner call-to-action cards. Session-dependent, so rendered client-side
// while the rest of the homepage is server-rendered. Hidden while the session loads
// and once the profile is complete.
export default function HomeMembershipCards() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Wait for the client-side session so the cards don't flash for signed-in users
  if (status === 'loading' || session?.user?.profileCompleted) return null

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Be a Member Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-primary border-2 border-custom text-primary shadow-custom text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--text-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-0 text-2xl sm:text-3xl font-bold tracking-wide mb-3 sm:mb-4">Be a Member!</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8">Join our exclusive HR community and unlock personalized experiences, networking opportunities, and cutting-edge insights.</p>
          <button
            onClick={() => {
              if (session) {
                // If logged in, go to member profile completion
                router.push('/member/complete-profile')
              } else {
                // If not logged in, sign in first
                signIn()
              }
            }}
            className="inline-block px-6 sm:px-8 py-3 bg-primary text-primary rounded-full font-bold text-base sm:text-lg transition-all duration-300 ease-out border-2 border-solid border-current hover:bg-transparent hover:text-primary hover:scale-110 shadow-lg">
            {session ? 'Complete Profile' : 'Join Community'}
          </button>
        </div>

        {/* Be a Partner Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-secondary border-2 border-custom text-primary shadow-custom text-center transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--text-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="mt-0 text-2xl sm:text-3xl font-bold tracking-wide mb-3 sm:mb-4">Be a Partner!</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8">Join our strategic partner network and collaborate with us to shape the future of HR innovation and excellence.</p>
          <button
            onClick={() => {
              if (session) {
                // If logged in, go to partner profile completion
                router.push('/partner/complete-profile')
              } else {
                // If not logged in, sign in first
                signIn()
              }
            }}
            className="inline-block px-6 sm:px-8 py-3 bg-secondary text-primary rounded-full font-bold text-base sm:text-lg transition-all duration-300 ease-out border-2 border-solid border-current hover:bg-transparent hover:text-primary hover:scale-110 shadow-lg">
            {session ? 'Become Partner' : 'Partner With Us'}
          </button>
        </div>
      </div>
    </div>
  )
}
