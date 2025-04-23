"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Headphones, ChevronRight, CirclePlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioVideoBigCard } from './AudioVideoBigCard'
import axios from 'axios'
import { BASE_URL } from '@/config'
import qs from 'qs'
import { ArticleWithLangSelection } from '../pariRecommends/page'
import { useLocale } from '@/lib/locale'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

interface MediaStory {
  headtitle:  string;
  sub_title: string;
  localizations: Array<{
    locale: string;
    title: string;
    strap: string;
    slug: string;
  }>;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'audio' | 'video';  // This must be strictly 'audio' or 'video'
  categories: string[];
  slug: string;
  authors: string[];
  location: string;
  date: string;
}

interface ApiResponse {
  data: {
    attributes: {
      pari_movable_sections: Array<{
        title: string;
        av_stories_button: string;
        av_stories_icon: string;
        article_with_lang_selection_1: ArticleWithLangSelection[];
        article_with_lang_selection_2: ArticleWithLangSelection[];
      }>
    }
  }
}

export function AudioVideoCard() {
  const [mediaStories, setMediaStories] = useState<MediaStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setIsLoaded(true)
    },
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 600px)': {
        slides: {
          perView: 2,
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 3,
        },
      },
    },
  })

  useEffect(() => {
    const fetchAudioVideoStories = async () => {
      try {
        const sharedArticlePopulation = {
          fields: ['id'],
          populate: {
            all_language: { fields: ['language_name'] },
            article: {
              fields: [
                'Title',
                'Strap',
                'original_published_date',
                'slug',
                'location_auto_suggestion',
                'Type',
              ],
              populate: {
                location: { fields: ['name', 'district', 'state'] },
                localizations: {
                  fields: ['locale', 'title', 'strap', 'slug'],
                },
                Authors: {
                  populate: {
                    author_role: { fields: ['Name'] },
                    author_name: { fields: ['Name'] },
                  },
                },
                Cover_image: { fields: ['url'] },
                mobilecover: { fields: ['url'] },
                categories: { fields: ['slug', 'Title'] },
              },
            },
          },
        }

        const query = {
          populate: {
            pari_movable_sections: {
              on: {
                'home-page.audio-video-stories': {
                  fields: [
                    'title',
                    'av_stories_button',
                    'av_stories_icon',
                    'sub_title',
                  ],
                  populate: {
                    article_with_lang_selection_1: sharedArticlePopulation,
                    article_with_lang_selection_2: sharedArticlePopulation,
                  },
                },
              },
            },
          },
          locale: language, // Add the current language to the query
        }

        const queryString = qs.stringify(query, { encodeValuesOnly: true })
        const response = await axios.get<ApiResponse>(`${BASE_URL}api/home-page?${queryString}`)
        
        const sections = response.data.data.attributes.pari_movable_sections[0];
        console.log('Sections data:', sections);
        
        const allArticles = [
          ...(sections.article_with_lang_selection_1 || []),
          ...(sections.article_with_lang_selection_2 || []),
        ];         

        const formattedStories = allArticles.map(item => {
          const articleData = item.article.data.attributes;
          
          const authors = Array.isArray(articleData.Authors)
            ? articleData.Authors.map(author => {
                const name = author?.author_name?.data?.attributes?.Name
                return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI'
              })
            : ['PARI']
          
          const localizationsData = Array.isArray(articleData.localizations) 
            ? articleData.localizations 
            : (articleData.localizations as { data: Array<{ locale: string; title: string; strap: string; slug: string }> })?.data || [];

          const localizations = localizationsData.map(
            (loc: { locale: string; title: string; strap: string; slug: string }) => ({
              locale: loc.locale,
              title: loc.title,
              strap: loc.strap,
              slug: loc.slug
            })
          );
          
          return {
            id: item.id,
            headtitle: sections.title,
            sub_title: sections.av_stories_button,
            title: articleData.Title,
            description: articleData.Strap || 'No description available',
            imageUrl: articleData.Cover_image?.data?.attributes?.url
              ? `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
              : '/images/categories/default.jpg',
            type: 'video',
            duration: '00:00',
            categories: Array.isArray(articleData.categories?.data) 
              ? articleData.categories.data.map(
                  (cat: { attributes: { Title: string } }) => cat.attributes.Title
                )
              : [],
            slug: articleData.slug,
            localizations,
            languages: Array.isArray(item.all_language?.data)
              ? item.all_language.data.map(
                  (lang: { attributes: { language_name: string } }) => lang.attributes.language_name
                )
              : [],
            location: (articleData.location?.data?.attributes?.district && articleData.location?.data?.attributes?.state) 
              ? `${articleData.location.data.attributes.district}, ${articleData.location.data.attributes.state}`
              : articleData.location_auto_suggestion || 'India',
            date: articleData.Original_published_date
              ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : '',
            authors,
          }
        })

        const updatedMediaStories = formattedStories.map(story => ({
          ...story,
          type: story.type.toLowerCase() === 'audio' ? 'audio' : 'video',
          id: story.id,
          title: story.title,
          description: story.description,
          imageUrl: story.imageUrl,
          categories: story.categories,
          slug: story.slug,
          authors: story.authors,
          location: story.location,
          date: story.date
        } as MediaStory));

        setMediaStories(updatedMediaStories);
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching audio video stories:', error)
        setError('Failed to load audio video stories')
        setIsLoading(false)
      }
    }

    fetchAudioVideoStories()
  }, [language]) // Only depend on language changes

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (!mediaStories.length) {
    return null
  }

  const featuredStory = mediaStories[0]

  return (
    <div className="max-w-[1232px] relative lg:px-0 px-4 mx-auto md:py-20 sm:py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <CirclePlay className="h-7 w-7 text-red-700" />
          <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] tracking-[-0.02em] font-semibold">
          {featuredStory.headtitle}
          </h2>
        </div>
        <Button 
          variant="secondary" 
          className="text-sm h-[32px] rounded-[48px] text-red-700"
        >
          {featuredStory.sub_title}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Featured Story */}
      <div className="mb-12">
        <AudioVideoBigCard 
          {...featuredStory}
        />
      </div>
      

      <div className="relative overflow-hidden">
        <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto relative !overflow-visible">
          {mediaStories.slice(1).map((story: MediaStory) => {
            return (
              <Link 
                key={story.id} 
                href={`/stories/${story.slug}`}
                className="keen-slider__slide group"
              >
                <article className="rounded-lg overflow-hidden bg-background hover:shadow-xl transition-all duration-300 border border-border h-full mx-2">
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
                        <div className="w-12 h-12 rounded-full bg-red-700 hover:bg-red-500 flex items-center justify-center">
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
                      {story.categories.length > 0 && (
                        <>
                          <span className="inline-block px-2 py-1 items-center h-[24px] hover:bg-red-600 hover:text-white ring-1 ring-red-700 text-xs text-red-700 rounded-full">
                            {story.categories[0]}
                          </span>
                          {story.categories.length > 1 && (
                            <span className="inline-block px-2 py-1 items-center h-[24px] hover:bg-red-600 hover:text-white ring-1 ring-red-700 text-xs text-red-700 rounded-full">
                              +{story.categories.length - 1}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <h3 className="font-noto-sans text-[18px] h-[40px] font-semibold leading-[136%] tracking-[-0.04em] text-foreground">
                      {story.title}
                    </h3>

                    <p className="font-noto-sans text-[15px] leading-[170%] text-gray-400 tracking-[-0.04em] line-clamp-2">
                      {story.description}
                    </p>

                    <div className="flex flex-col gap-2">
                      <p className="font-noto-sans text-[15px] font-medium leading-[180%] tracking-[-0.02em] line-clamp-1 text-[#828282]">
                        {story.authors.join(', ')}
                      </p>
                      <div className="flex gap-1 items-center text-neutral-500">
                        {story.localizations?.length && (
                          <span>
                            Available in {story.localizations.length} languages
                          </span>
                        )}
                      </div>
                      <div className="flex items-center w-fit gap-2 text-sm text-red-700">
                        <span className='line-clamp-1'>{story.location}</span>
                        <span>•</span>
                        <span className='font-noto-sans text-[15px] flex-row font-medium leading-[180%] tracking-[-0.02em] text-red-700'>{story.date}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {isLoaded && instanceRef.current && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(mediaStories.slice(1).length)].map((_, idx) => (
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
  )
}
