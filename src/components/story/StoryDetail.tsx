'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { formatDate } from '@/lib/utils'
import { BASE_URL } from '@/config'
import axios from 'axios'
import qs from 'qs'
import { ArticleData } from '@/components/articles/ArticlesContent'


// Utility function to strip HTML/CSS elements from text while preserving formatting
function stripHtmlCssWithStyledStrong(text: string): string {
  if (typeof text !== 'string') return text;

  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/style\s*=\s*"[^"]*"/gi, '')
    .replace(/class\s*=\s*"[^"]*"/gi, '')
    .replace(/<strong[^>]*>/gi, '<strong>')
    .replace(/<b[^>]*>/gi, '<strong>')
    .replace(/<\/b>/gi, '</strong>')
    .replace(/<em[^>]*>/gi, '<em>')
    .replace(/<i[^>]*>/gi, '<em>')
    .replace(/<\/i>/gi, '</em>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Content interfaces
interface ContentParagraph {
  attributes?: {
    text?: string;
  };
  text?: string;
  content?: string;
  __component?: string;
}

interface ExtendedContentItem extends Record<string, unknown> {
  __component?: string;
  Text?: string;
  text?: string;
  content?: string;
  attributes?: {
    text?: string;
  } | string;
}

type FilterableContentItem = string | ContentParagraph | ExtendedContentItem

// Extended ArticleData interface that includes Modular_Content
interface ExtendedArticleData extends ArticleData {
  attributes: ArticleData['attributes'] & {
    Modular_Content?: (string | ContentParagraph | ExtendedContentItem)[];
  };
}

interface StoryDetailProps {
  slug: string;
}

export default function StoryDetail({ slug }: StoryDetailProps) {
  const [story, setStory] = useState<{
    title: string;
    subtitle: string;
    publishedDate: string;
    author: {
      name: string;
      title: string;
    };
    content: (string | ContentParagraph | ExtendedContentItem)[];
    coverImage?: string;
    categories?: string[];
    location?: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStory() {
      try {
        setIsLoading(true)
        console.log('Loading story with slug:', slug)

        const fetchedStory = await fetchStoryBySlug(slug)
        setStory(fetchedStory)


      } catch (err) {
        console.error('Error loading story:', err)
        setError('Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadStory()
    }
  }, [slug])

  // Helper functions (similar to introduction page)
  function filterContent(content: (string | ContentParagraph | ExtendedContentItem)[]): FilterableContentItem[] {
    if (!content || !Array.isArray(content)) {
      return []
    }

    return content.filter((item): item is FilterableContentItem => {
      if (typeof item === 'string') {
        return item.trim().length > 0
      }

      if (item && typeof item === 'object') {
        if ('attributes' in item && item.attributes && typeof item.attributes === 'object' && 'text' in item.attributes) {
          return typeof item.attributes.text === 'string' && item.attributes.text.trim().length > 0
        }

        return Object.values(item).some(value =>
          typeof value === 'string' && value.trim().length > 0
        )
      }

      return false
    })
  }



  function generateSectionId(content: string, index: number): string {
    const cleanText = content.replace(/<[^>]*>/g, '').trim()
    const words = cleanText.split(/\s+/).slice(0, 3).join('-')
    return `section-${index}-${words.toLowerCase().replace(/[^a-z0-9-]/g, '')}`
  }



 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Story not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Image */}
        {story.coverImage && (
          <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Story Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {story.title}
          </h1>

          {story.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {story.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>By {story.author.name}</span>
              {story.author.title && <span>• {story.author.title}</span>}
            </div>
            <div>{formatDate(story.publishedDate)}</div>
            {story.location && <div>• {story.location}</div>}
          </div>

          {story.categories && story.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {story.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-PARI-Red/10 text-primary-PARI-Red text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Story Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {story.content && story.content.length > 0 ? (
            <div>
              {(() => {
                console.log('=== RENDERING CONTENT ===')
                console.log('story.content:', story.content)
                console.log('story.content.length:', story.content.length)

                const filtered = filterContent(story.content)
                console.log('filtered content:', filtered)
                console.log('filtered content length:', filtered.length)

                return filtered.map((paragraph: FilterableContentItem, index: number) => {
                  console.log(`Processing paragraph ${index}:`, paragraph)

                  const content = extractContentText(paragraph)
                  console.log(`Extracted content ${index}:`, content)

                  const strippedContent = stripHtmlCssWithStyledStrong(content)
                  console.log(`Stripped content ${index}:`, strippedContent)

                  // Check for images in the content item
                  const imageData = extractImageData(paragraph)
                  console.log(`Image data ${index}:`, imageData)

                  // Check for videos in the content item
                  const videoData = extractVideoData(paragraph)
                  console.log(`Video data ${index}:`, videoData)

                  const sectionId = generateSectionId(content, index)

                  return (
                    <div key={index} className="my-6">
                      {/* Render image if available */}
                      {imageData && (
                        <div className="my-6">
                          <Image
                            src={imageData.url}
                            alt={imageData.alt || `Image ${index + 1}`}
                            width={imageData.width || 800}
                            height={imageData.height || 600}
                            className="rounded-lg shadow-md w-full h-auto"
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                          {imageData.caption && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic text-center">
                              {imageData.caption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Render video if available */}
                      {videoData && (
                        <div className="my-6">
                          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                            <video
                              src={videoData.url}
                              controls
                              className="w-full h-full rounded-lg shadow-md"
                              style={{ maxWidth: '100%', height: 'auto' }}
                              poster={videoData.poster}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          {videoData.caption && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic text-center">
                              {videoData.caption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Render text content if available */}
                      {strippedContent && strippedContent.trim().length > 0 && (
                        <p
                          id={sectionId}
                          className="my-4 text-foreground leading-relaxed scroll-mt-20"
                          style={{
                            fontFamily: 'Noto Sans',
                            fontWeight: 400,
                            fontSize: '15px',
                            lineHeight: '170%',
                            letterSpacing: '-3%'
                          }}
                          dangerouslySetInnerHTML={{ __html: strippedContent }}
                        />
                      )}

                      {/* Debug: Show component type and structure */}
                      <div className="text-xs text-gray-500 mb-2">
                        Component: {String((paragraph as Record<string, unknown>)?.__component || 'unknown')}
                        {imageData && ' | Has Image'}
                        {videoData && ' | Has Video'}
                        {strippedContent && ' | Has Text'}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <p>No content available</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to extract text content
function extractContentText(paragraph: FilterableContentItem): string {
  console.log('Extracting content from:', paragraph)
  console.log('Object keys:', paragraph && typeof paragraph === 'object' ? Object.keys(paragraph) : 'N/A')
  console.log('Full object structure:', JSON.stringify(paragraph, null, 2))

  if (typeof paragraph === 'string') {
    console.log('String content:', paragraph)
    return paragraph
  }

  if (paragraph && typeof paragraph === 'object') {
    // Cast to Record for dynamic property access
    const obj = paragraph as Record<string, unknown>

    // Check all possible text properties
    const possibleTextFields = [
      'text', 'Text', 'content', 'Content', 'body', 'Body',
      'description', 'Description', 'value', 'Value'
    ]

    // Check direct properties
    for (const field of possibleTextFields) {
      if (field in obj && typeof obj[field] === 'string') {
        console.log(`Extracted from ${field}:`, obj[field])
        return obj[field] as string
      }
    }

    // Check attributes object
    if ('attributes' in obj && obj.attributes && typeof obj.attributes === 'object') {
      console.log('Checking attributes:', obj.attributes)
      const attrs = obj.attributes as Record<string, unknown>
      for (const field of possibleTextFields) {
        if (field in attrs && typeof attrs[field] === 'string') {
          const text = attrs[field] as string
          console.log(`Extracted from attributes.${field}:`, text)
          return text
        }
      }
    }

    // Check for nested data structures
    if ('data' in obj && obj.data && typeof obj.data === 'object') {
      console.log('Checking data:', obj.data)
      const data = obj.data as Record<string, unknown>
      for (const field of possibleTextFields) {
        if (field in data && typeof data[field] === 'string') {
          const text = data[field] as string
          console.log(`Extracted from data.${field}:`, text)
          return text
        }
      }
    }

    // Try to find any string value in the object
    const allValues = Object.values(obj)
    for (const value of allValues) {
      if (typeof value === 'string' && value.trim().length > 0) {
        console.log('Found string value:', value)
        return value
      }
    }
  }

  console.log('No text found, returning empty string')
  return ''
}

// Helper function to extract image data from content items
function extractImageData(paragraph: FilterableContentItem): {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
} | null {
  if (!paragraph || typeof paragraph !== 'object') {
    return null
  }

  const obj = paragraph as Record<string, unknown>
  console.log('Checking for image data in:', obj)

  // Check for direct image properties
  if ('image' in obj && obj.image && typeof obj.image === 'object') {
    const imageObj = obj.image as Record<string, unknown>
    console.log('Found image object:', imageObj)

    // Check for Strapi media structure
    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }

    // Check for direct URL in image object
    if ('url' in imageObj && typeof imageObj.url === 'string') {
      return {
        url: imageObj.url.startsWith('http') ? imageObj.url : `${BASE_URL}${imageObj.url}`,
        alt: typeof imageObj.alt === 'string' ? imageObj.alt : undefined,
        caption: typeof imageObj.caption === 'string' ? imageObj.caption : undefined,
      }
    }
  }

  // Check for media field
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>
    console.log('Found media object:', mediaObj)

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for photo field
  if ('photo' in obj && obj.photo && typeof obj.photo === 'object') {
    const photoObj = obj.photo as Record<string, unknown>
    console.log('Found photo object:', photoObj)

    if ('data' in photoObj && photoObj.data && typeof photoObj.data === 'object') {
      const photoData = photoObj.data as Record<string, unknown>
      if ('attributes' in photoData && photoData.attributes && typeof photoData.attributes === 'object') {
        const attrs = photoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for direct URL field
  if ('url' in obj && typeof obj.url === 'string') {
    return {
      url: obj.url.startsWith('http') ? obj.url : `${BASE_URL}${obj.url}`,
      alt: typeof obj.alt === 'string' ? obj.alt : undefined,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  console.log('No image data found')
  return null
}

// Helper function to extract video data from content items
function extractVideoData(paragraph: FilterableContentItem): {
  url: string;
  poster?: string;
  caption?: string;
  width?: number;
  height?: number;
} | null {
  if (!paragraph || typeof paragraph !== 'object') {
    return null
  }

  const obj = paragraph as Record<string, unknown>
  console.log('Checking for video data in:', obj)

  // Check for direct video properties
  if ('video' in obj && obj.video && typeof obj.video === 'object') {
    const videoObj = obj.video as Record<string, unknown>
    console.log('Found video object:', videoObj)

    // Check for Strapi media structure
    if ('data' in videoObj && videoObj.data && typeof videoObj.data === 'object') {
      const videoData = videoObj.data as Record<string, unknown>
      if ('attributes' in videoData && videoData.attributes && typeof videoData.attributes === 'object') {
        const attrs = videoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${BASE_URL}${attrs.url}`,
            poster: typeof attrs.poster === 'string' ? `${BASE_URL}${attrs.poster}` : undefined,
            caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }

    // Check for direct URL in video object
    if ('url' in videoObj && typeof videoObj.url === 'string') {
      return {
        url: videoObj.url.startsWith('http') ? videoObj.url : `${BASE_URL}${videoObj.url}`,
        poster: typeof videoObj.poster === 'string' ? videoObj.poster : undefined,
        caption: typeof videoObj.caption === 'string' ? videoObj.caption : undefined,
      }
    }
  }

  // Check for media field that might contain video
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>
    console.log('Found media object (checking for video):', mediaObj)

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          // Check if it's a video file by extension or mime type
          const url = attrs.url as string
          const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(url) ||
                         (typeof attrs.mime === 'string' && attrs.mime.startsWith('video/'))

          if (isVideo) {
            return {
              url: `${BASE_URL}${url}`,
              poster: typeof attrs.poster === 'string' ? `${BASE_URL}${attrs.poster}` : undefined,
              caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
              width: typeof attrs.width === 'number' ? attrs.width : undefined,
              height: typeof attrs.height === 'number' ? attrs.height : undefined,
            }
          }
        }
      }
    }
  }

  // Check for YouTube or Vimeo embed URLs
  if ('embed_url' in obj && typeof obj.embed_url === 'string') {
    return {
      url: obj.embed_url,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  // Check for direct video URL field
  if ('video_url' in obj && typeof obj.video_url === 'string') {
    return {
      url: obj.video_url.startsWith('http') ? obj.video_url : `${BASE_URL}${obj.video_url}`,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  console.log('No video data found')
  return null
}

// Function to print all content (text, images, and videos) in a clean format
function printAllContent(content: (string | ContentParagraph | ExtendedContentItem)[], title: string) {
  console.log('\n=== PRINTING ALL CONTENT (TEXT, IMAGES & VIDEOS) ===')
  console.log(`Story Title: ${title}`)
  console.log('='.repeat(70))

  if (!content || !Array.isArray(content)) {
    console.log('No content available')
    return
  }

  // Simple filter function for this context
  const filteredContent = content.filter((item): item is FilterableContentItem => {
    if (typeof item === 'string') {
      return item.trim().length > 0
    }

    if (item && typeof item === 'object') {
      // Check for text content
      if ('attributes' in item && item.attributes && typeof item.attributes === 'object' && 'text' in item.attributes) {
        return typeof item.attributes.text === 'string' && item.attributes.text.trim().length > 0
      }

      // Check for any string content
      const hasText = Object.values(item).some(value =>
        typeof value === 'string' && value.trim().length > 0
      )

      // Check for image content
      const hasImage = extractImageData(item) !== null

      // Check for video content
      const hasVideo = extractVideoData(item) !== null

      return hasText || hasImage || hasVideo
    }

    return false
  })

  filteredContent.forEach((item: FilterableContentItem, index: number) => {
    console.log(`\n📄 Content Item ${index + 1}:`)
    console.log('='.repeat(40))

    // Check component type
    const componentType = (item as Record<string, unknown>)?.__component
    if (componentType) {
      console.log(`🔧 Component Type: ${componentType}`)
    }

    // Extract and print text content
    const text = extractContentText(item)
    const cleanText = stripHtmlCssWithStyledStrong(text)

    if (cleanText && cleanText.trim().length > 0) {
      console.log(`📝 Text Content:`)
      console.log('-'.repeat(20))
      console.log(cleanText)
    }

    // Extract and print image content
    const imageData = extractImageData(item)
    if (imageData) {
      console.log(`🖼️  Image Content:`)
      console.log('-'.repeat(20))
      console.log(`   URL: ${imageData.url}`)
      if (imageData.alt) console.log(`   Alt Text: ${imageData.alt}`)
      if (imageData.caption) console.log(`   Caption: ${imageData.caption}`)
      if (imageData.width && imageData.height) {
        console.log(`   Dimensions: ${imageData.width}x${imageData.height}`)
      }
    }

    // Extract and print video content
    const videoData = extractVideoData(item)
    if (videoData) {
      console.log(`🎥 Video Content:`)
      console.log('-'.repeat(20))
      console.log(`   URL: ${videoData.url}`)
      if (videoData.poster) console.log(`   Poster: ${videoData.poster}`)
      if (videoData.caption) console.log(`   Caption: ${videoData.caption}`)
      if (videoData.width && videoData.height) {
        console.log(`   Dimensions: ${videoData.width}x${videoData.height}`)
      }
    }

    // Show what content types this item has
    const contentTypes = []
    if (cleanText && cleanText.trim().length > 0) contentTypes.push('TEXT')
    if (imageData) contentTypes.push('IMAGE')
    if (videoData) contentTypes.push('VIDEO')

    console.log(`📊 Content Types: ${contentTypes.join(' + ') || 'NONE'}`)
  })

  // Summary
  const textItems = filteredContent.filter(item => {
    const text = extractContentText(item)
    return text && stripHtmlCssWithStyledStrong(text).trim().length > 0
  }).length

  const imageItems = filteredContent.filter(item => extractImageData(item) !== null).length
  const videoItems = filteredContent.filter(item => extractVideoData(item) !== null).length

  console.log('\n📈 CONTENT SUMMARY:')
  console.log('='.repeat(30))
  console.log(`📝 Text Items: ${textItems}`)
  console.log(`🖼️  Image Items: ${imageItems}`)
  console.log(`🎥 Video Items: ${videoItems}`)
  console.log(`📄 Total Items: ${filteredContent.length}`)

  console.log('\n=== END CONTENT LISTING ===\n')
}

// Function to fetch story by slug
async function fetchStoryBySlug(slug: string) {
  try {
    const query = {
      filters: {
        slug: {
          $eq: slug
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
        categories: {
          fields: ['Title']
        },
        location: {
          fields: ['name', 'district', 'state']
        },
        Modular_Content: true,
      }
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`
    
    const response = await axios.get(apiUrl)
    
    if (!response.data?.data || response.data.data.length === 0) {
      throw new Error('Story not found')
    }

    const articleData = response.data.data[0] as ExtendedArticleData

    // Print Modular_Content for debugging
    console.log('=== MODULAR CONTENT DEBUG ===')
    console.log('Raw Modular_Content:', articleData.attributes.Modular_Content)

    if (Array.isArray(articleData.attributes.Modular_Content)) {
      console.log('Modular_Content is array with length:', articleData.attributes.Modular_Content.length)
      articleData.attributes.Modular_Content.forEach((item, index) => {
        console.log(`Item ${index}:`, item)
        if (typeof item === 'string') {
          console.log(`  Text content: "${item}"`)
        } else if (item && typeof item === 'object') {
          console.log(`  Object type: ${item.__component || 'unknown'}`)
          if ('text' in item) console.log(`  Text field: "${item.text}"`)
          if ('content' in item) console.log(`  Content field: "${item.content}"`)
          if ('Text' in item) console.log(`  Text field (capital): "${item.Text}"`)
          if ('attributes' in item && item.attributes) {
            console.log(`  Attributes:`, item.attributes)
          }
        }
      })
    } else {
      console.log('Modular_Content is not an array:', typeof articleData.attributes.Modular_Content)
    }
    console.log('=== END MODULAR CONTENT DEBUG ===')

    // Format author data
    let authorName = 'Unknown Author'
    let authorRole = ''
    
    if (articleData.attributes.Authors && Array.isArray(articleData.attributes.Authors)) {
      const firstAuthor = articleData.attributes.Authors[0]
      if (firstAuthor?.author_name?.data?.attributes?.Name) {
        authorName = firstAuthor.author_name.data.attributes.Name
      }
      if (firstAuthor?.author_role?.data?.attributes?.Name) {
        authorRole = firstAuthor.author_role.data.attributes.Name
      }
    }

    // Get cover image
    const coverImageUrl = articleData.attributes.Cover_image?.data?.attributes?.url
      ? `${BASE_URL}${articleData.attributes.Cover_image.data.attributes.url}`
      : undefined

    // Get categories
    const categories = articleData.attributes.categories?.data?.map(
      cat => cat.attributes.Title
    ) || []

    // Get location
    const location = articleData.attributes.location?.data?.attributes?.name || 
                    articleData.attributes.location_auto_suggestion || 
                    undefined

    const finalContent = Array.isArray(articleData.attributes.Modular_Content)
      ? articleData.attributes.Modular_Content
      : []

    const finalTitle = articleData.attributes.Title || "Untitled Story"

    // Print all content (text and images) for debugging
    printAllContent(finalContent, finalTitle)

    return {
      title: finalTitle,
      subtitle: articleData.attributes.Strap || articleData.attributes.strap || "",
      publishedDate: articleData.attributes.Original_published_date || new Date().toISOString(),
      author: {
        name: authorName,
        title: authorRole,
      },
      content: finalContent,
      coverImage: coverImageUrl,
      categories,
      location
    }
  } catch (error) {
    console.error('Error fetching story:', error)
    throw error
  }
}
