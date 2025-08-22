'use client'

import Image from 'next/image'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { formatDate } from '@/lib/utils'
import { BASE_URL } from '@/config'
import axios from 'axios'
import qs from 'qs'
import { ArticleData } from '@/components/articles/ArticlesContent'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'


// Extended ArticleData interface that includes Modular_Content
interface ExtendedArticleData extends ArticleData {
  attributes: ArticleData['attributes'] & {
    Modular_Content?: (string | ContentParagraph | ExtendedContentItem)[];
  };
}

// Define ContentParagraph interface
interface ContentParagraph {
  attributes?: {
    text?: string;
  };
  text?: string;
  content?: string;
  __component?: string;
}

// Type for filterable content items
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

// Utility function to strip HTML/CSS elements from text while preserving formatting
function stripHtmlCssWithStyledStrong(text: string): string {
  if (typeof text !== 'string') return text;

  return text
    // Remove CSS style blocks first
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove inline styles
    .replace(/style\s*=\s*["'][^"']*["']/gi, '')
    // Remove CSS class attributes (except for ones we'll add later)
    .replace(/class\s*=\s*["'][^"']*["']/gi, '')
    // Remove CSS id attributes
    .replace(/id\s*=\s*["'][^"']*["']/gi, '')
    // Add class to strong tags
    .replace(/<strong\b[^>]*>/gi,  '<strong id="strong-tag" class="text-discreet-text  my-6 font-bold">   ')
    // Convert <b> tags to <strong> with class
    .replace(/<b\b[^>]*>/gi, '<strong id="bold-content" class="text-primary-PARI-Red my-6 font-semibold">  ')
    .replace(/<\/b>/gi, '</strong> <br> <br>')
    // Convert paragraph tags to line breaks
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br> <br>')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    // Convert div tags to line breaks
    .replace(/<\/div>\s*<div[^>]*>/gi, '<br>')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    // Convert newlines to br tags
    .replace(/\n\s*\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    // Remove all HTML tags EXCEPT strong, em, and br
    .replace(/<(?!\/?(?:strong|em|br)\b)[^>]*>/gi, '')
    // Clean up multiple consecutive br tags
    .replace(/(<br\s*\/?>){3,}/gi, '<br><br>')
    // Remove extra whitespace but preserve line structure
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Utility function to create slug from title
function createSlug(title: string, language: string = 'en'): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    + `-${language}` // Add language suffix
}

// Utility function to generate section ID from content
function generateSectionId(content: string, index: number): string {
  // Extract first few words for a meaningful ID
  const cleanContent = content.replace(/<[^>]*>/g, '').trim()
  const words = cleanContent.split(/\s+/).slice(0, 4).join('-')
  return `section-${index}-${words.toLowerCase().replace(/[^a-z0-9-]/g, '')}`
}

// Utility function to extract section title from content
function extractSectionTitle(content: string): string {
  const cleanContent = content.replace(/<[^>]*>/g, '').trim()
  // Take first sentence or first 50 characters
  const firstSentence = cleanContent.split(/[.!?]/)[0]
  return firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence
}

// Function to determine icon type based on content - matching exact design mockup
function getSectionIconType(title: string, index: number): string {
  // Direct mapping for design titles to avoid repetition
  const titleIconMap: { [key: string]: string } = {
    'Introduction': 'FileText',
    'Where PARI comes in': 'FileText',
    'What\'s on PARI': 'FileText',
    'Climate Change': 'Sun',
    'Library': 'BookMarked',
    'Farmer\'s Protests': 'Tractor',
    'Faces of India': 'Smile',
    'Livelihoods under lockdown': 'Lock',
    'Stories on art, artists, artisans & crafts': 'Amphora',
    'Grindmill songs project and Kutchi songs archive': 'AudioLines',
    'Adivasi children\'s art': 'Brush',
    'PARI series on women\'s health': 'Lightbulb',
    'Visible work, invisible women': 'EyeOff',
    'Freedom fighters\' gallery': 'Flag',
    'PARI in classrooms': 'Building2'
  }

  // Check for exact title match first
  if (titleIconMap[title]) {
    return titleIconMap[title]
  }

  // Convert title to lowercase for keyword matching
  const lowerTitle = title.toLowerCase()

  // Match keywords to exact design icons from mockup
  if (lowerTitle.includes('introduction') || lowerTitle.includes('story') || lowerTitle.includes('overview')) {
    return 'FileText'
  } else if (lowerTitle.includes('climate') || lowerTitle.includes('environment') || lowerTitle.includes('nature')) {
    return 'Sun'
  } else if (lowerTitle.includes('library') || lowerTitle.includes('archive') || lowerTitle.includes('collection')) {
    return 'BookMarked'
  } else if (lowerTitle.includes('farmer') || lowerTitle.includes('protest') || lowerTitle.includes('agriculture')) {
    return 'Tractor'
  } else if (lowerTitle.includes('faces') || lowerTitle.includes('portrait') || lowerTitle.includes('people')) {
    return 'Smile'
  } else if (lowerTitle.includes('livelihood') || lowerTitle.includes('lockdown') || lowerTitle.includes('work') || lowerTitle.includes('job')) {
    return 'Lock'
  } else if (lowerTitle.includes('art') || lowerTitle.includes('craft') || lowerTitle.includes('artist') || lowerTitle.includes('artisan')) {
    return 'Amphora'
  } else if (lowerTitle.includes('song') || lowerTitle.includes('music') || lowerTitle.includes('grindmill') || lowerTitle.includes('kutchi')) {
    return 'AudioLines'
  } else if (lowerTitle.includes('children') || lowerTitle.includes('adivasi')) {
    return 'Brush'
  } else if (lowerTitle.includes('health') || lowerTitle.includes('women') || lowerTitle.includes('medical')) {
    return 'Lightbulb'
  } else if (lowerTitle.includes('visible') || lowerTitle.includes('invisible') || lowerTitle.includes('see')) {
    return 'EyeOff'
  } else if (lowerTitle.includes('freedom') || lowerTitle.includes('fighter') || lowerTitle.includes('gallery')) {
    return 'Flag'
  } else if (lowerTitle.includes('classroom') || lowerTitle.includes('education') || lowerTitle.includes('learning')) {
    return 'Building2'
  } else if (lowerTitle.includes('where') || lowerTitle.includes('comes') || lowerTitle.includes('location')) {
    return 'FileText'
  } else if (lowerTitle.includes('what') || lowerTitle.includes('content') || lowerTitle.includes('list')) {
    return 'FileText'
  } else if (lowerTitle.includes('donate') || lowerTitle.includes('support') || lowerTitle.includes('help')) {
    return 'Heart'
  }

  // Unique default icons based on index to ensure no repetition
  const uniqueDefaultIcons = ['FileText', 'Sun', 'BookMarked', 'Tractor', 'Smile', 'Lock', 'Amphora', 'AudioLines', 'Brush', 'Lightbulb', 'EyeOff', 'Flag', 'Building2', 'Heart']
  return uniqueDefaultIcons[index % uniqueDefaultIcons.length]
}

// Format section title to be more readable
function formatSectionTitle(title: string): string {
  // Remove any HTML tags
  let cleanTitle = title.replace(/<[^>]*>/g, '')
  
  // Capitalize first letter of each word
  cleanTitle = cleanTitle.replace(/\b\w/g, (char) => char.toUpperCase())
  
  // Limit length and add ellipsis if needed
  if (cleanTitle.length > 40) {
    cleanTitle = cleanTitle.substring(0, 40) + '...'
  }
  
  return cleanTitle
}

// Available article slugs (you can expand this list)
const AVAILABLE_SLUGS = [
  'the-story-of-pari',
  // Add more slugs as needed
]

// Function to fetch all available slugs from API
async function fetchAvailableSlugs(): Promise<string[]> {
  try {
    const response = await axios.get(`${BASE_URL}api/articles?fields[0]=slug&pagination[limit]=100`)
    return response.data.data?.map((article: ArticleData) => article.attributes.slug) || []
  } catch (error) {
    console.error('Error fetching available slugs:', error)
    return AVAILABLE_SLUGS // Return default slugs if API fails
  }
}

// Client component that fetches data
function IntroductionPageContent() {
  const searchParams = useSearchParams()
  const [article, setArticle] = useState<{
    title: string;
    subtitle: string;
    publishedDate: string;
    author: {
      name: string;
      title: string;
    };
    content: (string | ContentParagraph | ExtendedContentItem)[];
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const [sections, setSections] = useState<Array<{id: string, title: string, iconType: string}>>([])

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Hardcoded sidebar title as per user preference
  const sidebarTitle = "Introduction"

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    async function loadArticle() {
      try {
        console.log('=== IntroductionPage Component Started ===')

        // Get slug from URL params or use default
        const slugParam = searchParams?.get('slug')
        const articleSlug = slugParam || 'the-story-of-pari'

        // Validate slug or create from title if needed
        if (slugParam && !AVAILABLE_SLUGS.includes(slugParam)) {
          console.log('Slug not in available list, checking API...')

          // Fetch available slugs from API to validate
          const availableSlugs = await fetchAvailableSlugs()

          if (!availableSlugs.includes(slugParam)) {
            console.log('Slug not found in API either, using default slug')
            // Example: Create slug from title if needed
            const generatedSlug = createSlug("the-story-of-pari", "en")
            console.log('Generated slug example:', generatedSlug)
            // articleSlug = generatedSlug // Uncomment to use generated slug
          } else {
            console.log('Slug found in API, using provided slug')
          }
        }

        console.log('Using slug:', articleSlug)
        console.log('Available slugs:', AVAILABLE_SLUGS)

        // Fetch the introduction article data from the API
        const fetchedArticle = await fetchIntroductionArticle(articleSlug)
        setArticle(fetchedArticle)
        


        // Generate sections for table of contents with design titles
        if (fetchedArticle.content && Array.isArray(fetchedArticle.content) && fetchedArticle.content.length > 0) {
          const designTitles = [
            'Introduction',
            'Where PARI comes in',
            'What\'s on PARI',
            'Climate Change',
            'Library',
            'Farmer\'s Protests',
            'Faces of India',
            'Livelihoods under lockdown',
            'Stories on art, artists, artisans & crafts',
            'Grindmill songs project and Kutchi songs archive',
            'Adivasi children\'s art',
            'PARI series on women\'s health',
            'Visible work, invisible women',
            'Freedom fighters\' gallery',
            'PARI in classrooms'
          ]

          const generatedSections = filterContent(fetchedArticle.content as (string | ContentParagraph | ExtendedContentItem)[]).map((item, index) => {
            let content = ''
            if (typeof item === 'string') {
              content = item
            } else if (item && typeof item === 'object') {
              if ('attributes' in item && item.attributes && typeof item.attributes === 'object' && 'text' in item.attributes) {
                content = item.attributes.text as string
              } else if ('Text' in item && typeof item.Text === 'string') {
                content = item.Text
              } else if ('text' in item && typeof item.text === 'string') {
                content = item.text
              } else if ('content' in item && typeof item.content === 'string') {
                content = item.content
              }
            }

            if (content.trim()) {
              // Use design title if available, otherwise extract from content
              const title = designTitles[index] || formatSectionTitle(extractSectionTitle(content))
              // Assign an appropriate icon based on title
              const iconType = getSectionIconType(title, index)

              return {
                id: generateSectionId(content, index),
                title: title,
                iconType: iconType
              }
            }
            return null
          }).filter(Boolean) as Array<{id: string, title: string, iconType: string}>

          setSections(generatedSections)
        }
      } catch (err) {
        console.error('Error loading article:', err)
        setError('Failed to load article')
        setArticle(getFallbackArticleData())
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [searchParams])

  // Enhanced scroll spy effect for both article sections and PARI sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header

      // Define PARI section IDs for scroll tracking
      const pariSectionIds = [
        'introduction',
        'where-pari-comes-in',
        'whats-on-pari',
        'climate-change',
        'library',
        'farmers-protests',
        'faces-of-india',
        'livelihoods-under-lockdown',
        'stories-on-art',
        'grindmill-songs',
        'adivasi-childrens-art',
        'womens-health',
        'visible-work-invisible-women',
        'freedom-fighters-gallery',
        'pari-in-classrooms'
      ]

      // Find the current section (prioritize article sections if they exist)
      let currentSection = ''

      // Check article sections first
      if (sections.length > 0) {
        for (const section of sections) {
          const element = document.getElementById(section.id)
          if (element) {
            const elementTop = element.offsetTop
            if (scrollPosition >= elementTop) {
              currentSection = section.id
            }
          }
        }
      } else {
        // Check PARI sections if no article sections
        for (const sectionId of pariSectionIds) {
          const element = document.getElementById(sectionId)
          if (element) {
            const elementTop = element.offsetTop
            if (scrollPosition >= elementTop) {
              currentSection = sectionId
            }
          }
        }
      }

      setActiveSection(currentSection)
    }

    const throttledScroll = throttle(handleScroll, 100)

    window.addEventListener('scroll', throttledScroll)

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [sections])

  // Throttle function to limit scroll event frequency
  function throttle(func: () => void, limit: number) {
    let inThrottle: boolean
    return function() {
      if (!inThrottle) {
        func()
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen max-w-[1232px] bg-white dark:bg-background">
      
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="flex items-center mb-8">
                <div className="w-[60px] h-[60px] bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen max-w-[1232px] bg-white dark:bg-background">
       
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error loading article: {error}</p>
              <p className="text-gray-600">Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function filterContent(content: (string | ContentParagraph | ExtendedContentItem)[]): FilterableContentItem[] {
    if (!content || !Array.isArray(content)) {
      return []
    }

    return content.filter((item): item is FilterableContentItem => {
      if (typeof item === 'string') {
        return item.trim().length > 0
      }

      if (item && typeof item === 'object') {
        // Check if it's a ContentParagraph with attributes.text
        if ('attributes' in item && item.attributes && typeof item.attributes === 'object' && 'text' in item.attributes) {
          return typeof item.attributes.text === 'string' && item.attributes.text.trim().length > 0
        }

        // Check for other possible content structures
        return Object.values(item).some(value =>
          typeof value === 'string' && value.trim().length > 0
        )
      }

      return false
    })
  }

  function stripHtmlCss(title: string): string {
    if (typeof title !== 'string') return title;

    return title
      // Remove CSS style blocks first
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove HTML tags but preserve content
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Function to scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex flex-col pt mx-auto md:flex-row min-h-screen bg-white dark:bg-background">
      {/* Main content */}
      <div className="flex-1 relative max-w-[1232px] mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row min-h-screen max-w-[1232px] mx-auto bg-white dark:bg-background">
          <div className={`hidden md:block flex-shrink-0 sticky top-4 self-start transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`} id="sidebar-container">
            <Sidebar
              activePage="introduction"
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
              sections={sections}
              activeSection={activeSection}
              scrollToSection={scrollToSection}
              sidebarTitle={sidebarTitle}
            />
          </div> 

          {/* Floating toggle button when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden md:block fixed top-32 left-96 z-50 p-2 bg-white dark:bg-background  hover:shadow-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {/* <PanelRightOpen className="w-5 h-5" /> */}
            </button>
          )}
        <div className="max-w-[45.75rem]  p-4 mx-auto">
          {/* Date */}
          <div className="text-grey-300  font-semibold text-[15px] mb-4">
            {formatDate(article.publishedDate || "2023-04-01")}
          </div>

          {/* Title */}
          <h1 id="article-title" className="text-[44px] leading-[120%] font-bold mb-2">{stripHtmlCss(article.title)}</h1>

          {/* Subtitle */}
          <h2 className="text-[26px] font-medium leading-[130%]  mb-6">{stripHtmlCss(article.subtitle)}</h2>

          {/* Author */}
          <div className="flex items-center mb-8">
            <div className="mr-4">
              <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden">
                <Image
                  src={'/images/P-Sainath.png'}
                  alt={article.author.name}
                  width={60}
                  height={60}
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div id="author-name" className="font-bold">{stripHtmlCss(article.author.name)}</div>
              <div className="text-sm font-medium text-grey-300">Founding Editor, PARI</div>
            </div>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-[65rem] border-t pt-3 border-border dark:border-grey-700 dark:prose-invert article-content">
            {article.content && article.content.length > 0 ? (
              <div className="article-wrapper">
                {filterContent(article.content).map((paragraph: FilterableContentItem, index: number) => {
                  // For debugging
                  console.log('Content item type:', typeof paragraph, paragraph);

                  // Generate section ID for this paragraph
                  let content = ''
                  if (typeof paragraph === 'string') {
                    content = paragraph
                  } else if (paragraph && typeof paragraph === 'object') {
                    if ('attributes' in paragraph && paragraph.attributes && typeof paragraph.attributes === 'object' && 'text' in paragraph.attributes) {
                      content = paragraph.attributes.text as string
                    } else if ('Text' in paragraph && typeof paragraph.Text === 'string') {
                      content = paragraph.Text
                    } else if ('text' in paragraph && typeof paragraph.text === 'string') {
                      content = paragraph.text
                    } else if ('content' in paragraph && typeof paragraph.content === 'string') {
                      content = paragraph.content
                    }
                  }

                  const sectionId = content.trim() ? generateSectionId(content, index) : `section-${index}`

                  if (typeof paragraph === 'string') {
                    return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph) }}></p>;
                  } else if (paragraph && typeof paragraph === 'object') {
                    // Handle Strapi Modular Content structures
                    if ('attributes' in paragraph && paragraph.attributes) {
                      if (typeof paragraph.attributes === 'object' && 'text' in paragraph.attributes && typeof paragraph.attributes.text === 'string') {
                        return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph.attributes.text) }}></p>;
                      } else if (typeof paragraph.attributes === 'string') {
                        return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph.attributes) }}></p>;
                      }
                    } else if ('__component' in paragraph && 'Text' in paragraph && typeof paragraph.Text === 'string') {
                      // Remove the component metadata from the text
                      const cleanedText = paragraph.Text.replace(/^\s*\{"id":\d+,"__component":"[^"]+","Text":"/g, '')
                                                       .replace(/"\}\s*$/g, '');
                      return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(cleanedText) }}></p>;
                    } else if ('Text' in paragraph && typeof paragraph.Text === 'string') {
                      return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph.Text) }}></p>;
                    } else if ('text' in paragraph && typeof paragraph.text === 'string') {
                      return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph.text) }}></p>;
                    } else if ('content' in paragraph && typeof paragraph.content === 'string') {
                      return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(paragraph.content) }}></p>;
                    } else if ('__component' in paragraph) {
                      // Try to find any string property that might contain content
                      const extendedParagraph = paragraph as ExtendedContentItem;
                      const contentKeys = Object.keys(extendedParagraph).filter(key =>
                        typeof extendedParagraph[key] === 'string' &&
                        key !== '__component' &&
                        (extendedParagraph[key] as string).trim().length > 0
                      );

                      if (contentKeys.length > 0) {
                        const content = extendedParagraph[contentKeys[0]] as string;
                        const cleanedContent = content.replace(/^\s*\{"id":\d+,"__component":"[^"]+","[^"]+":"/g, '')
                                                     .replace(/"\}\s*$/g, '');
                        return <p key={index} id={sectionId} className="my-8 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{
                          __html: stripHtmlCssWithStyledStrong(cleanedContent)
                        }}></p>;
                      }
                    }

                    // Last resort: try to stringify the object and display it
                    try {
                      const content = JSON.stringify(paragraph);
                      if (content && content !== '{}' && content !== '[]') {
                        // Clean up the JSON string to remove component metadata
                        const cleanedContent = content.replace(/^\s*\{"id":\d+,"__component":"[^"]+","[^"]+":"/g, '')
                     .replace(/"\}\s*$/g, '');
                        if (cleanedContent && cleanedContent.trim().length > 0) {
                          return <p key={index} id={sectionId} className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed scroll-mt-20" style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }} dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(cleanedContent) }}></p>;
                        }
                      }
                    } catch (e) {
                      console.error('Failed to stringify content item:', e);
                    }
                  }
                  return null;
                })}
              </div>
            ) : (
              <p style={{ fontFamily: 'Noto Sans', fontWeight: 400, fontSize: '15px', lineHeight: '170%', letterSpacing: '-3%' }}>No content available</p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function IntroductionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col md:flex-row min-h-screen max-w-[1232px] bg-white dark:bg-background">
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <IntroductionPageContent />
    </Suspense>
  )
}

