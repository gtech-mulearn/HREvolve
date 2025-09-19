'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '../theme-provider'
import ThemeToggle from '../theme-toggle'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  // Check if mandatory fields are completed
  const checkMandatoryFields = (user: any) => {
    if (!user) {
      console.log('Dashboard: User is null/undefined')
      return false
    }
    
    const mandatoryFields = [
      'name',
      'phone',
      'organization',
      'designation',
      'experience'
    ]
    
    console.log('Dashboard: Checking mandatory fields for user:', user)
    
    const result = mandatoryFields.every(field => {
      const value = user[field]
      const isValid = value !== null && value !== undefined && value.toString().trim() !== ''
      console.log(`Dashboard: Field ${field}: ${value} -> ${isValid}`)
      return isValid
    })
    
    console.log('Dashboard: Mandatory fields check result:', result)
    return result
  }

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (status === 'loading') return // Still loading
      if (hasChecked) return // Prevent multiple checks

      if (!session) {
        router.push('/auth/signin')
        return
      }

      setHasChecked(true)

      try {
        // Fetch user data from API to get complete profile information
        const response = await fetch('/api/member/complete-profile')
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          
          console.log('Dashboard: User data fetched:', user) // Debug log
          
          // If user is a partner, redirect to partner dashboard
          if (user?.userType === 'PARTNER') {
            console.log('Dashboard: Redirecting partner to partner dashboard') // Debug log
            router.push('/partner/dashboard')
            return
          }

          // Check if user's mandatory fields are completed
          if (!checkMandatoryFields(user)) {
            console.log('Dashboard: Mandatory fields incomplete, redirecting to profile') // Debug log
            router.push('/member/complete-profile')
            return
          }

          console.log('Dashboard: All checks passed, showing dashboard') // Debug log
          setLoading(false)
        } else {
          console.log('Dashboard: API call failed, redirecting to profile completion') // Debug log
          // If API call fails, redirect to profile completion to be safe
          router.push('/member/complete-profile')
        }
      } catch (error) {
        console.error('Dashboard: Failed to fetch user data:', error)
        router.push('/member/complete-profile')
      }
    }

    checkProfileAndRedirect()
  }, [session, status, router, hasChecked])

  const handleUpdateProfile = () => {
    router.push('/member/complete-profile?update=true')
  }

  const handleViewEvents = () => {
    router.push('/events')
  }

  // If not authenticated or checking, show loading
  if (status === 'loading' || loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: isDark ? '#ffffff' : '#000000' }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-3 sm:space-y-0">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
                alt="HR Evolve Logo"
                width={35}
                height={35}
                className="keep-colors sm:w-[45px] sm:h-[45px]"
              />
              <span className="font-bold text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                HR Evolve
              </span>
            </Link>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Welcome back, {session.user?.name}</span>
                <span className="sm:hidden">Welcome, {session.user?.name?.split(' ')[0]}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2m0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
            Welcome to your HR Evolve dashboard. Manage your profile, view events, and stay connected with the HR community.
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border mb-6 sm:mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
              <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? '#000000' : '#ffffff' }}>
                {session.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {session.user?.name}
              </h2>
              <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {session.user?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Member since {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>5</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Events Attended</div>
            </div>
            <div className="text-center p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>12</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Network Connections</div>
            </div>
            <div className="text-center p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>3</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Certificates Earned</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Update Profile Card */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
               onClick={handleUpdateProfile}>
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" 
                   style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Update Profile</h3>
            </div>
            <p className="text-sm mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
              Complete your member profile with professional details and interests
            </p>
            <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: isDark ? '#ffffff' : '#000000' }}>
              <span>Manage Details</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* View Events Card */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
               onClick={handleViewEvents}>
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" 
                   style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>View Events</h3>
            </div>
            <p className="text-sm mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
              Discover upcoming HR events, workshops, and networking opportunities
            </p>
            <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: isDark ? '#ffffff' : '#000000' }}>
              <span>Explore Events</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Home Page Card */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 cursor-pointer group sm:col-span-2 lg:col-span-1" 
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}
               onClick={() => router.push('/')}>
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" 
                   style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Back to Home</h3>
            </div>
            <p className="text-sm mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
              Return to the main HR Evolve website and explore all features
            </p>
            <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: isDark ? '#ffffff' : '#000000' }}>
              <span>Go Home</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Profile created successfully</span>
              </div>
              <span className="text-xs sm:text-sm ml-5 sm:ml-auto" style={{ color: 'var(--text-secondary)' }}>Just now</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Joined HR Evolve community</span>
              </div>
              <span className="text-xs sm:text-sm ml-5 sm:ml-auto" style={{ color: 'var(--text-secondary)' }}>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}