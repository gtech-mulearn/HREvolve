'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '../../theme-provider'
import ThemeToggle from '../../theme-toggle'
import Link from 'next/link'
import Image from 'next/image'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage === 'verify-email') {
      setMessage('Account created successfully! Please check your email and click the verification link to activate your account.')
    } else if (urlMessage === 'verified') {
      setMessage('Email verified successfully! You can now sign in to your account.')
    } else if (urlMessage === 'already-verified') {
      setMessage('Your email has already been verified! You can sign in to your account.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue your HR journey
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 focus:z-10 text-sm transition-all duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 focus:z-10 text-sm transition-all duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {message && (
                <div className="text-green-600 text-sm text-center p-4 rounded-2xl border-2 border-green-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{message}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center p-4 rounded-2xl border-2 border-red-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-6 border-2 border-transparent text-base font-semibold rounded-2xl text-white hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 ease-out shadow-xl hover:shadow-2xl"
                  style={{ 
                    backgroundColor: isDark ? '#ffffff' : '#000000', 
                    color: isDark ? '#000000' : '#ffffff'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>Sign In</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Account creation link moved here */}
              <div className="text-center pt-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="font-semibold hover:underline transition-all duration-300 hover:scale-105 inline-block" 
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Create one here
                  </Link>
                </p>
              </div>

              <div className="pt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2" style={{ borderColor: 'var(--border-custom)' }} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-6 py-2 font-medium rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full inline-flex justify-center items-center py-4 px-6 border-2 rounded-2xl shadow-xl text-base font-semibold hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-2xl"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-custom)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-4">Continue with Google</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}