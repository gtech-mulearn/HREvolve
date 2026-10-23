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

const SITE_DESCRIPTION =
  "HR Evolve is Kerala's community for HR professionals - monthly sessions, the Elevate HR conclave and chapters in Trivandrum, Kochi and Kozhikode."

export const metadata: Metadata = {
  metadataBase: new URL('https://hrevolve.org'),
  title: {
    default: 'HR Evolve',
    template: '%s | HR Evolve',
  },
  description: SITE_DESCRIPTION,
  keywords: ['HR Evolve', 'HR community Kerala', 'Elevate HR conclave', 'HR events Trivandrum', 'HR events Kochi', 'HR events Kozhikode'],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'HR Evolve',
    locale: 'en_IN',
    title: 'HR Evolve',
    description: SITE_DESCRIPTION,
    images: [{ url: '/elevate_new.jpg', width: 1200, height: 630, alt: 'HR Evolve - Elevate HR conclave' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR Evolve',
    description: SITE_DESCRIPTION,
    images: ['/elevate_new.jpg'],
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