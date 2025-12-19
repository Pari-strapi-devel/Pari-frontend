"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { useState } from 'react'

interface PariProjectCardProps {
  title: string
  description: string
  imageUrl: string
  categories: string[]
  slug: string
  authors: string[]
  readMore?: string
  className?: string
  isExternalLink?: boolean
}

export function PariProjectCard({
  title,
  description,
  imageUrl,
  categories,
  slug,
  readMore,
  className}: PariProjectCardProps) {
  const { language: currentLocale } = useLocale();
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);

  // Use slug directly - it already contains the full path
  const href = slug;

  return (
    <Link
      href={href}
      className={className}
    >
      <article className="group relative rounded-lg overflow-hidden hover:rounded-xl transition-discrete-00 transition-all duration-300 h-full">
        <div className="flex items-center mt-4 gap-2">
          {categories?.length > 0 && (
            <div className="flex flex-wrap px-1 gap-2">
              {/* Show 2 categories at a time */}
              {categories.slice(categoryStartIndex, categoryStartIndex + 2).map((category, index) => (
                <span
                  key={`${categoryStartIndex}-${index}`}
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2 cursor-pointer animate-slide-in-left"
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
                      setCategoryStartIndex(0);
                    } else {
                      setCategoryStartIndex(categoryStartIndex + 2);
                    }
                  }}
                >
                  +
                </span>
              )}
            </div>
          )}
        </div>

        <h3 className={` md:h-20 h-20 mb-2 md:text-[1.9rem] text-[1.6rem] ${currentLocale === 'ur' ? 'md:pt-2 pb-4 h-28' : ''} mb-2 px-1 text-foreground line-clamp-`}>
          {title}
        </h3>
        
        <div className="relative h-[376px] w-100% overflow-hidden rounded-2xl" style={{ boxShadow: '0px 1px 4px 0px #00000047' }}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="">
          <div className={`flex flex-col gap-1 ${currentLocale === 'ur' ? 'md:h-[90px] h-[100px]' : ' h-[70px] md:h-'}`}>
            <p className="text-discreet-text py- line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-primary-PARI-Red group-hover:gap-3 transition-all">
              <span className="font-medium">{readMore || 'Read more'}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

