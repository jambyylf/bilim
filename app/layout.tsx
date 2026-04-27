import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LangProvider } from '@/components/providers/LangProvider'

// Inter қарпі — Bilim дизайн жүйесінің негізгі қарпі
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        <ThemeProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
