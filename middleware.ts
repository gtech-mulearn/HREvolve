import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    // Allow access to auth routes, API routes, and home page
    if (req.nextUrl.pathname.startsWith('/auth') || 
        req.nextUrl.pathname.startsWith('/api') ||
        req.nextUrl.pathname === '/' ||
        req.nextUrl.pathname.startsWith('/events')) {
      return NextResponse.next()
    }
    
    // For authenticated users, we'll rely on client-side validation
    // since Prisma doesn't work on Edge Runtime in middleware
    
    // Allow access to profile completion routes
    if (req.nextUrl.pathname.startsWith('/member/complete-profile') ||
        req.nextUrl.pathname.startsWith('/partner/complete-profile')) {
      return NextResponse.next()
    }
    
    // Allow access to dashboard routes - client-side validation will handle redirects
    if (req.nextUrl.pathname === '/dashboard' ||
        req.nextUrl.pathname.startsWith('/partner/dashboard')) {
      return NextResponse.next()
    }
    
    // For other protected routes, continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow unauthenticated access to public pages
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname.startsWith('/auth') ||
            req.nextUrl.pathname.startsWith('/events') ||
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }
        
        // Allow access to profile completion pages for authenticated users
        if ((req.nextUrl.pathname.startsWith('/member/complete-profile') ||
             req.nextUrl.pathname.startsWith('/partner/complete-profile')) && token) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
}