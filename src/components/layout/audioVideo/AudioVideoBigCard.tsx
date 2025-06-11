"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Globe, Headphones, Play, } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { languages as languagesList } from '@/data/languages';

interface AudioVideoBigCardProps {
  title: string
  description: string
  imageUrl: string
  type: 'audio' | 'video'
  duration?: string
  categories: string[]
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
  currentLocale = 'en'
}: AudioVideoBigCardProps) {
  const [openDropdownId, setOpenDropdownId] = React.useState<boolean>(false);
  function handleArticleLanguageSelect(slug: string): void {
    if (!slug) return;
    window.location.href = `https://ruralindiaonline.org/article/${slug}`;
  }

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
      href={`https://ruralindiaonline.org/article/${slug}`}
      className="group"
    >
      <article className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[8px] overflow-hidden bg-background  transition-all duration-300 ">
        {/* Left side - Image */}
        <div className="relative h-[376px] rounded-2xl  md:h-full w-full shadow-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
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

        {/* Right side - Content */}
        <div className="md:p-6 px-1  flex flex-col lg:pr-36 gap-4">
        <div className="flex flex-wrap gap-2 ">
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
                    const categorySlug = categories[1].toLowerCase().replace(/\s+/g, '-');
                    
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
                  +{categories.length - 2}
                </span>
              )}
            </>
          )}
        </div>

          <h2 className="font-noto-sans text-2xl md:text-3xl font-bold leading-[130%] tracking-[-0.04em] text-foreground">
            {title}
          </h2>

          <p className="font-noto-sans text-[16px] font-normal  leading-[170%] tracking-[-0.01em] text-discreet-text">
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
          <p className="font-noto-sans text-[15px] pb-1 font-semibold leading-[170%] text-grey-300 tracking-[-0.04em] line-clamp-1">
              {authors?.join(', ') || 'PARI'}
            </p>

            <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                <span className="flex items-center gap-1">
                Available in {displayLanguages.length} languages
                {/* Language dropdown */}
                {displayLanguages && displayLanguages.length > 0 && (
                  <div className=" z-10">
                    <DropdownMenu 
                      open={openDropdownId}
                      onOpenChange={(open) => setOpenDropdownId(open)}
                    >
                      <DropdownMenuTrigger asChild>
                        <div
                           
                          className=" rounded-full ml-2  backdrop-blur-sm  "
                        
                        >
                          <Globe className="h-4 w-4 mt-[3px] text-primary-PARI-Red" />
                          
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-[250px] p-2">
                        <div className="p-2 border-b">
                          <h3 className="text-xs font-medium">This story is available in {displayLanguages.length} languages</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-1">
                          {displayLanguages.map(({ code: langCode, name: langName, slug: langSlug }) => (
                            <DropdownMenuItem
                              key={`lang-${langCode}-${langSlug}`}
                              className={`flex items-center cursor-pointer p-2 text-xs ${
                                currentLocale === langCode 
                                  ? 'bg-primary-PARI-Red/10 text-primary-PARI-Red font-medium' 
                                  : 'hover:bg-accent/50'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleArticleLanguageSelect(langSlug);
                              }}
                            >
                              <span>{langName}</span>
                              {currentLocale === langCode && (
                                <span className="ml-auto">•</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                        </div>
                  )}
                </span>
              </div>

            <div className="flex items-center gap-2 pt-1 text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em] mt-auto">
              {location && <span>{location}</span>}
              {location && date && <span>•</span>}
              {date && <span>{date}</span>}
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
        
      </article>
    </Link>
  )
}
