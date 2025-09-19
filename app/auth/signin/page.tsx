'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

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
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300 py-6 sm:py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--text-primary)' }}>
            <span className="text-white font-bold text-lg sm:text-xl">HR</span>
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Sign in to HR Evolve
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Or{' '}
            <Link href="/auth/signup" className="font-medium hover:underline transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:z-10 text-sm sm:text-base transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-custom)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:z-10 text-sm sm:text-base transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-custom)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className="text-green-600 text-xs sm:text-sm text-center p-3 rounded-md border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              {message}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-xs sm:text-sm text-center p-3 rounded-md border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-custom)' }}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-md text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 ease-out"
              style={{ backgroundColor: 'var(--text-primary)' }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-custom)' }} />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 text-gray-500" style={{ backgroundColor: 'var(--bg-primary)' }}>Or continue with</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center items-center py-3 sm:py-2 px-4 border rounded-lg sm:rounded-md shadow-sm text-sm sm:text-base font-medium hover:scale-105 transition-all duration-200 ease-out"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-custom)',
                  color: 'var(--text-primary)'
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}