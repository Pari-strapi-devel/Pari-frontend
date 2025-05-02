"use client"

import { useKeenSlider } from 'keen-slider/react'
import { useState, useEffect } from 'react'
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
  breakpoints
}: CarouselProps) {
  const [, setCurrentSlide] = useState(0)
  const [, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: {
      perView: slides.perView,
      spacing: slides.spacing,
    },
    breakpoints: breakpoints,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
  })

  // Add cleanup
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        instanceRef.current.destroy()
      }
    }
  }, [instanceRef])

  return (
    <div className="relative max-w-[1234px] mx-auto h-full">
      {/* Overflow hidden wrapper */}
      <div className="relative  !overflow-visible">
        <div 
          ref={sliderRef} 
          className={cn(
            "keen-slider relative !overflow-visible scrollbar-none",
            className
          )}
        >
          {children}
        </div>
      </div>
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
    <div className={cn("keen-slider__slide relative !overflow-visible", className)}>
      {children}
    </div>
  )
}
