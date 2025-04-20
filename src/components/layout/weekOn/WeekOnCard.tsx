"use client"

import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState, useEffect } from 'react'
// import WeekOnHeader from './WeekOnHeader'
import { ArticleCard } from '@/components/ui/ArticleCard'
import axios from 'axios'
import { BASE_URL } from '@/config'
import qs from 'qs'
import WeekOnHeader from './WeekOnHeader'
import { useLocale } from '@/lib/locale'

interface Author {
  author_role: {
    Name: string;
  };
  author_name: {
    data: {
      attributes: {
        Name: string;
      }
    }
    Name: string;
  };
}

interface Location {
  name: string;
  district: string;
  state: string;
}

interface Category {
  slug: string;
  Title: string;
}

interface Localization {
  locale: string;
  title: string;
  strap: string;
  slug: string;
}

interface Article {
  data: {
    attributes: {
      Authors: Author[];
      categories: {
        data: CategoryData[];
      };
      Title: string;
      Strap: string;
      Original_published_date: string;
      slug: string;
      location_auto_suggestion: string;
      location: {
        data: {
          attributes: {
            district: string;
            state: string;
          }
        }
      };
      Cover_image: {
        data: {
          attributes: {
            url: string;
          }
        }
      };
    }
  }
  Title: string;
  strap: string;
  original_published_date: string;
  slug: string;
  location_auto_suggestion: string;
  location: Location;
  localizations: Localization[];
  Authors: Author[];
  Cover_image: { url: string };
  mobilecover: { url: string };
  categories: Category[];
}

interface ArticleWithLangSelection {
  forEach(arg0: (item: ArticleWithLangSelection, index: number) => void): void;
  all_language: {
    language_name: string;
  };
  article: Article;
}

interface ApiResponse {
  data: {
    attributes: {
      thisWeekOnPari: {
        ThisWeek_On_Pari_Icon?: string;
        [key: string]: ArticleWithLangSelection | string | undefined;
      };
    };
  };
}

interface FormattedArticle {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categories: Category[];
  slug: string;
  authors: string[];
  location: string;
  date: string;
}

interface CategoryData {
  attributes: {
    slug: string;
    Title: string;
  }
}

// interface WeekOnHeaderProps {
//   header?: string;
// } // Removed this unused interface

export function WeekOnCard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, ] = useState(false)
  const [articles, setArticles] = useState<FormattedArticle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [header, setHeader] = useState<string>()
  const { language } = useLocale()

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0)
    },
    slides: {
      perView: 1.1,
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 16 },
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

  useEffect(() => {
    async function thisWeekOnPari() {
      try {
        setIsLoading(true)

        const query = {
          populate: {
            thisWeekOnPari: {
              fields: ['*'],
              populate: {
               
                article_with_lang_selection_1: {
                  populate: {
                    all_language: true,
                    article: {
                      populate: {
                        Cover_image: true,
                        Authors: {
                          populate: {
                            author_name: {
                              populate: true
                            }
                          }
                        },
                        author_role: true,
                        categories: true,
                        location: true
                      }
                    }
                  }
                },
              }
            }
          },
          locale: language
        }

        const queryString = qs.stringify(query, { encodeValuesOnly: true })

        const response = await axios.get<ApiResponse>(
          `${BASE_URL}api/home-page?${queryString}`
        )
         
        const headerIcon = response.data?.data?.attributes?.thisWeekOnPari?.ThisWeek_On_Pari_Icon;
        setHeader(headerIcon);

        const articleArray = response.data?.data?.attributes?.thisWeekOnPari?.article_with_lang_selection_1 || []

        const articles = (Array.isArray(articleArray) ? articleArray : [])
          .map((item: ArticleWithLangSelection, index: number): FormattedArticle | null => {
            const articleData = item?.article?.data?.attributes
            console.log('Article data:', articleData)
            if (!articleData) return null


            const authors = Array.isArray(articleData.Authors)
              ? articleData.Authors.map(author => {
                const name = author?.author_name?.data?.attributes?.Name
                return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI'
              })
              : ['PARI']


            console.log(JSON.stringify(articleData.Authors, null, 2))



            const categories = articleData.categories?.data?.map((cat: CategoryData) => ({
              slug: cat?.attributes?.slug || '',
              Title: cat?.attributes?.Title || ''
            })) || []

            return {
              id: index + 1,
              title: articleData.Title || 'Untitled',
              description: articleData.Strap || '',
              imageUrl: articleData.Cover_image?.data?.attributes?.url
                ? articleData.Cover_image.data.attributes.url.startsWith('http')
                  ? articleData.Cover_image.data.attributes.url
                  : `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
                : '/images/categories/category-img.png',
              categories,
              slug: articleData.slug || '',
              authors,
              location: articleData.location?.data?.attributes
                ? `${articleData.location.data.attributes.district}, ${articleData.location.data.attributes.state}`
                : articleData.location_auto_suggestion || 'India',
              date: articleData.Original_published_date
                ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
                : '',
            }
          })
          .filter((article): article is FormattedArticle => article !== null)

        // Process article 2
        // If no articles found, show a more specific error
        if (articles.length === 0) {
          console.error('No articles found in response. Full response:', response.data)
          setArticles([{
            id: 1,
            title: 'No articles available',
            description: 'Please check back later',
            imageUrl: '/images/categories/category-img.png',
            categories: [],
            slug: '',
            authors: ['PARI'],
            location: 'India',
            date: new Date().toISOString(),
          }])
        } else {
          setArticles(articles)
        }
      } catch (err) {
        console.error('Error fetching articles:', err)
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
          })
        }
        setError('Failed to fetch articles')
      } finally {
        setIsLoading(false)
      }
    }

    thisWeekOnPari()
  }, [language])
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>
  }

  return (
    <section className="py-10 md:py-20 px-4 relative overflow-hidden">
      <div className="max-w-[1232px] mx-auto">
        <WeekOnHeader header={header} />
        
        <div className="relative mt-8">
          <div ref={sliderRef} className="keen-slider !overflow-visible">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article?.title}
                description={article.description}
                imageUrl={article.imageUrl}
                categories={article.categories?.map(cat => cat.Title) || []}
                slug={article.slug}
                authors={article.authors}
                location={article.location}
                date={article.date}
                className="keen-slider__slide !min-h-[500px]"
              />
            ))}
          </div>

          {loaded && instanceRef.current && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(articles.length)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  className={`h-2 w-2 rounded-full transition-colors duration-100 ${
                    currentSlide === idx ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
