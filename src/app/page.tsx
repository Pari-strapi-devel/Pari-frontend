

import * as React from "react"
import { Suspense } from "react"

import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '../components/layout/weekOn/WeekOnCard'
import { PariLibrary } from '@/components/layout/pariLibrary/PariLibrary'
import { MakeInIndiaCard as MakeInIndiaCard } from '@/components/layout/makeInIndia/MakeInIndiaCard'
import StoriesPage from '../components/layout/pariRecommends/page'
import './globals.css'
import { LanguageToggle } from '../components/layout/header/LanguageToggle'
// import { PariLibraryStory } from '@/components/layout/pariLibrary/PariLibraryStory'
import { AudioVideoCard } from '@/components/layout/audioVideo/AudioVideoCard'

function HomeContent() {
  return (

    <div className="min-h-screen bg-background !scroll-y-auto">

      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Loading hero...</div>}>
        <Hero />
      </Suspense>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[200px]">Loading content...</div>}>
        <WeekOnCard />
      </Suspense>

      <div className="bg-[#EDEDED]  md:py-20 py-10 dark:bg-popover">
        <MakeInIndiaCard />
        <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">Loading stories...</div>}>
          <StoriesPage />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]">Loading library...</div>}>
          <PariLibrary />
        </Suspense>
        {/* <PariLibraryStory /> */}
      </div>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[200px]">Loading audio/video...</div>}>
        <AudioVideoCard />
      </Suspense>
      <Suspense fallback={<div>Loading language toggle...</div>}>
        <LanguageToggle />
      </Suspense>

    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}


