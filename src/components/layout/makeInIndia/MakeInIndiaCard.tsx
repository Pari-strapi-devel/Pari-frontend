"use client"

import Image from 'next/image';
import { BentoCard } from "@/components/magicui/bento-grid";
import { HiOutlineLightBulb } from 'react-icons/hi';
import { useLocale } from '@/lib/locale';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { JSX } from 'react/jsx-runtime';
import { Carousel, CarouselItem } from '@/components/ui/Carousel';
import { cn } from '@/lib/utils';

export interface Article {
  id: string;
  attributes: {
    Title: string;
    sub_title: string;
    strap: string;
    slug: string;
    original_published_date: string;
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
    }>;
    localizations: Array<{
      locale: string;
      title: string;
      strap: string;
      slug: string;
    }>;
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
    languages: string[];
    location: string;
    date: string;
    background: JSX.Element;
    className: string;
  }[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [strap, setStrap] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMakeInIndiaData = async () => {
      try {
        const sharedArticlePopulation = {
          fields: ['id'],
          populate: {
            all_language: { fields: ['language_name'] },
            article: {
              fields: [
                'Title',
                'sub_title',
                'strap',
                'original_published_date',
                'slug',
                'location_auto_suggestion',
              ],
              populate: {
                location: { fields: ['name', 'district', 'state'] },
                localizations: { fields: ['locale', 'title', 'strap', 'slug'] },
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
        setSectionTitle(sections.title);
        setStrap(sections.sub_title);

        const allArticles = [
          ...(sections.article_with_lang_selection_1 || []),
          ...(sections.article_with_lang_selection_2 || []),
        ];

        const formattedFeatures = allArticles.map((item, index) => {
          const articleData = item.article.data.attributes;
          const categories = articleData.categories?.data?.map((cat: { attributes: { Title: string } }) => cat.attributes.Title) || [];
          
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
            description: articleData.strap,
            href: `/stories/${articleData.slug}`,
            cta: "Read more",
            languages: [`Available in ${articleData.localizations?.length || 1} languages`],
            location: articleData.location_auto_suggestion,
            date: new Date(articleData.original_published_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            background: (
              <Image 
                src={`${BASE_URL}${articleData.Cover_image?.data?.attributes?.url}`} 
                alt={articleData.Title}
                width={300} 
                height={400} 
                className="w-full bg-gradient-to-t from-black/80 to-transparent h-full absolute right-0 top-0 bg-cover"
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
    return <div>Loading...</div>;
  }

  return (
    <div className="sm:pb-20 px-4 max-w-[1234px] mx-auto border-b-1 border-[#D9D9D9] dark:border-gray-800"> {/* Increased max-width */}
      <div>
        <div className="flex flex-col gap-2 py-4 mb-4">
          <div className='flex items-center gap-2'>
            <HiOutlineLightBulb className="h-6 w-7 text-red-700" />
            <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">
           {strap}
            </h2>
          </div>
          <h4 className="font-noto-sans text-[56px] font-bold leading-[122%] tracking-[-0.04em]">
            {sectionTitle}
          </h4>
        </div>
      </div>
      
      <Carousel
        slides={{ perView: 1, spacing: 24 }} 
        breakpoints={{
          '(min-width: 640px)': {
            slides: { perView: 1.5, spacing: 32 }, // Reduced items per view to make them wider
          },
          '(min-width: 768px)': {
            slides: { perView: 2, spacing: 32 },
          },
          '(min-width: 1024px)': {
            slides: { perView: 2.5, spacing: 32 },
          },
          '(min-width: 1280px)': {
            slides: { perView: 3, spacing: 32 }, // Reduced items per view to make them wider
          },
        }}
      >
        {features.map((feature, index) => (
          <CarouselItem 
            key={`${feature.href}-${index}`} 
            className="min-h-[400px] min-w-[360px]" // Added minimum width
          >
            <BentoCard 
              features={[{ title: feature.category[0] }]}
              {...feature}
              className={cn(
                "h-[400px] w-full",
                "group relative col-span-1 md:col-span-3 flex flex-col justify-between overflow-hidden opacity-90 cursor-pointer rounded-2xl",
                "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
                feature.className
              )}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}
// Remove the entire function
