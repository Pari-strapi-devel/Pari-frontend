import { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Footer } from '@/components/layout/footer/Footer'

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
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
