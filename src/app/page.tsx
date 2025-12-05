

import * as React from "react"
import { Suspense } from "react"

import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '@/components/layout/weekOn/WeekOnCard'
import { PariLibrary } from '@/components/layout/pariLibrary/PariLibrary'
import { MakeInIndiaCard as MakeInIndiaCard } from '@/components/layout/makeInIndia/MakeInIndiaCard'
import StoriesPage from '@/components/layout/pariRecommends/page'
import './globals.css'

// import { PariLibraryStory } from '@/components/layout/pariLibrary/PariLibraryStory'
import { AudioVideoCard } from '@/components/layout/audioVideo/AudioVideoCard'
import { HomeCardSkeleton, LibraryGridSkeleton, AudioVideoCardSkeleton, HeroSectionSkeleton } from '@/components/skeletons/ArticleSkeletons'

// Force dynamic rendering to prevent SSR issues with useSearchParams
export const dynamic = 'force-dynamic'

function HomeContent() {
  return (

    <div className="min-h-screen bg-background !scroll-y-auto">

      <Suspense fallback={<HeroSectionSkeleton />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<HomeCardSkeleton />}>
        <WeekOnCard />
      </Suspense>

      <div className="bg-[#EDEDED]  md:py-20 py-10 dark:bg-popover">
        <MakeInIndiaCard />
        <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8"><HomeCardSkeleton /></div>}>
          <StoriesPage />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-8"><LibraryGridSkeleton /></div>}>
          <PariLibrary />
        </Suspense>
        {/* <PariLibraryStory /> */}
      </div>
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-8"><AudioVideoCardSkeleton /></div>}>
        <AudioVideoCard />
      </Suspense>


    </div>
  )
}

export default function Home() {
  return <HomeContent />
}


