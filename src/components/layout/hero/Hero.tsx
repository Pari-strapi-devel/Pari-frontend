"use client"

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKeenSlider } from 'keen-slider/react'
import axios from 'axios'
import 'keen-slider/keen-slider.min.css'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import qs from 'qs'


export const getTextDirection = (langCode: string) => {
  const rtlLanguages = ['ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
};

const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

export interface PariInformation {
  seeallStories: ReactNode
  id: number;
  heading: string;
  sabHeading: string;
  weekDays: string[];
  months: string[];
  title: string;
  url: string;
  ButtonText: string;
  description: string;
  image: {
    data: {
      attributes: {
        url: string
      }
    }
  }
}

// Remove unused interface and add welcome_to_pari to fields

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [pariInfo, setPariInfo] = useState<PariInformation[]>([])
  const [months, setMonths] = useState([])
  const [weekDays, setWeekDays] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLocale()

  const getCurrentDate = (monthsObj: Record<string, string>, weekDaysObj: Record<string, string>) => {
    if (!monthsObj || !weekDaysObj) return '';
    
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentDay = currentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Map month index to month name in monthsObj
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const currentMonthName = monthsObj[monthNames[currentMonthIndex]];
    const currentDayName = weekDaysObj[currentDay];

    return `${currentDayName}, ${currentMonthName} ${currentDate.getDate()}, ${currentDate.getFullYear()}`.toUpperCase();
  };

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setIsLoading(true)
        
        const query = {
          populate: {
            Months: true,
            week_days: true,
            fields: ['welcome_Title', 'welcome_subtitle', 'seeallStories'],
            pariInformation: {
              populate: {
                image: {
                  fields: ['url']
                },
                localizations: {
                  populate: '*',  // Ensure we're getting all localizations
                  fields: ['locale', 'description', 'title', 'ButtonText']
                }
              }
            },
            localizations: {
              populate: '*',  // Ensure we're getting all localizations
              fields: ['locale', 'welcome_Title', 'welcome_subtitle', 'seeallStories']
            }
          },
          locale: language
        }

        const queryString = qs.stringify(query, { 
          encodeValuesOnly: true,
          addQueryPrefix: false 
        })
        
        const response = await axios.get(`${BASE_URL}api/home-page?${queryString}`)
        
        // Get heading and seeallStories from the correct localization
        const attributes = response.data?.data?.attributes
        const welcomeTitle = attributes?.welcome_Title
        const welcomeSubtitle = attributes?.welcome_subtitle
        const seeallStories = attributes?.seeallStories
        const week_days = response.data?.data?.attributes?.week_days
        const months = response.data?.data?.attributes?.Months

        // Debug logs
        console.log('Raw Months Data:', months)
        console.log('Raw Week Days Data:', week_days)

        // Set the state with the actual objects
        setMonths(months || {})
        setWeekDays(week_days || {})

        // Transform the data with proper localization handling
        const transformedData = response.data.data.attributes.pariInformation.map((info: {
          description: string;
          title: string;
          url: string;
          Months: string[];
          week_days: string[];
          ButtonText: string;
          localizations?: {
            data: Array<{
              attributes: {
                locale: string;
                description?: string;
                title?: string;
                ButtonText?: string;
              };
            }>;
          };
          image: {
            data: {
              attributes: {
                url: string;
              };
            };
          };
        }) => {
          // Get the localized content if available
          const localizedContent = info.localizations?.data?.find(
            (l: { 
              attributes: { 
                locale: string; 
                description?: string; 
                title?: string; 
                ButtonText?: string; 
              }
            }) => l.attributes.locale === language
          )?.attributes

          return {
            ...info,
            description: stripHtmlTags(localizedContent?.description || info.description),
            title: localizedContent?.title || info.title,
            heading: welcomeTitle || "Welcome to PARI",
            sabHeading: welcomeSubtitle || "Let's get you acquainted",
            seeallStories: seeallStories || "See all stories",
            weekDays: week_days,
            months: months,
            ButtonText: localizedContent?.ButtonText || info.ButtonText,
            image: {
              data: {
                attributes: {
                  url: info.image?.data?.attributes?.url?.startsWith('http')
                    ? info.image?.data?.attributes?.url
                    : `${BASE_URL}${info.image?.data?.attributes?.url}`
                }
              }
            }
          }
        })
        
        setPariInfo(transformedData)
        setIsLoading(false)
      } catch {
        setError('Failed to load content')
        setIsLoading(false)
      }
    }

    fetchHomePageData()
  }, [language]) // Keep language as dependency

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

  // Add language selection handler
 
  return (
    <div className="relative font-noto-sans">
      <section className="relative px-4 md:mt-20 mt-10 bg-background">
        <div className='shadow-lg rounded-lg bg-popover sm:w-[90%] max-w-[1232px] mx-auto'>
          <div className={`container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 relative ${language === 'ur' ? 'flex flex-col' : ''}`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="z-20 w-fit cursor-pointer hover:text-red-700 transition-all duration-200 text-red-700 rounded-full flex items-center gap-2 py-6 group"
            >
              <div className='hover:bg-red-400 h-8 w-8 rounded-full flex items-center justify-center hover:text-white'>
                <X className="h-4 w-4 hover:bg-red-400 cursor-pointer transition-transform duration-200" />
              </div>
              <span className="text-sm font-medium">Dismiss</span>
            </Button>

            <div className={`flex sm:justify-between flex-col sm:flex-row gap-4 pt-6 ${language === 'ur' ? 'sm:flex-row-reverse' : ''}`}>
              <div className={language === 'ur' ? 'text-right' : 'text-left'}>
                <span className="text-[15px] text-gray-400 font-[600] leading-none tracking-[-0.02em] align-middle uppercase">
                  { String(getCurrentDate(months as unknown as Record<string, string>, weekDays as unknown as Record<string, string>)) }
                </span>
                <h2 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[112%] tracking-[-0.04em] text-foreground">
                  {pariInfo[0]?.heading}
                  <br />
                  {pariInfo[0]?.sabHeading}
                </h2>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="secondary" 
                  className="h-[32px] cursor-pointer hover ring-red-700 text-red-700 flex items-center rounded-[48px] gap-1"
                  onClick={() => {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                  }}
                >
                  <span className={`flex items-center gap-2 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                    {pariInfo[0]?.seeallStories}
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </span>
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
                  instanceRef.current?.next()
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
                  instanceRef.current?.prev()
                }}
                className="pointer-events-auto bg-white dark:bg-popover inset-shadow-sm dark:hover:text-red-700 dark:inset-shadow-red-800 inset-shadow-primary text-red-700 hover:text-red-700 shadow-lg rounded-full z-10 cursor-pointer w-11 h-11 sm:w-10 sm:h-10 md:w-12 md:h-12"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            <div className={`!overflow-hidden keen-slider relative max-w-[1232px] px-4 h-fit md:px-0 mx-auto`}>
              <div ref={sliderRef} className="keen-slider !overflow-visible relative md:mx-10">
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
                      
                      <div className={`py-4 px-1 flex flex-col justify-between relative ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                        <h3 className="font-noto-sans text-[20px] md:h-[70px] sm:text-[24px] md:text-[28px] font-bold leading-[124%] tracking-[-0.04em] mb-2 text-foreground line-clamp-1 sm:line-clamp-2">
                          {info.title}
                        </h3>
                        <p className="font-noto-sans text-[15px] font-normal leading-[170%] tracking-[-0.03em] text-muted-foreground line-clamp-2 sm:line-clamp-3">
                          {info.description}
                        </p>
                        
                        <div className={`transform translate-y-4 flex items-center pt-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-2 py-2 text-red-700 font-medium ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                            <span className='text-sm'>{info.ButtonText}</span>
                            <ArrowRight className="h-4 w-4" />
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
    </div>
  )
}
