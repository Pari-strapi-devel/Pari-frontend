"use client";

import { useKeenSlider } from "keen-slider/react";
import { useState, useEffect } from "react";
import { useLocale } from "@/lib/locale";
import { StoryCard } from "@/components/layout/stories/StoryCard";
import { languages as languagesList } from "@/data/languages";
import "keen-slider/keen-slider.min.css";
import { Sparkle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import qs from "qs";
import axios from "axios";
import { BASE_URL } from "@/config";


interface Story {
  availableLanguages: { code: string; name: string; slug: string; }[] | undefined;
  sub_title: string;
  localizations:
    | { locale: string; title: string; strap: string; slug: string }[]
    | undefined;
  headtitle: string;
  authors: string | string[]; // Changed from authors(authors: any): unknown
  categories: { title: string; slug: string; }[] | undefined;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  languages: string[];
  location: string;
  date: string;
  type: string;
  videoUrl?: string;
  audioUrl?: string;
}

export interface ArticleWithLangSelection {
  headtitle: string;
  sub_title: string;

  id: number;
  locale: string;
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
        type: string;
        locale: string;
        localizations: {
          locale: string;
          title: string;
          strap: string;
          slug: string;
        }[];
        Authors: {
          data: Array<{
            attributes: {
              author_name: {
                data: {
                  attributes: {
                    Name: string;
                  };
                };
              };
            };
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
  const [isLoading, setIsLoading] = useState(false);
  const { language: currentLocale, addLocaleToUrl } = useLocale();

  // Add slider states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Initialize keen-slider
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slides: {
      perView: 1.2,
      spacing: 10,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2.2, spacing: 16 },
      },
      "(min-width: 768px)": {
        slides: { perView: 2.5, spacing: 24 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 24 },
      },
      "(min-width: 1280px)": {
        slides: { perView: 4, spacing: 24 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details?.rel ?? 0);
    },
    mounted() {
      setLoaded(true);
    },
  });

  // Add cleanup
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        instanceRef.current.destroy();
      }
    };
  }, [instanceRef]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);

        // Fetch home page based on current locale - each locale has different articles configured
        const query = {
          locale: currentLocale || "en",
          populate: {
            fields: ["seeallStories"],
            pari_movable_sections: {
              on: {
                "home-page.pari-recommends": {
                  fields: ["Title"],
                  populate: {
                    see_all_button: true,
                    article_with_lang_selection_1: {
                      populate: {
                        all_language: {
                          fields: ["language_name"],
                        },
                        article: {
                          populate: {
                            localizations: {
                              fields: ["locale", "title", "strap", "slug"],
                            },
                            Authors: {
                              populate: {
                                author_name: {
                                  fields: ["Name"],
                                },
                              },
                            },
                            Cover_image: {
                              fields: ["url"],
                            },
                            categories: {
                              fields: ["slug", "Title"],
                            },
                            location: {
                              fields: ["name", "district", "state"],
                            },
                          },
                          fields: [
                            "Title",
                            "strap",
                            "Original_published_date",
                            "slug",
                            "location_auto_suggestion",
                            "type",
                            "locale",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const response = await axios.get(
          `${BASE_URL}api/home-page?${queryString}`
        );

        const responseData = response?.data?.data;
        // Handle both array and single object response
        const pageData = Array.isArray(responseData) ? responseData[0] : responseData;

        if (!pageData) {
          setStories([]);
          setIsLoading(false);
          return;
        }

        const section = pageData?.attributes?.pari_movable_sections?.[0];

        if (!section) {
          setStories([]);
          return;
        }

        const see_all_button = pageData?.attributes?.seeallStories;

        const articles = section?.article_with_lang_selection_1 || [];
        if (!articles.length) {
          return;
        }

        // Map language names to locale codes
        const languageNameToCode: { [key: string]: string } = {
          'English': 'en',
          'Hindi': 'hi',
          'Telugu': 'te',
          'Tamil': 'ta',
          'Marathi': 'mr',
          'Gujarati': 'gu',
          'Odia': 'or',
          'Oriya': 'or',
          'Kannada': 'kn',
          'Punjabi': 'pa',
          'Assamese': 'as',
          'Malayalam': 'ml',
          'Urdu': 'ur',
          'Bengali': 'bn',
          'Bhojpuri': 'bho',
          'Chhattisgarhi': 'hne'
        };

        const formattedStories = articles
          .filter(
            (article: ArticleWithLangSelection) =>
              article?.article?.data?.attributes
          )
          .map((article: ArticleWithLangSelection) => {
            const articleData = article.article.data.attributes;
            // Fix author data extraction
            const authors = Array.isArray(articleData.Authors)
              ? articleData.Authors.map((author) => {
                  const name = author?.author_name?.data?.attributes?.Name;
                  return name &&
                    typeof name === "string" &&
                    name.trim().length > 0
                    ? name
                    : "PARI";
                })
              : ["PARI"];
            const langsData = article.all_language?.data;
            let langs: string[] = [];
            let targetLanguageName = "";

            if (Array.isArray(langsData)) {
              langs = langsData.map(
                (lang: { attributes: { language_name: string } }) =>
                  lang.attributes.language_name
              );
              targetLanguageName = langs[0] || "";
            } else if (
              langsData &&
              typeof langsData === "object" &&
              "attributes" in langsData &&
              "language_name" in
                (langsData as { attributes: { language_name: string } })
                  .attributes
            ) {
              targetLanguageName = (langsData as { attributes: { language_name: string } })
                .attributes.language_name;
              langs = [targetLanguageName];
            } else {
              langs = ["Available in 6 languages"];
            }

            // Get the target locale code from language name
            const targetLocaleCode = languageNameToCode[targetLanguageName] || 'en';

            // Extract localizations data
            const localizationsData = Array.isArray(articleData.localizations)
              ? articleData.localizations
              : (articleData.localizations as { data: Array<{ locale: string; title: string; strap: string; slug: string }> })?.data || [];

            // Map to consistent format with proper typing
            // Note: API returns Title/Strap with capital letters
            const localizations = localizationsData.map(
              (loc: {
                attributes?: { locale: string; Title: string; Strap: string; slug: string; title?: string; strap?: string };
                locale?: string;
                Title?: string;
                Strap?: string;
                title?: string;
                strap?: string;
                slug?: string;
              }) => ({
                locale: loc.attributes?.locale || loc.locale || '',
                title: loc.attributes?.Title || loc.attributes?.title || loc.Title || loc.title || '',
                strap: loc.attributes?.Strap || loc.attributes?.strap || loc.Strap || loc.strap || '',
                slug: loc.attributes?.slug || loc.slug || ''
              })
            );

            // Check if article is already in the target language
            const articleLocale = articleData.locale || 'en';

            let displayTitle: string;
            let displaySlug: string;

            if (articleLocale === targetLocaleCode) {
              // Article is already in the target language, use its data directly
              displayTitle = articleData.Title;
              displaySlug = articleData.slug;
            } else {
              // Find the localization that matches the target language
              const targetLocalization = localizations.find(
                (loc: { locale: string }) => loc.locale === targetLocaleCode
              );
              // Use target language title/strap/slug if available, otherwise use default
              displayTitle = targetLocalization?.title || articleData.Title;
              displaySlug = targetLocalization?.slug || articleData.slug;
            }

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

            return {
              headtitle: section?.Title,
              sub_title: see_all_button,
              title: displayTitle,
              description: articleData.strap,
              imageUrl: articleData.Cover_image?.data?.attributes?.url
                ? `${BASE_URL}${articleData.Cover_image.data.attributes.url}`
                : "/images/categories/default.jpg",
              slug: displaySlug,
              categories:
                articleData.categories?.data?.map(
                  (cat: { attributes: { Title: string; slug: string } }) => ({
                    title: cat.attributes.Title,
                    slug: cat.attributes.slug
                  })
                ) || [],
              authors,
              languages: langs,
              localizations,
              location:
                articleData.location?.data?.attributes?.district ||
                articleData.location_auto_suggestion ||
                "India",
              date: articleData.Original_published_date
                ? new Date(
                    articleData.Original_published_date
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "",
              type: articleData.type?.toLowerCase() || "",
              videoUrl:
                articleData.type?.toLowerCase() === "video"
                  ? "true"
                  : undefined,
              audioUrl:
                articleData.type?.toLowerCase() === "audio"
                  ? "true"
                  : undefined,
              availableLanguages
            };
          });

        setStories(formattedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [currentLocale]); // Refetch when locale changes

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  const visibleStories = stories;

  return (
    <div className=" relative overflow-hidden   ">
      <div className="pb-4 max-w-[1232px] border-t-1 lg:px-0  px-4  border-[#D9D9D9] dark:border-border md:pt-12 pt-10 mx-auto relative z-10">
        <div className="flex justify-between sm:flex-row flex-col sm:items-center md:gap-5  md:mb-4">
          <div className="flex flex-row items-center gap-2">
            <Sparkle className="h-6 w-6 text-primary-PARI-Red" />
            <h6 className="text-grey-300 dark:text-discreet-text">
              {stories[0]?.headtitle}
            </h6>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Add See All Stories button */}
            <Link href={addLocaleToUrl("/articles")}>
              <Button
                variant="secondary"
                className="text-sm h-[36px] md:flex hidden ring-[1px] rounded-[48px] text-primary-PARI-Red"
              >
                <p className="text-sm pl-2">
                  {stories[0]?.sub_title || "See all stories"}
                </p>
                <ChevronRight className="h-5 w-5 " />
              </Button>
            </Link>
            
            {/* Navigation buttons */}
            <div className="hidden md:flex items-center gap-2">
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

      <div className="relative !overflow-visible ">
        <div
          ref={sliderRef}
          className="keen-slider max-w-[1232px] px-4 md:px-0 mx-auto relative !overflow-visible "
        >
          {visibleStories.map((story, index) => (
            <div
              key={`${story.slug}-${index}-${currentLocale}`}
              className="keen-slider__slide min-h-[500px] "
            >
              <StoryCard
                {...story}
                description={story.description}
                authors={
                  Array.isArray(story.authors)
                    ? story.authors.join(", ")
                    : story.authors
                }
                localizations={story.localizations}
              
                availableLanguages={story.availableLanguages}
                currentLocale={currentLocale}
                className="h-full"
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
                  currentSlide === idx ? "bg-primary-PARI-Red" : "bg-grey-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
