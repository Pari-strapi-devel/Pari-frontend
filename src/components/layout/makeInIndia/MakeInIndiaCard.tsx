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
// Remove any imports of Carousel if they exist

export interface Article {
  id: string;
  attributes: {
    Title: string;
    Strap: string;
    Original_published_date: string;
    slug: string;
    location_auto_suggestion: string;
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
    location: string;
    date: string;
    authors: string[];  // Add authors to the state type
    background: JSX.Element;
    className: string;
  }[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [strap, setStrap] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setCurrentSlide] = useState(0);
  const [, setLoaded] = useState(false);
  
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slides: {
      perView: 1,
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

        const formattedFeatures = allArticles.map((item, index) => {
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
            const localizations = Array.isArray(articleData.localizations.data) 
              ? articleData.localizations.data.map((loc: { locale: string; title: string; strap: string; slug: string }) => ({
                  locale: loc.locale,
                  title: loc.title,
                  strap: loc.strap,
                  slug: loc.slug
                }))
              : []; 
         
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
            href: `/stories/${articleData.slug}`,
            cta: "Read more",
            localizations,  // This is already correctly formatted
            location,
            date: articleData.Original_published_date
                ? new Date(articleData.Original_published_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })
                : '',
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
  }, [language]);

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
              <h2 className="text-[13px] font-noto-sans uppercase text-grey-300 leading-[100%] letter-spacing-[-2%] font-semibold">
                {strap}
              </h2>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <h4 className="font-noto-sans sm:text-[40px] md:text-[48px] lg:text-[56px] text-[32px] font-bold leading-[122%] tracking-[-0.04em]">
              {sectionTitle}
            </h4>
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
            <div 
              key={`${feature.href}-${index}`} 
              className="keen-slider__slide min-h-[400px] md:p-3 max-w-full min-w-[360px]  "
            >
              <BentoCard
                features={[{ title: feature.category[0] }]}
                {...feature}
                className={cn(
                  "h-[520px] w-full",
                  "group relative col-span-1 md:col-span-3 flex flex-col justify-between overflow-hidden opacity-90 cursor-pointer rounded-2xl",
                  "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
                  feature.className
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
                    <p className="text-sm text-gray-300">
                      {feature.authors.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      {feature.location && <span>{feature.location}</span>}
                      {feature.location && feature.date && <span>•</span>}
                      {feature.date && <span>{feature.date}</span>}
                    </div>
                    {feature.localizations && feature.localizations.length > 0 && (
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>Available in {feature.localizations.length} languages</span>
                          <div className="relative flex gap-1">
                            {/* Replace Carousel with a simple div */}
                            <div className="w-fit flex gap-1">
                              {feature.localizations.map((loc, idx) => (
                                <Link 
                                  key={`${loc.locale}-${idx}`}
                                  href={`/stories/${loc.slug}`}
                                  className="px-2 py-1 text-xs bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                                >
                                  {loc.locale}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BentoCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Remove the entire function
