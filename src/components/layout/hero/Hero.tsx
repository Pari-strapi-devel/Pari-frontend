"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

const heroCards = [
  {
    id: 1,
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions",
    imageUrl: "/images/categories/category-img.png",
    category: "Rural India"
  },
  {
    id: 2,
    title: "Traditional Artisans",
    description: "The last remaining practitioners of dying art forms",
    imageUrl: "/images/categories/category-img.png",
    category: "Culture"
  },
  {
    id: 3,
    title: "Education Crisis",
    description: "The challenges of rural education during the pandemic",
    imageUrl: "/images/categories/category-img.png",
    category: "Education"
  },
  {
    id: 4,
    title: "Women Farmers",
    description: "Stories of women leading agricultural innovation",
    imageUrl: "/images/categories/category-img.png",
    category: "Agriculture"
  },
  {
    id: 5,
    title: "Indigenous Knowledge",
    description: "Traditional practices and their modern relevance",
    imageUrl: "/images/categories/category-img.png",
    category: "Heritage"
  }
]

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  }).toUpperCase();
};

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [visibleCards] = useState(heroCards)

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
    slides: {
      perView: 1.2,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: {
          perView: 2.2,
          spacing: 20,
        },
      },
      '(min-width: 768px)': {
        slides: {
          perView: 2.5,
          spacing: 24,
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 3.2,
          spacing: 24,
        },
      },
      '(min-width: 1280px)': {
        slides: {
          perView: 3.5,
          spacing: 24,
        },
      },
    },
  })

  if (!isVisible) return null;

  return (
    <section className="relative mt-20 bg-background">
      <div className='shadow-lg rounded-lg bg-popover w-[95%] sm:w-[90%] max-w-[1200px] mx-auto'>
      <div className="container mx-auto p-4  sm:p-6 md:p-8 lg:p-10 relative">
      <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="z-20  w-fit cursor-pointer   transition-all duration-200 text-red-600 rounded-full flex items-center gap-2  py-6 group"
        >
          <X className="h-4 w-4 cursor-pointer transition-transform duration-200" />
          <span className="text-sm font-medium">Dismiss</span>
        </Button>
        <div className="flex flex-col space-y-2">
          <span className="text-[15px] font-[600] leading-none tracking-[-0.02em] text-muted-foreground font-noto-sans align-middle uppercase">
            {getCurrentDate()}
          </span>
          <h2 className="text-3xl font-bold text-foreground">Welcome to PARI Let&apos;s get you acquainted</h2>
          <p className="text-lg text-muted-foreground"></p>
         <div className='flex justify-end pr-8'>
          <Button 
            variant="secondary" 
            className="h-[32px] cursor-pointer flex items-center gap-1"
            onClick={() => {
              // Add your jump to stories logic here
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
            }}
          >
            Jump to stories
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
          </div>
        </div>
      </div>

      <div>
      
        
        <div className="container mx-auto rounded-2xl sh px-2 pl-2 sm:px-4 md:px-0 py-4 sm:py-6 md:pb-8 relative">
          <div ref={sliderRef} className="keen-slider pl-6 overflow-visible">
            {visibleCards.map((card) => (
              <div
                key={card.id}
                className="keen-slider__slide cursor-pointer"
              >
                <div className="flex flex-col rounded-lg shadow-lg h-[300px] sm:h-[350px] md:h-[400px] bg-white dark:bg-popover hover:shadow-xl transition-shadow duration-200 relative group">
                  <div className="relative h-full w-full overflow-hidden rounded-lg">
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover rounded-lg top-0 cover h-full transition-transform duration-400 group-hover:scale-110 scale-102"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className=" bg-black/10 rounded-lg group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                  
                  <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow relative">
                    <span className="inline-block px-2 py-1 ring-1 ring-red-600 text-xs text-red-600 rounded-full w-fit mb-2">
                      {card.category}
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-foreground line-clamp-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{card.description}</p>
                    
                    {/* Read More Link */}
                    <div className="transform translate-y-4 flex items-center pt-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                      <span className="flex items-center justify-center text-red-600 font-medium">
                        <span>Read more</span>
                        <svg 
                          className="w-6 h-6 ml-1 flex items-center transform group-hover:translate-x-1 transition-transform duration-200" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          style={{ marginTop: '1px' }} // Fine-tune vertical alignment
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 8l4 4m0 0l-4 4m4-4H3" 
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none navigation-container" 
                 style={{
                   width: 'calc(100% + 40px)',
                   left: '-20px'
                 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.prev()
                }}
                className="pointer-events-auto bg-white/80 hover:bg-white text-red-600 shadow-lg rounded-full z-10 cursor-pointer w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.next()
                }}
                className="pointer-events-auto bg-white/80 hover:bg-white text-red-600 shadow-lg rounded-full z-10 cursor-pointer w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          )}

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
              {[...Array(visibleCards.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (instanceRef.current) {
                      instanceRef.current.current = idx;
                    }
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full transition-colors ${
                    currentSlide === idx ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  )
}
