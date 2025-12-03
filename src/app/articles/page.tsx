'use client'

import { Suspense } from 'react'
import ArticlesContent from '@/components/articles/ArticlesContent'

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
            </div>
          </div>
        }>
          <ArticlesContent />
        </Suspense>
      </div>
    </div>
  )
}
