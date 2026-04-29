import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LangProvider } from '@/components/providers/LangProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
    { media: '(prefers-color-scheme: dark)',  color: '#1E3A8A' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Bilim — Қазақстандағы №1 онлайн оқу платформасы',
    template: '%s | Bilim',
  },
  description:
    'Қазақстанның үздік спикерлерінен курстар. Өз қарқыныңызда үйреніңіз — қазақ, орыс немесе ағылшын тілінде.',
  keywords: ['онлайн курс', 'Қазақстан', 'білім', 'курс', 'онлайн оқу', 'bilim', 'казахстан курсы'],
  authors: [{ name: 'Bilim Platform' }],
  creator: 'Bilim Platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bilim',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'kk_KZ',
    alternateLocale: ['ru_RU', 'en_US'],
    siteName: 'Bilim',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* PWA — iOS Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bilim" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#1E3A8A" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased" style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
