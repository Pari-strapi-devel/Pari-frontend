"use client"

import { useState, useEffect } from 'react'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Button } from '@/components/ui/button'
import { BASE_URL } from '@/config'
import axios from 'axios'
import { ChevronRight, Sparkle } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { Carousel, CarouselItem } from '@/components/ui/Carousel'
import { cn } from '@/lib/utils'

interface AuthorName {
  data: {
    attributes: {
      Name: string;
    };
  };
}

interface Author {
  author_name?: AuthorName;
}

interface Category {
  attributes: {
    Title: string;
  };
}

interface ArticleAttributes {
  Title: string;
  strap: string;
  Original_published_date: string;
  slug: string;
  Authors?: Author[];
  Cover_image?: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  categories?: {
    data: Category[];
  };
  location?: {
    data: {
      attributes: {
        district: string;
      };
    };
  };
  location_auto_suggestion?: string;
}

interface ArticleData {
  article: {
    data: {
      attributes: ArticleAttributes;
    };
  };
}

interface Story {
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  slug: string;
  authors: string;
  location: string;
  date: string;
}

export function PariRecommends() {
  const [stories, setStories] = useState<Story[]>([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { language } = useLocale()

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const query = {
          locale: language,
          populate: {
            pari_movable_sections: {
              on: {
                'home-page.pari-recommends': {
                  fields: ['Title', 'sub_title'],
                  populate: {
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
        }

        const response = await axios.get(`${BASE_URL}api/home-page`, { params: query })
        const sections = response.data?.data?.attributes?.pari_movable_sections?.[0]
        
        if (!sections) {
          console.log('No sections found')
          return
        }

        const articles = sections.article_with_lang_selection_1 || []
        const formattedStories = articles.map((article: ArticleData): Story => {
          const articleData = article.article.data.attributes
          const authors = articleData.Authors?.map(author => author?.author_name?.data?.attributes?.Name).filter(Boolean) || ['PARI']
          const categories = articleData.categories?.data?.map(cat => cat.attributes.Title) || []
          const location = articleData.location?.data?.attributes?.district || articleData.location_auto_suggestion || ''
          
          return {
            title: articleData.Title,
            description: articleData.strap,
            imageUrl: `${BASE_URL}${articleData.Cover_image?.data?.attributes?.url}`,
            categories,
            slug: articleData.slug,
            authors: authors.join(', '),
            location,
            date: articleData.Original_published_date
              ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : ''
          }
        })

        setStories(formattedStories)
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStories()
  }, [language])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-[1232px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-row items-center gap-2">
          <Sparkle className="h-7 w-7 text-red-700" />
          <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">
            PARI Recommends
          </h2>
        </div>

        <Button
          variant="secondary"
          className="text-sm h-[32px] rounded-[48px] text-red-700"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : 'See all'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Carousel
        slides={{ perView: 1, spacing: 24 }}
        breakpoints={{
          '(min-width: 640px)': {
            slides: { perView: 2, spacing: 32 },
          },
          '(min-width: 768px)': {
            slides: { perView: 2, spacing: 32 },
          },
          '(min-width: 1024px)': {
            slides: { perView: 3, spacing: 32 },
          },
          '(min-width: 1280px)': {
            slides: { perView: 4, spacing: 32 },
          },
        }}
      >
        {stories.map((story, index) => (
          <CarouselItem 
            key={`${story.slug}-${index}`}
            className="min-h-[400px]"
          >
            <StoryCard
              {...story}
              className={cn(
                "h-full",
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl",
                "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]"
              )}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  )
}
