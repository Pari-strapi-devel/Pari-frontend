'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import StoryDetail from '../../../components/story/StoryDetail'

// This could be enhanced to generate metadata dynamically
// export async function generateMetadata({ params }: { params: { slug: string } }) {
//   return {
//     title: `${params.slug} - PARI`,
//     description: 'Story from PARI - People\'s Archive of Rural India'
//   }
// }

function StoryContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string

  // Force re-render when locale changes by including it in a key
  const locale = searchParams?.get('locale') || 'en'
  const key = `${slug}-${locale}`

  console.log('##Rohit_Rocks## StoryContent rendering with slug:', slug, 'locale:', locale, 'key:', key)

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Invalid story URL</p>
        </div>
      </div>
    )
  }

  return <StoryDetail key={key} slug={slug} />
}

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
          </div>
        </div>
      }>
        <StoryContent />
      </Suspense>
    </div>
  )
}
