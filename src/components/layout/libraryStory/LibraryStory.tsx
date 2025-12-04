"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronRight, } from 'lucide-react'
import { BASE_URL } from '@/config'
import { useEffect, useState } from 'react'
import axios from 'axios'

interface ApiBannerItem {
  attributes: {
    Title: string;
    Strap: string;
    slug: string;
    location?: string;
    date?: string;
    Cover_image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export function LibraryStory() {
  const [imageUrl, setImageUrl] = useState('')
  const [item, setItem] = useState<ApiBannerItem | null>(null)

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/articles?locale=all&filters[slug][$eq]=waiting-for-sunny-days-in-the-mountains&populate=deep`)
        const data = await response.data
        
        // Get the first item since we're filtering for a specific article
        const fetchedItem = data.data[0] as ApiBannerItem
        setItem(fetchedItem)
        
        const imageUrl = fetchedItem?.attributes?.Cover_image?.data?.attributes?.url
        if (imageUrl) {
          setImageUrl(`${BASE_URL}${imageUrl}`)
        }
      } catch (error) {
        console.error('Error fetching image URL:', error)
      }
    }

    fetchImageUrl()
  }, [])

  
 
  return (
    <section className="relative w-full">
      <div className="relative h-[400px] md:h-[500px] w-full">
        <Image
          src={imageUrl }
          alt="PARI Library Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-[600px]">
              <div className="flex items-center gap-2 mb-4">
               
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-200">
                  PARI Library
                </span>
              </div>
              
              <h1 className="text-white mb-2">
                {item?.attributes?.Title || 'Loading...'}
              </h1>
              
              <p className="text-lg text-gray-200 mb-8 max-w-[500px]">
              {item?.attributes?.Strap || 'Loading...'}
              </p>
              
              <Button 
                variant="secondary"
                className="text-primary-PARI-Red hover:text-primary-PARI-Red"
              >
                Browse Collection
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
