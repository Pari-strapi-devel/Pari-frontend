"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useEffect } from "react"

// Language configuration for styling control
const LANGUAGE_CONFIG = {
  en: { lang: 'en', dir: 'ltr' as const, fontClass: 'font-noto' },
  hi: { lang: 'hi', dir: 'ltr' as const, fontClass: 'font-noto-devanagari' },
  mr: { lang: 'mr', dir: 'ltr' as const, fontClass: 'font-noto-devanagari' },
  te: { lang: 'te', dir: 'ltr' as const, fontClass: 'font-noto-telugu' },
  ta: { lang: 'ta', dir: 'ltr' as const, fontClass: 'font-noto-tamil' },
  kn: { lang: 'kn', dir: 'ltr' as const, fontClass: 'font-noto-kannada' },
  bn: { lang: 'bn', dir: 'ltr' as const, fontClass: 'font-noto-bengali' },
  gu: { lang: 'gu', dir: 'ltr' as const, fontClass: 'font-noto-gujarati' },
  or: { lang: 'or', dir: 'ltr' as const, fontClass: 'font-noto-oriya' },
  ml: { lang: 'ml', dir: 'ltr' as const, fontClass: 'font-noto-malayalam' },
  pa: { lang: 'pa', dir: 'ltr' as const, fontClass: 'font-noto-gurmukhi' },
  ur: { lang: 'ur', dir: 'rtl' as const, fontClass: 'font-noto-nastaliq-urdu' },
  ar: { lang: 'ar', dir: 'rtl' as const, fontClass: 'font-noto-nastaliq-urdu' },
  as: { lang: 'as', dir: 'ltr' as const, fontClass: 'font-noto-bengali' },
  bho: { lang: 'bho', dir: 'ltr' as const, fontClass: 'font-noto-devanagari' },
  hne: { lang: 'hne', dir: 'ltr' as const, fontClass: 'font-noto-devanagari' }
} as const

type LanguageCode = keyof typeof LANGUAGE_CONFIG

// Helper functions for language styling
export function getLanguageConfig(locale: string) {
  return LANGUAGE_CONFIG[locale as LanguageCode] || LANGUAGE_CONFIG.en
}

export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return getLanguageConfig(locale).dir
}

export function getFontClass(locale: string): string {
  return getLanguageConfig(locale).fontClass
}

export function getLangAttribute(locale: string): string {
  return getLanguageConfig(locale).lang
}

export function isRTL(locale: string): boolean {
  return getTextDirection(locale) === 'rtl'
}

export function useLocale() {
  const router = useRouter()
  const searchparams = useSearchParams()
  const pathname = usePathname()

  const language = useMemo(() => {
    const locale = searchparams?.get('locale')
    console.log('##Rohit_Rocks## Current locale from URL:', locale);
    if (locale) {
      return locale
    }
    return 'en'
  }, [searchparams])

  const setLanguage = useCallback((locale: string) => {
    console.log('##Rohit_Rocks## Setting language to:', locale);
    const searchParams = new URLSearchParams(searchparams?.toString() || '')
    searchParams.set('locale', locale)
    const newPathName = pathname || '/'
    const newUrl = newPathName + '?' + searchParams.toString();
    console.log('##Rohit_Rocks## Navigating to:', newUrl);
    router.push(newUrl)
  }, [router, pathname, searchparams])

  // Helper function to add locale to any URL
  const addLocaleToUrl = useCallback((url: string) => {
    const locale = searchparams?.get('locale')
    if (!locale || locale === 'en') {
      return url
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      const urlObj = new URL(url, origin)
      urlObj.searchParams.set('locale', locale)
      return urlObj.pathname + urlObj.search
    } catch {
      // If URL parsing fails, append locale as query param
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}locale=${locale}`
    }
  }, [searchparams])

  // Apply lang and dir attributes to html element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement
      const langAttr = getLangAttribute(language)
      const dir = getTextDirection(language)

      htmlElement.setAttribute('lang', langAttr)
      htmlElement.setAttribute('dir', dir)

      console.log('##Rohit_Rocks## Language attributes applied:', { locale: language, lang: langAttr, dir })
    }
  }, [language])

  return {
    language,
    setLanguage,
    isLocaleSet: !!searchparams?.get('locale'),
    addLocaleToUrl,
    // Language styling helpers
    dir: getTextDirection(language),
    fontClass: getFontClass(language),
    langAttr: getLangAttribute(language),
    isRTL: isRTL(language)
  }
}

// Standalone helper function to add locale to URL (for use outside of React components)
export function addLocaleToUrl(url: string, locale?: string): string {
  if (!locale || locale === 'en') {
    return url
  }

  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    urlObj.searchParams.set('locale', locale)
    return urlObj.pathname + urlObj.search
  } catch {
    // If URL parsing fails, append locale as query param
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}locale=${locale}`
  }
}
