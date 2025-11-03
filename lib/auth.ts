import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // Check if user account is active (email verified)
        // Only require verification if email verification is enabled
        const emailVerificationEnabled = process.env.SMTP_USER && process.env.SMTP_PASS
        if (emailVerificationEnabled && !user.isActive) {
          throw new Error('Please verify your email address before signing in')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.userType = token.userType
        
        // Fetch additional user data including profileCompleted and userType
        if (session.user.email) {
          try {
            const user = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { 
                profileCompleted: true,
                userType: true
              }
            })
            session.user.profileCompleted = user?.profileCompleted || false
            session.user.userType = user?.userType || 'MEMBER'
          } catch (error) {
            console.error('Failed to fetch user profile status:', error)
            session.user.profileCompleted = false
            session.user.userType = 'MEMBER'
          }
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allowed domains for redirect
      const allowedDomains = [
        'https://hrevolve.org',
        'https://hr-evolve-delta.vercel.app',
        'http://localhost:3000' // for local development
      ]
      
      // For sign-in redirects, go to home page and let client-side routing handle it
      if (url === baseUrl || url === '/') {
        return '/'
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      // Allow redirects to other allowed domains
      if (allowedDomains.includes(new URL(url).origin)) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/member/complete-profile',
  }
}