// Function to fetch the introduction article from the API
async function fetchIntroductionArticle(slug: string = 'the-story-of-pari') {

  try {
    // Build query for Strapi
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
        Modular_Content: true,
      }
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`
    console.log('API URL:', apiUrl)
    console.log('BASE_URL:', BASE_URL)

    const response = await axios.get(apiUrl)
    console.log('API Response Status:', response.status)
    console.log('API Response Data:', response.data)

    // Check if we got a valid response with data
    if (!response.data?.data || response.data.data.length === 0) {
      console.log('No data found in API response, trying to fetch all articles to see available slugs...')

      // Try to fetch all articles to see what's available
      try {
        const allArticlesResponse = await axios.get(`${BASE_URL}api/articles?pagination[limit]=10`)
        console.log('Available articles:', allArticlesResponse.data.data?.map((article: ArticleData) => ({
          id: article.id,
          title: article.attributes.Title,
          slug: article.attributes.slug
        })))
      } catch (err) {
        console.log('Could not fetch all articles:', err)
      }

      // Return fallback data if API request fails or returns no data
      return getFallbackArticleData()
    }

    const articleData = response.data.data[0] as ExtendedArticleData
    console.log('Article Data:', articleData)
    console.log('Original Published Date:', articleData.attributes.Original_published_date)

    // Format the author data
    let authorName = 'P. Sainath'
    let authorRole = 'Founding Editor, PARI'

    const authorsData = articleData.attributes.Authors
    if (authorsData) {
      if ('data' in authorsData && Array.isArray(authorsData.data) && authorsData.data.length > 0) {
        // Handle case where Authors is { data: [...] }
        const authorData = authorsData.data[0]?.attributes
        authorName = authorData?.author_name?.data?.attributes?.Name || 'P. Sainath'
        authorRole = authorData?.author_role?.data?.attributes?.Name || 'Founding Editor, PARI'
      } else if (Array.isArray(authorsData) && authorsData.length > 0) {
        // Handle case where Authors is an array directly
        const authorData = authorsData[0]
        authorName = authorData?.author_name?.data?.attributes?.Name || 'P. Sainath'
        authorRole = authorData?.author_role?.data?.attributes?.Name || 'Founding Editor, PARI'
      }
    }
    console.log('Authors Data:', authorsData)

    // Get the cover image URL
    // const coverImageUrl = articleData.attributes.Cover_image?.data?.attributes?.url
    //   ? `${BASE_URL}${articleData.attributes.Cover_image.data.attributes.url}`
    //   : '/images/authors/sainath.png'

    // Log content for debugging
    console.log(`Content for slug '${query.filters.slug.$eq}':`, articleData.attributes.Modular_Content)
    console.log('API Date:', articleData.attributes.Original_published_date)

    const finalData = {
      title: articleData.attributes.Title || "The Story of PARI",
      subtitle: articleData.attributes.strap || "PARI: a living journal, a breathing archive",
      publishedDate: articleData.attributes.Original_published_date || "2023-04-01",
      author: {
        name: authorName,
        title: authorRole,
        // imageUrl: coverImageUrl
      },
      content: Array.isArray(articleData.attributes.Modular_Content)
        ? articleData.attributes.Modular_Content
        : []
    }

    console.log('=== Returning API Data ===')
    console.log('Final Data:', finalData)
    return finalData
  } catch (error) {
    console.error('Error fetching introduction article:', error)
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
    }
    // Return fallback data if API request fails
    return getFallbackArticleData()
  }
}

// Fallback data in case the API request fails
function getFallbackArticleData() {
  console.log('=== Using Fallback Data ===')
  const fallbackData = {
    title: "The Story of PARI",
    subtitle: "PARI: a living journal, a breathing archive",
    publishedDate: new Date().toISOString(),
    author: {
      name: "P. Sainath",
      title: "Founding Editor, PARI",
      imageUrl: "/images/authors/sainath.jpg"
    },
    content: []
  }
  console.log('Fallback Data:', fallbackData)
  return fallbackData
}
