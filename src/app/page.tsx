

import * as React from "react"
import { Header } from "@/components/layout/header/Header"
import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '../components/layout/weekOn/WeekOnCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WeekOnCard />
      <main className="container mx-auto px-4 py-8">
        {/* Other content */}
      </main>
    </div>
  )
}


