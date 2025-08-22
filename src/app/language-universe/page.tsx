'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import axios from 'axios'
import qs from 'qs'
import { BASE_URL, IMAGE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { LanguageToggle } from '@/components/layout/header/LanguageToggle'

interface Author {
  id: number
  attributes: {
    author_name: {
      data: {
        attributes: {
          Name: string
        }
      }
    }
    author_role: {
      data: {
        attributes: {
          Name: string
        }
      }
    }
  }
}

interface ContentParagraph {
  type: string;
  children: Array<{
    text: string;
    type?: string;
  }>;
}

interface ExtendedContentItem extends Record<string, unknown> {
  __component?: string;
  Text?: string;
  text?: string;
  content?: string;
  attributes?: {
    text?: string;
  } | string;
  image?: {
    data: {
      attributes: {
        url: string
      }
    }
  }
}

type ModularContentItem = string | ContentParagraph | ExtendedContentItem

interface ArticleData {
  id: number
  attributes: {
    Title: string
    strap: string
    Original_published_date: string
    slug: string
    locale: string
    Cover_image?: {
      data: {
        attributes: {
          url: string
        }
      }
    }
    Authors: {
      data: Author[]
    }
    Modular_Content: ModularContentItem[]
  }
}

interface ApiResponse {
  data: ArticleData[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

function LanguageUniverseContent() {
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language: currentLocale } = useLocale()

  // Text direction helper function
  const getTextDirection = (locale: string) => {
    return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
  }

  const textDirection = getTextDirection(currentLocale)

  const fetchLanguageUniverseArticle = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query for Strapi to fetch the language universe article
      // First try with specific locale
      const query = {
        filters: {
          slug: {
            $eq: 'pari-s-language-universe' // Assuming this is the slug for the language universe article
          }
        },
        populate: {
          Cover_image: {
            fields: ['url']
          },
          Authors: {
            populate: {
              author_name: {
                fields: ['Name']
              },
              author_role: {
                fields: ['Name']
              }
            }
          },
          Modular_Content: true,
          localizations: {
            fields: ['locale', 'Title', 'slug']
          }
        },
        locale: currentLocale
      }

      // Try fetching all locales first to see what's available
      const allLocalesQuery = {
        ...query,
        locale: 'all'
      }

      const allLocalesQueryString = qs.stringify(allLocalesQuery, { encodeValuesOnly: true })
      const allLocalesApiUrl = `${BASE_URL}api/articles?${allLocalesQueryString}`

      console.log('Current Locale:', currentLocale)
      console.log('Fetching all locales first:', allLocalesApiUrl)

      const allLocalesResponse = await axios.get<ApiResponse>(allLocalesApiUrl)
      console.log('All locales response:', allLocalesResponse.data)

      if (allLocalesResponse.data.data && allLocalesResponse.data.data.length > 0) {
        // Find article in current locale
        const currentLocaleArticle = allLocalesResponse.data.data.find(
          (article: ArticleData) => article.attributes.locale === currentLocale
        )

        if (currentLocaleArticle) {
          console.log('Found article for locale', currentLocale)
          console.log('Article title:', currentLocaleArticle.attributes.Title)
          setArticle(currentLocaleArticle)
        } else {
          // Fallback to English
          const englishArticle = allLocalesResponse.data.data.find(
            (article: ArticleData) => article.attributes.locale === 'en'
          )

          if (englishArticle) {
            console.log('Using English fallback article')
            console.log('English article title:', englishArticle.attributes.Title)
            setArticle(englishArticle)
          } else {
            // Use first available article
            console.log('Using first available article')
            setArticle(allLocalesResponse.data.data[0])
          }
        }
      } else {
        console.log('No articles found at all')
        setError('Language Universe article not found')
      }
    } catch (error) {
      console.error('Error fetching language universe article:', error)
      setError('Failed to load Language Universe content')
    } finally {
      setIsLoading(false)
    }
  }, [currentLocale])

  useEffect(() => {
    fetchLanguageUniverseArticle()
  }, [fetchLanguageUniverseArticle])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Use current locale for date formatting
    return date.toLocaleDateString(currentLocale === 'en' ? 'en-US' : currentLocale, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).toUpperCase()
  }

  const stripHtmlCssWithStyledStrong = (html: string): string => {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/style="[^"]*"/gi, '')
      .replace(/<strong>/gi, '<strong style="font-weight: 700;">')
      .replace(/<p>&nbsp;<\/p>/gi, '<div style="margin-bottom: 16px;"></div>')
      .replace(/<p><br><\/p>/gi, '<div style="margin-bottom: 16px;"></div>')
      .replace(/<\/p>\s*<p>/gi, '</p><div style="margin-bottom: 16px;"></div><p>')
  }

  const renderModularContent = (content: ModularContentItem[]) => {
    console.log('Rendering modular content:', content)

    return content.map((item, index) => {
      console.log(`Item ${index}:`, item)

      // Handle string content
      if (typeof item === 'string') {
        return (
          <div key={index} className="">
            <p
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}
              dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item) }}
            />
          </div>
        )
      }

      // Handle object content
      if (item && typeof item === 'object') {
        // Handle Strapi component types
        if ('__component' in item) {
          switch (item.__component) {
            case 'shared.rich-text':
            case 'modular-content.text':
              const content = item.content || item.text || item.Text || ''
              // Add CSS to style paragraphs with proper spacing
              const styledContent = `
                <style>
                  .modular-content p {
                    margin-bottom: 24px;
                  }
                  .modular-content p:last-child {
                    margin-bottom: 0;
                  }
                </style>
                <div class="modular-content">
                  ${stripHtmlCssWithStyledStrong(content)}
                </div>
              `
              return (
                <div key={index} className="mb-6">
                  <div
                    className="text-gray-800 dark:text-gray-200"
                    style={{
                      fontFamily: 'Noto Sans',
                      fontWeight: 400,
                      fontSize: '15px',
                      lineHeight: '170%',
                      letterSpacing: '-3%'
                    }}
                    dangerouslySetInnerHTML={{ __html: styledContent }}
                  />
                </div>
              )
            case 'shared.media':
            case 'modular-content.media':
              if (item.image?.data?.attributes?.url) {
                return (
                  <div key={index} className="mb-10">
                    <Image
                      src={`${IMAGE_URL}${item.image.data.attributes.url}`}
                      alt="Language Universe content"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )
              }
              return null
            default:
              console.log('Unknown component type:', item.__component)
              return null
          }
        }

        // Handle other object structures
        if ('attributes' in item && item.attributes) {
          if (typeof item.attributes === 'object' && 'text' in item.attributes && typeof item.attributes.text === 'string') {
            return (
              <div key={index} className="mb-6">
                <p
                  className="text-gray-800 dark:text-gray-200 leading-relaxed"
                  style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 500,
                    fontSize: '15px',
                    lineHeight: '180%',
                    letterSpacing: '-2%'
                  }}
                  dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.attributes.text) }}
                />
              </div>
            )
          }
        }

        // Handle direct text properties
        const extendedItem = item as ExtendedContentItem
        const textContent = extendedItem.text || extendedItem.Text || extendedItem.content || ''
        if (textContent) {
          return (
            <div key={index} className="mb-6">
              <p
                className="text-gray-800 dark:text-gray-200 leading-relaxed"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '15px',
                  lineHeight: '180%',
                  letterSpacing: '-2%'
                }}
                dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(textContent) }}
              />
            </div>
          )
        }
      }

      return null
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Language Universe...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Article not found'}</p>
          <button 
            onClick={fetchLanguageUniverseArticle}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { attributes } = article
  const authors = attributes.Authors?.data || []

  // Debug logging
  console.log('Article attributes:', attributes)
  console.log('Strap:', attributes.strap)
  console.log('Authors data:', attributes.Authors)
  console.log('Processed authors:', authors)

  return (
    <div className="min-h-screen bg-white dark:bg-background" dir={textDirection}>
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Date */}
        <p className="text-[15px] text-grey-300 font-semibold font-noto-sans  mb-4 uppercase tracking-wide">
          {formatDate(attributes.Original_published_date)}
        </p>

        {/* Title */}
        <h1
          className="text-black dark:text-white mb-3"
          style={{
            fontFamily: 'Noto Sans',
            fontWeight: 700,
            fontSize: '49px',
            lineHeight: '112%',
            letterSpacing: '-4%'
          }}
        >
          {attributes.Title}
        </h1>

        {/* Subtitle/Strap */}
        <h2 className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8 font-medium leading-relaxed">
          {attributes.strap || 'Many worlds, myriad tongues'}
        </h2>

        {/* Author Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src="/images/P-Sainath.png"
                alt="P Sainath"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white text-lg">
                {authors.length > 0 ? authors[0].attributes.author_name?.data?.attributes?.Name : 'P Sainath'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {authors.length > 0 ? authors[0].attributes.author_role?.data?.attributes?.Name : 'Founding Editor, PARI'}
              </p>
            </div>
          </div>
          {/* Separator line */}
          <hr className="border-gray-200 dark:border-[#363636]" />
        </div>

        {/* Content */}
        <article className="max-w-none mt-8 space-y-2">
          {attributes.Modular_Content && renderModularContent(attributes.Modular_Content)}
        </article>

        {/* Footer */}
        <footer className="">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Want to republish this article? Please write to{' '}
            <a href="mailto:zahra@ruralindiaonline.org" className="text-primary-PARI-Red hover:underline">
              zahra@ruralindiaonline.org
            </a>{' '}
            with a cc to{' '}
            <a href="mailto:namita@ruralindiaonline.org" className="text-primary-PARI-Red hover:underline">
              namita@ruralindiaonline.org
            </a>
          </p>
        </footer>
      </div>

      {/* Language Toggle */}
      <LanguageToggle />
    </div>
  )
}

export default function LanguageUniversePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Language Universe...</p>
        </div>
      </div>
    }>
      <LanguageUniverseContent />
    </Suspense>
  )
}
