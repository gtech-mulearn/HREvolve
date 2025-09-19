'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '../../theme-provider'
import ThemeToggle from '../../theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Check if this is an update request
  const isUpdate = searchParams.get('update') === 'true'
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    organization: '',
    designation: '',
    experience: '',
    linkedinUrl: '',
    expertise: '',
    interests: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch existing profile data when component mounts and session is available
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return

      console.log('Member Profile: User session:', session.user) // Debug log

      // If user is a partner, redirect to partner profile
      if (session.user?.userType === 'PARTNER') {
        console.log('Member Profile: Redirecting partner to partner profile') // Debug log
        router.push('/partner/complete-profile')
        return
      }

      try {
        const response = await fetch('/api/member/complete-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            console.log('Member Profile: Fetched user data:', data.user) // Debug log
            
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              organization: data.user.organization || '',
              designation: data.user.designation || '',
              experience: data.user.experience || '',
              linkedinUrl: data.user.linkedinUrl || '',
              expertise: data.user.expertise || '',
              interests: data.user.interests || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        // Don't show error to user, just use defaults
      }
    }

    if (session?.user?.email) {
      fetchProfileData()
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

    console.log('Submitting form data:', formData) // Debug log

    try {
      const response = await fetch('/api/member/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('API response:', data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile completed successfully!')
      
      // Show loading for a moment, then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
    // Note: Don't set isLoading to false in finally, we want it to stay true during redirect
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
              <svg className="w-10 h-10 animate-spin" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {success ? 'Profile Completed!' : 'Saving Your Profile...'}
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {success ? 'Redirecting to your dashboard...' : 'Please wait while we save your information'}
            </p>
            <div className="mt-6 flex justify-center">
              <div className="px-6 py-3 rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {success ? '🎉 Welcome to HR Evolve!' : '💾 Processing...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Welcome, {session.user?.name}</span>
              </div>
              <div className="sm:hidden flex items-center space-x-2 text-xs px-2 py-1 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-custom)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            {isUpdate ? 'Update Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
            {isUpdate 
              ? 'Update your professional information and keep your HR Evolve profile current.'
              : 'Join our exclusive HR community and unlock personalized experiences, networking opportunities, and cutting-edge insights.'
            }
          </p>
          <div className="mt-4 sm:mt-6 flex justify-center">
            <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                {isUpdate ? '✏️ Update your details!' : '🚀 Just a few details to get started!'}
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
          {/* Personal Information */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Personal Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl cursor-not-allowed opacity-60 text-sm sm:text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-secondary)'
                  }}
                  placeholder="Your email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
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

              <div className="space-y-2">
                <label htmlFor="linkedinUrl" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
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

          {/* Professional Information */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Professional Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="organization" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Organization/Company *
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  placeholder="Your company name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="designation" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Job Title/Designation *
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  placeholder="HR Manager, CEO, etc."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="experience" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Years of Experience *
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Select your experience range</option>
                  <option value="0-1">0-1 years (Fresh Graduate)</option>
                  <option value="2-5">2-5 years (Early Career)</option>
                  <option value="6-10">6-10 years (Mid-Level)</option>
                  <option value="11-15">11-15 years (Senior Level)</option>
                  <option value="16+">16+ years (Executive Level)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-3xl p-8 shadow-xl border hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}>
                <svg className="w-4 h-4" style={{ color: isDark ? '#000000' : '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Tell Us More About You
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="expertise" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Areas of Expertise
                </label>
                <textarea
                  id="expertise"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="e.g., Recruitment & Talent Acquisition, Performance Management, Training & Development, Employee Relations, Compensation & Benefits, HR Analytics..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--border-custom)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="interests" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Professional Interests & Goals
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="What HR topics, events, or professional development opportunities are you most interested in? What are your career goals?"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none"
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
                    <span>{isUpdate ? 'Updating Your Profile...' : 'Creating Your Profile...'}</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{isUpdate ? '✏️ Update Profile' : '🚀 Complete Profile & Join HR Evolve'}</span>
                    <span className="sm:hidden">{isUpdate ? '✏️ Update Profile' : '🚀 Complete Profile'}</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            🔒 Your information is secure and will only be used to personalize your HR Evolve experience
          </p>
        </div>
      </div>
    </div>
    </>
  )
}