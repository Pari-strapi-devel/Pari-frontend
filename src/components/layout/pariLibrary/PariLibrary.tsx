"use client"

import { useState } from 'react'
import { Book, ChevronRight } from 'lucide-react'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/button'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

const libraryArticles = [
  {
    id: 1,
    title: "Dalits",
    description: "Breaking barriers in rural communities and documenting stories of social change",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Dalits","Farming",
"Environment"],
    slug: "dalits-stories",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  },
  {
    id: 2,
    title: "Farming",
    description: "Exploring sustainable agricultural practices and farmer experiences",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Agriculture"],
    slug: "farming-stories",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  },
  {
    id: 3,
    title: "Environment",
    description: "Stories of environmental conservation and climate change impact",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Environment"],
    slug: "environment-stories",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  },
  {
    id: 4,
    title: "The Faces of India",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Culture", "People"],
    slug: "faces-of-india",
    authors: ["Various Contributors"],
    location: "Pan India",
    date: "Feb 17, 2024"
  },
  {
    id: 5,
    title: "Freedom Fighters Gallery",
    description: "Launched on August 15, 2022, this gallery is home to photos and videos of India's little-known foot soldiers of freedom. Some of these already appear elsewhere in PARI. But there are many that don't.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["History", "Freedom Movement"],
    slug: "freedom-fighters",
    authors: ["Various Contributors"],
    readMore: "See project",
  },
  {
    id: 6,
    title: "Visible Work, Invisible Women",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Women", "Labor"],
    slug: "invisible-women",
    authors: ["Various Contributors"],
    readMore: "See project",
    
  },
  {
    id: 7,
    title: "Dalits: Stories of Resilience",
    description: "Breaking barriers in rural communities and documenting stories of social change",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Social Justice"],
    slug: "dalits-resilience",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  },
  {
    id: 8,
    title: "Farming Innovations",
    description: "Exploring sustainable agricultural practices and farmer experiences",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Agriculture"],
    slug: "farming-innovations",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  },
  {
    id: 9,
    title: "Environmental Chronicles",
    description: "Stories of environmental conservation and climate change impact",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Environment"],
    slug: "environment-chronicles",
    authors: ["Aparna Karthikeyan"],
    readMore: "See project",
  }
]

export function PariLibrary() {
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
          perView: 2,
          spacing: 24,
        },
      },
      '(min-width: 1280px)': {
        slides: {
          perView: 2,
          spacing: 24,
        },
      },
    },
  })

  return (
    <div className=" overflow-hidden h-fit pt-8 px-4 sm:pt-20">
      <div className="px-2">
        <div className="flex md:justify-between max-w-[1232px] flex-col sm:flex-row mx-auto sm:items-end  mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-red-600" />
              <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] tracking-[-0.02em] font-semibold">
              In Focus
              </h2>
            </div>
            <h3 className="font-noto-sans md:text-[56px] text-[40px] font-bold leading-[122%] tracking-[-0.04em]">
              The PARI Library
            </h3>
            <p className="font-noto-sans max-w-[400px] text-[16px] font-normal leading-[170%] tracking-[-0.01em] text-muted-foreground">
            The PARI Library brings reports and information on rural India to a single location for students, researchers and other readers. It includes official as well as independent reports, out-of-print books, rare documents and reviewed research articles.
            </p>
          </div>
          
          <div className="flex items-end h-full  sm:pt-0 pt-6  gap-4">
            
            
            <Button 
              variant="secondary" 
              className="text-sm h-[32px]  rounded-[48px] text-red-600"
            >
              See more reports
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-visible">
          <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto relative !overflow-visible">
            {libraryArticles.map((article) => (
              <ArticleCard
                key={article.id}
                {...article}
                className="keen-slider__slide !min-h-[500px]"
              />
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(libraryArticles.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentSlide === idx ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}