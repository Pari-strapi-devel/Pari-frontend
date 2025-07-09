'use client'

import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import StoryDetail from '../../../components/story/StoryDetail'

// This could be enhanced to generate metadata dynamically
// export async function generateMetadata({ params }: { params: { slug: string } }) {
//   return {
//     title: `${params.slug} - PARI`,
//     description: 'Story from PARI - People\'s Archive of Rural India'
//   }
// }

export default function StoryPage() {
  const params = useParams()
  const slug = params?.slug as string

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Invalid story URL</p>
        </div>
      </div>
    )
  }

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
        <StoryDetail slug={slug} />
      </Suspense>
    </div>
  )
}
