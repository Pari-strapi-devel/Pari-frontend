import { Skeleton } from "@/components/ui/skeleton"

// Article grid skeleton (for articles listing page)
export function ArticleGridSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 animate-pulse">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Filters/Search */}
        <div className="mb-8 flex gap-4 animate-pulse">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-48" />
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="animate-pulse">
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Search results skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-10 md:py-20 md:px-20 px-8">
        {/* Search Header */}
        <div className="mb-8 animate-pulse">
          <Skeleton className="h-12 w-full max-w-2xl mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Results */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex gap-4 animate-pulse">
              <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Home page card skeletons
export function HomeCardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <Skeleton className="w-full h-64 sm:h-80 md:h-96 rounded-lg mb-4" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

// Hero section skeleton with header
export function HeroSectionSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="main-header-section bg-white dark:bg-popover md:py-8 py-5 border-b border-border dark:border-borderline">
        <div className="container mx-auto px-4 top-0 max-w-[1282px]">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-col items-center -mt-1 mx-auto animate-pulse">
              {/* Date Skeleton */}
              <div className="max-w-[1232px] mx-auto px-6 mb-2">
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Logo Skeleton */}
              <div className="flex items-center justify-center mb-2">
                <Skeleton className="w-[250px] h-[100px] sm:w-[280px] sm:h-[100px] md:w-[300px] md:h-[100px] lg:w-[350px] lg:h-[120px]" />
              </div>

              {/* Tagline Skeleton */}
              <div className="text-center mt-2">
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content Skeleton */}
      <div className="relative px-4 pt-10 md:pt-20">
        <div className="shadow-[0px_1px_6px_0px_rgba(0,0,0,0.12)] rounded-[12px] bg-popover sm:w-[90%] max-w-[1232px] mx-auto">
          <div className="p-6 sm:p-6 md:p-8 lg:p-10 relative">
            {/* Dismiss button skeleton */}
            <div className="flex justify-between mb-7 animate-pulse">
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Title skeleton */}
            <div className="mb-8 animate-pulse">
              <Skeleton className="h-12 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </div>

          {/* Slider skeleton */}
          <div className="relative max-w-[1232px] h-fit mb-8 mx-auto md:px-10 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse">
                  <Skeleton className="w-full h-[170px] rounded-lg mb-4" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>

            {/* Dots skeleton */}
            <div className="flex justify-center gap-2 mt-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-2 w-2 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Library grid skeleton
export function LibraryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="animate-pulse">
          <Skeleton className="w-full h-56 rounded-lg mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  )
}

// Audio/Video card skeleton
export function AudioVideoCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse">
          <Skeleton className="w-full h-64 rounded-lg mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

