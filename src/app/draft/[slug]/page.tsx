'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import StoryDetail from '../../../components/story/StoryDetail'
import { StoryDetailSkeleton } from '@/components/skeletons/PageSkeletons'

function DraftContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const rawSlug = params?.slug as string

  // Decode the slug to handle non-English characters (e.g., Marathi, Hindi, etc.)
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  // Force re-render when locale changes by including it in a key
  const locale = searchParams?.get('locale') || 'en'
  const key = `${slug}-${locale}-draft`

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Invalid draft URL</p>
        </div>
      </div>
    )
  }

  // Use publicationState="preview" to fetch draft/unpublished articles
  return <StoryDetail key={key} slug={slug} publicationState="preview" />
}

export default function DraftPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Draft indicator banner */}
      <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
        📝 Draft Preview - This content is not published yet
      </div>
      <Suspense fallback={<StoryDetailSkeleton />}>
        <DraftContent />
      </Suspense>
    </div>
  )
}

