"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Headphones, ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useLocale } from '@/lib/locale'
import { languages as languagesList } from '@/data/languages'
import { useState } from 'react'




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
  const { language: currentLocale, addLocaleToUrl } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);




  return (
    <>
    <Link
      href={addLocaleToUrl(`/article/${slug}`)}
      className={className}
    >
     
      <article className="group relative rounded-lg overflow-hidden  hover:rounded-xl transition-discrete-00 transition-all duration-300 h-full">
       <div className="flex items-center mt-4 gap-2">
            {categories?.length > 0 && (
              <div className="flex flex-wrap px-1 gap-2">
                {/* Show 2 categories at a time */}
                {categories.slice(categoryStartIndex, categoryStartIndex + 2).map((category, index) => (
                  <span
                    key={`${categoryStartIndex}-${index}`}
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer animate-slide-in-left"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Get current URL and parameters
                      const url = new URL(window.location.href);
                      const params = new URLSearchParams(url.search);

                      // Get existing types if any
                      const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                      const actualIndex = categoryStartIndex + index;
                      const slug = categorySlug[actualIndex] || category.toLowerCase().replace(/\s+/g, '-');

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
                    {category}
                  </span>
                ))}

                {/* Next/Reset button */}
               
                {categories.length > 2 && (
                  <span
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (categoryStartIndex + 2 >= categories.length) {
                        // If at end, reset to beginning
                        setCategoryStartIndex(0);
                      } else {
                        // Move to next pair
                        setCategoryStartIndex(prev => prev + 2);
                      }
                    }}
                  >
                    {categoryStartIndex + 2 >= categories.length
                      ? '-'
                      : `+${categories.length - (categoryStartIndex + 2)}`
                    }
                  </span>
                )}
              </div>
            )}
            </div>
        <h3 className={` md:h-20 h-20 flex items-end mb-4 text-[1.6rem] ${currentLocale === 'ur' ? 'md:pt-2 pb-4 h-28' : ''} mb-2 px-1 text-foreground line-clamp-`}>
            {title}
          </h3>
        <div className="relative h-[376px] w-100% overflow-hidden  rounded-2xl" style={{ boxShadow: '0px 1px 4px 0px #00000047' }}>
          {/* Desktop Image */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="hidden md:block object-cover transition-transform scale-102 rounded-xl duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Mobile Image */}
          <Image
            src={mobileImageUrl || imageUrl}
            alt={title}
            fill
            className="block md:hidden object-cover transition-transform scale-102 rounded-xl duration-300 group-hover:scale-108"
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
                className={`flex items-center gap-2 h-[36px] ring-0 outline-none rounded-[48px] bg-white/80 dark:bg-background border cursor-pointer shadow-lg
                  ${isStudentArticle
                    ? 'text-student-blue hover:bg-student-blue hover:text-white border-student-blue'
                    : 'text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white '}`}
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
          <div className="flex flex-wrap gap-2 mb-2 items-center justify-between">
            



          </div>
          <div className=" ">

          <div className={`flex flex-col gap-1 ${currentLocale === 'ur' ? 'md:h-[90px] h-[100px]' : ' h-[70px] md:h-'}`}>
         

          <p className="text-discreet-text py- line-clamp-2">
            {description}
          </p>
          </div>
              
          <div className="flex items-end justify-between font-noto-sans text-sm text-muted-foreground">
            <div>
              <h5 className=" text-[15px]  line-clamp-1  text-grey-300">
                {authors && authors.map((author, index) => (
                  <span key={index}>
                    <span
                      className="cursor-pointer hover:text-primary-PARI-Red transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/articles?author=${encodeURIComponent(author.trim())}`;
                      }}
                    >
                      {author.trim()}
                    </span>
                    {index < authors.length - 1 && ', '}
                  </span>
                ))}
              </h5>
              <div className='flex gap-1 items-center w-fit text-primary-PARI-Red pt-1'> 
                {location && <p className='text-sm font-noto-sans'>{location}</p>}
                {location && date && '•'}
                {date && <p className='text-sm font-noto-sans'>{date}</p>}
                {readMore && <p className='text-sm font-noto-sans'>{readMore}</p>}
                <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-4 gap-2 w-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        window.location.href = addLocaleToUrl(`/article/${language.slug}`);
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
