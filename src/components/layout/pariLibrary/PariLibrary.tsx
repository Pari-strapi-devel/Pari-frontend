"use client"

import { useState, useEffect } from 'react'
import { BookOpen, ChevronRight } from 'lucide-react'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/button'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import axios from 'axios'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'

// Add helper function to strip HTML tags
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

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
}

export function PariLibrary() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [libraryData, setLibraryData] = useState<PariLibraryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLocale()

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const query = {
          locale: language,
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
        }) => ({
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
          authors: ['PARI'],
          readMore: 'See project'
        }));

        setLibraryData(formattedData);
      } catch (error) {
        console.error('Error fetching library data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraryData();
  }, [language]); // Added language as a dependency

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
    slides: {
      perView: 1.2,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 20 },
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
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="overflow-hidden h-fit pt-8 px-4 sm:pt-20">
      <div className="px-2">
        <div className="flex md:justify-between max-w-[1232px] flex-col sm:flex-row mx-auto sm:items-end mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-red-700" />
              <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] tracking-[-0.02em] font-semibold">
                {libraryData[0]?.sub_title}
              </h2>
            </div>
            <h3 className="font-noto-sans md:text-[56px] text-[40px] font-bold leading-[122%] tracking-[-0.04em]">
              {libraryData[0]?.headtitle}
            </h3>
            <p className="font-noto-sans max-w-[400px] text-[16px] font-normal leading-[170%] tracking-[-0.01em] text-muted-foreground">
              {libraryData[0]?.headDescription}
            </p>
          </div>
          
          <div className="flex items-end h-full sm:pt-0 pt-6 gap-4">
            <Button 
              variant="secondary" 
              className="text-sm h-[32px] rounded-[48px] text-red-700"
            >
              {libraryData[0]?.Button}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-visible">
          <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto relative !overflow-visible">
            {libraryData.map((article, index) => (
              <ArticleCard
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
                    currentSlide === idx ? 'bg-red-600' : 'bg-gray-300'
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
