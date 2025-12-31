'use client'

import { usePathname } from 'next/navigation'
import { languages } from '@/data/languages'

interface CanonicalAndHreflangProps {
  /**
   * Base URL for the site (e.g., 'https://ruralindiaonline.org')
   */
  baseUrl?: string
  /**
   * Available language versions for this page (array of locale codes)
   * If not provided, will use all supported languages
   */
  availableLanguages?: string[]
  /**
   * Custom canonical URL (if different from current URL)
   */
  customCanonical?: string
}

/**
 * Component that generates canonical and hreflang tags for SEO
 * 
 * Features:
 * - Self-referencing canonical tag
 * - hreflang tags for all available language versions
 * - x-default tag for global fallback (English)
 * - Absolute URLs with https scheme
 */
export function CanonicalAndHreflang({
  baseUrl = 'https://ruralindiaonline.org',
  availableLanguages,
  customCanonical
}: CanonicalAndHreflangProps) {
  const pathname = usePathname()

  // Build the canonical URL (without locale parameter for clean URLs)
  const canonicalPath = pathname || '/'
  const canonicalUrl = customCanonical || `${baseUrl}${canonicalPath}`

  // Get all supported language codes
  const allLanguageCodes = languages.map(lang => lang.code)
  
  // Use provided languages or all supported languages
  const languagesToInclude = availableLanguages || allLanguageCodes

  // Build hreflang URLs with locale prefix in path
  const hreflangUrls = languagesToInclude.map(langCode => {
    // Use path-based locale (e.g., /hi/page instead of /page?locale=hi)
    const localePath = langCode === 'en'
      ? canonicalPath
      : `/${langCode}${canonicalPath}`
    return {
      lang: langCode,
      url: `${baseUrl}${localePath}`
    }
  })

  return (
    <>
      {/* Canonical tag - self-referencing */}
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang tags for each language version */}
      {hreflangUrls.map(({ lang, url }) => (
        <link
          key={`hreflang-${lang}`}
          rel="alternate"
          hrefLang={lang}
          href={url}
        />
      ))}

      {/* x-default for global fallback (English version) */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}${canonicalPath}`}
      />
    </>
  )
}

