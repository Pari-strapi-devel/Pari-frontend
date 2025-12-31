"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Headphones, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { languages as languagesList } from '@/data/languages';
import { createPortal } from 'react-dom';
import { useLocale } from '@/lib/locale';


interface AudioVideoBigCardProps {
  title: string
  description: string
  imageUrl: string
  type: 'audio' | 'video'
  duration?: string
  categories: Array<{ title: string; slug: string }>
  slug: string
  languages?: string[]
  location?: string
  localizations?: Array<{
    locale: string
    title: string
    strap: string
    slug: string
  }>
  date?: string
  authors?: string[]
  availableLanguages?: Array<{
    code: string;
    name: string;
    slug: string;
  }>
  currentLocale?: string
  isStudentArticle?: boolean
}

export function AudioVideoBigCard({
  title,
  description,
  imageUrl,
  type,
  categories,
  slug,
  languages,
  location,

  date,
  authors,
  availableLanguages,
  currentLocale = 'en',
  isStudentArticle = false
}: AudioVideoBigCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { addLocaleToUrl } = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Make sure current language is included in availableLanguages
  const hasCurrentLocale = availableLanguages?.some(lang => lang.code === currentLocale);
  const displayLanguages = [...(availableLanguages || [])];
  
  if (!hasCurrentLocale && availableLanguages?.length) {
    // Find the current language in the languages list
    const currentLanguage = languagesList.find((lang) => lang.code === currentLocale);
    if (currentLanguage) {
      displayLanguages.unshift({
        code: currentLocale,
        name: currentLanguage.name,
        slug: slug // Use the current slug
      });
    }
  }

  return (
    <Link
      href={addLocaleToUrl(`/article/${slug}`)}
      className="group"
    >
      <article className="grid grid-cols-1 md:grid-cols-2 justify-center md:gap-6 rounded-[8px] bg-background  transition-all duration-300 ">
        {/* Left side - Image */}
        <div className="relative h-[358px] rounded-2xl shadow-lg mb-8">
          <div className="relative h-full rounded-2xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              className="object-cover transition-transform scale-102 duration-300 group-hover:scale-108"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-primary-PARI-Red hover:bg-red-500 flex items-center justify-center">
                  {type === 'video' ? (
                    <Play className="w-8 h-8 text-white ml-1" />
                  ) : (
                    <Headphones className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Language button - half on image, half outside */}
          {availableLanguages && availableLanguages.length > 1 && !isSheetOpen && (
            <div className="absolute -bottom-[18px] left-1/2 transform -translate-x-1/2 z-[9]">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 h-[36px] z-30 ring-0 outline-none rounded-[48px] bg-white/80 dark:bg-background  cursor-pointer shadow-lg
                  ${isStudentArticle
                    ? 'text-student-blue hover:bg-student-blue hover:text-white border-student-blue'
                    : 'text-primary-PARI-Red hover:bg-primary-PARI-Red outline-none border-none hover:text-white '}`}
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
        </div>

        {/* Right side - Content */}
        <div className="md:p-6 px-1 md:pb-6  flex flex-col mt-4 md:mt-0 lg:pr-36 md:gap-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {categories?.length > 0 && (
            <>
              {showAllCategories ? (
                // Show all categories
                categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer animate-slide-in-left"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Navigate to articles page with this category filter
                      const params = new URLSearchParams();
                      params.set('types', category.slug);
                      window.location.href = addLocaleToUrl(`/articles?${params.toString()}`);
                    }}
                  >
                    {category.title}
                  </span>
                ))
              ) : (
                // Show first 2 categories
                <>
                  {categories.slice(0, 2).map((category, index) => (
                    <span
                      key={index}
                      className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer animate-slide-in-left"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Navigate to articles page with this category filter
                        const params = new URLSearchParams();
                        params.set('types', category.slug);
                        window.location.href = addLocaleToUrl(`/articles?${params.toString()}`);
                      }}
                    >
                      {category.title}
                    </span>
                  ))}
                </>
              )}

              {/* Show all / Reset button */}
              {categories.length > 2 && (
                <span
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAllCategories(!showAllCategories);
                  }}
                >
                  {showAllCategories ? '-' : `+${categories.length - 2}`}
                </span>
              )}
            </>
          )}
        </div>

          <h3 className="text-2xl  text-foreground">
            {title}
          </h3>

          <p className=" text-discreet-text">
            {description}
          </p>


          {languages && (
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
                <span
                  key={index}
                  className="text-sm text-gray-500"
                >
                  {language}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col  ">
            <h5 className=" text-[15px] pb-1 text-grey-300 line-clamp-1">
              {authors && authors.length > 0 ? (
                authors.map((author, index) => (
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
                ))
              ) : (
                'PARI'
              )}
            </h5>

            <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
              {/* <span className="flex items-center gap-1">
                Available in {availableLanguages?.length || 1} languages
              </span> */}
                {/* Language button */}
              

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
                        <div className="flex items-center border-b-2 justify-between px-6 pb-4">
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
                                    window.location.href = `/article/${language.slug}`;
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
                  </>,
                  document.body
                )}
    </div>

            <div className="flex items-center gap-2 pt-1 text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em] mt-auto">
              {location && <span className="text-sm">{location}</span>}
              {location && date && <span>•</span>}
              {date && <span className="text-sm">{date}</span>}
              <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
