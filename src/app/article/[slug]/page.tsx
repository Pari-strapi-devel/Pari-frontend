'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import StoryDetail from '../../../components/story/StoryDetail'
import { StoryDetailSkeleton } from '@/components/skeletons/PageSkeletons'

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
  const rawSlug = params?.slug as string

  // Decode the slug to handle non-English characters (e.g., Marathi, Hindi, etc.)
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  // Force re-render when locale changes by including it in a key
  const locale = searchParams?.get('locale') || 'en'
  const key = `${slug}-${locale}`

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
      <Suspense fallback={<StoryDetailSkeleton />}>
        <StoryContent />
      </Suspense>
    </div>
  )
}
