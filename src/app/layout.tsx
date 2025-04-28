import { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Footer } from '@/components/layout/footer/Footer'
import { Noto_Sans } from 'next/font/google'
import { Suspense } from 'react'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
})

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
      <body className={`${notoSans.variable} font-noto-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
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
