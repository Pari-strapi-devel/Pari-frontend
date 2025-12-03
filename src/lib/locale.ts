"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

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

  return {
    language,
    setLanguage,
    isLocaleSet: !!searchparams?.get('locale'),
    addLocaleToUrl
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
