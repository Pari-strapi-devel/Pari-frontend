"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CirclePlay, Headphones, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioVideoBigCard } from './AudioVideoBigCard'
import axios from 'axios'
import { BASE_URL } from '@/config'
import qs from 'qs'
import { ArticleWithLangSelection } from '../pariRecommends/page'
import { useLocale } from '@/lib/locale'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { LocalizationData } from '@/components/layout/stories/StoryCard'
import { languages as languagesList } from '@/data/languages';

// Translation map for "More stories" button
const moreStoriesTranslations: { [locale: string]: string } = {
  'en': 'More stories',
  'hi': 'और कहानियां',
  'mr': 'अधिक कथा',
  'bn': 'আরও গল্প',
  'or': 'ଅଧିକ କାହାଣୀ',
  'ur': 'مزید کہانیاں',
  'te': 'మరిన్ని కథలు',
  'ta': 'மேலும் கதைகள்',
  'gu': 'વધુ વાર્તાઓ',
  'kn': 'ಹೆಚ್ಚಿನ ಕಥೆಗಳು',
  'pa': 'ਹੋਰ ਕਹਾਣੀਆਂ',
  'as': 'অধিক কাহিনী',
  'ml': 'കൂടുതൽ കഥകൾ',
  'bho': 'अउर कहानी',
  'hne': 'अउ कहानी'
};

