'use client'

import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { BASE_URL } from '@/config'
import axios from 'axios'
import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/locale'
import { LanguageToggle } from '@/components/layout/header/LanguageToggle'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Define interfaces for page-story-of-pari API
interface ImageFormat {
  url: string
  width: number
  height: number
}

interface PageAuthor {
  id: number
  AuthorName: string
  AuthorDesignation: string
  AuthorImage?: {
    data: Array<{
      id: number
      attributes: {
        url: string
        alternativeText: string | null
        width: number
        height: number
        formats?: {
          thumbnail?: ImageFormat
          small?: ImageFormat
          medium?: ImageFormat
          large?: ImageFormat
        }
      }
    }>
  }
}

interface StorySubsection {
  id: number
  Title: string
  TabName: string
  Content: string
}

interface StorySection {
  id: number
  Title: string | null
  TabName: string
  Content: string
  StoryofPARISubsection: StorySubsection[]
}

interface PageAttributes {
  Title: string
  Strap: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: string
  PageAuthor: PageAuthor
  StorySection: StorySection[]
  localizations: {
    data: Array<{
      id: number
      attributes: {
        Title: string
        locale: string
      }
    }>
  }
}

interface PageData {
  id: number
  attributes: PageAttributes
}

interface ApiResponse {
  data: PageData
  meta: Record<string, unknown>
}

// Utility function to preserve HTML content as-is from backend
function stripHtmlCss(text: string): string {
  if (typeof text !== 'string') return text
  // Return content as-is without any modifications
  return text
}

// Translation map for hardcoded English terms that appear in non-English API responses
const sectionTranslations: { [locale: string]: { [englishTerm: string]: string } } = {
  'hi': {
    'Introduction': 'परिचय',
    'Donate to PARI': 'पारी को दान करें',
    'Freedom Fighters\' Gallery': 'स्वतंत्रता सेनानियों की गैलरी'
  },
  'mr': {
    'Introduction': 'परिचय',
    'Donate to PARI': 'पारीला देणगी द्या',
    'Freedom Fighters\' Gallery': 'स्वातंत्र्य सैनिकांची गॅलरी'
  },
  'bn': {
    'Introduction': 'ভূমিকা',
    'Donate to PARI': 'পারিকে দান করুন',
    'Freedom Fighters\' Gallery': 'স্বাধীনতা সংগ্রামীদের গ্যালারি'
  },
  'or': {
    'Introduction': 'ପରିଚୟ',
    'Donate to PARI': 'ପାରିକୁ ଦାନ କରନ୍ତୁ',
    'Freedom Fighters\' Gallery': 'ସ୍ୱାଧୀନତା ସଂଗ୍ରାମୀଙ୍କ ଗ୍ୟାଲେରୀ'
  },
  'ur': {
    'Introduction': 'تعارف',
    'Donate to PARI': 'پاری کو عطیہ دیں',
    'Freedom Fighters\' Gallery': 'آزادی کے جنگجوؤں کی گیلری'
  }
}

// Translate section title if it's in English but locale is not English
function translateSectionTitle(title: string, locale: string): string {
  if (locale === 'en' || !title) return title
  return sectionTranslations[locale]?.[title] || title
}

// Get icon type based on section index (consistent across all languages)
function getSectionIconType(sectionIndex: number, subsectionIndex?: number): string {
  // First three main sections have no icons
  if (subsectionIndex === undefined && sectionIndex < 3) return ''

  // Main sections
  if (subsectionIndex === undefined) {
    // Section 3 (Donate) - index 3
    if (sectionIndex === 3) return 'Heart'
    return 'FileText'
  }

  // Subsections under "What's on PARI" (section index 2)
  const iconMap: { [key: number]: string } = {
    0: 'Sun',           // Climate Change
    1: 'BookMarked',    // Library
    2: 'Tractor',       // Farmers' Protests
    3: 'Smile',         // Faces
    4: 'Lock',          // Livelihoods under lockdown
    5: 'Amphora',       // Stories on Art, Artists, Artisans & Crafts
    6: 'AudioLines',    // Grindmill Songs Project and Kutchi Songs Archive
    7: 'Brush',         // The Archive of Adivasi Children's Art
    8: 'Lightbulb',     // Pari Series on Women's Health
    9: 'EyeOff',        // Visible Work, Invisible Women
    10: 'Flag',         // Freedom Fighters' Gallery
    11: 'Building2'     // PARI in Classrooms
  }

  return iconMap[subsectionIndex] || 'FileText'
}

// Throttle function for scroll events
function throttle<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0

  return function(this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  } as T
}

