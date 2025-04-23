"use client"

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useKeenSlider } from 'keen-slider/react'
import axios from 'axios'
import 'keen-slider/keen-slider.min.css'
import { BASE_URL } from '@/config'


// Add this helper function at the top of the file, before the component
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

interface PariInformation {
  categories: ReactNode
  id: number
  title: string
  url: string
  ButtonText: string
  description: string
  image: {
    data: {
      attributes: {
        url: string
      }
    }
  }
}

interface HomePageData {
  data: {
    attributes: {
      pariInformation: PariInformation[]
    }
  }
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [pariInfo, setPariInfo] = useState<PariInformation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).toUpperCase();
  };

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<HomePageData>(
          `${BASE_URL}api/home-page?populate[pariInformation][fields][0]=title&populate[pariInformation][fields][1]=url&populate[pariInformation][fields][2]=ButtonText&populate[pariInformation][fields][3]=description&populate[pariInformation][populate][image][fields][0]=url&populate`
        )
        
        // Transform the data and strip HTML tags from description
        const transformedData = response.data.data.attributes.pariInformation.map(info => ({
          ...info,
          description: stripHtmlTags(info.description), // Strip HTML tags from description
          image: {
            ...info.image,
            data: {
              ...info.image.data,
              attributes: {
                ...info.image.data.attributes,
                url: info.image.data.attributes.url.startsWith('http') 
                  ? info.image.data.attributes.url 
                  : `${BASE_URL}${info.image.data.attributes.url}`
              }
            }
          }
        }))
        
        setPariInfo(transformedData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching home page data:', error)
        setError('Failed to load content')
        setIsLoading(false)
      }
    }

    fetchHomePageData()
  }, [])

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
    slides: {
      perView: 1.3,
      spacing: 24,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 32 },
      },
      '(min-width: 768px)': {
        slides: { perView: 2.5, spacing: 32 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 3.5, spacing: 32 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 3.5, spacing: 32 },
      },
    },
  })

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null
  if (isLoading) return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>

  return (
    <section className="relative px-4 md:mt-20 mt-10 bg-background">
      <div className='shadow-lg rounded-lg bg-popover sm:w-[90%] max-w-[1232px] mx-auto'>
        <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="z-20 w-fit -ml-2 cursor-pointer hover:text-red-700 transition-all duration-200 text-red-700 rounded-full flex items-center gap-2 py-6 group"
          >
            <div className='hover:bg-red-400 h-8 w-8 rounded-full flex items-center justify-center hover:text-white'>
              <X className="h-4 w-4 hover:bg-red-400 cursor-pointer transition-transform duration-200" />
            </div>
            <span className="text-sm font-medium">Dismiss</span>
          </Button>

          <div className="flex sm:justify-between flex-col sm:flex-row gap-4 pt-6">
            <div>
              <span className="text-[15px] text-gray-400 font-[600] leading-none tracking-[-0.02em] font-noto-sans align-middle uppercase">
                {getCurrentDate()}
              </span>
              <h2 className="font-noto-sans text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[112%] tracking-[-0.04em] text-foreground">
                Welcome to PARI<br />Let&apos;s get you acquainted
              </h2>
            </div>
            <div className='flex  items-end pr-8'>
           <Button 
             variant="secondary" 
             className="h-[32px] cursor-pointer hover ring-red-700 text-red-700 flex items-center rounded-[48px] gap-1"
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

        <div className='relative max-w-[1232px] h-fit mb-8 mx-auto'>
          <div className="absolute z-50 overflow-visible md:-left-10 top-6 md:-right-10 left-1/3 right-1/3 gap-6 -bottom-92 md:bottom-1/2 flex items-center justify-between pointer-events-none px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                instanceRef.current?.prev()
              }}
              className="pointer-events-auto bg-white dark:bg-popover inset-shadow-sm dark:hover:text-red-700 dark:inset-shadow-red-800 inset-shadow-primary text-red-700 hover:text-red-700 shadow-lg rounded-full z-10 cursor-pointer w-11 h-11 sm:w-10 sm:h-10 md:w-12 md:h-12"
            >
              <ChevronLeft className="h-8 w-8 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                instanceRef.current?.next()
              }}
              className="pointer-events-auto bg-white dark:bg-popover inset-shadow-sm dark:hover:text-red-700 dark:inset-shadow-red-800 inset-shadow-primary text-red-700 hover:text-red-700 shadow-lg rounded-full z-10 cursor-pointer w-11 h-11 sm:w-10 sm:h-10 md:w-12 md:h-12"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </Button>
          </div>

          <div className="!overflow-hidden keen-slider relative max-w-[1232px] px-4 h-fit  md:px-0 mx-auto">
            <div ref={sliderRef} className="keen-slider !overflow-visible  relative md:mx-10">
              {pariInfo.map((info, index) => (
                <Link
                  key={info.id || index}
                  href={info.url}
                  className="keen-slider__slide bg-none cursor-pointer block"
                >
                  <div className="flex flex-col rounded-lg h-[320px] sm:h-[350px] md:h-[456px] dark:bg-popover duration-200 relative group">
                    <div className="relative aspect-[16/9] min-h-[130px] w-full overflow-hidden rounded-lg">
                      <Image
                        src={info.image.data.attributes.url}
                        alt={info.title}
                        fill
                        priority
                        className="object-cover rounded-lg transition-transform duration-400 group-hover:scale-110 scale-102"
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="bg-black/10 rounded-lg pt-4 group-hover:bg-black/0 transition-colors duration-500" />
                    </div>
                    
                    <div className="py-4 px-1 flex flex-col justify-between  relative">
                   
                      <h3 className="font-noto-sans text-[20px] md:h-[70px] sm:text-[24px] md:text-[28px] font-bold leading-[124%] tracking-[-0.04em] mb-2 text-foreground line-clamp-1 sm:line-clamp-2">
                        {info.title}
                      </h3>
                      <p className="font-noto-sans text-[15px] ] font-normal leading-[170%] tracking-[-0.03em] text-muted-foreground line-clamp-2 sm:line-clamp-3">
                        {info.description}
                      </p>
                      
                      <div className="transform translate-y-4 flex items-center pt-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <span className="flex items-center gap-2 py-2 text-red-700 font-medium">
                          <span className='text-sm'>{info.ButtonText}</span>
                          <span className="text-xl pt-1 text-center">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {loaded && instanceRef.current && (
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-4">
                {[...Array(pariInfo.length)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx)
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
