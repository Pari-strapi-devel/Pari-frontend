"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Headphones, ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { languages as languagesList } from '@/data/languages'
import { useLocale } from '@/lib/locale'

export interface LocalizationData {
  attributes?: {
    locale: string;
    title: string;
    strap: string;
    slug: string;
  };
  locale?: string;
  title?: string;
  strap?: string;
  slug?: string;
}

interface StoryCardProps {
  title?: string
  description?: string
  authors?: string
  imageUrl?: string
  categories?: Array<{ title: string; slug: string }>
  slug?: string
  location?: string
  date?: string
  videoUrl?: string
  audioUrl?: string
  duration?: string
  localizations?: Array<{
    locale: string;
    title: string;
    strap: string;
    slug: string;
  }>
  className?: string
  isStudentArticle?: boolean
  availableLanguages?: Array<{
    code: string;
    name: string;
    slug: string;
  }>
  currentLocale?: string
}

export function StoryCard({
  title,
  description,
  authors,
  imageUrl,
  categories,
  slug,
  location,
  date,
  videoUrl,
  audioUrl,
  duration,
  // localizations,
  className = '',
  isStudentArticle,
  availableLanguages,
  currentLocale,

}: StoryCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { addLocaleToUrl } = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);





  return (
    <div className={`relative ${className}`}>
      <Link href={addLocaleToUrl(`/article/${slug || ''}`)}>

        <article className="group rounded-[16px] m-2 sm:hover:scale-103 transition-transform duration-300 bg-white dark:bg-background hover:rounded-[16px] border border-border ">
          <div className="relative h-[180px] w-full overflow-hidden rounded-t-2xl">
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10 flex-wrap max-w-[calc(100%-24px)]">
            {(categories && categories.length > 0) && (
              <>
                {showAllCategories ? (
                  // Show all categories
                  categories.map((category, index) => (
                    <span
                      key={index}
                      className={`inline-block items-center px-2 py-1 bg-white ${isStudentArticle ? 'text-student-blue hover:bg-student-blue' : 'text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white text-xs rounded-full w-fit h-[24px] cursor-pointer transition-all duration-300 animate-slide-in-left`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Navigate to articles page with this category filter
                        const params = new URLSearchParams();
                        params.set('types', category.slug);
                        const url = addLocaleToUrl(`/articles?${params.toString()}`);
                        window.location.href = url;
                      }}
                    >
                      {category.title}
                    </span>
                  ))
                ) : (
                  // Show only first category
                  <span
                    key={0}
                    className={`inline-block items-center px-2 py-1 bg-white ${isStudentArticle ? 'text-student-blue hover:bg-student-blue' : 'text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white text-xs rounded-full w-fit h-[24px] cursor-pointer transition-all duration-300 animate-slide-in-left`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Navigate to articles page with this category filter
                      const params = new URLSearchParams();
                      params.set('types', categories[0].slug);
                      const url = addLocaleToUrl(`/articles?${params.toString()}`);
                      window.location.href = url;
                    }}
                  >
                    {categories[0].title}
                  </span>
                )}

                {/* Show all / Reset button */}
                {categories.length > 1 && (
                  <span
                    className={`inline-block items-center px-2 py-1 bg-white ${isStudentArticle ? 'text-student-blue hover:bg-student-blue' : 'text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white text-xs rounded-full w-fit h-[24px] cursor-pointer transition-all duration-300`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllCategories(!showAllCategories);
                    }}
                  >
                    {showAllCategories ? '-' : `+${categories.length - 1}`}
                  </span>
                )}
              </>
            )}
          </div>
            <Image
              src={imageUrl || '/images/placeholder.png'}
              alt={title || 'Story thumbnail'}
              fill
              className="object-cover transition-transform scale-102 shadow-lg  duration-300 group-hover:scale-108"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw "
            />
            
            {/* Video overlay if videoUrl exists */}
            {videoUrl ? (
              <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isStudentArticle ? 'bg-student-blue hover:bg-student-blue/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} flex items-center justify-center`}>
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  {duration && (
                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            ) : audioUrl ? (
              <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isStudentArticle ? 'bg-student-blue hover:bg-student-blue/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} flex items-center justify-center`}>
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  {duration && (
                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            
          </div>
         {/* Language button if multiple languages available */}
            {Array.isArray(availableLanguages) && availableLanguages.length > 0 && (
              <div className="absolute z-30  left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 h-[36px] ring-0 outline-none rounded-[48px] bg-white/80 dark:bg-background/90 border-none cursor-pointer shadow-md
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
          {/* <CategoryList categories={categories && categories.length > 0 ? categories : []}></CategoryList> */}
          {isStudentArticle ? (
            <div className="py-6 flex min-h-[180px] bg-popover items-start rounded-b-[16px] justify-between 
            flex-col px-4">
               {videoUrl ? (
              <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isStudentArticle ? 'bg-student-blue hover:bg-student-blue/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} flex items-center justify-center`}>
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  {duration && (
                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            ) : audioUrl ? (
              <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isStudentArticle ? 'bg-student-blue hover:bg-student-blue/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} flex items-center justify-center`}>
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  {duration && (
                    <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      {duration}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
              <h4 className=" pt-2 flex  text-[18px] font-semibold leading-[136%] tracking-[-0.04em]  text-foreground  line-clamp-2">
                {title}
              </h4>

             

              <div className="flex flex-col pt-3">
                <h5 className=" text-[15px] pb-1 text-grey-300 line-clamp-1">
                  {authors && authors.split(',').map((author, index) => (
                    <span key={index}>
                      <span
                        className="cursor-pointer hover:text-student-blue transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = addLocaleToUrl(`/articles?author=${encodeURIComponent(author.trim())}`);
                        }}
                      >
                        {author.trim()}
                      </span>
                      {index < authors.split(',').length - 1 && ', '}
                    </span>
                  ))}
                </h5>

                <div className="flex items-center justify-between font-noto-sans text-sm text-">
                  <div className='flex flex-col'>
                    <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                      <span className="flex items-center gap-1">

                      </span>
                    </div>

                    <div className="flex gap-1 justify-start items-center text-student-blue font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                      <p className="flex-shrink-1 text-sm line-clamp-1">{location}</p>•
                      <p className="flex-shrink-0 text-sm">{date}</p>
                      <span className="text-sm group-hover:translate-x-1 transition-transform duration-300"> 
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex min-h-[180px] items-start bg-popover rounded-b-[16px] justify-between flex-col px-4">
              <h4 className=" pt-2 flex  text-[18px] font-semibold leading-[136%] tracking-[-0.04em]  text-foreground  line-clamp-2">
                {title}
              </h4>

              <p className="font-noto-sans pt-1 text-discreet-text text-[15px] font-normal leading-[160%]  tracking-[-0.04em] line-clamp-2">
                {description}
              </p>

              <div className="flex flex-col pt-3">
                <div className="font-noto-sans text-[15px] pb-1 font-semibold leading-[170%] text-grey-300 tracking-[-0.04em] line-clamp-1">
                  {authors && authors.split(',').map((author, index) => (
                    <span key={index}>
                      <span
                        className="cursor-pointer hover:text-primary-PARI-Red transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = addLocaleToUrl(`/articles?author=${encodeURIComponent(author.trim())}`);
                        }}
                      >
                        {author.trim()}
                      </span>
                      {index < authors.split(',').length - 1 && ', '}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between font-noto-sans text-sm text-foreground">
                  <div className='flex flex-col '>
                    <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                      {/* <span>Available in {availableLanguages?.length || localizations?.length || 1} language{(availableLanguages?.length || localizations?.length || 1) > 1 ? 's' : ''}</span> */}
                    </div>

                    <div className="flex gap-1 justify-start items-center text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                      <p className="flex-shrink-1 font-noto-sans text-sm  line-clamp-1" >{location}</p>•
                      <p className="flex-shrink-0 font-noto-sans text-sm">{date}</p>
                      <span className="text-sm  group-hover:translate-x-1  transition-transform duration-300"> 
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </Link>
      
      {/* Language Bottom Sheet - Portal to Body */}
      {mounted && isSheetOpen && createPortal(
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
              <div className="flex items-center border-b-2  justify-between px-6 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Available in {availableLanguages?.length || 0} languages
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
                  {[...(availableLanguages || [])].sort((a, b) => {
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
                          const url = addLocaleToUrl(`/article/${language.slug}`);
                          window.location.href = url;
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex  gap-2">
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
        </>,
        document.body
      )}
    </div>
  )
}
