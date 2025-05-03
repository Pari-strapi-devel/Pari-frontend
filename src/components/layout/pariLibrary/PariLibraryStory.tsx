"use client"

import { useState } from 'react'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

const libraryStories = [
  {
    id: 1,
    title: "The Platform",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Documentation", "Culture"],
    slug: "the-platform",
    authors: ["Aparna Karthikeyan"],
    readMore: "Read more"
  },
  {
    id: 2,
    title: "Languages",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Languages", "Culture"],
    slug: "languages",
    authors: ["Aparna Karthikeyan"],
    readMore: "Read more"
  },
  {
    id: 3,
    title: "The Archive",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Archive", "Documentation"],
    slug: "the-archive",
    authors: ["Aparna Karthikeyan"],
    readMore: "Read more"
  },
  {
    id: 4,
    title: "Donations",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Support", "Community"],
    slug: "donations",
    authors: ["Aparna Karthikeyan"],
    readMore: "Read more"
  },
  {
    id: 5,
    title: "PARI Education",
    description: "PARI aims to record Indian faces from every single block and district in the country. That's right — thousands and thousands of FACES, capturing the astonishing diversity of how Indians look.",
    imageUrl: "/images/categories/pari-re4.png",
    categories: ["Education", "Development"],
    slug: "pari-education",
    authors: ["Aparna Karthikeyan"],
    readMore: "Read more"
  }
]

export function PariLibraryStory() {
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
          perView: 3,
          spacing: 24,
        },
      },
      '(min-width: 1280px)': {
        slides: {
          perView: 4,
          spacing: 24,
        },
      },
    },
  })

  return (
    <div className="overflow-hidden rounded-md px-4 md:py-0 py-10">
      <div className="px-2">
        <div className="relative  overflow-visible">
          <div ref={sliderRef} className="keen-slider border-b-1 md:pb-20 pb-10 dark:border-gray-800  max-w-[1232px] mx-auto relative !overflow-visible">
            {libraryStories.map((story) => (
              <ArticleCard
                key={story.id}
                {...story}
                className="keen-slider__slide !min-h-[500px]"
              />
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(libraryStories.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-gray-300'
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