// Client component that fetches data
function StoryOfPariContent() {
  const router = useRouter()
  const { language: currentLocale } = useLocale()
  const [page, setPage] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const [sections, setSections] = useState<Array<{id: string, title: string, iconType: string}>>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Text direction helper function
  const getTextDirection = (locale: string) => {
    return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr'
  }

  const textDirection = getTextDirection(currentLocale)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Fetch page data from page-story-of-pari API
  const loadArticle = useCallback(async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('##Rohit_Rocks## Fetching Story of PARI in locale:', currentLocale)

        // Try to fetch the page in the current locale
        // Note: publicationState=preview allows fetching unpublished content (useful for development)
        const apiUrl = `${BASE_URL}api/page-story-of-pari?populate=deep,3&locale=${currentLocale}&publicationState=preview`

        const response = await axios.get<ApiResponse>(apiUrl)

        if (response.data.data) {
          const fetchedPage = response.data.data
          console.log('##Rohit_Rocks## Successfully fetched page in locale:', fetchedPage.attributes.locale)
          console.log('##Rohit_Rocks## Section titles:', fetchedPage.attributes.StorySection?.map((s: StorySection) => ({
            title: s.Title,
            tabName: s.TabName
          })))
          setPage(fetchedPage)

          // Generate sections for sidebar from StorySection
          if (fetchedPage.attributes.StorySection) {
            const generatedSections: Array<{id: string, title: string, iconType: string}> = []

            fetchedPage.attributes.StorySection.forEach((section: StorySection, sectionIndex: number) => {
              // Add main section
              const sectionId = `section-${section.id}`
              // Prioritize Title over TabName for better translations
              const rawTitle = section.Title || section.TabName || `Section ${sectionIndex + 1}`

              console.log(`##Rohit_Rocks## Section ${sectionIndex}:`, {
                rawTitle,
                locale: fetchedPage.attributes.locale,
                willTranslateTo: translateSectionTitle(rawTitle, fetchedPage.attributes.locale)
              })

              const sectionTitle = translateSectionTitle(rawTitle, fetchedPage.attributes.locale)
              const iconType = getSectionIconType(sectionIndex)

              generatedSections.push({
                id: sectionId,
                title: sectionTitle,
                iconType: iconType
              })

              // Add subsections if they exist
              if (section.StoryofPARISubsection && section.StoryofPARISubsection.length > 0) {
                section.StoryofPARISubsection.forEach((subsection: StorySubsection, subsectionIndex: number) => {
                  const subsectionId = `subsection-${subsection.id}`
                  // Prioritize Title over TabName for better translations
                  const rawSubtitle = subsection.Title || subsection.TabName
                  const subsectionTitle = translateSectionTitle(rawSubtitle, fetchedPage.attributes.locale)
                  const subsectionIconType = getSectionIconType(sectionIndex, subsectionIndex)

                  generatedSections.push({
                    id: subsectionId,
                    title: subsectionTitle,
                    iconType: subsectionIconType
                  })
                })
              }
            })

            setSections(generatedSections)
          }
        } else {
          setError('Page not found')
        }
      } catch (err) {
        console.error('##Rohit_Rocks## Error loading page:', err)

        // If locale not found (404), try falling back to English
        if (axios.isAxiosError(err) && err.response?.status === 404 && currentLocale !== 'en') {
          console.log('##Rohit_Rocks## Locale not found, falling back to English')
          try {
            const fallbackUrl = `${BASE_URL}api/page-story-of-pari?populate=deep,3&locale=en&publicationState=preview`
            const fallbackResponse = await axios.get<ApiResponse>(fallbackUrl)

            if (fallbackResponse.data.data) {
              setPage(fallbackResponse.data.data)
              console.log('##Rohit_Rocks## Loaded English fallback')
            } else {
              setError('Page not found')
            }
          } catch (fallbackErr) {
            console.error('##Rohit_Rocks## Fallback also failed:', fallbackErr)
            setError('Failed to load page')
          }
        } else {
          setError('Failed to load page')
        }
      } finally {
        setIsLoading(false)
      }
  }, [currentLocale])

  useEffect(() => {
    loadArticle()
  }, [loadArticle])

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      let currentSection = ''
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const elementTop = element.offsetTop
          if (scrollPosition >= elementTop) {
            currentSection = section.id
          }
        }
      }

      setActiveSection(currentSection)
    }

    const throttledScroll = throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [sections])

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Story of PARI...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Page not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-PARI-Red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const { attributes } = page
  const author = attributes.PageAuthor
  const authorName = author?.AuthorName || 'P. Sainath'
  const authorRole = author?.AuthorDesignation || 'Founding Editor, PARI'

  // Get author image URL
  const authorImageData = author?.AuthorImage?.data?.[0]
  const authorImageAttrs = authorImageData?.attributes

  // Try different image formats - prefer smaller sizes for profile picture
  let authorImagePath = null
  if (authorImageAttrs) {
    // Try formats in order: thumbnail, small, medium, or original
    authorImagePath =
      authorImageAttrs.formats?.thumbnail?.url ||
      authorImageAttrs.formats?.small?.url ||
      authorImageAttrs.formats?.medium?.url ||
      authorImageAttrs.url
  }

  // Build full URL - check if path already includes domain
  let authorImageUrl = null
  if (authorImagePath) {
    if (authorImagePath.startsWith('http')) {
      authorImageUrl = authorImagePath
    } else {
      authorImageUrl = `https://merge.ruralindiaonline.org${authorImagePath}`
    }
  }

  console.log('##Rohit_Rocks## Author image DEBUG:', {
    hasAuthor: !!author,
    hasImageData: !!authorImageData,
    hasFormats: !!authorImageAttrs?.formats,
    availableFormats: authorImageAttrs?.formats ? Object.keys(authorImageAttrs.formats) : [],
    selectedPath: authorImagePath,
    fullUrl: authorImageUrl,
    rawImageData: authorImageData
  })

  return (
    <>
      <style jsx global>{`
        .story-content p {
          margin-bottom: 1rem;
          margin-top: 0;
        }
        .story-content p:last-child {
          margin-bottom: 0;
        }
        .story-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
        .story-content ul,
        .story-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .story-content li {
          margin-bottom: 0.5rem;
        }
        .story-content strong {
          font-weight: 700;
        }
        .story-content em {
          font-style: italic;
        }
      `}</style>
      <div className="flex flex-col md:flex-row min-h-screen bg-white md:py-20 py-10 dark:bg-background" dir={textDirection}>
        <div className="flex flex-col gap-4 md:flex-row min-h-screen max-w-[1232px] mx-auto w-full">
        {/* Sidebar */}
        <div className={`hidden md:block flex-shrink-0 sticky top-4 self-start transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`}>
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            sections={sections}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            sidebarTitle="Story of PARI"
          />
        </div>

      
        {/* Main content */}
        <div className="flex-1 p-4 md:px-8">
          <div className="max-w-[45.75rem] mx-auto">
            {/* Language Notice - Only show if not English */}
            

           

            {/* Title */}
            <h1
              className="mb-2 text-foreground"
              
            >
              {attributes.Title}
            </h1>

            {/* Subtitle - Pages API doesn't have Strap for this page */}
            {attributes.Strap && (
              <h2
                className="mb-8 text-discreet-text"
                
              >
                {attributes.Strap}
              </h2>
            )}

            {/* Author */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border dark:border-borderline">
              {authorImageUrl && (
                <div className="w-16 h-16 rounded-full bg-border dark:bg-border overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={authorImageUrl}
                    alt={authorName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('##Rohit_Rocks## Image failed to load:', authorImageUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                    onLoad={() => {
                      console.log('##Rohit_Rocks## Image loaded successfully:', authorImageUrl)
                    }}
                  />
                </div>
              )}
              <div>
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '140%',
                    letterSpacing: '-4%'
                  }}
                >
                  {authorName}
                </p>
                <p
                  className="text-discreet-text"
                  style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}
                >
                  {authorRole}
                </p>
              </div>
            </div>

            {/* Content */}
            <article className="max-w-none space-y-8">
              {attributes.StorySection?.map((section: StorySection) => {
                const sectionId = `section-${section.id}`
                const cleanedContent = stripHtmlCss(section.Content)

                return (
                  <div key={section.id}>
                    {/* Main Section */}
                    <section id={sectionId} className="scroll-mt-20">
                      {section.Title && (
                        <h3
                          className="mb-4 text-[28px] text-foreground"
                         
                        >
                          {section.Title}
                        </h3>
                      )}
                      <p
                        className="text-discreet-text mb-6 story-content"
                        style={{
                          fontFamily: 'Noto Sans',
                          fontWeight: 400,
                          fontSize: '15px',
                          lineHeight: '170%',
                          letterSpacing: '-3%'
                        }}
                        dangerouslySetInnerHTML={{ __html: cleanedContent }}
                      />
                    </section>

                    {/* Subsections */}
                    {section.StoryofPARISubsection && section.StoryofPARISubsection.length > 0 && (
                      <div className="ml-4 space-y-6">
                        {section.StoryofPARISubsection.map((subsection: StorySubsection) => {
                          const subsectionId = `subsection-${subsection.id}`
                          const cleanedSubContent = stripHtmlCss(subsection.Content)

                          return (
                            <section key={subsection.id} id={subsectionId} className="scroll-mt-20 dark:text-gray-300 pl-6 border-l-1 border-border dark:border-borderline">
                              <h4
                                className="mb-3 text-[24px] text-foreground"
                               
                              >
                                {subsection.Title}
                              </h4>
                              <p
                                className="text-discreet-text story-content"
                                style={{
                                  fontFamily: 'Noto Sans',
                                  fontWeight: 400,
                                  fontSize: '15px',
                                  lineHeight: '170%',
                                  letterSpacing: '-3%'
                                }}
                                dangerouslySetInnerHTML={{ __html: cleanedSubContent }}
                              />
                            </section>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </article>

            {/* Footer */}

          </div>
        </div>
      </div>

      {/* Language Toggle */}
      <LanguageToggle />
    </div>
    </>
  )
}

export default function StoryOfPariPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Story of PARI...</p>
        </div>
      </div>
    }>
      <StoryOfPariContent />
    </Suspense>
  )
}

