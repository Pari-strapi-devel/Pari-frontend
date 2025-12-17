"use client"

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'

import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKeenSlider } from 'keen-slider/react'
import axios from 'axios'
import 'keen-slider/keen-slider.min.css'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import qs from 'qs'
// import {  Category,  } from '../../ui/category';
import { stripHtmlTags } from '@/utils/text'


export const getTextDirection = (langCode: string) => {
  const rtlLanguages = ['ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
};

// Replace the single defaultCategories array with a map of languages to category arrays
const defaultCategoriesMap = {
  en: ["The Platform", "Languages", "The Archive", "Donations", "PARI Education"],
  hi: ["प्लेटफॉर्म", "भाषाएँ", "आर्काइव", "दान", "पारी शिक्षा"],
  ur: ["پلیٹ فارم", "زبانیں", "آرکائیو", "عطیات", "پاری تعلیم"],
 or: ["ପ୍ଲାଟଫର୍ମ", "ଭାଷା", "ଆର୍କାଇଭ୍", "ଦାନ", "ପାରି ଶିକ୍ଷା"],
  bn: ["প্ল্যাটফর্ম", "ভাষা", "আর্কাইভ", "অনুদান", "পারি শিক্ষা"],
  mr: ["प्लॅ�फॉर्म", "भाषा", "संग्रहालय", "देणगी", "पारी शिक्षण"]
};

// Default to English if language not found
const defaultCategories = (langCode: string) => {
  if (langCode in defaultCategoriesMap) {
    return defaultCategoriesMap[langCode as keyof typeof defaultCategoriesMap];
  }
  return defaultCategoriesMap.en;
};

export interface PariInformation {
  categories: string[];
  seeallStories: ReactNode
  id: number;
  heading: string;
  sabHeading: string;
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language, addLocaleToUrl } = useLocale()

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setIsLoading(true)

        const query = {
          populate: {
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

        // Transform the data with proper localization handling
        const transformedData = response.data.data.attributes.pariInformation.map((info: {
          description: string;
          title: string;
          url: string;
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
            categories: defaultCategories(language),
            description: stripHtmlTags(localizedContent?.description || info.description),
            title: localizedContent?.title || info.title,
            heading: welcomeTitle || "Welcome to PARI",
            sabHeading: welcomeSubtitle || "Let's get you acquainted",
            seeallStories: seeallStories || "See all stories",
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
      perView: 1.1,
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

  if (isLoading) return <div className="flex justify-center items-center min-h-[300px]">Loading...</div>
  if (error) return <div className="text-primary-PARI-Red text-center">{error}</div>

  // Add language selection handler

  return (
    <div className="relative font-notoSans">
   

      {/* Only hide the section when dismissed */}
      {isVisible && (
        <section className="relative px-4 pt-10 md:pt-20 bg-background">
        <div className='shadow-[0px_1px_6px_0px_rgba(0,0,0,0.12)]
          font-notoSans rounded-[12px] bg-popover sm:w-[90%] max-w-[1232px] mx-auto'>
          <div className={` p-6 sm:p-6 md:p-8 lg:p-10 relative ${language === 'ur' ? 'flex flex-col ' : ''}`}>
            <div className={`flex justify-between ${language === 'ur' ? 'flex-row' : ''}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="z-20 w-fit cursor-pointer hover:text-primary-PARI-Red transition-all duration-200 text-primary-PARI-Red rounded-full flex items-center gap-2 py-6 group"
              >
                <div className={`hover:bg-primary-PARI-Red h-8 w-8 rounded-full flex items-center justify-center hover:text-white ${language === 'ur' ? 'sm:flex-row' : ''}`}>
                  <X className="h-6 w-6 hover:bg-primary-PARI-Red cursor-pointer transition-transform duration-200" />
                </div>
                <span className="text-sm font-medium">Dismiss</span>
              </Button>
            </div>



            <div className={`flex sm:justify-between flex-col sm:flex-row gap-4 pt-7 ${language === 'ur' ? 'sm:flex-row' : ''}`}>
              <div className={language === 'ur' ? 'text-right' : 'text-left'}>
                <h1 className="text-foreground  mb-2">
                  {pariInfo[0]?.heading}
                  <br />
                  {pariInfo[0]?.sabHeading}
                </h1>
              </div>
              {/* <div className="flex items-end">
                <Button
                  variant="secondary"
                  className="h-[32px] cursor-pointer hover ring-primary-PARI-Red text-primary-PARI-Red flex items-center rounded-[48px] gap-1"
                  onClick={() => {
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                  }}
                >
                  <span className={`flex items-center gap-2 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                    {pariInfo[0]?.seeallStories}
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </span>
                </Button>
              </div> */}
            </div>
          </div>

          <div className='relative max-w-[1232px] h-fit mb-8 mx-auto'>
            {/* Modified navigation buttons container */}
            <div className={`absolute right-10 top-[-78px] hidden md:block items-center !gap-3 z-10 ${language === 'ur' ? 'left-10 right-auto flex-row-reverse gap-4' : ''}`}>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.prev()
                }}
                className="pointer-events-auto mr-3  bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  instanceRef.current?.next()
                }}
                className="pointer-events-auto mr-3 bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className={`!overflow-hidden keen-slider relative max-w-[1232px] md:px-10 px-6 h-fit mx-auto`}>
              <div ref={sliderRef} className="keen-slider !overflow-visible pb-2 relative">
                {pariInfo.map((info, index) => (
                  <a
                    key={info.id || index}
                    href={addLocaleToUrl(info.url || '#')} // Add fallback to prevent null href and preserve locale
                    className="keen-slider__slide bg-none cursor-pointer block"
                  >
                    <div className="flex flex-col rounded-lg h-[380px]  md:h-[406px] dark:bg-popover duration-200 relative group">
                      <div className="relative aspect-[16/9] min-h-[170px] w-full overflow-hidden rounded-lg">
                        <Image
                          src={info.image.data.attributes.url}
                          alt={info.title || "PARI featured content"} // Add fallback alt text
                          fill
                          priority
                          className="object-cover rounded-lg transition-transform duration-400 group-hover:scale-110 scale-102"
                          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="bg-black/10 rounded-lg pt-4 group-hover:bg-black/0 transition-colors duration-500" />
                      </div>
                      
                      <div className={`py-4 px-1 flex flex-col justify-between relative ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                        {/* {info.categories && info.categories.length > 0 && (
                          <div className={`flex flex-wrap gap-2 ${language === 'ur' ? 'justify-end' : ''}`}>
                            <Category name={info.categories[index % info.categories.length]} />
                          </div>
                        )} */}
                       
                        <h3 className={` text-2xl  text-foreground  mb-4 ${language === 'ur' ? 'pb-4' : 'md:line-clamp-2 h-16 pb-2'} sm:line-clamp-2 `}>
                          {info.title}
                        </h3>
                        <p className="line-clamp-2  text-discreet-text ">
                          {info.description}
                        </p>
                        
                        <div className={`flex items-center md:pt-4 md:transform md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:transition-all md:duration-300 md:ease-out ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-2 py-2 text-primary-PARI-Red ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                            <span className='text-[14px] font-noto-sans font-medium leading-[160%] tracking-[-0.03em]'>{info.ButtonText}</span>
                            <span className="md:group-hover:translate-x-1 md:transition-transform md:duration-300">
                              <ArrowRight className="h-5 w-5" />
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
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
                        currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-grey-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  )
}
