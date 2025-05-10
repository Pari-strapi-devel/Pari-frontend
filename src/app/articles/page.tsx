import { Suspense } from 'react'
import ArticlesContent from '@/components/articles/ArticlesContent'
import { Header } from '@/components/layout/header/Header'

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-[1232px] mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Articles</h1>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <p>Loading articles...</p>
          </div>
        </main>
      </div>
    }>
      <ArticlesContent />
    </Suspense>
  )
}
