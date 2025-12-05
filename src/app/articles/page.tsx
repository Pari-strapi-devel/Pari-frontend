'use client'

import { Suspense } from 'react'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { ArticleGridSkeleton } from '@/components/skeletons/ArticleSkeletons'

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1232px] mx-auto px-4 py-8">
        <Suspense fallback={<ArticleGridSkeleton />}>
          <ArticlesContent />
        </Suspense>
      </div>
    </div>
  )
}
