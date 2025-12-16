"use client"

import Image from 'next/image';
import { BentoCard } from "@/components/magicui/bento-grid";
import { useLocale } from '@/lib/locale';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { JSX } from 'react/jsx-runtime';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { languages as languagesList } from '@/data/languages';


import { Globe, X } from 'lucide-react';

export interface Article {
  id: string;
  attributes: {
    Title: string;
    Strap: string;
    Original_published_date: string;
    slug: string;
    location_auto_suggestion: string;
    type: string;
    Cover_image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    categories: {
      data: Array<{
        attributes: {
          Title: string;
          slug: string;
        };
      }>;
    };
    Authors: Array<{
      author_name: {
        data: {
          attributes: {
            Name: string;
          };
        };
      };
      author_role?: {
        data: {
          attributes: {
            Name: string;
          };
        };
      };
    }>;
    localizations: {
      data: Array<{
        locale: string;
        title: string;
        strap: string;
        slug: string;
      }>;
    };
  };

}

export function MakeInIndiaCard() {
  const { language } = useLocale();
  const [features, setFeatures] = useState<{
    category: string[];
    name: string;
    title: string;
    strap: string;
    description: string;
    href: string;
    cta: string;
    localizations: Array<{ locale: string; title: string; strap: string; slug: string }>;
    availableLanguages: Array<{ code: string; name: string; slug: string }>;
    location: string;
    date: string;
    type: string;
    videoUrl?: string;
    audioUrl?: string;
    authors: string[];
    background: JSX.Element;
    className: string;
  }[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [strap, setStrap] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setCurrentSlide] = useState(0);
  const [, setLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<{
    category: string[];
    name: string;
    title: string;
    strap: string;
    description: string;
    href: string;
    cta: string;
    localizations: Array<{ locale: string; title: string; strap: string; slug: string }>;
    availableLanguages: Array<{ code: string; name: string; slug: string }>;
    location: string;
    date: string;
    type: string;
    videoUrl?: string;
    audioUrl?: string;
    authors: string[];
    background: JSX.Element;
    className: string;
  } | null>(null);
  const { language: currentLocale } = useLocale();

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slides: {
      perView: 1.1,
      spacing: 12,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 1.5, spacing: 10 },
      },
      '(min-width: 768px)': {
        slides: { perView: 1.5, spacing: 10 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 2.5, spacing: 10 },
      },
      '(min-width: 1280px)': {
        slides: { perView: 3, spacing: 10 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0);
    },
    mounted() {
      setLoaded(true);
    },
  });



  useEffect(() => {
    const fetchMakeInIndiaData = async () => {
      try {
        setIsLoading(true);

        const sharedArticlePopulation = {
          fields: ['id'],
          populate: {
            all_language: { fields: ['language_name'] },
            article: {
              fields: [
                'Title',
                'Strap',
                'Original_published_date',
                'slug',
                'location_auto_suggestion',
                'type',
              ],
              populate: {
                location: { fields: ['name', 'district', 'state'] },
                localizations: { fields: ['locale', 'title', 'strap', 'slug'] },
                Authors: {
                  populate: {
                    author_role: { fields: ['Name'] },
                    author_name: { 
                      populate: true,
                      fields: ['Name']
                    },
                  },
                },
                Cover_image: { fields: ['url'] },
                mobilecover: { fields: ['url'] },
                categories: { fields: ['slug', 'Title'] },
              },
            },
          },
        };

        const query = {
          locale: language,
          populate: {
            pari_movable_sections: {
              on: {
                'home-page.editors-choice': {
                  fields: ['title', 'sub_title'],
                  populate: {
                    article_with_lang_selection_1: sharedArticlePopulation,
                    article_with_lang_selection_2: sharedArticlePopulation,
                  },
                },
              },
            },
          },
        };

        const response = await axios.get(`${BASE_URL}api/home-page`, { params: query });
        const sections = response.data.data.attributes.pari_movable_sections[0];
        
        if (!sections) {
         
          return;
        }
        
        setSectionTitle(sections.title || '');
        setStrap(sections.sub_title || '');
        
        const allArticles = [
          ...(sections.article_with_lang_selection_1 || []),
          ...(sections.article_with_lang_selection_2 || []),
        ];

        const formattedFeatures = allArticles
          .filter((item) => item?.article?.data?.attributes) // Filter out items with null data
          .map((item, index) => {
          const articleData = item.article.data.attributes;
          const categories = articleData.categories?.data?.map((cat: { attributes: { Title: string } }) => cat.attributes.Title) || [];
          const location = articleData.location?.data?.attributes?.district || articleData.location_auto_suggestion || 'India';
          
          // Extract authors
          const authors = Array.isArray(articleData.Authors)
            ? articleData.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) => {
                const name = author?.author_name?.data?.attributes?.Name;
                return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI';
              })
            : ['PARI'];
            const localizationsData = Array.isArray(articleData.localizations?.data) 
              ? articleData.localizations.data
              : [];

          // Map to consistent format with proper typing
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
          const currentLanguageExists = availableLanguages.some((lang: { code: string; }) => lang.code === currentLocale);
          if (!currentLanguageExists) {
            const currentLanguage = languagesList.find(lang => lang.code === currentLocale);
            if (currentLanguage) {
              availableLanguages.unshift({
                code: currentLocale,
                name: currentLanguage.name,
                slug: articleData.slug
              });
            }
          }

          // Define grid positions based on index
          const gridPositions = [
            "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
            "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
            "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
            "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
            "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
          ];

          return {
            category: categories,
            name: categories[0] || "Story",
            title: articleData.Title,
            strap: articleData.sub_title,
            authors,
            description: articleData.Strap,
            href: `${articleData.slug}`,
            cta: "Read more",
            localizations,
            availableLanguages,
            location,
            date: articleData.Original_published_date
                ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })
                : '',
            type: articleData.type?.toLowerCase() || '',
            videoUrl: articleData.type?.toLowerCase() === 'video' ? 'true' : undefined,
            audioUrl: articleData.type?.toLowerCase() === 'audio' ? 'true' : undefined,
            background: (
              <Image 
                src={`${BASE_URL}${articleData.Cover_image?.data?.attributes?.url}`} 
                alt={articleData.Title}
                width={300} 
                height={400} 
                className="w-full bg-gradient-to-t from-black/80 to-transparent inset-0 object-cover h-full absolute right-0 top-0 bg-cover"
              />
            ),
            className: gridPositions[index] || "",
          };
        });

        setFeatures(formattedFeatures);
      } catch (error) {
        console.error('Error fetching Make in India data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMakeInIndiaData();
  }, [language, currentLocale]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    )
  }
 
  return (
    <div className="sm:pb-16 pb-10 px-4 overflow-hidden dark:border-border">
      <div className="max-w-[1232px] mx-auto">
        <div className="flex flex-col gap-2 pb-4 mb-4">
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Newspaper className="h-6 w-7 text-primary-PARI-Red" />
              <h6 className="text-grey-300 dark:text-discreet-text">
                {strap}
              </h6>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-foreground mb-2">
              {sectionTitle}
            </h1>
            <div className="hidden md:flex items-end gap-3">
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
      
      <div className="relative max-w-[1234px] mx-auto">
        <div ref={sliderRef} className="keen-slider !overflow-visible">
          {features.map((feature, index) => (
            <Link
              key={`${feature.href}-${index}`}
              href={`/article/${feature.href}`}
              className="keen-slider__slide min-h-[400px] md:p-3 max-w-full min-w-[360px]  "
            >
              <BentoCard
                features={[{ title: feature.category[0] }]}
                {...feature}
                className={cn(
                  "h-[520px] w-full",
                  " relative col-span-1 md:col-span-3 flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl",
             
                  
                )}
              >
                {feature.background}
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      {feature.category.map((cat, idx) => (
                        <span key={idx} className="text-xs font-medium text-white bg-primary-PARI-Red px-2 py-1 rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-4  font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-200">
                      {feature.description}
                    </p>
                  </div>
                
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">
                      {feature.authors && feature.authors.length > 0 ? (
                        feature.authors.map((author, index) => (
                          <span key={index}>
                            <span
                              className="cursor-pointer hover:text-white transition-colors duration-200"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/articles?author=${encodeURIComponent(author.trim())}`;
                              }}
                            >
                              {author.trim()}
                            </span>
                            {index < feature.authors.length - 1 && ', '}
                          </span>
                        ))
                      ) : (
                        'PARI'
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      {feature.location && <span>{feature.location}</span>}
                      {feature.location && feature.date && <span>•</span>}
                      {feature.date && <span>{feature.date}</span>}
                    </div>
                    {feature.availableLanguages && feature.availableLanguages.length > 0 && (
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>Available in {feature.availableLanguages.length} languages</span>
                          <button
                            className="rounded-full ml-2 backdrop-blur-sm cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedFeature(feature);
                              setIsSheetOpen(true);
                            }}
                          >
                            <Globe className="h-4 w-4 text-primary-PARI-Red" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BentoCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Language Modal Dialog */}
      {isSheetOpen && selectedFeature && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSheetOpen(false);
              setSelectedFeature(null);
            }}
          />

          {/* Language Modal - Full Body */}
          <div className="fixed inset-0 flex items-end md:items-center justify-center z-[101] p-0 md:p-4">
            <div className="bg-white dark:bg-popover rounded-t-lg md:rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    This story is available in {selectedFeature.availableLanguages?.length || 0} languages
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select your preferred language to read this story
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSheetOpen(false);
                    setSelectedFeature(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content - Single Column on Mobile, 2 Column on Desktop */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFeature.availableLanguages?.map((language: { code: string; name: string; slug: string }) => {
                    const languageData = languagesList.find(lang => lang.code === language.code);
                    return (
                      <button
                        key={`lang-${language.code}-${language.slug}`}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                          currentLocale === language.code
                            ? 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-md'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/article/${language.slug}`;
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-base font-medium mb-1">
                              {languageData ? languageData.names[0] : language.name}
                            </div>
                            <div className="text-sm opacity-70">
                              {languageData ? languageData.names[1] : ''}
                            </div>
                          </div>
                          {currentLocale === language.code && (
                            <div className="w-3 h-3 rounded-full bg-primary-PARI-Red"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// Remove the entire function
