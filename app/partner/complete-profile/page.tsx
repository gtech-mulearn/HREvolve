'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '../../theme-provider'
import ThemeToggle from '../../theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export default function CompletePartnerProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Check if this is an update request
  const isUpdate = searchParams.get('update') === 'true'
  
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    partnershipGoals: '',
    servicesOffered: '',
    targetAudience: '',
    companySize: '',
    yearEstablished: '',
    website: '',
    linkedinProfile: '',
    contactPerson: session?.user?.name || '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    businessDescription: '',
    expectedBenefits: '',
    previousPartnerships: '',
    additionalInfo: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true) // New loading state for data fetching
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch existing partner profile data when component mounts and session is available
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!session?.user?.email) {
        setIsDataLoading(false)
        return
      }

      try {
        // First, ensure the user is set as a PARTNER when accessing this page
        const setUserTypeResponse = await fetch('/api/user/set-usertype', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType: 'PARTNER' }),
        })

        if (setUserTypeResponse.ok) {
          // Update session after setting userType
          await getSession()
        }

        const response = await fetch('/api/partner/complete-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.partner) {
            // Check if profile is already completed and this is not an update
            if (data.partner.profileCompleted && !isUpdate) {
              // Redirect to partner dashboard if profile is already complete and not updating
              router.push('/partner/dashboard')
              return
            }
            
            setFormData({
              companyName: data.partner.companyName || '',
              businessType: data.partner.businessType || '',
              partnershipGoals: data.partner.partnershipGoals || '',
              servicesOffered: data.partner.servicesOffered || '',
              targetAudience: data.partner.targetAudience || '',
              companySize: data.partner.companySize || '',
              yearEstablished: data.partner.yearEstablished || '',
              website: data.partner.website || '',
              linkedinProfile: data.partner.linkedinProfile || '',
              contactPerson: data.partner.contactPerson || session?.user?.name || '',
              contactEmail: data.partner.contactEmail || session?.user?.email || '',
              contactPhone: data.partner.contactPhone || '',
              businessDescription: data.partner.businessDescription || '',
              expectedBenefits: data.partner.expectedBenefits || '',
              previousPartnerships: data.partner.previousPartnerships || '',
              additionalInfo: data.partner.additionalInfo || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch partner data:', error)
        // Don't show error to user, just use defaults
      } finally {
        setIsDataLoading(false) // Stop loading after fetch completes
      }
    }

    if (session?.user?.email) {
      fetchPartnerData()
    } else {
      setIsDataLoading(false)
    }
  }, [session?.user?.email, router, isUpdate])

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  // Show loading while fetching profile data
  if (isDataLoading) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
            <svg className="w-10 h-10 animate-spin" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Loading Your Profile</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please wait while we fetch your information...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/partner/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(isUpdate ? 'Partner profile updated successfully!' : 'Partner profile created successfully!')
        
        // Update the session
        await getSession()
        
        // Short delay to show success message, then redirect
        setTimeout(() => {
          router.push('/partner/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Failed to save partner profile')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading/success state
  if (isLoading || success) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
            <svg className="w-10 h-10 animate-spin" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {success ? 'Partnership Profile Completed!' : 'Saving Your Partnership Profile...'}
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {success ? 'Redirecting to your partner dashboard...' : 'Please wait while we save your partnership information'}
          </p>
          <div className="mt-6 flex justify-center">
            <div className="px-6 py-3 rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {success ? '🤝 Welcome to HR Evolve Partnership!' : '💼 Processing...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}

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

        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
              <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
              {isUpdate ? 'Update Partnership Profile' : 'Complete Partnership Profile'}
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
              {isUpdate 
                ? 'Update your partnership information and strengthen your collaboration with HR Evolve.'
                : 'Join our strategic partner network and unlock collaborative opportunities in the HR industry.'
              }
            </p>
            <div className="mt-4 sm:mt-6 flex justify-center">
              <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
                <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                  {isUpdate ? '🤝 Update your partnership details!' : '🚀 Let\'s build something great together!'}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-8 mx-auto max-w-2xl">
              <div className="border rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 mx-auto max-w-2xl">
              <div className="border rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Company Information */}
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Company Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessType" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Business Type *
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Select business type</option>
                    <option value="HR Consulting">HR Consulting</option>
                    <option value="Technology Provider">Technology Provider</option>
                    <option value="Training & Development">Training & Development</option>
                    <option value="Recruitment Agency">Recruitment Agency</option>
                    <option value="Software Vendor">Software Vendor</option>
                    <option value="Event Management">Event Management</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Educational Institution">Educational Institution</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="companySize" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="yearEstablished" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Year Established
                  </label>
                  <input
                    type="number"
                    id="yearEstablished"
                    name="yearEstablished"
                    value={formData.yearEstablished}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="e.g., 2010"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Company Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.yourcompany.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="linkedinProfile" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Company LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="space-y-2">
                  <label htmlFor="businessDescription" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Business Description *
                  </label>
                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe your company's core business, mission, and what makes you unique in the HR industry..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Contact Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="contactPerson" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Primary contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl cursor-not-allowed opacity-60 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-secondary)'
                    }}
                    placeholder="Contact email address"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Partnership Details
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="servicesOffered" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Services/Products Offered *
                  </label>
                  <textarea
                    id="servicesOffered"
                    name="servicesOffered"
                    value={formData.servicesOffered}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe the services or products your company offers that would be relevant to HR professionals..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="targetAudience" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Target Audience
                  </label>
                  <textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Who is your ideal customer? (e.g., SMEs, large enterprises, startups, specific industries...)"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="partnershipGoals" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Partnership Goals *
                  </label>
                  <textarea
                    id="partnershipGoals"
                    name="partnershipGoals"
                    value={formData.partnershipGoals}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="What do you hope to achieve through this partnership with HR Evolve? How can we collaborate?"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="expectedBenefits" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Expected Benefits
                  </label>
                  <textarea
                    id="expectedBenefits"
                    name="expectedBenefits"
                    value={formData.expectedBenefits}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What benefits do you expect from this partnership? What value can you bring to HR Evolve members?"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="previousPartnerships" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Previous Partnerships
                  </label>
                  <textarea
                    id="previousPartnerships"
                    name="previousPartnerships"
                    value={formData.previousPartnerships}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell us about any previous partnerships or collaborations in the HR industry..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="additionalInfo" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional information you'd like to share about your company or partnership proposal?"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full max-w-md py-3 sm:py-4 px-6 sm:px-8 font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 text-sm sm:text-base"
                style={{
                  backgroundColor: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#000000' : '#ffffff',
                  border: 'none'
                }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isUpdate ? 'Updating Partnership Profile...' : 'Creating Partnership Profile...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{isUpdate ? '🤝 Update Partnership Profile' : '🚀 Submit Partnership Application'}</span>
                      <span className="sm:hidden">{isUpdate ? '🤝 Update Profile' : '🚀 Submit Application'}</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-8 sm:mt-12 text-center px-4">
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              🔒 Your partnership application will be reviewed by our team. We'll get back to you within 2-3 business days.
            </p>
          </div>
        </div>
      </div>
    )
}