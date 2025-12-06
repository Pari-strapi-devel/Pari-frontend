"use client"

import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState, useEffect } from 'react'
// import WeekOnHeader from './WeekOnHeader'
import { ArticleCard } from '@/components/ui/ArticleCard'
import axios from 'axios'
import { BASE_URL } from '@/config'
import { API_BASE_URL } from '@/utils/constants'
import qs from 'qs'
import WeekOnHeader from './WeekOnHeader'
import { useLocale } from '@/lib/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      type: string;
      Authors: Author[];
      categories: {
        data: CategoryData[];
      };
      Title: string;
      Strap: string;
      Original_published_date: string;
      slug: string;
      locale?: string;
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
      mobilecover: {
        data: {
          attributes: {
            url: string;
          }
        }
      };
      localizations?: {
        data: Array<{
          attributes: {
            locale: string;
            slug: string;
            title?: string;
            strap?: string;
          }
        }>
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
  id: number
  forEach(arg0: (item: ArticleWithLangSelection, index: number) => void): void;
  all_language: {
    language_name: string;
  };
  article: Article;
}

interface ApiResponse {
  data: {
    attributes: {
      seeallStories: string;
      thisWeekOnPari: {
        ThisWeek_On_Pari_Icon: {
          data: {
            attributes: {
              url: string;
            }
          }
        };
        id: number;
        ThisWeek_On_Pari_Title: string;
        article_with_lang_selection_1: ArticleWithLangSelection[];
      };
    };
  };
}

