'use client'

import { Suspense } from 'react'
import SearchPageContent from '@/components/search/SearchPageContent'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p>Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
