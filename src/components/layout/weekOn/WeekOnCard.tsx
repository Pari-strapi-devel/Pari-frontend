"use client"

import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState, useEffect } from 'react'
import WeekOnHeader from './WeekOnHeader'
import { ArticleCard } from '@/components/ui/ArticleCard'
import axios from 'axios'
import { BASE_URL } from '@/config'

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

interface ApiResponse {
  data: Array<{
    id: number
    attributes: {
      PublishedAt: string
      Strap: string
      Stap: string
      Title: string
      Description: string
      slug: string
      Location?: string
      PublishedDate?: string
      Categories?: string
      Authors?: string
      Cover_image?: {
        data?: {
          attributes: {
            url: string
          }
        }
      }
    }
  }>
}

export function WeekOnCard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, ] = useState(false)
  const [articles, setArticles] = useState<WeekOnArticle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
  
    slides: {
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 16 },
      },
      '(min-width: 768px)': {
        slides: { perView: 2.5, spacing: 24 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 2, spacing: 24 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 2, spacing: 24 },
      },
    },
  })

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<ApiResponse>(
          'https://beta.ruralindiaonline.org/v1/api/articles', {
          params: {
            'populate': '*',
            'filters': {}
          }
        })

        const formattedArticles = response.data.data.map(article => {
          const authorsString = article.attributes.Authors || '';
          const authors = typeof authorsString === 'string' 
            ? authorsString.split(',').filter(Boolean)
            : ['PARI'];

          const categoriesString = article.attributes.Categories || '';
          const categories = typeof categoriesString === 'string'
            ? categoriesString.split(',').filter(Boolean)
            : ['Rural India'];

          const imageUrl = article.attributes.Cover_image?.data?.attributes?.url;
          const formattedImageUrl = imageUrl
            ? imageUrl.startsWith('http')
              ? imageUrl
              : `${BASE_URL}${imageUrl}`
            : '/images/categories/category-img.png';

          return {
            id: article.id,
            title: article.attributes.Title || '',
            description: article.attributes.Strap || '',
            imageUrl: formattedImageUrl,
            categories: categories,
            slug: article.attributes.slug ,
            authors: authors,
            location: article.attributes.Location || 'India',
            date: article.attributes.PublishedAt || '',
          }
        })

        setArticles(formattedArticles)
      } catch (err) {
        console.error('Error fetching articles:', err)
        setError('Failed to fetch articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>
  }

  return (
    <section className="py-10 md:py-20 px-4 relative overflow-hidden">
      <div className="max-w-[1232px] mx-auto">
        <WeekOnHeader />
        
        <div className="relative mt-8">
          <div ref={sliderRef} className="keen-slider !overflow-visible">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id}
                {...article}
                className="keen-slider__slide !min-h-[500px]"
              />
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(articles.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    currentSlide === idx ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
