"use client"

import { useKeenSlider } from 'keen-slider/react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'keen-slider/keen-slider.min.css'

interface CarouselProps {
  children: React.ReactNode
  className?: string
  slides?: {
    perView?: number
    spacing?: number
  }
  breakpoints?: {
    [key: string]: {
      slides: {
        perView: number
        spacing: number
      }
    }
  }
}

export function Carousel({ 
  children, 
  className,
  slides = { perView: 1, spacing: 16 },
  breakpoints = {
    '(min-width: 640px)': {
      slides: { perView: 2, spacing: 20 },
    },
    '(min-width: 768px)': {
      slides: { perView: 2.5, spacing: 24 },
    },
    '(min-width: 1024px)': {
      slides: { perView: 3, spacing: 24 },
    },
    '(min-width: 1280px)': {
      slides: { perView: 2, spacing: 24 },
    },
  }
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
    slides,
    breakpoints,
  })

  return (
    <div className="relative overflow-hidden">
      {/* Carousel Container */}
      <div className={cn("keen-slider", className)} ref={sliderRef}>
        {children}
      </div>

      {/* Navigation Arrows */}
      {loaded && instanceRef.current && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              instanceRef.current?.prev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white disabled:opacity-0"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              instanceRef.current?.next()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white disabled:opacity-0"
            disabled={
              currentSlide ===
              (instanceRef.current.track.details?.slides.length ?? 0) - 1
            }
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {loaded && instanceRef.current && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(instanceRef.current.track.details?.slides.length)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                currentSlide === idx ? "bg-red-600" : "bg-gray-300"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CarouselItem({ 
  children,
  className 
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("keen-slider__slide", className)}>
      {children}
    </div>
  )
}