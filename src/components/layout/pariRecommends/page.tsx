
"use client"
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Button } from '@/components/ui/button'
import { BASE_URL } from '@/config';
import qs from 'qs';
import axios from 'axios';
import { ChevronRight,  Sparkle  } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/locale'
import { useSearchParams } from 'next/navigation'

interface Story {
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
  const [stories, setStories] = useState<Story[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { language } = useLocale();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const fetchStories = async () => {
      // Get the initial locale from URL or fallback to default
      const currentLocale = searchParams?.get('locale') || language;
      
      try {
        const query = {
          locale: currentLocale,
          populate: {
            pari_movable_sections: {
              on: {
                'home-page.pari-recommends': {
                  fields: ['Title'],
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
        };

        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const response = await axios.get(`${BASE_URL}api/home-page?${queryString}`);
  
        const sections: Array<{
          Title: string;
          pari_recommends: Array<{
            Title: string;
          }>;
          article_with_lang_selection_1: ArticleWithLangSelection[];
        }> = response.data?.data?.attributes?.pari_movable_sections;
        
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

        setStories(formattedStories);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setStories([]);
      }
    };

    fetchStories();
  }, [language, searchParams]);

  // Show all stories if showAll is true, otherwise show only 8
  const visibleStories = showAll ? stories : stories.slice(0, 8);


  return (
    <div className='max-w-[1232px] lg:px-0 py-10 px-4 hover:h-fit mx-auto'>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className='flex flex-row items-center gap-2'>
            <Sparkle className="h-7 w-7 text-red-700" />
            <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">
              {stories[0]?.headtitle}
            </h2>
          </div>

          <Button
            variant="secondary"
            className="text-sm h-[32px] rounded-[48px] text-red-700"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : 'See all stories'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 bg-propover lg:grid-cols-4 gap-6 py-4 ${showAll ? 'h-auto' : ''}`}>
        {visibleStories.map((story, index) => (
          <StoryCard
            key={`${story.slug}-${index}`}
            title={story.title}
            description={story.description}
            imageUrl={story.imageUrl}
            categories={story.categories}
            slug={story.slug}
            authors={Array.isArray(story.authors) ? story.authors.join(', ') : story.authors}
            location={story.location}
            date={story.date}
            // languages={story.languages}
            localizations={story.localizations}
          />
        ))}
      </div>
    </div>
  );
}
