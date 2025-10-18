import { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Footer } from '@/components/layout/footer/Footer'
import { Suspense } from 'react'
import { Noto_Sans, Noto_Serif, Noto_Sans_Devanagari } from 'next/font/google';
import { Header } from '@/components/layout/header/Header'

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
  preload: true
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
  preload: true
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto-serif'
});

export const metadata: Metadata = {
  title: {
    template: '%s - PARI',
    default: 'PARI - People\'s Archive of Rural India',
  },
  description: 'Stories from rural India',
  icons: {
    icon: '/favicon.ico',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
     <head>
      <meta name="algolia-site-verification"  content="F5CD6E39238D1785" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
     </head>
      <body
        className={`${notoSans.className} ${notoSerif.variable} ${notoSansDevanagari.variable} font-noto antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <Suspense fallback={
            <div className="h-[88px] bg-white dark:bg-background border-b border-border">
              <div className="container mx-auto px-4 max-w-[1282px] h-full flex items-center justify-center">
                Loading header...
              </div>
            </div>
          }>
            <Header />
          </Suspense>
          {children}
          <Suspense fallback={
            <div className="bg-white dark:bg-popover text-card-foreground px-5 py-8 sm:py-12 md:py-16">
              <div className="max-w-[1232px] mx-auto px-4">Loading footer...</div>
            </div>
          }>
            <Footer />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
