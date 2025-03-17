

import * as React from "react"
import { Header } from "@/components/layout/header/Header"
import { Hero } from "@/components/layout/hero/Hero"
import { WeekOnCard } from '../components/layout/weekOn/WeekOnCard';
import './globals.css'
import { LanguageToggle } from '../components/layout/header/LanguageToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WeekOnCard />
      <LanguageToggle></LanguageToggle>
      <main className="container mx-auto px-4 py-8">
        {/* Other content */}
      </main>
    </div>
  )
}


