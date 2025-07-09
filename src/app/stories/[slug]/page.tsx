'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StorySlugPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  
  useEffect(() => {
    // Redirect to article page with the same slug
    if (slug) {
      router.replace(`/article/${slug}`)
    }
  }, [slug, router])
  
  return null
}
