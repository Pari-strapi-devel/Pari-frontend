"use client"

import Image from 'next/image'
import Link from 'next/link'

import { Headphones, Play } from 'lucide-react'

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
  date?: string
}

export function AudioVideoBigCard({
  title,
  description,
  imageUrl,
  type,
  duration,
  categories,
  slug,
  languages,
  location,
  date
}: AudioVideoBigCardProps) {
  return (
    <Link 
      href={`/stories/${slug}`}
      className="group"
    >
      <article className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg overflow-hidden bg-background  transition-all duration-300 ">
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
              <div className="w-16 h-16 rounded-full bg-red-700 hover:bg-red-500 flex items-center justify-center">
                {type === 'video' ? (
                  <Play className="w-8 h-8 text-white ml-1" />
                ) : (
                  <Headphones className="w-8 h-8 text-red-600" />
                )}
              </div>
              {duration && (
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="p-6 flex flex-col lg:pr-36 gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 hover:bg-red-700 hover:text-white ring-1 ring-red-700  text-sm text-red-700 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>

          <h2 className="font-noto-sans text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.04em] text-foreground">
            {title}
          </h2>

          <p className="font-noto-sans text-base leading-relaxed text-gray-400 tracking-[-0.02em]">
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

          <div className="flex items-center gap-2 text-sm text-red-700 mt-auto">
            {location && <span>{location}</span>}
            {location && date && <span>•</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </article>
    </Link>
  )
}