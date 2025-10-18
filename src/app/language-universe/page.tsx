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
  AuthorName: string
  AuthorDesignation: string
  AuthorImage: {
    data: Array<{
      id: number
      attributes: {
        url: string
        name: string
        alternativeText: string | null
      }
    }>
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
  Paragraph?: string;
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
    Strap: string | null
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
    Author: Author | null
    Modular_Content: ModularContentItem[]
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

      // Language Universe page IDs mapping
      const pageIdMap: Record<string, number> = {
        'en': 1,
        'hi': 15,
        'bn': 16,
        'mr': 17,
        'or': 18,
        'ur': 19
      }

      // Get the page ID for current locale, fallback to English
      const pageId = pageIdMap[currentLocale] || pageIdMap['en']

      // Build query for Strapi to fetch the specific language universe page
      const query = {
        populate: {
          Author: {
            populate: {
              AuthorImage: {
                fields: ['url', 'name', 'alternativeText']
              }
            }
          },
          Modular_Content: true,
          localizations: {
            fields: ['locale', 'Title', 'id']
          }
        }
      }

      const queryString = qs.stringify(query, { encodeValuesOnly: true })
      const apiUrl = `${BASE_URL}api/pages/${pageId}?${queryString}`

      console.log('##Rohit_Rocks## Current Locale:', currentLocale)
      console.log('##Rohit_Rocks## Page ID:', pageId)
      console.log('##Rohit_Rocks## Fetching from pages API:', apiUrl)

      const response = await axios.get(apiUrl)
      console.log('##Rohit_Rocks## Pages API response:', response.data)

      if (response.data.data) {
        const pageData = {
          id: response.data.data.id,
          attributes: response.data.data.attributes
        }
        console.log('##Rohit_Rocks## Page title:', pageData.attributes.Title)
        console.log('##Rohit_Rocks## Page locale:', pageData.attributes.locale)
        setArticle(pageData)
      } else {
        console.log('##Rohit_Rocks## No page found')
        setError('Language Universe page not found')
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching language universe page:', error)
      setError('Failed to load Language Universe content')
    } finally {
      setIsLoading(false)
    }
  }, [currentLocale])

  useEffect(() => {
    fetchLanguageUniverseArticle()
  }, [fetchLanguageUniverseArticle])

  
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
    console.log('##Rohit_Rocks## Rendering modular content:', content)

    return content.map((item, index) => {
      console.log(`##Rohit_Rocks## Item ${index}:`, item)

      // Handle string content
      if (typeof item === 'string') {
        return (
          <div key={index} className="">
            <p
              className="text-discreet-text leading-relaxed"
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
            case 'modular-content.paragraph':
              const extendedItem = item as ExtendedContentItem
              const content = extendedItem.Paragraph || extendedItem.content || extendedItem.text || extendedItem.Text || ''
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
                    className="text-discreet-text"
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
              console.log('##Rohit_Rocks## Unknown component type:', item.__component)
              return null
          }
        }

        // Handle other object structures
        if ('attributes' in item && item.attributes) {
          if (typeof item.attributes === 'object' && 'text' in item.attributes && typeof item.attributes.text === 'string') {
            return (
              <div key={index} className="mb-6">
                <p
                  className="text-discreet-text leading-relaxed"
                  style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}
                  dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.attributes.text) }}
                />
              </div>
            )
          }
        }

        // Handle direct text properties
        const extendedItem = item as ExtendedContentItem
        const textContent = extendedItem.Paragraph || extendedItem.text || extendedItem.Text || extendedItem.content || ''
        if (textContent) {
          return (
            <div key={index} className="mb-6">
              <p
                className="text-discreet-text leading-relaxed"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
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
  const author = attributes.Author

  // Debug logging
  console.log('##Rohit_Rocks## Page attributes:', attributes)
  console.log('##Rohit_Rocks## Strap:', attributes.Strap)
  console.log('##Rohit_Rocks## Author data:', attributes.Author)

  // Get author image URL
  const authorImageUrl = author?.AuthorImage?.data?.[0]?.attributes?.url
    ? `${IMAGE_URL}${author.AuthorImage.data[0].attributes.url}`
    : '/images/P-Sainath.png'

  return (
    <div className="min-h-screen bg-white dark:bg-background" dir={textDirection}>
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Date */}
       

        {/* Title */}
        <h1
          className="text-foreground mb-3"
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
        {attributes.Strap && (
          <h2 className="text-discreet-text mb-8" style={{
            fontFamily: 'Noto Sans',
            fontWeight: 500,
            fontSize: '28px',
            lineHeight: '130%',
            letterSpacing: '-5%'
          }}>
            {attributes.Strap}
          </h2>
        )}

        {/* Author Section */}
        {author && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={authorImageUrl}
                  alt={author.AuthorName || 'Author'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-foreground" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '140%',
                  letterSpacing: '-4%'
                }}>
                  {author.AuthorName}
                </p>
                <p className="text-discreet-text" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  {author.AuthorDesignation}
                </p>
              </div>
            </div>
            {/* Separator line */}
            <hr className="border-border dark:border-borderline" />
          </div>
        )}

        {/* Content */}
        <article className="max-w-none mt-8 space-y-2">
          {attributes.Modular_Content && renderModularContent(attributes.Modular_Content)}
        </article>

        
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
