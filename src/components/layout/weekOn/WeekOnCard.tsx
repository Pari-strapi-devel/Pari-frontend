"use client"

import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState } from 'react'
import WeekOnHeader from './WeekOnHeader'
import { ArticleCard } from '@/components/ui/ArticleCard'

interface WeekOnArticle {
  id: number
  title: string
  description: string
  imageUrl: string
  categories: string[]
  slug: string
  authors: string[]
  location: string
  date: string
}

const weekOnArticles: WeekOnArticle[] = [
  {
    id: 1,
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 2,  // Changed from 1 to 2
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 3,  // Changed from 1 to 3
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 4,  // Changed from 1 to 4
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 5,  // Changed from 1 to 5
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 6,  // Changed from 1 to 6
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 7,  // Changed from 1 to 7
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  {
    id: 8,  // Changed from 1 to 8
    title: "Rural Life in Maharashtra",
    description: "Exploring the daily lives of farmers in drought-affected regions of Maharashtra, documenting their struggles and resilience.",
    imageUrl: "/images/categories/category-img.png",
    categories: ["Rural India", "Agriculture"],
    slug: "rural-life-maharashtra",
    authors: ["Priya Sharma"],
    location: "Maharashtra",
    date: "Feb 15, 2024"
  },
  
  // Add more articles as needed
];

export function WeekOnCard() {
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
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 16 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 2, spacing: 24 },
      },
    },
  })

  return (
    
    <section className="m:py-20  py-10 px-4 relative overflow-hidden">
      <div className=" ">
        <div className='max-w-[1232px] mx-auto '>
        <WeekOnHeader />
        </div>
       
        <div ref={sliderRef} className="!overflow-visible keen-slider  relative max-w-[1232px]  mx-auto    ">
          {weekOnArticles.map((article) => (
            <ArticleCard 
              key={article.id}
              {...article}
              className="keen-slider__slide"
            />
          ))}
        </div>

        {loaded && instanceRef.current && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(weekOnArticles.length)].map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  if (instanceRef.current) {
                    instanceRef.current.moveToIdx(idx)
                  }
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
    </section>
  )
}