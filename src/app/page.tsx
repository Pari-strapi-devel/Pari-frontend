"use client"

import { Suspense, useEffect } from "react"
import confetti from "canvas-confetti"

import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '@/components/layout/weekOn/WeekOnCard'
import { PariLibrary } from '@/components/layout/pariLibrary/PariLibrary'
import { MakeInIndiaCard as MakeInIndiaCard } from '@/components/layout/makeInIndia/MakeInIndiaCard'
import StoriesPage from '@/components/layout/pariRecommends/page'
import './globals.css'

// import { PariLibraryStory } from '@/components/layout/pariLibrary/PariLibraryStory'
import { AudioVideoCard } from '@/components/layout/audioVideo/AudioVideoCard'
import { HomeCardSkeleton, LibraryGridSkeleton, AudioVideoCardSkeleton, HeroSectionSkeleton } from '@/components/skeletons/ArticleSkeletons'

function HomeContent() {

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = sessionStorage.getItem('pari-welcomed')

    if (!hasVisited) {
      // Fire confetti for first-time visitors
      const fireConfetti = () => {
        // First burst - center
        confetti({
          particleCount: 400,
          spread: 90,
          origin: { x: 0.5, y: 0.3 }
        })

        // Side bursts after small delay
        setTimeout(() => {
          confetti({
            particleCount: 400,
            angle: 50,
            spread: 90,
            origin: { x: 0, y: 0.7 }
          })
          confetti({
            particleCount: 400,
            angle: 120,
            spread: 80,
            origin: { x: 1, y: 0.7 }
          })
        }, 900)
      }

      // Small delay to let page load
      setTimeout(fireConfetti, 700)

      // Mark as visited
      sessionStorage.setItem('pari-welcomed', 'true')
    }
  }, [])

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
  return (
    <Suspense fallback={<HeroSectionSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}


