import { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Footer } from '@/components/layout/footer/Footer'
import { Suspense } from 'react'
import {
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Telugu,
  Noto_Sans_Tamil,
  Noto_Sans_Kannada,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Oriya,
  Noto_Sans_Malayalam,
  Noto_Sans_Gurmukhi,
  Noto_Nastaliq_Urdu
} from 'next/font/google';
import { Header } from '@/components/layout/header/Header'
import { LanguageToggle } from '@/components/layout/header/LanguageToggle'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { CanonicalAndHreflang } from '@/components/seo/CanonicalAndHreflang'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-noto-sans',
  axes: ['wdth'],
  display: 'swap'
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
  axes: ['wdth'],
  preload: true
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu', 'latin'],
 
  variable: '--font-noto-sans-telugu',
  display: 'swap',
  axes: ['wdth'],
  preload: true
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil', 'latin'],
 
  variable: '--font-noto-sans-tamil',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ['kannada', 'latin'],
 
  variable: '--font-noto-sans-kannada',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
 
  variable: '--font-noto-sans-bengali',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati', 'latin'],
 
  variable: '--font-noto-sans-gujarati',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansOriya = Noto_Sans_Oriya({
  subsets: ['oriya', 'latin'],
 
  variable: '--font-noto-sans-oriya',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam', 'latin'],
 
  variable: '--font-noto-sans-malayalam',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi', 'latin'],
 
  variable: '--font-noto-sans-gurmukhi',
  display: 'swap',
  preload: true,
  axes: ['wdth'],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'], // Nastaliq is used for Urdu, which is an Arabic script
  variable: '--font-noto-nastaliq-urdu',
  display: 'swap',
  preload: true,
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
      <CanonicalAndHreflang />
     </head>
      <body
        className={`${notoSans.variable} ${notoSansDevanagari.variable} ${notoSansTelugu.variable} ${notoSansTamil.variable} ${notoSansKannada.variable} ${notoSansBengali.variable} ${notoSansGujarati.variable} ${notoSansOriya.variable} ${notoSansMalayalam.variable} ${notoSansGurmukhi.variable} ${notoNastaliqUrdu.variable} font-noto antialiased`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <GoogleAnalytics />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
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

          {/* Floating Language Toggle Button */}
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
