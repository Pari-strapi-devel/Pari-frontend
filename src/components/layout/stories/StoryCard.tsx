"use client"

import Image from 'next/image'
import Link from 'next/link'
import {  ArrowRight, Play, } from 'lucide-react'

interface StoryCardProps {
  title?: string
  description?: string
  authors?: string
  imageUrl?: string
  categories?: string[]
  slug?: string
  // languages?: string[]
  location?: string
  date?: string
  videoUrl?: string
  duration?: string
  localizations?: Array<{
    locale: string
    title: string
    strap: string
    slug: string
  }>
}

export function StoryCard({
  title,
  description,
  authors,
  imageUrl,
  categories,
  slug,
  // languages,
  location,
  date,
  videoUrl,
  duration,
  localizations
}: StoryCardProps) {
  return (
    <Link href={`/stories/${slug || ''}`}>
      <article className="group rounded-lg h-[338px] overflow-hidden bg-background hover:shadow-xl transition-all duration-300 border border-border">
        <div className="relative h-[156px] w-full overflow-hidden rounded-t-2xl">
          <Image
            src={imageUrl || '/images/placeholder.png'}
            alt={title || 'Story thumbnail'}
            fill
            className="object-cover transition-transform  scale-102 duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw "
          />
          
          {/* Video overlay if videoUrl exists */}
          {videoUrl && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-red-600 ml-1" />
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

        <div className="py-3 h-[172px] flex  justify-around flex-col px-4">
          <div className="flex flex-wrap gap-2 ">
          {(categories && categories.length > 0) && (
              <>
                <span 
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-red-700 hover:text-white ring-red-700 text-xs text-red-700 rounded-full w-fit h-[23px] mb-2"
                >
                  {categories[0]}
                </span>
                {categories.length > 2 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-red-700 hover:text-white ring-red-700 text-xs text-red-700 rounded-full w-fit h-[23px] mb-2"
                  >
                    +{categories.length - 1}
                  </span>
                )}
              </>
            )}
          </div>

          <h3 className="font-noto-sans line-clamp-1 text-[18px] font-semibold leading-[136%] tracking-[-0.04em] mb-2 text-foreground ">
            {title}
          </h3>

          <p className="font-noto-sans text-[15px] font-semibold leading-[170%] text-gray-400 tracking-[-0.04em]  mb-2 line-clamp-2">
            {description}
          </p>
          <p className="font-noto-sans text-[15px] font-semibold leading-[170%] text-gray-400 tracking-[-0.04em]  mb-2 line-clamp-2">
            {authors}
          </p>

          <div className="flex items-center justify-between font-noto-sans text-sm text-muted-foreground">
            <div>
              <div className="font-noto-sans text-[15px] font-medium leading-[180%] tracking-[-0.02em] text-foreground flex items-center gap-1">
                <span>
                Available in {localizations?.length} languages
                </span>
              </div>

              <div className="flex gap-1 justify-around items-center text-red-700">
                <p>{location}</p>•
                <p>{date}</p>
                <span className="text-xl"> <ArrowRight className="h-4 w-4" /></span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
