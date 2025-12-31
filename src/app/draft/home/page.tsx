"use client"

import { Suspense } from "react"

import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '@/components/layout/weekOn/WeekOnCard'
import { PariLibrary } from '@/components/layout/pariLibrary/PariLibrary'
import { MakeInIndiaCard } from '@/components/layout/makeInIndia/MakeInIndiaCard'
import StoriesPage from '@/components/layout/pariRecommends/page'
import { AudioVideoCard } from '@/components/layout/audioVideo/AudioVideoCard'
import { HomeCardSkeleton, LibraryGridSkeleton, AudioVideoCardSkeleton, HeroSectionSkeleton } from '@/components/skeletons/ArticleSkeletons'

function DraftHomeContent() {
  return (
    <div className="min-h-screen bg-background !scroll-y-auto">
      {/* Draft Preview Banner */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3 text-center">
        <p className="text-yellow-800 font-medium">
          📝 Draft Preview - This content is not published yet
        </p>
      </div>

      <Suspense fallback={<HeroSectionSkeleton />}>
        <Hero publicationState="preview" />
      </Suspense>
      <Suspense fallback={<HomeCardSkeleton />}>
        <WeekOnCard publicationState="preview" />
      </Suspense>

      <div className="bg-[#EDEDED] md:py-20 py-10 dark:bg-popover">
        <MakeInIndiaCard publicationState="preview" />
        <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8"><HomeCardSkeleton /></div>}>
          <StoriesPage publicationState="preview" />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-8"><LibraryGridSkeleton /></div>}>
          <PariLibrary publicationState="preview" />
        </Suspense>
      </div>
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-8"><AudioVideoCardSkeleton /></div>}>
        <AudioVideoCard publicationState="preview" />
      </Suspense>
    </div>
  )
}

export default function DraftHome() {
  return (
    <Suspense fallback={<HeroSectionSkeleton />}>
      <DraftHomeContent />
    </Suspense>
  )
}

