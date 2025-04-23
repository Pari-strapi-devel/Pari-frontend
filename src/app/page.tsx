

import * as React from "react"
import { Suspense } from "react"
import { Header } from "@/components/layout/header/Header"
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
      <Header />
      <Hero />
      <WeekOnCard />
   
      <div className="bg-[#EDEDED] md:py-10 py-8 dark:bg-popover">
        <MakeInIndiaCard />
        <StoriesPage />
      </div>
      <div>
        <PariLibrary />
        {/* <PariLibraryStory /> */}
      </div>
      <AudioVideoCard />
      <LanguageToggle />
      <main className="container mx-auto px-4 py-8">
        {/* Other content */}
      </main>
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


