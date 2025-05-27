"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

export function useLocale() {
  const router = useRouter()
  const searchparams = useSearchParams()
  const pathname = usePathname()
  
  const language = useMemo(() => {
    const locale = searchparams?.get('locale')
    if (locale) {
      return locale
    }
    return 'en'
  }, [searchparams])

  const setLanguage = useCallback((locale: string) => {
    const searchParams = new URLSearchParams(searchparams?.toString() || '')
    searchParams.set('locale', locale)
    const newPathName = pathname || '/'
    router.push(newPathName + '?' + searchParams.toString())
  }, [router, pathname, searchparams])

  return {
    language,
    setLanguage
  }
}
