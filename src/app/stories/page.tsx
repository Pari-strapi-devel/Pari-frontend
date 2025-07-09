'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StoriesPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to articles page
    router.replace('/articles')
  }, [router])
  
  return null
}
