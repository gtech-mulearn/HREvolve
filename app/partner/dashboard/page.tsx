'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '../../theme-provider'
import ThemeToggle from '../../theme-toggle'
import UserButton from '../../../components/UserButton'
import Link from 'next/link'
import Image from 'next/image'

export default function PartnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [partnerData, setPartnerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  // Check if mandatory fields are completed
  const checkMandatoryFields = (partner: any) => {
    if (!partner) return false
    
    const mandatoryFields = [
      'companyName',
      'businessType', 
      'businessDescription',
      'contactPerson',
      'contactPhone',
      'servicesOffered',
      'partnershipGoals'
    ]
    
    return mandatoryFields.every(field => partner[field] && partner[field].trim() !== '')
  }

  // Fetch partner data and validate access
  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!session?.user?.email) return
      if (hasChecked) return // Prevent multiple checks

      setHasChecked(true)

      console.log('Partner Dashboard: User type:', session.user?.userType) // Debug log

      // If user is not a partner, redirect to member dashboard
      if (session.user?.userType !== 'PARTNER') {
        console.log('Partner Dashboard: Non-partner user, redirecting to member dashboard') // Debug log
        router.push('/dashboard')
        return
      }

      try {
        const response = await fetch('/api/partner/complete-profile')
        if (response.ok) {
          const data = await response.json()
          setPartnerData(data.partner)
          
          console.log('Partner Dashboard: Partner data fetched:', data.partner) // Debug log
          
          // Check if mandatory fields are completed
          if (!data.partner || !checkMandatoryFields(data.partner)) {
            console.log('Partner Dashboard: Mandatory fields incomplete, redirecting to profile') // Debug log
            router.push('/partner/complete-profile')
            return
          }

          console.log('Partner Dashboard: All checks passed, showing dashboard') // Debug log
        } else {
          console.log('Partner Dashboard: API call failed, redirecting to profile completion') // Debug log
          // If no partner profile exists, redirect to form
          router.push('/partner/complete-profile')
          return
        }
      } catch (error) {
        console.error('Partner Dashboard: Failed to fetch partner data:', error)
        // On error, redirect to form to be safe
        router.push('/partner/complete-profile')
        return
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      checkProfileAndRedirect()
    }
  }, [session?.user?.email, session?.user?.userType, router, hasChecked])

  // Redirect if not authenticated or not a partner
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user?.userType !== 'PARTNER') {
    router.push('/auth/signin')
    return null
  }

  // If partner data is null or mandatory fields are incomplete, the useEffect will handle redirect
  if (!partnerData || !checkMandatoryFields(partnerData)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleUpdateProfile = () => {
    router.push('/partner/complete-profile?update=true')
  }

  const handleViewEvents = () => {
    router.push('/events')
  }

  const getPartnershipStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Your partnership application is under review. We\'ll get back to you within 2-3 business days.'
      case 'APPROVED':
        return 'Congratulations! Your partnership has been approved. Welcome to the HR Evolve partner network.'
      case 'ACTIVE':
        return 'Your partnership is active. Thank you for being a valued partner!'
      case 'REJECTED':
        return 'Unfortunately, your partnership application was not approved at this time. Please contact us for more information.'
      case 'INACTIVE':
        return 'Your partnership is currently inactive. Please contact us to reactivate.'
      default:
        return 'Partnership status unknown. Please contact support.'
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
        <header className="sticky top-0 z-50 border-b transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <Image
                  src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
                  alt="HR Evolve Logo"
                  width={40}
                  height={40}
                  className="keep-colors sm:w-[45px] sm:h-[45px]"
                />
                <span className="font-bold text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                  HR Evolve
                </span>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm px-3 sm:px-4 py-2 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Partner: {session.user?.name}</span>
                </div>
                <div className="sm:hidden flex items-center space-x-2 text-xs px-2 py-1 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{session.user?.name?.split(' ')[0]}</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            Partner Dashboard
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
            Welcome to your HR Evolve partner portal. Manage your partnership, track collaboration opportunities, and connect with the HR community.
          </p>
        </div>

        {/* Partnership Status Card */}
        {partnerData && (
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border mb-6 sm:mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? '#000000' : '#ffffff' }}>
                  {partnerData.companyName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-center sm:text-left flex-grow">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {partnerData.companyName}
                </h2>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {partnerData.businessType}
                </p>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full border ${getPartnershipStatusColor(partnerData.partnershipStatus)}`}>
                    {partnerData.partnershipStatus}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Partnership Status</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {getStatusMessage(partnerData.partnershipStatus)}
              </p>
            </div>
          </div>
        )}

        {/* Company Summary */}
        {partnerData && (
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border mb-6 sm:mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--text-primary)' }}>
              Company Overview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Company Size</h4>
                  <p className="text-base" style={{ color: 'var(--text-primary)' }}>{partnerData.companySize || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Year Established</h4>
                  <p className="text-base" style={{ color: 'var(--text-primary)' }}>{partnerData.yearEstablished || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Contact Person</h4>
                  <p className="text-base" style={{ color: 'var(--text-primary)' }}>{partnerData.contactPerson || 'Not specified'}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Contact Phone</h4>
                  <p className="text-base" style={{ color: 'var(--text-primary)' }}>{partnerData.contactPhone || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {partnerData.businessDescription && (
              <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Business Description</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{partnerData.businessDescription}</p>
              </div>
            )}
          </div>
        )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Update Profile</h3>
            </div>
            <p className="text-sm mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
              Update your partnership information and company details
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
              Discover partnership opportunities and industry events
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

        {/* Partnership Details */}
        {partnerData && (
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Partnership Information
              </h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {partnerData.servicesOffered && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Services/Products Offered</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{partnerData.servicesOffered}</p>
                </div>
              )}
              
              {partnerData.partnershipGoals && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Partnership Goals</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{partnerData.partnershipGoals}</p>
                </div>
              )}
              
              {partnerData.expectedBenefits && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Expected Benefits</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{partnerData.expectedBenefits}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}