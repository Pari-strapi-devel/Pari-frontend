
"use client"

import { useKeenSlider } from 'keen-slider/react'
import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale'
import { useSearchParams } from 'next/navigation'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { cn } from '@/lib/utils'
import 'keen-slider/keen-slider.min.css'
import { Sparkle, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import qs from 'qs'
import axios from 'axios'
import { BASE_URL } from '@/config'

interface Story {
  sub_title: string;
  localizations: { locale: string; title: string; strap: string; slug: string; }[] | undefined;
  headtitle: string;
  authors: string | string[];  // Changed from authors(authors: any): unknown
  categories: string[] | undefined;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  languages: string[];
  location: string;
  date: string;
}

export interface ArticleWithLangSelection {
  headtitle: string;
  sub_title: string;
  
  id: number;
  all_language: {
    data: Array<{
      attributes: {
        language_name: string;
      };
    }>;
  };
  article: {
    data: {
      attributes: {
        Strap: string;
        original_published_date: string;
        Original_published_date: string;
        localizations: {  locale: string; title: string; strap: string; slug: string; }[];
        Authors: {
          data: Array<{
            attributes: {
              author_name: {
                data: {
                  attributes: {
                    Name: string;
                  }
                }
              }
            }
          }>;
        };
        Title: string;
        strap: string;
        slug: string;
        location_auto_suggestion: string;
        location: {
          data: {
            attributes: {
              name: string;
              district: string;
              state: string;
            };
          };
        };
        Cover_image: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
        mobilecover: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
        categories: {
          data: Array<{
            attributes: {
              slug: string;
              Title: string;
            };
          }>;
        };
      };
    };
  };
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { language: currentLocale } = useLocale()
  const searchParams = useSearchParams()
  
  // Add slider states
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Initialize keen-slider
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slides: {
      perView: 1.2,
      spacing: 10,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 16 },
      },
      '(min-width: 768px)': {
        slides: { perView: 2.5, spacing: 24 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 3, spacing: 24 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 4, spacing: 24 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    mounted() {
      setLoaded(true)
    },
  })

  // Add cleanup
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        instanceRef.current.destroy()
      }
    }
  }, [instanceRef])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true)

        const query = {
          locale: currentLocale,
          populate: {
            fields: ['seeallStories'],
            pari_movable_sections: {
              on: {
                'home-page.pari-recommends': {
                  fields: ['Title', ],
                  populate: {
                    see_all_button: true,
                    article_with_lang_selection_1: {
                      populate: {
                        all_language: {
                          fields: ['language_name']
                        },
                        article: {
                          populate: {
                            localizations: {
                              fields: ['locale', 'title', 'strap', 'slug']
                            },
                            Authors: {
                              populate: {
                                author_name: {
                                  fields: ['Name']
                                }
                              }
                            },
                            Cover_image: {
                              fields: ['url']
                            },
                            categories: {
                              fields: ['slug', 'Title']
                            },
                            location: {
                              fields: ['name', 'district', 'state']
                            }
                          },
                          fields: ['Title', 'strap', 'Original_published_date', 'slug', 'location_auto_suggestion']
                        }
                      }
                    }
                  }
                

                }
              }
            }
          }
        };

        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const response = await axios.get(`${BASE_URL}api/home-page?${queryString}`);
  
        const sections: Array<{
          Title: string;
          see_all_button: string;
          article_with_lang_selection_1: ArticleWithLangSelection[];
        }> = response.data?.data?.attributes?.pari_movable_sections;
      const see_all_button = response.data?.data?.attributes?.seeallStories;
     
        const articles = sections[0]?.article_with_lang_selection_1 || [];
        if (!articles.length) {
          return;
        }

        const formattedStories = articles
          .filter((article: ArticleWithLangSelection) => article?.article?.data?.attributes)
          .map((article: ArticleWithLangSelection) => {
            const articleData = article.article.data.attributes;
            // Fix author data extraction
            const authors = Array.isArray(articleData.Authors)
              ? articleData.Authors.map(author => {
                const name = author?.author_name?.data?.attributes?.Name
                return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI'
              })
              : ['PARI']
            const langsData = article.all_language?.data;
            let langs: string[] = [];
        
            if (Array.isArray(langsData)) {
              langs = langsData.map((lang: { attributes: { language_name: string } }) => lang.attributes.language_name);
            } else if (
              langsData &&
              typeof langsData === 'object' &&
              'attributes' in langsData &&
              'language_name' in (langsData as { attributes: { language_name: string } }).attributes
            ) {
              langs = [(langsData as { attributes: { language_name: string } }).attributes.language_name];
            } else {
              langs = ['Available in 6 languages'];
            }
            

            // First, ensure localizations is an array
            const localizationsData = Array.isArray(articleData.localizations) 
              ? articleData.localizations 
              : (articleData.localizations as { data: Array<{ locale: string; title: string; strap: string; slug: string }> })?.data || [];

            // Then map over the array
            const localizations = localizationsData.map(
              (loc: { locale: string; title: string; strap: string; slug: string }) => ({
                locale: loc.locale,
                title: loc.title,
                strap: loc.strap,
                slug: loc.slug
              })
            );
        
            return {
              headtitle: sections[0]?.Title,
              sub_title: see_all_button,
              title: articleData.Title,
              description: articleData.strap,
              imageUrl: articleData.Cover_image?.data?.attributes?.url
                ? `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
                : '/images/categories/default.jpg',
              slug: articleData.slug,
              categories: articleData.categories?.data?.map(
                (cat: { attributes: { Title: string } }) => cat.attributes.Title
              ) || [],
              authors,
              languages: langs,
              localizations,
              location:
                articleData.location?.data?.attributes?.district ||
                articleData.location_auto_suggestion ||
                'India',
              date: articleData.Original_published_date
                ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })
                : '',
            };
          });

        setStories(formattedStories)
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStories()
  }, [currentLocale, searchParams])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    )
  }

  const visibleStories = showAll ? stories : stories.slice(0, 4)

  return (
    <div className='max-w-[1232px] relative overflow-hidden border-t-1 border-[#D9D9D9] dark:border-[#444444] lg:px-0 md:pt-12 pt-10 px-4 mx-auto'>
      <div className="pb-4 relative z-10">
        <div className="flex justify-between sm:flex-row  flex-col sm:items-center gap-5 mb-4">
          <div className='flex flex-row items-center gap-2'>
            <Sparkle className="h-6 w-6 text-primary-PARI-Red" />
            <h2 className="text-[13px] font-noto-sans  uppercase text-grey-300 line-clamp-1 leading-[100%] letter-spacing-[-2%] font-semibold">
              {stories[0]?.headtitle}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="secondary"
              className="text-sm h-[36px] ml-1 sm:ml-0 ring-[2px] rounded-[48px] text-primary-PARI-Red"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : stories[0]?.sub_title || 'See all'}
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="hidden md:flex items-center  gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => instanceRef.current?.prev()}
                className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => instanceRef.current?.next()}
                className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hinden ">
        <div ref={sliderRef} className="keen-slider max-w-[1232px] mx-auto relative !overflow-visible ">
          {visibleStories.map((story, index) => (
            <div 
              key={`${story.slug}-${index}-${currentLocale}`}
              className="keen-slider__slide min-h-[500px] "
            >
              <StoryCard
                {...story}
                description={story.description}
                authors={Array.isArray(story.authors) ? story.authors.join(', ') : story.authors}
                className={cn(
                  "h-full",
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl",
                  "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]"
                )}
              />
            </div>
          ))}
        </div>

        {loaded && instanceRef.current && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(visibleStories.length)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => instanceRef.current?.moveToIdx(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-grey-300'
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
