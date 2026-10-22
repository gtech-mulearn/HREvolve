import './globals.css'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { ThemeProvider } from './theme-provider'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '700']
})

export const metadata: Metadata = {
  title: 'HR Evolve',
  description: 'Connect, Inspire, Transform: HR Leading the Way',
  icons: {
    icon: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${roboto.className} bg-primary text-primary transition-colors duration-300 ease-out m-0 p-0 leading-relaxed`}>
        <SessionProvider session={session}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}