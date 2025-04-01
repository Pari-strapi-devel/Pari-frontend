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

  const [visibleCards] = useState(heroCards)

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
//   dd this to make the carousel infinite
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
          perView: 3.5,
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



  return (
    <section className="relative px-4 mt-20 bg-background ">
      <div className='shadow-lg rounded-lg bg-popover  sm:w-[90%] max-w-[1232px] mx-auto'>
      <div className="container mx-auto p-4  sm:p-6 md:p-8 lg:p-10 relative">
      <Button
          variant="ghost"
          size="icon"
    
          className="z-20  w-fit -ml-2 cursor-pointer   hover:text-red-700  transition-all duration-200 text-red-700 rounded-full flex items-center gap-2  py-6 group"
        >
          <div className='hover:bg-red-400 h-8 w-8  rounded-full flex items-center justify-center hover:text-white'>
          <X className="h-4 w-4 hover:bg-red-400 cursor-pointer  transition-transform duration-200" />
          </div>
         
          <span className="text-sm font-medium">Dismiss</span>
        </Button>
        <div className="flex sm:justify-between flex-col sm:flex-row gap-4 pt-6">
          <div>
          <span className="text-[15px] text-gray-400 font-[600] leading-none tracking-[-0.02em]  font-noto-sans align-middle uppercase">
            {getCurrentDate()}
          </span>
          <h2 className="font-noto-sans text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[112%] tracking-[-0.04em] text-foreground">
            Welcome to PARI<br />Let&apos;s get you acquainted
          </h2>
          
          </div>
         <div className='flex  items-end pr-8'>
          <Button 
            variant="secondary" 
            className="h-[32px] cursor-pointer hover  flex items-center rounded-[48px] gap-1"
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
      
      <div className='relative max-w-[1232px] mx-auto'>
      <div className="absolute inset-y-1/2 z-50   overflow-visible sshadow-2xl md:-left-10 top-6 md:-right-10 -left-7 -right-7  flex items-center justify-between pointer-events-none px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.next()
                }}
                className="pointer-events-auto  bg-white hover:bg-white text-red-700 shadow-3xl rounded-full z-10 cursor-pointer w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.prev()
                }}
                className="pointer-events-auto bg-white hover:bg-white text-red-700 shadow-lg rounded-full z-10 cursor-pointer w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
            </div>
            <div className="!overflow-hidden keen-slider relative   ">
          <div ref={sliderRef} className="keen-slider  relative md:mx-10 mx-4  !overflow-visible">
          
            {visibleCards.map((card, index) => (
              <div
                key={card.id}
                className={`keen-slider__slide  bg-none cursor-pointer ${
                  index === visibleCards.length - 1 ? 'gap-0' : ''
                }`}
              >
                <div className="flex flex-col rounded-lg  !gap-x-4 h-[320px] sm:h-[350px] md:h-[400px]  dark:bg-popover   duration-200 relative group">
                  <div className="relative h-full w-full overflow-hidden rounded-lg">
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover rounded-lg top-0 cover h-full transition-transform duration-400 bg-contain group-hover:scale-110 scale-102"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px)  33vw, 25vw"
                    />
                    <div className=" bg-black/10 rounded-lg  pt-4 group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                  
                  <div className="py-4 px-1  flex flex-col flex-grow relative">
                    <span className="inline-flex items-center justify-center w-fit h-[23px] gap-[8px] rounded-[32px] px-3 py-[7px] ring-1 hover:bg-red-700 hover:text-white ring-red-700 text-xs text-red-700 mb-2">
                      {card.category}
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-foreground md:line-clamp-2 line-clamp-1">{card.title}</h3>
                    <p className="font-noto-sans text-[15px] font-normal leading-[170%] tracking-[-0.03em] text-muted-foreground line-clamp-2">
                      {card.description}
                    </p>
                    
                    {/* Read More Link */}
                    <div className="transform translate-y-4 flex items-center pt-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                      <span className="flex items-center gap-2 py-2  text-red-700 font-medium">
                        <span className='text-sm'>Read more </span>
                        <span className="text-xl pt-1 text-center">→</span>
                         
                       
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
           
     

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
      </div>
    </section>
  )
}
