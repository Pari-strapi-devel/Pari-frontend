'use client'

import { Suspense } from 'react'
import SearchPageContent from '@/components/search/SearchPageContent'
import { SearchResultsSkeleton } from '@/components/skeletons/ArticleSkeletons'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchPageContent />
    </Suspense>
  )
}
