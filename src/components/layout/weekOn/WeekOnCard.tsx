"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState } from 'react'
import WeekOnHeader from './WeekOnHeader'

interface WeekOnArticle {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  slug: string;
  authors: string[];
  location: string;
  date: string;
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
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2, spacing: 16 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 2.2, spacing: 24 },
      },
    },
  })

  return (
    
    <section className="py-20 relative">
      <div className=" ">
        <div className='max-w-[1232px] mx-auto'>
        <WeekOnHeader />
        </div>
       
        <div ref={sliderRef} className="keen-slider relative max-w-[1232px] mx-auto z-50 overflow-visible   ">
          {weekOnArticles.map((article) => (
            <Link 
              href={`/articles/${article.slug}`} 
              key={article.id}
              className="keen-slider__slide"
            >
              <article className="group rounded-lg overflow-hidden pt-8  hover:shadow-xl transition-discrete-00 transition-all duration-300 h-full">
                <div className="relative h-[306px] overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform rounded-xl duration-300 group-hover:scale-105"
                    sizes="(max-width: 540px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                
                <div className="py-6 px-1 rounded-2xl">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="inline-block items-center px-2 py-1 ring-1 ring-red-600 text-xs text-red-600 rounded-full w-fit h-[23px] mb-2">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="font-noto-sans text-[28px] font-bold leading-[130%] tracking-[-0.04em] text-foreground mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="font-noto-sans text-base font-normal leading-[170%] tracking-[-0.01em] text-muted-foreground mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between  font-noto-sans text-sm text-muted-foreground">
                    <div>
                      <p className="font-noto-sans text-[15px] font-medium leading-[180%] tracking-[-0.02em] text-foreground">{article.authors.join(', ')}</p>
                      <div className='flex gap-1 items-center text-red-700'> 
                        <p>{article.location}</p>•
                        <p>{article.date}</p>
                        <span className='text-xl'>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
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