interface FormattedArticle {
  type: string;
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  mobileImageUrl: string;
  categories: Category[];
  slug: string;
  authors: string[];
  location: string;
  date: string;
  availableLanguages: Array<{
    code: string;
    slug: string;
  }>;
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
  const [thisWeekData, setThisWeekData] = useState<ApiResponse['data']['attributes']['thisWeekOnPari'] | null>(null)
  const [seeAllStories, setSeeAllStories] = useState<string>("See all stories");
  const { language } = useLocale()
  const isRTL = language === 'ur'

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
        slides: { perView: 1.5, spacing: 16 },
      },
      '(min-width: 768px)': {
        slides: { perView: 1.5, spacing: 24 },
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
            fields: ['seeallStories'],
            thisWeekOnPari: {
              populate: {
                
                ThisWeek_On_Pari_Icon: {
                  fields: ['url', 'name', 'alternativeText'],
                },
                article_with_lang_selection_1: {
                  populate: {
                    all_language: true,
                    article: {
                      populate: {
                        Cover_image: true,
                        mobilecover: true,
                        Authors: {
                          populate: {
                            author_name: {
                              populate: true
                            },
                            author_role: true
                          }
                        },
                        categories: true,
                        location: true,
                        localizations: {
                          fields: ['locale', 'slug', 'title', 'strap']
                        }
                      }
                    }
                  }
                },
                ThisWeek_On_Pari_Title: true
              }
            }
          },
          locale: language
        }

        const queryString = qs.stringify(query, { encodeValuesOnly: true })

        const response = await axios.get<ApiResponse>(
          `${BASE_URL}api/home-page?${queryString}`
        )
       
        const weekData = response.data?.data?.attributes?.thisWeekOnPari;
        const seeAllStories = response.data?.data?.attributes?.seeallStories;
        setThisWeekData({
          ...weekData,
          ThisWeek_On_Pari_Title: weekData?.ThisWeek_On_Pari_Title || "This Week on PARI"
        });
        setSeeAllStories(seeAllStories || "See all stories");
        
     console.log('thisWeekData:', weekData);
       
        // Update header icon handling
        const iconUrl = weekData?.ThisWeek_On_Pari_Icon?.data?.attributes?.url;
        if (iconUrl) {
          setHeader(iconUrl.startsWith('http') ? iconUrl : `${BASE_URL}${iconUrl}`);
        } else {
          setHeader(`${API_BASE_URL}/v1/uploads/stand_2aa0fa18b2.svg`); // Removed extra quotes
        }

        const articleArray = weekData?.article_with_lang_selection_1 || [];
        

        const articles = (Array.isArray(articleArray) ? articleArray : [])
          .map((item: ArticleWithLangSelection): FormattedArticle | null => {
            const articleData = item?.article?.data?.attributes;
            
            if (!articleData) {
              console.log('No article data for item:', item);
              return null;
            }

            const authors = Array.isArray(articleData.Authors)
              ? articleData.Authors.map(author => {
                  const name = author?.author_name?.data?.attributes?.Name;
                  return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI';
                })
              : ['PARI'];

            const categories = articleData.categories?.data?.map((cat: CategoryData) => ({
              slug: cat?.attributes?.slug || '',
              Title: cat?.attributes?.Title || ''
            })) || [];

            // Extract available languages from localizations
            const availableLanguages = articleData.localizations?.data?.map((loc) => ({
              code: loc.attributes.locale,
              slug: loc.attributes.slug
            })) || [];

            // Add current article as a language option
            if (articleData.slug) {
              availableLanguages.push({
                code: articleData.locale || 'en',
                slug: articleData.slug
              });
            }

            // Debug logging
            if (availableLanguages.length > 1) {
              console.log('Article with multiple languages:', articleData.Title);
              console.log('Available languages:', availableLanguages);
            }

            return {
              id: item.id || 0,
              title: articleData.Title || 'Untitled',
              description: articleData.Strap || '',
              imageUrl: articleData.Cover_image?.data?.attributes?.url
                ? articleData.Cover_image.data.attributes.url.startsWith('http')
                  ? articleData.Cover_image.data.attributes.url
                  : `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
                : '',
              mobileImageUrl: articleData.mobilecover?.data?.attributes?.url
                ? articleData.mobilecover.data.attributes.url.startsWith('http')
                  ? articleData.mobilecover.data.attributes.url
                  : `${BASE_URL}${articleData.mobilecover.data.attributes.url}`
                : '',
              categories,
              slug: articleData.slug || '',
              authors,
              location: articleData.location?.data?.attributes
                ? `${articleData.location.data.attributes.district} ` //${articleData.location.data.attributes.state}
                : articleData.location_auto_suggestion || 'India',
              date: articleData.Original_published_date
                ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
                : '',
              type: articleData.type || '',
              availableLanguages
            }
          })
          .filter((article): article is FormattedArticle => article !== null);

        if (articles.length === 0) {
          setArticles([{
            id: 1,
            title: 'No articles available',
            description: 'Please check back later',
            imageUrl: '',
            mobileImageUrl: '',
            categories: [],
            slug: '',
            authors: ['PARI'],
            location: 'India',
            date: new Date().toISOString(),
            type: '',
            availableLanguages: []
          }]);
        } else {
          setArticles(articles);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    }

    thisWeekOnPari();
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
    <section className="py-10 md:py-12 px-4 relative overflow-hidden">
      <div className="max-w-[1232px] mx-auto">
        <div className="flex justify-between sm:flex-row   items-center gap-5 mb-6">
          <WeekOnHeader 
            header={header}
            title={thisWeekData?.ThisWeek_On_Pari_Title || "This Week on PARI"}
         
          />
          <Link href="/articles">
<Button 
                variant="secondary" 
                className="text-sm h-[36px] ml-1 flex md:hidden ring-[2px] rounded-[48px] text-primary-PARI-Red mr-4"
              >
                {seeAllStories || "See all stories"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
          </Link>
          
        
        </div>
        
        <div className="relative  mt-4">
          <div className={`absolute top-[-60px] z-10 ${isRTL ? 'left-0' : 'right-0'}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="/articles" >
                <Button
                  variant="secondary"
                  className="text-sm h-[36px] md:flex hidden ring-[1px] rounded-[48px]"
                >
                  {seeAllStories || "See all stories"}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <div className="gap-4 hidden md:flex">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    
                      instanceRef.current?.next()
                   
                      instanceRef.current?.prev()
                    
                  }}
                  className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    
                      instanceRef.current?.prev()
                 
                      instanceRef.current?.next()
                    
                  }}
                  className="bg-white dark:bg-popover hover:bg-primary-PARI-Red text-primary-PARI-Red hover:text-white rounded-full cursor-pointer w-10 h-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div ref={sliderRef} className="keen-slider  !overflow-visible">
            {articles.map((story) => (
              <ArticleCard
                videoUrl={story.type.toLowerCase() === 'video' ? 'true' : undefined}
                audioUrl={story.type.toLowerCase() === 'audio' ? 'true' : undefined}
           
                key={story.id}
                title={story.title}
                description={story.description}
                imageUrl={story.imageUrl}
                mobileImageUrl={story.mobileImageUrl}
                categories={story.categories?.map(cat => cat.Title) || []}
                slug={story.slug}
                authors={story.authors}
                location={story.location}
                date={story.date}
                availableLanguages={story.availableLanguages}
                className="keen-slider__slide !min-h-[500px] !w-full"
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
                    currentSlide === idx ? 'bg-primary-PARI-Red' : 'bg-gray-300'
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
