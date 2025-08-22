"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Headphones, ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useLocale } from '@/lib/locale'
import { languages as languagesList } from '@/data/languages'
import { useState } from 'react'
import { API_BASE_URL } from '@/utils/constants'



interface Language {
  code: string;
  slug: string;
}

interface ArticleCardProps {
  title: string
  description: string
  imageUrl: string
  mobileImageUrl?: string;
  categories: string[]
  categorySlug?: string[] // Add category slugs
  slug: string
  authors: string[]
  readMore?: string
  location?: string
  date?: string
  className?: string
  videoUrl?: string
  audioUrl?: string
  duration?: string
  availableLanguages?: Language[]
  isStudentArticle?: boolean
}

export function ArticleCard({
  title,
  description,
  imageUrl,
  mobileImageUrl,
  categories,
  categorySlug = [], // Default to empty array
  slug,
  authors,
  location,
  date,
  readMore,
  className,
  videoUrl,
  audioUrl,
  duration,
  availableLanguages = [],
  isStudentArticle = false
}: ArticleCardProps) {
  const { language: currentLocale } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);




  return (
    <>
    <Link
      href={`${API_BASE_URL}/article/${slug}`}
      className={className}
    >
      <article className="group relative rounded-lg overflow-hidden sm:pt-8 hover:rounded-xl transition-discrete-00 transition-all duration-300 h-full">
        <div className="relative h-[376px] w-100% overflow-hidden  rounded-2xl" style={{ boxShadow: '0px 1px 4px 0px #00000047' }}>
          <Image
            src={mobileImageUrl || imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform scale-102 rounded-xl duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Video overlay if videoUrl exists */}
          {videoUrl && (
            <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-PARI-Red hover:bg-primary-PARI-Red/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                {duration && (
                  <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                    {duration}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Audio overlay if audioUrl exists */}
          {audioUrl && !videoUrl && (
            <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-PARI-Red hover:bg-primary-PARI-Red/80 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                {duration && (
                  <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                    {duration}
                  </span>
                )}
              </div>
            </div>
          )}

        
        </div>
          {/* Language button if multiple languages available */}
          {Array.isArray(availableLanguages) && availableLanguages.length > 0 && (
            <div className="absolute  left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100000]">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 h-[36px] ring-0 outline-none rounded-[48px] bg-white dark:bg-background border cursor-pointer shadow-lg
                  ${isStudentArticle
                    ? 'text-student-blue hover:bg-student-blue hover:text-white border-student-blue'
                    : 'text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white border-primary-PARI-Red/20'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSheetOpen(!isSheetOpen);
                }}
              >
                <span>{availableLanguages.length} Languages</span>
                <ChevronDown className="h-3 w-3 mt-[1px]" />
              </Button>
            </div>
          )}
        <div>
        <div className="py-5 px-1 rounded-2xl">
          <div className="flex flex-wrap gap-2 sm:mb-4 items-center justify-between">
            <div className="flex flex-wrap  mt-4 gap-2">
            {categories?.length > 0 && (
              <>
                {/* First category */}
                <span 
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get current URL and parameters
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);
                    
                    // Get existing types if any
                    const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                    const slug = categorySlug[0] || categories[0].toLowerCase().replace(/\s+/g, '-');
                    
                    // Add the new category if it's not already included
                    if (!existingTypes.includes(slug)) {
                      existingTypes.push(slug);
                    }
                    
                    // Update the URL
                    params.set('types', existingTypes.join(','));
                    
                    // Navigate to the updated URL
                    window.location.href = `/articles?${params.toString()}`;
                  }}
                >
                  {categories[0]}
                </span>
                
                {/* Second category if available */}
                {categories.length > 1 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Get current URL and parameters
                      const url = new URL(window.location.href);
                      const params = new URLSearchParams(url.search);
                      
                      // Get existing types if any
                      const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                      const slug = categorySlug[1] || categories[1].toLowerCase().replace(/\s+/g, '-');
                      
                      // Add the new category if it's not already included
                      if (!existingTypes.includes(slug)) {
                        existingTypes.push(slug);
                      }
                      
                      // Update the URL
                      params.set('types', existingTypes.join(','));
                      
                      // Navigate to the updated URL
                      window.location.href = `/articles?${params.toString()}`;
                    }}
                  >
                    {categories[1]}
                  </span>
                )}
                
                {/* +X more categories if there are more than 2 */}
                {categories.length > 2 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Get current URL and parameters
                      const url = new URL(window.location.href);
                      const params = new URLSearchParams(url.search);
                      
                      // Get existing types if any
                      const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                      
                      // Add all categories if they're not already included
                      categories.forEach((category, index) => {
                        const slug = categorySlug[index] || category.toLowerCase().replace(/\s+/g, '-');
                        if (!existingTypes.includes(slug)) {
                          existingTypes.push(slug);
                        }
                      });
                      
                      // Update the URL
                      params.set('types', existingTypes.join(','));
                      
                      // Navigate to the updated URL
                      window.location.href = `/articles?${params.toString()}`;
                    }}
                  >
                    +{categories.length - 2}
                  </span>
                )}
              </>
            )}
            </div>



          </div>
          <div className=" ">

          <div className="flex flex-col md:h-[150px] h-[160px] gap-1 ">
          <h3 className="font-noto-sans md:h-20 h-28 text-[28px] font-bold leading-[130%] tracking-[-0.04em] text-foreground line-clamp-">
            {title}
          </h3>
          
          <p className="!font-noto-sans text-[16px] text-discreet-text font-normal max-w-[500px] leading-[170%] tracking-[-0.01em]  line-clamp-2">
            {description}
          </p>
          </div>
              
          <div className="flex items-end justify-between font-noto-sans text-sm text-muted-foreground">
            <div>
              <p className="font-noto-sans text-[15px] font-medium leading-[180%] line-clamp-1 tracking-[-0.02em] text-[#828282]">
                {authors.join(', ')}
              </p>
              <div className='flex gap-1 items-center w-fit text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]'> 
                {location && <p>{location}</p>}
                {location && date && '•'}
                {date && <p>{date}</p>}
                {readMore && <p>{readMore}</p>}
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-5 gap-2 w-5" />
                </span>
              </div>
            </div>
          </div>
          </div>


        </div>
        </div>

      </article>
    </Link>

    {/* Language Bottom Sheet */}
    {isSheetOpen && (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-[9999] transition-opacity duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSheetOpen(false);
          }}
        />

        {/* Bottom Sheet */}
        <div
          className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[10000] transform transition-transform duration-300 flex ease-out"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSheetOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-popover rounded-t-2xl md:rounded-2xl shadow-xl md:max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Handle Bar */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center border-b-2 justify-between px-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Available in {availableLanguages.length} languages
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select your preferred language
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSheetOpen(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content - Language List */}
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-3">
                {/* Sort languages to put selected language first */}
                {[...availableLanguages].sort((a, b) => {
                  if (a.code === currentLocale) return -1;
                  if (b.code === currentLocale) return 1;
                  return 0;
                }).map((language) => {
                  const languageData = languagesList.find(lang => lang.code === language.code);
                  return (
                    <button
                      key={`lang-${language.code}-${language.slug}`}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                        currentLocale === language.code
                          ? isStudentArticle
                            ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                            : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsSheetOpen(false);
                        window.open(`${API_BASE_URL}/article/${language.slug}`, '_blank');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <div className="text-base font-medium">
                            {languageData ? languageData.names[0] : language.code.toUpperCase()}
                          </div>
                          {languageData && languageData.names[1] && (
                            <div className="text-sm opacity-70">
                              {languageData.names[1]}
                            </div>
                          )}
                        </div>
                        {currentLocale === language.code && (
                          <div className={`w-3 h-3 rounded-full ${isStudentArticle ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}
