import { Skeleton } from "@/components/ui/skeleton"

// Generic page skeleton with title and content
export function GenericPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-10 md:py-20 px-4 sm:px-8 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <Skeleton className="h-12 sm:h-14 md:h-16 w-3/4" />
            <Skeleton className="h-6 sm:h-7 md:h-8 w-full max-w-3xl" />
          </div>

          {/* Content blocks */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Team page skeleton
export function TeamPageSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-pulse">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="animate-pulse">
              <Skeleton className="w-full h-[200px] sm:h-[240px] lg:h-[268px] rounded-lg mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Form page skeleton (for contribute, intern, volunteer, donate)
export function FormPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-10 md:py-20 px-4 sm:px-8 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-40">
          {/* Left Content */}
          <div className="animate-pulse space-y-8">
            <div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-8" />
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-2/3" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-popover dark:bg-popover p-4 sm:p-6 md:p-8 rounded-lg shadow-sm border border-border">
            <div className="animate-pulse space-y-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />
              
              {/* Form fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Story/Article detail skeleton
export function StoryDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header info */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Title */}
          <Skeleton className="h-16 w-full" />

          {/* Strap */}
          <Skeleton className="h-6 w-5/6" />

          {/* Author info */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Featured image */}
          <Skeleton className="h-96 w-full rounded-lg" />

          {/* Content */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Painting detail skeleton
export function PaintingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* Back Button */}
          <Skeleton className="h-6 w-32" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image/Video */}
            <div className="space-y-4">
              {/* Main Image/Video Area */}
              <Skeleton className="w-full h-[400px] rounded-lg" />

              {/* Navigation and Thumbnails */}
              <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <Skeleton className="w-12 h-12 rounded-full" />

                {/* Thumbnails */}
                <div className="flex gap-3">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <Skeleton className="w-24 h-24 rounded-lg" />
                </div>

                {/* Next Button */}
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Artist Details */}
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => (
                  <div key={item} className="flex gap-8 pb-2 border-b">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 flex-1" />
                  </div>
                ))}
              </div>

              {/* Translation/Description */}
              <div className="p-6 rounded-lg border-l-4 border-primary-PARI-Red">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