interface MediaStory {
  availableLanguages: { code: string; name: string; slug: string }[] | undefined
  headtitle:  string;
  sub_title: string;
  localizations: Array<{
    locale: string;
    title: string;
    name: string;
    strap: string;
    slug: string;
  }>;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'audio' | 'video';  // This must be strictly 'audio' or 'video'
  categories: Array<{ title: string; slug: string }>;
  slug: string;
  authors: string[];
  location: string;
  date: string;
  currentLocale: string;
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

interface AudioVideoCardProps {
  publicationState?: 'live' | 'preview';
}

export function AudioVideoCard({ publicationState = 'live' }: AudioVideoCardProps) {
  const [mediaStories, setMediaStories] = useState<MediaStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language: targetLocale, addLocaleToUrl } = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const isRTL = targetLocale === 'ur'
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setIsLoaded(true)
    },
    slides: {
      perView: 1.2,
      spacing: 10,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: {
          perView: 1.5,
          spacing: 16,
        },
      },
      '(min-width: 768px)': {
        slides: {
          perView: 3,
          spacing: 24,
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 4,
          spacing: 24,
        },
      },
    },
  })

  useEffect(() => {
    const fetchAudioVideoStories = async () => {
      try {
        setIsLoading(true)

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
          publicationState,
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
          locale: targetLocale, // Add the current language to the query
        }

        const queryString = qs.stringify(query, { encodeValuesOnly: true })
        const response = await axios.get<ApiResponse>(`${BASE_URL}api/home-page?${queryString}`)
        
        const sections = response.data.data.attributes.pari_movable_sections[0];
       
        
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
            : (articleData.localizations as { data: Array<LocalizationData> })?.data || [];

          const localizations = localizationsData.map(
            (loc: {
              attributes?: { locale: string; title: string; strap: string; slug: string };
              locale?: string;
              title?: string;
              strap?: string;
              slug?: string;
            }) => ({
              locale: loc.attributes?.locale || loc.locale || '',
              title: loc.attributes?.title || loc.title || '',
              name: loc.attributes?.title || loc.title || '',
              strap: loc.attributes?.strap || loc.strap || '',
              slug: loc.attributes?.slug || loc.slug || ''
            })
          );

          // Get available languages from localizations
          const availableLanguages = localizations.map((loc: { locale:  string; slug: string; }) => {
            const langCode = loc.locale;
            const language = languagesList.find(lang => lang.code === langCode);
            return {
              code: langCode,
              name: language ? language.name : langCode,
              slug: loc.slug
            };
          });
          
          // Add current language if not in localizations
          const hasCurrentLocale = availableLanguages.some((lang: { code: string; }) => lang.code === targetLocale);
          if (!hasCurrentLocale) {
            const currentLanguage = languagesList.find(lang => lang.code === targetLocale);
            if (currentLanguage) {
              availableLanguages.unshift({
                code: targetLocale,
                name: currentLanguage.name,
                slug: articleData.slug
              });
            }
          }


          return {
            id: item.id,
            headtitle: sections.title,
            sub_title: sections.av_stories_button,
            title: articleData.Title,
            description: articleData.Strap || 'No description available',
            imageUrl: articleData.Cover_image?.data?.attributes?.url
              ? `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
              : '/images/categories/default.jpg',
            type: 'video/audio',
            duration: '00:00',
            categories: Array.isArray(articleData.categories?.data)
              ? articleData.categories.data.map(
                  (cat: { attributes: { Title: string; slug?: string } }) => ({
                    title: cat.attributes.Title,
                    slug: cat.attributes.slug || ''
                  })
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
              ? `${articleData.location.data.attributes.district} ` //${articleData.location.data.attributes.state}
              : articleData.location_auto_suggestion || 'India',
            date: articleData.Original_published_date
              ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : '',
            authors,
            availableLanguages,
            currentLocale: targetLocale
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
  }, [targetLocale, publicationState]) // Depend on language and publication state changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
      
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 flex items-center justify-center">
       
        {error}
      </div>
    )
  }

  if (!mediaStories.length) {
    return null
  }

  const featuredStory = mediaStories[0]

  return (
    <div className=" relative border-t-1 max-w-[1232px] border-[#D9D9D9] dark:border-[#444444] lg:px-0 px-4 mx-auto md:py-20 py-10 ">
      <div className="flex justify-between max-w-[1232px] mx-auto sm:items-center  sm:flex-row gap-5 mb-8">
        <div className="flex items-center gap-2">
          {featuredStory.type === 'audio' ? (
            <Headphones className="h-7 w-7 text-primary-PARI-Red" />
          ) : (
            <CirclePlay className="h-6 w-6 text-primary-PARI-Red" />
          )}
          <h6 className="text-grey-300 dark:text-discreet-text">
            {featuredStory.headtitle}
          </h6>
        </div>
        <div className="flex items-center gap-4">

          <Link href={addLocaleToUrl("articles?content=Video+Articles")}>
            <Button
              variant="secondary"
              className="text-sm h-[36px]  ml-1 sm:ml-0  ring-[1px] rounded-[48px] text-primary-PARI-Red group"
            >
              <p className="text-sm pl-2">{moreStoriesTranslations[targetLocale] || moreStoriesTranslations['en']}</p>
              <ChevronRight className="h-4 w-4 " />
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Story */}
      <div className="md:mb-6 max-w-[1232px] mx-auto mb-8 ">
        <AudioVideoBigCard 
          {...featuredStory}
        />
      </div>
      
      <div className="relative overflow-hidden">
      <div className="hidden md:flex items-center max-w-[1232px] mx-auto justify-end pb-5 gap-2">
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
        <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto !overflow-visible">
          {mediaStories.slice(1).map((story: MediaStory) => (
            <div key={story.id} className="keen-slider__slide  ">
              <StoryCard
                title={story.title}
                // description={story.description}
                authors={story.authors.join(', ')}
                imageUrl={story.imageUrl}
                categories={story.categories}
                slug={story.slug}
                location={story.location}
                date={story.date}
                videoUrl={story.type === 'video' ? 'true' : undefined}
                audioUrl={story.type === 'audio' ? 'true' : undefined}
                localizations={story.localizations}
                availableLanguages={story.availableLanguages}
                currentLocale={story.currentLocale}
                className="h-full "
              />
            </div>
          ))}
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
                  currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-gray-300'
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
