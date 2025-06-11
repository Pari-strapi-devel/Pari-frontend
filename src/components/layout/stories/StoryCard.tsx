"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Headphones, ChevronDown, } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react'

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
  categories?: string[]
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
  setLanguage?: (locale: string) => void
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
  localizations,
  className = '',
  isStudentArticle,
  availableLanguages,
  currentLocale = 'en',
 
}: StoryCardProps) {
  const [openDropdownId, setOpenDropdownId] = useState<boolean>(false);
  
  const handleArticleLanguageSelect = (articleSlug: string) => {
    // Navigate to the article in the selected language
    window.location.href = `https://ruralindiaonline.org/article/${articleSlug}`;
  }

 
  
  return (
    <div className={`relative ${className}`}>
      <Link href={`https://ruralindiaonline.org/article/${slug || ''}`}>
        <article className="group rounded-[16px] m-2 sm:hover:scale-103 transition-transform duration-300 bg-white dark:bg-background hover:rounded-[16px] border border-border ">
          <div className="relative h-[180px] w-full overflow-hidden rounded-t-2xl">
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
            {(categories && categories.length > 0) && (
              <>
                <span 
                  className={`inline-block items-center px-2 py-1 bg-white ${isStudentArticle ? 'text-student-blue hover:bg-student-blue' : 'text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get current URL and parameters
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);
                    
                    // Get existing types if any
                    const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                    const categorySlug = categories[0].toLowerCase().replace(/\s+/g, '-');
                    
                    // Add the new category if it's not already included
                    if (!existingTypes.includes(categorySlug)) {
                      existingTypes.push(categorySlug);
                    }
                    
                    // Update the URL
                    params.set('types', existingTypes.join(','));
                    
                    // Navigate to the updated URL
                    window.location.href = `/articles?${params.toString()}`;
                  }}
                >
                  {categories[0]}
                </span>
                {categories.length > 1 && (
                  <span 
                    className={`inline-block items-center px-2 py-1 bg-white ${isStudentArticle ? 'text-student-blue hover:bg-student-blue' : 'text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Get current URL and parameters
                      const url = new URL(window.location.href);
                      const params = new URLSearchParams(url.search);
                      
                      // Get existing types if any
                      const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                      
                      // Add all categories if they're not already included
                      categories.forEach(category => {
                        const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
                        if (!existingTypes.includes(categorySlug)) {
                          existingTypes.push(categorySlug);
                        }
                      });
                      
                      // Update the URL
                      params.set('types', existingTypes.join(','));
                      
                      // Navigate to the updated URL
                      window.location.href = `/articles?${params.toString()}`;
                    }}
                  >
                    +{categories.length - 1}
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
         
          {/* <CategoryList categories={categories && categories.length > 0 ? categories : []}></CategoryList> */}
          {isStudentArticle ? (
            <div className="py-6 flex min-h-[180px] bg-popover items-start rounded-b-[16px] justify-between 
            flex-col px-4">
              <h3 className="font-noto-sans flex h-[50px] text-[18px] font-semibold leading-[136%] tracking-[-0.04em] text-foreground !line-clamp-2">
                {title}
              </h3>

             

              <div className="flex flex-col pt-3">
                <p className="font-noto-sans text-[15px] pb-1 font-semibold leading-[170%] text-grey-300 tracking-[-0.04em] line-clamp-1">
                  {authors}
                </p>

                <div className="flex items-center justify-between font-noto-sans text-sm text-">
                  <div className='flex flex-col'>
                    <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        Available in {localizations?.length} languages
                        {/* Language dropdown */}
                        {availableLanguages && availableLanguages.length > 1 && (
                          <div className="z-10">
                            <DropdownMenu 
                              open={openDropdownId}
                              onOpenChange={(open) => setOpenDropdownId(open)}
                            >
                              <DropdownMenuTrigger asChild>
                                <div className="rounded-full ml-2 backdrop-blur-sm cursor-pointer">
                                  <ChevronDown className="h-6 w-6 mt-[3px] text-student-blue" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="w-[250px] p-2">
                                <div className="p-2 border-b">
                                  <h3 className="text-xs font-medium">This story is available in {localizations?.length || 1} languages</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-1 p-1">
                                  {availableLanguages.map((language) => {
                                    // Make sure we handle both string and object formats
                                    const langCode = typeof language === 'string' ? language : language.code;
                                    const langName = typeof language === 'string' ? language : language.name;
                                    const langSlug = typeof language === 'string' ? slug : language.slug;
                                    
                                    return (
                                      <DropdownMenuItem
                                        key={`lang-${langCode}-${langSlug}`}
                                        className={`flex items-center cursor-pointer p-2 text-xs ${
                                          currentLocale === langCode 
                                            ? 'bg-student-blue/10 text-student-blue font-medium' 
                                            : 'hover:bg-accent/50'
                                        }`}
                                        onClick={() => langSlug && handleArticleLanguageSelect(langSlug)}
                                      >
                                        <span>{langName}</span>
                                        {currentLocale === langCode && (
                                          <span className="ml-auto">•</span>
                                        )}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </span>
                    </div>

                    <div className="flex gap-1 justify-start items-center text-student-blue font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                      <p className="flex-shrink-1 line-clamp-1">{location}</p>•
                      <p className="flex-shrink-0">{date}</p>
                      <span className="text-xl group-hover:translate-x-1 transition-transform duration-300"> 
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex min-h-[180px] items-start bg-popover rounded-b-[16px] justify-between flex-col px-4">
              <h3 className="font-noto-sans pt-2 flex  text-[18px] font-semibold leading-[136%] tracking-[-0.04em]  text-foreground  !line-clamp-2">
                {title}
              </h3>

              <p className="font-noto-sans pt-1 text-discreet-text text-[15px] font-normal leading-[160%]  tracking-[-0.04em] line-clamp-2">
                {description}
              </p>

              <div className="flex flex-col pt-3">
                <p className="font-noto-sans text-[15px] pb-1 font-semibold leading-[170%] text-grey-300 tracking-[-0.04em] line-clamp-1">
                  {authors}
                </p>

                <div className="flex items-center justify-between font-noto-sans text-sm text-foreground">
                  <div className='flex flex-col '>
                    <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                      {availableLanguages && availableLanguages.length > 1 ? (
                        <div className="z-10">
                          <DropdownMenu 
                            open={openDropdownId}
                            onOpenChange={(open) => setOpenDropdownId(open)}
                          >
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center gap-1 cursor-pointer hover:text-primary-PARI-Red">
                              
                                {/* <span>Available in {availableLanguages.length} languages</span> */}
                                {/* <ChevronDown className="h-5 w-5 text-primary-PARI-Red mt-[1px]" /> */}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-[250px] p-2">
                              <div className="p-2 border-b">
                                <h3 className="text-xs font-medium">This story is available in {availableLanguages.length} languages</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-1 p-1">
                                {availableLanguages.map((language) => (
                                  <DropdownMenuItem
                                    key={`lang-${language.code}-${language.slug}`}
                                    className={`flex items-center cursor-pointer p-2 text-xs ${
                                      currentLocale === language.code 
                                        ? 'bg-primary-PARI-Red/10 text-primary-PARI-Red font-medium' 
                                        : 'hover:bg-accent/50'
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleArticleLanguageSelect(language.slug);
                                    }}
                                  >
                                    <span>{language.name}</span>
                                    {currentLocale === language.code && (
                                      <span className="ml-auto">•</span>
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <span>Available in {localizations?.length || 1} language</span>
                      )}
                    </div>

                    <div className="flex gap-1 justify-start items-center text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                      <p className="flex-shrink-1 line-clamp-1" >{location}</p>•
                      <p className="flex-shrink-0">{date}</p>
                      <span className="text-xl group-hover:translate-x-1  transition-transform duration-300"> 
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </Link>
      
      {/* Add language dropdown outside the Link to prevent navigation when clicking dropdown */}
      {availableLanguages && availableLanguages.length > 1 && (
        <div className="absolute top-[180px] left-[50%] z-20 transform -translate-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 h-[36px] rounded-[48px] bg-white/80 dark:bg-background/80 backdrop-blur-sm cursor-pointer
                  ${isStudentArticle 
                    ? 'text-student-blue hover:bg-student-blue hover:text-white' 
                    : 'text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span>{availableLanguages.length} Languages</span>
          
                <ChevronDown className="h-3 w-3 mt-[1px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[250px] p-2">
              <div className="p-2 border-b">
                <h3 className="text-xs font-medium">This story is available in {availableLanguages.length} languages</h3>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                {availableLanguages.map((language) => (
                  <DropdownMenuItem
                    key={`lang-${language.code}-${language.slug}`}
                    className={`flex items-center cursor-pointer p-2 text-xs ${
                      currentLocale === language.code 
                        ? isStudentArticle
                          ? 'bg-student-blue/10 text-student-blue font-medium'
                          : 'bg-primary-PARI-Red/10 text-primary-PARI-Red font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleArticleLanguageSelect(language.slug);
                    }}
                  >
                    <span>{language.name}</span>
                    {currentLocale === language.code && (
                      <span className="ml-auto">•</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
