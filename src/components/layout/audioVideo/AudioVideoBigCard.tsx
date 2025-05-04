"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Headphones, Play, } from 'lucide-react'

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
  localizations,
  date,
  authors
}: AudioVideoBigCardProps) {
  return (
    <Link 
      href={`/stories/${slug}`}
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
                <span 
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
                >
                  {categories[0]}
                </span>
                {categories.length > 1 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
                  >
                    {categories[1]}
                  </span>
                )}
                {categories.length > 2 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
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
                <span>
                Available in {localizations?.length} languages
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
