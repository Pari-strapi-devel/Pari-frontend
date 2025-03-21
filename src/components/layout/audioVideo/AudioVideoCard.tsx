"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Play, Headphones, ChevronRight, CirclePlay} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioVideoBigCard } from './AudioVideoBigCard'

interface MediaStory {
  id: number
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

const mediaStories: MediaStory[] = [
  {
    id: 1,
    title: "Nats at Singhu: nearing the end of their rope",
    description: "A documentary capturing the lives of cotton farmers in Maharashtra, their struggles and triumphs through the seasons.",
    imageUrl: "/images/categories/pari-vidoe.png",
    type: "video",
    duration: "24:15",
    categories: ["Agriculture", "Documentary"],
    slug: "cotton-fields-documentary",
    languages: ["English", "Marathi", "Hindi"],
    location: "Maharashtra",
    date: "Mar 15, 2024"
  },
  {
    id: 2,
    title: "Songs of the Fisherwomen",
    description: "Traditional songs and stories of the fishing communities along the Konkan coast, preserved through oral histories.",
    imageUrl: "/images/categories/pari-re4.png",
    type: "audio",
    duration: "18:30",
    categories: ["Culture", "Oral History"],
    slug: "fisherwomen-songs",
    languages: ["Konkani", "English"],
    location: "Konkan Coast",
    date: "Mar 12, 2024"
  },
  {
    id: 3,
    title: "The Last Bamboo Craftsmen",
    description: "Video documentation of traditional bamboo craft in Northeast India, featuring master artisans and their unique techniques.",
    imageUrl: "/images/categories/pari-re3.png",
    type: "video",
    duration: "32:45",
    categories: ["Crafts", "Heritage"],
    slug: "bamboo-craftsmen",
    languages: ["English", "Assamese"],
    location: "Assam",
    date: "Mar 10, 2024"
  },
  {
    id: 4,
    title: "Tribal Music of Bastar",
    description: "An audio journey through the rich musical traditions of Bastar's tribal communities, recorded live during festivals.",
    imageUrl: "/images/categories/pari-re3.png",
    type: "audio",
    duration: "45:20",
    categories: ["Music", "Tribal Culture"],
    slug: "bastar-tribal-music",
    languages: ["Gondi", "Hindi", "English"],
    location: "Bastar",
    date: "Mar 8, 2024"
  }
]

export function AudioVideoCard() {
  const featuredStory = mediaStories[0] // Use your featured story data

  return (
    <div className="max-w-[1232px] mx-auto py-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <CirclePlay className="h-4 w-4 text-red-600" />
          <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] tracking-[-0.02em] font-semibold">
            Audio & Video Stories
          </h2>
        </div>
        <Button 
          variant="secondary" 
          className="text-sm h-[32px] rounded-[48px] text-red-600"
        >
          See all stories
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Featured Story */}
      <div className="mb-12">
        <AudioVideoBigCard {...featuredStory} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mediaStories.map((story) => (
          <Link 
            key={story.id} 
            href={`/stories/${story.slug}`}
            className="group"
          >
            <article className="rounded-lg overflow-hidden bg-background hover:shadow-xl transition-all duration-300 border border-border h-full">
              <div className="relative h-[156px] w-full overflow-hidden rounded-t-2xl">
                <Image
                  src={story.imageUrl}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform scale-102 duration-300 group-hover:scale-108"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center">
                      {story.type === 'video' ? (
                        <Play className="w-6 h-6 text-white ml-1" />
                      ) : (
                        <Headphones className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {story.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 ring-1 ring-red-600 text-xs text-red-600 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <h3 className="font-noto-sans text-[18px] font-semibold leading-[136%] tracking-[-0.04em] text-foreground">
                  {story.title}
                </h3>

                <p className="font-noto-sans text-[15px] leading-[170%] text-gray-400 tracking-[-0.04em] line-clamp-2">
                  {story.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span>{story.location}</span>
                  <span>•</span>
                  <span>{story.date}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}