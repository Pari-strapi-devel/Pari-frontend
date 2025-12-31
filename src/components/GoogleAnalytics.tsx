'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

/**
 * Google Analytics component for tracking website analytics
 *
 * Features:
 * - Loads Google Analytics gtag.js script
 * - Initializes GA with measurement ID from environment variable
 * - Only renders if GA_MEASUREMENT_ID is configured
 * - Uses Next.js Script component for optimal loading
 * - Excludes draft pages from tracking
 */
export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pathname = usePathname()

  // Don't render if no GA ID is configured
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  // Don't track draft pages
  if (pathname?.startsWith('/draft')) {
    return null
  }

  return (
    <>
      {/* Load Google Analytics script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      {/* Initialize Google Analytics */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

