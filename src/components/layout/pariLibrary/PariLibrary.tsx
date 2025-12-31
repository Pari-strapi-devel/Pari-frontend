"use client"

import { useState, useEffect } from 'react'
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'
import { PariProjectCard } from '@/components/ui/PariProjectCard'
import { Button } from '@/components/ui/button'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import axios from 'axios'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { stripHtmlTags } from '@/utils/text'

interface PariLibraryData {
  headtitle: string;
  headDescription: string;
  Button: string;
  sub_title: string;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  slug: string;
  authors: string[];
  readMore: string;
  isExternalLink?: boolean;
}

interface PariLibraryProps {
  publicationState?: 'live' | 'preview';
}

export function PariLibrary({ publicationState = 'live' }: PariLibraryProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [libraryData, setLibraryData] = useState<PariLibraryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLocale()

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setIsLoading(true);

        const query = {
          locale: language,
          publicationState,
          populate: {
            pari_movable_sections: {
              on: {
                'home-page.pari-library': {
                  fields: ['title', 'sub_title', 'Button', 'view_project', 'description'],
                  populate: {
                    pariProjects: {
                      fields: ['title', 'link', 'sub_title', 'description'],
                      populate: {
                        image: { fields: ['url'] },
                      },
                    },
                    libraryArticles: {
                      fields: ['Title', 'slug', 'Categories'],
                      populate: {
                        Thumbnail: { fields: ['url'] },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        const response = await axios.get(`${BASE_URL}api/home-page`, { params: query });
        const sections = response.data.data.attributes.pari_movable_sections[0];
        const titlesab = sections;

        console.log('##Rohit_Rocks## PariLibrary sections:', sections);
        console.log('##Rohit_Rocks## PariLibrary pariProjects:', sections.pariProjects);
        console.log('##Rohit_Rocks## PariLibrary libraryArticles:', sections.libraryArticles);

        const formattedData = sections.pariProjects.map((project: {
          title: string;
          Button: string;
          sub_title: string;
          description: string;
          image?: {
            data?: {
              attributes?: {
                url: string;
              };
            };
          };
          Categories?: string;
          link: string;
        }) => {
          console.log('##Rohit_Rocks## Individual project:', project);
          console.log('##Rohit_Rocks## Project title:', project.title);
          console.log('##Rohit_Rocks## Project link:', project.link);

          // Check if link is an external URL
          const isExternalLink = project.link?.startsWith('http://') || project.link?.startsWith('https://');

          return {
            title: stripHtmlTags(project.title),
            headDescription: stripHtmlTags(titlesab.description),
            headtitle: stripHtmlTags(titlesab.title),
            Button: stripHtmlTags(titlesab.Button),
            sub_title: stripHtmlTags(titlesab.sub_title),
            description: stripHtmlTags(project.description),
            imageUrl: project.image?.data?.attributes?.url
              ? `${BASE_URL}${project.image.data.attributes.url}`
              : '/images/categories/default.jpg',
            categories: project.Categories?.split(',').map(cat => stripHtmlTags(cat)) || [],
            slug: project.link,
            authors: [''],
            readMore: 'See project',
            isExternalLink
          };
        });

        setLibraryData(formattedData);
      } catch (error) {
        console.error('Error fetching library data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraryData();
  }, [language, publicationState]); // Added language and publicationState as dependencies

  const isRTL = language === 'ur'

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
    slides: {
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 1.5, spacing: 20 },
      },
      '(min-width: 768px)': {
        slides: { perView: 2.5, spacing: 24 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 2, spacing: 24 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 2, spacing: 24 },
      },
    },
  })

  if (isLoading) {
    return null
  }

  return (
    <div className="overflow-hidden h-fit py-10 px-4 sm:py-20">
      <div className="px-2">
        <div className=" flex md:justify-between max-w-[1232px] flex-col sm:flex-row mx-auto sm:items-end mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-PARI-Red" />
              <h6 className="text-grey-300 dark:text-discreet-text">
                {libraryData[0]?.sub_title}
              </h6>
            </div>
            <h1 className="text-foreground mb-2">
              {libraryData[0]?.headtitle}
            </h1>
            <p className=" max-w-[32.375rem]  text-discreet-text">
              {libraryData[0]?.headDescription}
            </p>
          </div>
          
          <div className="flex items-center h-full sm:pt-0 pt-6 gap-4">
            <Button 
              variant="secondary" 
              className="text-sm h-[36px] ring-[1px] rounded-[48px] text-primary-PARI-Red"
            >
              <p className="text-sm pl-2">
                {libraryData[0]?.Button}
              </p>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Add navigation buttons similar to other components */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => isRTL ? instanceRef.current?.next() : instanceRef.current?.prev()}
                className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => isRTL ? instanceRef.current?.prev() : instanceRef.current?.next()}
                className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative overflow-visible">
          <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto relative !overflow-visible">
            {libraryData.map((article, index) => (
              <PariProjectCard
                key={`${article.slug}-${index}`}
                {...article}
                className="keen-slider__slide !min-h-[500px]"
              />
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(libraryData.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
