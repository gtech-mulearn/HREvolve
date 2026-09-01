import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import ThemeToggle from '../theme-toggle'
import AdminNav from './_components/AdminNav'
import AdminUserMenu from './_components/AdminUserMenu'
import { ToastProvider } from './_components/Toast'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HOST')) {
    redirect('/')
  }

  const isAdmin = session.user.role === 'ADMIN'

  return (
    <ToastProvider>
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <header
          className="sticky top-0 z-50 border-b transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-custom)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4 gap-4">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                  <Image
                    src="https://raw.githubusercontent.com/Gourav61/webhr/main/logo.png"
                    alt="HR Evolve Logo"
                    width={34}
                    height={34}
                    className="keep-colors"
                  />
                  <span className="font-bold text-base hidden md:block whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    HR Evolve
                  </span>
                </Link>
                <div className="h-6 w-px hidden sm:block" style={{ backgroundColor: 'var(--border-custom)' }} />
                <AdminNav isAdmin={isAdmin} />
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <AdminUserMenu name={session.user.name} email={session.user.email} role={session.user.role!} />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </ToastProvider>
  )
}
