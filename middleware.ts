import { withAuth } from "next-auth/middleware"

// Only runs for the signed-in areas listed in `config.matcher` - public pages and
// public APIs never hit the middleware. All matched routes just need a valid session.
//
// The actual role check (ADMIN/HOST) for /admin is done in app/admin/layout.tsx via
// getServerSession, not here - the JWT's `role` claim only refreshes on login, so
// gating on it at the edge would keep a user who was just promoted via /admin/users
// locked out until they sign out and back in. Admin API routes check roles
// themselves via requireAdminSession.
//
// Dashboard and profile-completion redirects (member vs partner, incomplete profile)
// are handled client-side, since Prisma doesn't run on the Edge Runtime.
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/member/:path*',
    '/partner/:path*',
    '/api/admin/:path*',
    '/api/member/:path*',
    '/api/partner/:path*',
  ],
}
