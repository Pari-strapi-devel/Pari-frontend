"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Presentation } from 'lucide-react'

export function WeekOnHeader() {
  

  return (
    <div className="container mx-auto px-4">
      <div className="flex  gap-4 sm:flex-row sm:items-center justify-between py-6">
        <div className="flex flex-col gap-2">
         
          <div className="flex items-center gap-3">
            <Presentation className="h-6 w-6 text-red-600" />
            <h2 className="text-[13px] text-gray-400 font-noto-sans font-semibold leading-[100%] tracking-[-0.02em] align-middle uppercase">
              This week on PARI
            </h2>
          </div>
          
          
        </div>
        
        <div className="flex items-center">
        <Button 
            variant="secondary" 
            className="h-[32px] cursor-pointer rounded-2xl flex items-center gap-1"
            onClick={() => {
              // Add your jump to stories logic here
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
            }}
          >
            See all stories
            <ChevronRight className="h-4 w-4  rounded-2xl" />
          </Button>
        </div>
      </div>
      
      
    </div>
  )
}