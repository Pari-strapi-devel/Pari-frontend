"use client"

import Image from 'next/image'
import Link from 'next/link'
import {  ArrowRight, Play, } from 'lucide-react'
// import { CategoryList } from '@/components/ui/category'

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
  duration?: string
  localizations?: Array<{
    locale: string
    title: string
    strap: string
    slug: string
  }>
  className?: string
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
  duration,
  localizations
}: StoryCardProps) {
  return (
    <Link href={`/stories/${slug || ''}`}>
      <article className="group rounded-[16px] bg-white dark:bg-popover  transition-all duration-300 border border-border shadow-[0px_1px_2px_0px_#00000014]">
        <div className="relative h-[180px] w-full overflow-hidden rounded-t-2xl">
        <div className="absolute top-3 left-3 flex flex-wrap  gap-2 z-50 ">
          {(categories && categories.length > 0) && (
              <>
                <span 
                  className="inline-block items-center px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2"
                >
                  {categories[0]}
                </span>
                {categories.length > 2 && (
                  <span 
                    className="inline-block items-center px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2"
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
          {videoUrl && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary-PARI-Red hover:bg-red-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
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
        {/* <CategoryList categories={categories && categories.length > 0 ? categories : []}></CategoryList> */}

        <div className="py-6   flex  justify-around flex-col px-4">
          

          <h3 className="font-noto-sans line-clamp-1 text-[18px] font-semibold leading-[136%] tracking-[-0.04em]  text-foreground ">
            {title}
          </h3>

          <p className="font-noto-sans pt-1 text-discreet-text text-[15px] font-normal leading-[160%]  tracking-[-0.04em] line-clamp-2">
            {description}
          </p>

          <div className="flex flex-col pt-3">
          <p className="font-noto-sans text-[15px] pb-1 font-semibold leading-[170%] text-grey-300 tracking-[-0.04em] line-clamp-1">
            {authors}
          </p>

          <div className="flex items-center justify-between font-noto-sans text-sm text-muted-foreground">
            <div className='flex flex-col '>
              <div className="font-noto-sans text-[14px] font-normal leading-[150%] tracking-[-0.03em] text-foreground flex items-center gap-1">
                <span>
                Available in {localizations?.length} languages
                </span>
              </div>

              <div className="flex gap-1 justify-around items-center text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                <p>{location}</p>•
                <p>{date}</p>
                <span className="text-xl "> <ArrowRight className="h-5 w-5" /></span>
              </div>
            </div>
          </div>
          </div>
         
        </div>
      </article>
    </Link>
  )
}
