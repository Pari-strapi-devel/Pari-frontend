'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { formatDate } from '@/lib/utils'
import { BASE_URL } from '@/config'
import { Button } from "@/components/ui/button"
import { languages as allLanguages } from '@/data/languages'
import { useLocale, getTextDirection, getLangAttribute, addLocaleToUrl } from '@/lib/locale'
import { API_BASE_URL } from '@/utils/constants'
import axios from 'axios'
import qs from 'qs'
import { ArticleData } from '@/components/articles/ArticlesContent'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { FiShare2, FiMail, FiCopy, FiCheck } from 'react-icons/fi'
import { FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaTelegram } from 'react-icons/fa6'
import { Printer, Image as ImageIcon, ZoomIn, X, Captions, CaptionsOff } from 'lucide-react'
import { StoryDetailSkeleton } from '@/components/skeletons/PageSkeletons'

// Labels for credits and donation (English only)
const CREDIT_LABELS_EN: Record<string, string> = {
  author: 'AUTHOR',
  editor: 'EDITOR',
  photoEditor: 'PHOTO EDITOR',
  seeAllCredits: 'See all credits',
  seeMoreStories: 'See more stories',
  donateToPARI: 'Donate to PARI',
  donateDisclaimer: 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
  online: 'Online',
  cheque: 'Cheque',
  bankTransfer: 'Bank Transfer',
  monthly: 'Monthly',
  yearly: 'Yearly',
  oneTime: 'One-time',
  nameOnAadhar: 'Name as on Aadhar card',
  phoneNumber: 'Phone number',
  emailAddress: 'Email address',
  citizenConfirm: 'I confirm that I am a citizen of India',
  confirmAndPay: 'Confirm & Pay',
}

// Helper function to get label
const getTranslatedLabel = (key: string, _locale: string): string => {
  void _locale
  return CREDIT_LABELS_EN[key] || key
}

// Define the order of author roles for sorting (original roles)
const AUTHOR_ROLE_ORDER = [
  // Author roles
  'Author',
  'Author and Photographer',
  'Author and Video Editor',
  'Reporter',
  'Reporters',
  'Reporting',
  'Student Reporter',
  'Reporting and Cover Illustration',
  'Text',
  'Text and Illustrations',

  // Documentary/Video/Photo roles
  'Documentary',
  'Video',
  'Photographer',
  'Photographs',
  'Photos and Illustration',
  'Photos and Text',
  'Photos and Video',

  // Poem roles
  'Poem',
  'Poem and Text',
  'Poems and Text',
  'Poems and Text in Hindi',

  // Illustration/Art roles
  'Illustration',
  'Illustrations',
  'Lead Illustration',
  'Painting',
  'Paintings',

  // Team roles
  'Pari Video Team',
  'PARI Education Team',

  // Editor roles
  'Editor',
  'Editors',
  'Editor and Series Editor',
  'Text Editor',

  // Series roles
  'Series Curator',
  'Series Editor',
  'Series Editors',

  // Translation roles
  'English Translation',

  // Photo Editor
  'Photo Editor',

  // Video roles
  'Video Producer',
  'Video Editor',

  // Translation roles
  'Translation',
  'Translator'
]

// Define the order of simplified roles for display
const SIMPLIFIED_ROLE_ORDER = [
  'AUTHOR',
  'PHOTOGRAPHER',
  'VIDEO',
  'POEM',
  'ILLUSTRATION',
  'TEAM',
  'EDITOR',
  'SERIES EDITOR',
  'PHOTO EDITOR',
  'TRANSLATION'
]

// Helper function to map specific roles to simplified categories
function getSimplifiedRole(role: string): string {
  const roleLower = role.toLowerCase()

  // Author-related roles
  if (roleLower.includes('author') || roleLower.includes('reporter') ||
      roleLower.includes('reporting') || roleLower === 'text' ||
      roleLower.includes('text and')) {
    return 'AUTHOR'
  }

  // Photographer-related roles
  if (roleLower.includes('photograph') || roleLower.includes('photos')) {
    return 'PHOTOGRAPHER'
  }

  // Video/Documentary roles
  if (roleLower.includes('video') || roleLower.includes('documentary')) {
    return 'VIDEO'
  }

  // Poem roles
  if (roleLower.includes('poem')) {
    return 'POEM'
  }

  // Illustration/Art roles
  if (roleLower.includes('illustration') || roleLower.includes('painting')) {
    return 'ILLUSTRATION'
  }

  // Editor roles
  if (roleLower.includes('editor') && !roleLower.includes('photo') && !roleLower.includes('video')) {
    return 'EDITOR'
  }

  // Series roles
  if (roleLower.includes('series')) {
    return 'SERIES EDITOR'
  }

  // Translation roles
  if (roleLower.includes('translation') || roleLower.includes('translator')) {
    return 'TRANSLATION'
  }

  // Photo Editor
  if (roleLower.includes('photo editor')) {
    return 'PHOTO EDITOR'
  }

  // Team roles
  if (roleLower.includes('team')) {
    return 'TEAM'
  }

  // Default: return the original role in uppercase
  return role.toUpperCase()
}

// Helper function to sort authors by role order
function sortAuthorsByRole(authors: Array<{
  name: string;
  title: string;
  bio?: string;
  email?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}>) {
  return [...authors].sort((a, b) => {
    const indexA = AUTHOR_ROLE_ORDER.indexOf(a.title)
    const indexB = AUTHOR_ROLE_ORDER.indexOf(b.title)

    // If both roles are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only A is in the list, it comes first
    if (indexA !== -1) return -1

    // If only B is in the list, it comes first
    if (indexB !== -1) return 1

    // If neither is in the list, maintain original order
    return 0
  })
}

// Helper function to group authors by role
function groupAuthorsByRole(authors: Array<{
  name: string;
  title: string;
  bio?: string;
  email?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}>) {
  // First sort the authors by original role
  const sortedAuthors = sortAuthorsByRole(authors)

  // Group authors by simplified role while maintaining order
  const groupedMap = new Map<string, Array<{
    name: string;
    title: string;
    bio?: string;
    email?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  }>>()

  sortedAuthors.forEach(author => {
    const originalRole = author.title || 'Author'
    const simplifiedRole = getSimplifiedRole(originalRole)

    if (!groupedMap.has(simplifiedRole)) {
      groupedMap.set(simplifiedRole, [])
    }
    groupedMap.get(simplifiedRole)!.push(author)
  })

  // Convert map to array of grouped authors
  const grouped: Array<{
    names: string[];
    title: string;
    bios: string[];
    emails: string[];
    twitters: string[];
    facebooks: string[];
    instagrams: string[];
    linkedins: string[];
  }> = []

  groupedMap.forEach((authorsInRole, role) => {
    grouped.push({
      names: authorsInRole.map(a => a.name),
      title: role,
      bios: authorsInRole.map(a => a.bio || ''),
      emails: authorsInRole.map(a => a.email || ''),
      twitters: authorsInRole.map(a => a.twitter || ''),
      facebooks: authorsInRole.map(a => a.facebook || ''),
      instagrams: authorsInRole.map(a => a.instagram || ''),
      linkedins: authorsInRole.map(a => a.linkedin || '')
    })
  })

  // Sort the grouped array by simplified role order
  return grouped.sort((a, b) => {
    const indexA = SIMPLIFIED_ROLE_ORDER.indexOf(a.title)
    const indexB = SIMPLIFIED_ROLE_ORDER.indexOf(b.title)

    // If both roles are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only A is in the list, it comes first
    if (indexA !== -1) return -1

    // If only B is in the list, it comes first
    if (indexB !== -1) return 1

    // If neither is in the list, maintain original order
    return 0
  })
}


// Utility function to clean HTML while preserving original structure and tags
function stripHtmlCssWithStyledStrong(text: string): string {
  if (typeof text !== 'string') return text;

  let result = text;

  // Only remove style and script tags (dangerous content)
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove inline style attributes only
  result = result.replace(/\s*style\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s*style\s*=\s*'[^']*'/gi, '');

  // Protect tags we want to keep with placeholders
  result = result.replace(/<br\s*\/?>/gi, '___BR_TAG___');
  result = result.replace(/<strong>/gi, '___STRONG_OPEN___');
  result = result.replace(/<\/strong>/gi, '___STRONG_CLOSE___');
  result = result.replace(/<b>/gi, '___B_OPEN___');
  result = result.replace(/<\/b>/gi, '___B_CLOSE___');
  result = result.replace(/<em>/gi, '___EM_OPEN___');
  result = result.replace(/<\/em>/gi, '___EM_CLOSE___');
  result = result.replace(/<i>/gi, '___I_OPEN___');
  result = result.replace(/<\/i>/gi, '___I_CLOSE___');
  result = result.replace(/<a\s+href\s*=\s*"([^"]*)"[^>]*>/gi, '___A_OPEN_$1___');
  result = result.replace(/<\/a>/gi, '___A_CLOSE___');

  // Protect p tags to preserve paragraph structure
  result = result.replace(/<p[^>]*>/gi, '___P_OPEN___');
  result = result.replace(/<\/p>/gi, '___P_CLOSE___');

  // Remove div and span tags but keep their content
  result = result.replace(/<div[^>]*>/gi, '');
  result = result.replace(/<\/div>/gi, '');
  result = result.replace(/<span[^>]*>/gi, '');
  result = result.replace(/<\/span>/gi, '');

  // Remove newline characters (don't convert to br - Strapi already has proper p tags)
  result = result.replace(/\n/g, '');

  // Handle nbsp
  result = result.replace(/&nbsp;/gi, ' ');

  // Clean up multiple consecutive br tags (replace 3+ with just 2)
  result = result.replace(/(___BR_TAG___){3,}/g, '___BR_TAG______BR_TAG___');

  // Restore all protected tags - keep br tags and p tags as is
  result = result.replace(/___STRONG_OPEN___/g, '<strong>');
  result = result.replace(/___STRONG_CLOSE___/g, '</strong>');
  result = result.replace(/___B_OPEN___/g, '<b>');
  result = result.replace(/___B_CLOSE___/g, '</b>');
  result = result.replace(/___EM_OPEN___/g, '<em>');
  result = result.replace(/___EM_CLOSE___/g, '</em>');
  result = result.replace(/___I_OPEN___/g, '<i>');
  result = result.replace(/___I_CLOSE___/g, '</i>');
  result = result.replace(/___A_OPEN_([^_]+)___/g, '<a href="$1">');
  result = result.replace(/___A_CLOSE___/g, '</a>');
  result = result.replace(/___BR_TAG___/g, '<br>');
  result = result.replace(/___P_OPEN___/g, '<p>');
  result = result.replace(/___P_CLOSE___/g, '</p>');

  return result;
}

// Utility function to strip HTML/CSS without wrapping in <p> tags (for blockquotes, captions, etc.)
function stripHtmlCssNoParagraphs(text: string): string {
  if (typeof text !== 'string') return text;

  let result = text;

  // Remove style and script tags
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove inline style attributes only
  result = result.replace(/\s*style\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s*style\s*=\s*'[^']*'/gi, '');

  // Keep formatting tags: strong, b, em, i
  // Wrap <strong> tags with <b> tags for bold text
  result = result.replace(/<strong[^>]*>/gi, '<b><strong>');
  result = result.replace(/<\/strong>/gi, '</strong></b>');
  result = result.replace(/<b[^>]*>/gi, '<b>');
  result = result.replace(/<em[^>]*>/gi, '<em>');
  result = result.replace(/<i[^>]*>/gi, '<i>');

  // Keep <a> tags with href attribute
  result = result.replace(/<a\s+[^>]*href\s*=\s*"([^"]*)"[^>]*>/gi, '<a href="$1">');
  result = result.replace(/<a\s+[^>]*href\s*=\s*'([^']*)'[^>]*>/gi, '<a href="$1">');

  // Clean br tags FIRST to preserve them
  result = result.replace(/<br\s*\/?>/gi, '<br>');

  // Remove div, span, p tags but keep content
  result = result.replace(/<div[^>]*>/gi, '');
  result = result.replace(/<\/div>/gi, '');
  result = result.replace(/<span[^>]*>/gi, '');
  result = result.replace(/<\/span>/gi, '');
  result = result.replace(/<p[^>]*>/gi, ' ');
  result = result.replace(/<\/p>/gi, ' ');

  // Convert newline characters to <br> tags
  result = result.replace(/\n/g, '<br>');

  // Handle nbsp
  result = result.replace(/&nbsp;/gi, ' ');

  // Don't clean up whitespace for this function - preserve line breaks
  // Just trim the start and end
  return result.trim();
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
    locale?: string;
    localizations?: {
      data?: Array<{
        attributes?: {
          locale: string;
          slug: string;
          title?: string;
        };
      }>;
    };
    Related_stories?: {
      data?: Array<ArticleData>;
    };
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
    authors: Array<{
      name: string;
      title: string;
      bio?: string;
      email?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    }>;
    content: (string | ContentParagraph | ExtendedContentItem)[];
    coverImage?: string;
    mobileCoverImage?: string;
    categories?: Array<{ title: string; slug: string }>;
    location?: string;
    city?: string;
    state?: string;
    availableLanguages?: Array<{ code: string; slug: string }>;
    relatedStoriesData?: ArticleData[];
    isStudent?: boolean;
    storyLocale?: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(18)
  const [showPhotos, setShowPhotos] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showHeaderBar, setShowHeaderBar] = useState(false)
  // const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<Array<{ code: string; slug: string }>>([])
  const [hasMultipleLanguages, setHasMultipleLanguages] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)
  const [showCard, setShowCard] = useState(true)
  const [relatedStories, setRelatedStories] = useState<Array<{
    title: string;
    description: string;
    authors: string;
    imageUrl: string;
    categories: Array<{ title: string; slug: string }>;
    slug: string;
    location: string;
    date: string;
    availableLanguages?: Array<{ code: string; name: string; slug: string }>;
  }>>([])
  const [groupedAuthors, setGroupedAuthors] = useState<Array<{
    names: string[];
    title: string;
    bios: string[];
    emails: string[];
    twitters: string[];
    facebooks: string[];
    instagrams: string[];
    linkedins: string[];
  }>>([])
  const [showAllCategories, setShowAllCategories] = useState(false)

  // State for share modal
  const [showShareModal, setShowShareModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { language: currentLocale } = useLocale()

  // Get locale from URL search params to trigger re-render on language change
  const urlLocale = searchParams?.get('locale') || 'en'

  // Get current article locale from story data (will be set after story loads)
  const currentArticleLocale = story?.storyLocale || 'en'

  // State for credits modal - Always open by default
  const [showCreditsModal, setShowCreditsModal] = useState(true)

  // State for image modal
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; caption?: string; credits?: string } | null>(null)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [allContentImages, setAllContentImages] = useState<Array<{ src: string; alt: string; caption?: string; credits?: string }>>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageAnimating, setImageAnimating] = useState(false)
  const [showOriginalSize, setShowOriginalSize] = useState(false)
  const [showCaption, setShowCaption] = useState(true)

  // Collect all images from content when story loads - memoized
  const allImages = useMemo(() => {
    if (!story?.content) return []

    const images: Array<{ src: string; alt: string; caption?: string; credits?: string }> = []

    story.content.forEach((paragraph) => {
      if (!paragraph || typeof paragraph !== 'object') return

      const obj = paragraph as ExtendedContentItem

      // Extract images from different component types
      if (obj.__component === 'shared.media' || obj.__component === 'modular-content.media') {
        const mediaImages = extractMultipleImages(paragraph)
        mediaImages.forEach(img => {
          images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption, credits: img.credits })
        })
      } else if (obj.__component === 'modular-content.single-caption-mul-img') {
        const multiImages = extractMultipleImages(paragraph)
        multiImages.forEach(img => {
          images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption, credits: img.credits })
        })
      } else if (obj.__component === 'modular-content.multiple-caption-mul-img') {
        const multiCaptionImages = extractMultipleImages(paragraph)
        multiCaptionImages.forEach(img => {
          images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption, credits: img.credits })
        })
      } else if (obj.__component === 'shared.quote') {
        const quoteImageData = extractImageData(obj)
        if (quoteImageData) {
          images.push({ src: quoteImageData.url, alt: quoteImageData.alt || 'Quote image', caption: quoteImageData.caption, credits: quoteImageData.credits })
        }
      } else if (obj.__component === 'shared.rich-text') {
        // Extract images from rich text content
        const content = obj.content || obj.text || obj.Text || ''
        const imgRegex = /<img[^>]+src="([^">]+)"[^>]*alt="([^"]*)"[^>]*>/g
        let match
        while ((match = imgRegex.exec(content)) !== null) {
          images.push({ src: match[1], alt: match[2] || 'Article image' })
        }
      }
    })

    return images
  }, [story?.content])

  // Update state when images change
  useEffect(() => {
    setAllContentImages(allImages)
  }, [allImages])

  // Stop animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Update Open Graph meta tags for social sharing
  useEffect(() => {
    if (!story) return

    const updateMetaTags = () => {
      const currentUrl = window.location.href
      const title = story.title || 'PARI - People\'s Archive of Rural India'
      const description = story.subtitle || 'Stories from rural India'
      const image = story.coverImage || `${window.location.origin}/images/header-logo/For-dark-mode/pari-english-dark.png`

      // Update or create meta tags
      const metaTags = [
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:url', content: currentUrl },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'PARI - People\'s Archive of Rural India' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
      ]

      metaTags.forEach(({ property, name, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
        let metaTag = document.querySelector(selector)

        if (!metaTag) {
          metaTag = document.createElement('meta')
          if (property) metaTag.setAttribute('property', property)
          if (name) metaTag.setAttribute('name', name)
          document.head.appendChild(metaTag)
        }

        metaTag.setAttribute('content', content)
      })

      // Update page title
      document.title = `${title} - PARI`
    }

    updateMetaTags()
  }, [story])

  // Track scroll progress and header visibility
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - windowHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(progress)

      // Show header bar after scrolling 200px
      setShowHeaderBar(scrollTop > 200)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load story when slug or URL locale changes
  // urlLocale is from URL search params and triggers re-render when language changes
  useEffect(() => {
    async function loadStory() {
      try {
        setIsLoading(true)

        const fetchedStory = await fetchStoryBySlug(slug)
        setStory(fetchedStory)

        // Group authors by role
        if (fetchedStory.authors && fetchedStory.authors.length > 0) {
          const grouped = groupAuthorsByRole(fetchedStory.authors)
          setGroupedAuthors(grouped)
        }

        // Set available languages - only show languages that exist for this article
        if (fetchedStory.availableLanguages && fetchedStory.availableLanguages.length > 0) {
          // Filter to only include languages that have valid data
          const validLanguages = fetchedStory.availableLanguages.filter(lang =>
            lang.code && lang.slug && allLanguages.find(l => l.code === lang.code)
          )

          setAvailableLanguages(validLanguages)
          // Show language button if there's at least 1 language available
          setHasMultipleLanguages(validLanguages.length >= 1)

        }

      } catch {
        setError('Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadStory()
    }
  }, [slug, urlLocale, currentLocale])

  // Fetch related stories dynamically based on author, title, and category - memoized
  const fetchRelatedStories = useCallback(async () => {
    if (!story) {
      setRelatedStories([])
      return
    }

    try {
      // First, try to use manually curated related stories from API
      if (story.relatedStoriesData && story.relatedStoriesData.length > 0) {
        // Create a map to track unique articles by their ID
        // This helps us avoid showing the same article in different languages
        const uniqueArticleIds = new Set<number>()
        const seenSlugs = new Set<string>()

        // Filter to show only English language stories and avoid duplicates
        const englishStories = story.relatedStoriesData.filter((article: ArticleData) => {
          const locale = article.attributes.locale || 'en'
          const articleId = article.id
          const slug = article.attributes.slug

          // Skip if not English
          if (locale !== 'en') {
            return false
          }

          // Skip if we've already seen this article ID or a very similar slug
          // (to avoid showing translations of the same article)
          const baseSlug = slug.replace(/-(en|hi|mr|ta|te|kn|ml|bn|gu|guj|pa|or|as|ur|bho|hne|chh)$/, '')
          if (uniqueArticleIds.has(articleId) || seenSlugs.has(baseSlug)) {
            return false
          }

          uniqueArticleIds.add(articleId)
          seenSlugs.add(baseSlug)
          return true
        })

          const formattedStories = englishStories.slice(0, 4).map((article: ArticleData) => {
            const attrs = article.attributes
            const coverImage = attrs.Cover_image?.data?.attributes?.url

            // Handle Authors - check if it's an array
            let authors = ''
            if (Array.isArray(attrs.Authors)) {
              authors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                author.author_name?.data?.attributes?.Name || ''
              ).filter(Boolean).join(', ') || ''
            }

            const categories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string; slug?: string } }) => ({
              title: cat.attributes?.Title || '',
              slug: cat.attributes?.slug || ''
            })).filter(cat => cat.title) || []

            const locationName = attrs.location?.data?.attributes?.name || ''
            const locationDistrict = attrs.location?.data?.attributes?.district || ''
            const locationState = attrs.location?.data?.attributes?.state || ''
            const location = [locationName, locationDistrict, locationState].filter(Boolean).join(', ')

            // Get available languages from localizations
            let availableLanguages: Array<{ code: string; name: string; slug: string }> = []

            if (attrs.localizations) {
              // Handle both possible structures of localizations
              const localizationsArray = Array.isArray(attrs.localizations)
                ? attrs.localizations
                : attrs.localizations.data || []

              const mappedLocalizations = localizationsArray
                .filter((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                  const locale = loc.attributes?.locale || loc.locale
                  const slug = loc.attributes?.slug || loc.slug
                  return locale && slug
                })
                .map((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                  const locale = loc.attributes?.locale || loc.locale || 'en'
                  const slug = loc.attributes?.slug || loc.slug || ''
                  return {
                    code: locale,
                    name: allLanguages.find(l => l.code === locale)?.names[0] || locale.toUpperCase(),
                    slug: slug
                  }
                })

              // Add current article as first language (assuming current locale)
              availableLanguages = [
                {
                  code: currentLocale,
                  name: allLanguages.find(l => l.code === currentLocale)?.names[0] || currentLocale.toUpperCase(),
                  slug: attrs.slug || ''
                },
                ...mappedLocalizations.filter(loc => loc.code !== currentLocale)
              ]
            }

            return {
              title: attrs.Title || '',
              description: attrs.Strap || '',
              authors,
              imageUrl: coverImage ? `${API_BASE_URL}${coverImage}` : '',
              categories,
              slug: attrs.slug || '',
              location,
              date: attrs.Original_published_date ? formatDate(attrs.Original_published_date) : '',
              availableLanguages: availableLanguages.length > 1 ? availableLanguages : undefined
            }
          })

          setRelatedStories(formattedStories)
          return
        }

        // If no curated stories, fetch dynamically based on similarity scoring
        // Fetch only English language articles
        const allArticles: ArticleData[] = []

        // Fetch only English articles
        try {
          const query = {
            locale: 'en', // Only fetch English articles
            populate: {
              Cover_image: {
                fields: ['url']
              },
              is_student: true,
              Authors: {
                populate: {
                  author_name: {
                    fields: ['Name']
                  }
                }
              },
              categories: {
                fields: ['Title', 'slug']
              },
              location: {
                fields: ['name', 'district', 'state']
              },
              localizations: {
                fields: ['locale', 'slug']
              }
            },
            filters: {
              Title: {
                $ne: story.title // Exclude current story
              }
            },
            pagination: {
              limit: 40 // Fetch more articles to have better selection
            },
            sort: ['Original_published_date:desc']
          }

          const queryString = qs.stringify(query, { encodeValuesOnly: true })
          const apiUrl = `${BASE_URL}api/articles?${queryString}`

          const response = await axios.get(apiUrl)

          if (response.data?.data && response.data.data.length > 0) {
            allArticles.push(...response.data.data)
          }
        } catch {
          // No articles found
        }

        if (allArticles.length > 0) {
          // Calculate similarity score for each article
          interface ScoredArticle {
            article: ArticleData;
            score: number;
            matchDetails: {
              authorMatch: boolean;
              categoryMatches: number;
              locationMatch: boolean;
              titleSimilarity: number;
            };
          }

          const scoredArticles: ScoredArticle[] = allArticles.map((article: ArticleData) => {
            const attrs = article.attributes
            let score = 0
            const matchDetails = {
              authorMatch: false,
              categoryMatches: 0,
              locationMatch: false,
              titleSimilarity: 0
            }

            // 1. Author match (highest weight: 40 points)
            if (Array.isArray(attrs.Authors) && story.authors.length > 0) {
              const articleAuthors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                author.author_name?.data?.attributes?.Name || ''
              ).filter(Boolean)

              const hasAuthorMatch = story.authors.some(storyAuthor =>
                articleAuthors.some(articleAuthor =>
                  articleAuthor.toLowerCase().includes(storyAuthor.name.toLowerCase()) ||
                  storyAuthor.name.toLowerCase().includes(articleAuthor.toLowerCase())
                )
              )

              if (hasAuthorMatch) {
                score += 40
                matchDetails.authorMatch = true
              }
            }

            // 2. Category matches (30 points per matching category, max 60 points)
            if (story.categories && story.categories.length > 0) {
              const articleCategories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string } }) =>
                cat.attributes?.Title || ''
              ).filter(Boolean) || []

              const matchingCategories = story.categories.filter(cat =>
                articleCategories.some(artCat => artCat.toLowerCase() === cat.title.toLowerCase())
              )

              matchDetails.categoryMatches = matchingCategories.length
              score += matchingCategories.length * 30
            }

            // 3. Location match (20 points)
            if (story.location) {
              const articleLocation = attrs.location?.data?.attributes?.name ||
                                     attrs.location_auto_suggestion || ''

              if (articleLocation && story.location.toLowerCase().includes(articleLocation.toLowerCase())) {
                score += 20
                matchDetails.locationMatch = true
              }
            }

            // 4. Title keyword similarity (up to 20 points)
            const currentTitleWords = story.title.toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3) // Only words longer than 3 chars
              .filter(word => !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'their', 'have', 'been'].includes(word))

            const articleTitle = (attrs.Title || '').toLowerCase()
            const matchingWords = currentTitleWords.filter(word => articleTitle.includes(word))

            if (matchingWords.length > 0 && currentTitleWords.length > 0) {
              const titleSimilarity = (matchingWords.length / currentTitleWords.length) * 20
              score += titleSimilarity
              matchDetails.titleSimilarity = titleSimilarity
            }

            return {
              article,
              score,
              matchDetails
            }
          })

          // Sort by score (highest first) and take top 4
          const topRelatedArticles = scoredArticles
            .filter(item => item.score > 0) // Only include articles with some similarity
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)

          if (topRelatedArticles.length > 0) {
            const formattedStories = topRelatedArticles.map(({ article }) => {
              const attrs = article.attributes
              const coverImage = attrs.Cover_image?.data?.attributes?.url

              // Handle Authors - check if it's an array
              let authors = ''
              if (Array.isArray(attrs.Authors)) {
                authors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                  author.author_name?.data?.attributes?.Name || ''
                ).filter(Boolean).join(', ') || ''
              }

              const categories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string; slug?: string } }) => ({
                title: cat.attributes?.Title || '',
                slug: cat.attributes?.slug || ''
              })).filter(cat => cat.title) || []

              const locationName = attrs.location?.data?.attributes?.name || ''
              const locationDistrict = attrs.location?.data?.attributes?.district || ''
              const locationState = attrs.location?.data?.attributes?.state || ''
              const location = [locationName, locationDistrict, locationState].filter(Boolean).join(', ')

              // Get available languages from localizations
              let availableLanguages: Array<{ code: string; name: string; slug: string }> = []

              if (attrs.localizations) {
                // Handle both possible structures of localizations
                const localizationsArray = Array.isArray(attrs.localizations)
                  ? attrs.localizations
                  : attrs.localizations.data || []

                const mappedLocalizations = localizationsArray
                  .filter((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                    const locale = loc.attributes?.locale || loc.locale
                    const slug = loc.attributes?.slug || loc.slug
                    return locale && slug
                  })
                  .map((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                    const locale = loc.attributes?.locale || loc.locale || 'en'
                    const slug = loc.attributes?.slug || loc.slug || ''
                    return {
                      code: locale,
                      name: allLanguages.find(l => l.code === locale)?.names[0] || locale.toUpperCase(),
                      slug: slug
                    }
                  })

                // Add current article as first language (assuming current locale)
                availableLanguages = [
                  {
                    code: currentLocale,
                    name: allLanguages.find(l => l.code === currentLocale)?.names[0] || currentLocale.toUpperCase(),
                    slug: attrs.slug || ''
                  },
                  ...mappedLocalizations.filter(loc => loc.code !== currentLocale)
                ]
              }

              return {
                title: attrs.Title || '',
                description: attrs.Strap || '',
                authors,
                imageUrl: coverImage ? `${API_BASE_URL}${coverImage}` : '',
                categories,
                slug: attrs.slug || '',
                location,
                date: attrs.Original_published_date ? formatDate(attrs.Original_published_date) : '',
                availableLanguages: availableLanguages.length > 1 ? availableLanguages : undefined
              }
            })

            setRelatedStories(formattedStories)
          } else {
            setRelatedStories([])
          }
        } else {
          setRelatedStories([])
        }

      } catch (error) {
        console.error('Error fetching related stories:', error)
        setRelatedStories([])
      }
  }, [story, currentLocale])

  // Call fetchRelatedStories when story or locale changes
  useEffect(() => {
    fetchRelatedStories()
  }, [fetchRelatedStories])

  // Callback functions for image modal navigation
  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false)
    setSelectedImage(null)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setShowOriginalSize(false)
  }, [])

  const handleNextImage = useCallback(() => {
    if (allContentImages.length === 0) return

    const nextIndex = (currentImageIndex + 1) % allContentImages.length
    setCurrentImageIndex(nextIndex)
    setSelectedImage(allContentImages[nextIndex])
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setShowOriginalSize(false)
  }, [allContentImages, currentImageIndex])

  const handlePrevImage = useCallback(() => {
    if (allContentImages.length === 0) return

    const prevIndex = (currentImageIndex - 1 + allContentImages.length) % allContentImages.length
    setCurrentImageIndex(prevIndex)
    setSelectedImage(allContentImages[prevIndex])
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setShowOriginalSize(false)
  }, [allContentImages, currentImageIndex])

  // Handle image click - memoized
  const handleImageClick = useCallback((src: string, alt: string, caption?: string, credits?: string) => {
    // Find the index of the clicked image
    const index = allContentImages.findIndex(img => img.src === src)

    if (index !== -1) {
      setCurrentImageIndex(index)
    } else {
      // If image not found in array, add it and set as current
      setAllContentImages(prev => [...prev, { src, alt, caption, credits }])
      setCurrentImageIndex(allContentImages.length)
    }

    setSelectedImage({ src, alt, caption, credits })
    setShowImageModal(true)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setShowOriginalSize(false)
    setImageAnimating(true)
    setTimeout(() => setImageAnimating(false), 1500) // Animation duration
  }, [allContentImages])

  // Share and utility handlers - memoized
  const handleShare = useCallback(() => {
    setShowShareModal(true)
  }, [])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }, [])

  const shareToWhatsApp = useCallback(() => {
    const title = story?.title || ''
    const description = story?.subtitle || ''
    const url = window.location.href

    let message = `*${title}*`
    if (description) {
      message += `\n\n${description}`
    }
    message += `\n\n${url}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }, [story?.title, story?.subtitle])

  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
  }, [])

  const shareToTwitter = useCallback(() => {
    const title = story?.title || ''
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
  }, [story?.title])

  const shareToTelegram = useCallback(() => {
    const title = story?.title || ''
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`
    window.open(url, '_blank')
  }, [story?.title])

  const shareToLinkedIn = useCallback(() => {
    const title = story?.title || ''
    const description = story?.subtitle || ''
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    window.open(url, '_blank')
  }, [story?.title, story?.subtitle])

  const shareToEmail = useCallback(() => {
    const title = story?.title || ''
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`Check out this story from PARI:\n\n${title}\n\n${window.location.href}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, [story?.title])

  const shareToInstagram = useCallback(() => {
    const url = window.location.href

    // Try to open Instagram app with the URL
    // Instagram doesn't support direct sharing via URL, so we open the app
    const instagramUrl = `instagram://`

    // Try to open Instagram app
    window.location.href = instagramUrl

    // Fallback: If Instagram app doesn't open (desktop), copy link after a delay
    setTimeout(() => {
      navigator.clipboard.writeText(url).then(() => {
        // Link copied as fallback
      }).catch(() => {
        console.log('Failed to copy link')
      })
    }, 1000)
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleZoomIn = useCallback(() => {
    setImageScale(prev => Math.min(prev + 0.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setImageScale(prev => Math.max(prev - 0.5, 0.5))
  }, [])

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }, [])

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 14))
  }, [])

  // Calculate font size percentage (14px = 0%, 24px = 100%)
  // const fontSizePercentage = useMemo(() => {
  //   const min = 14
  //   const max = 24
  //   const percentage = Math.round(((fontSize - min) / (max - min)) * 100)
  //   console.log('##Rohit_Rocks## fontSize:', fontSize, 'percentage:', percentage)
  //   return percentage
  // }, [fontSize])

  const handlePhotoClick = useCallback(() => {
    setShowPhotos(!showPhotos)
  }, [showPhotos])

  const handleClose = useCallback(() => {
    setShowCard(false)
  }, [])

  const handleToggleCard = useCallback(() => {
    setShowCard(true)
  }, [])

  const handleResetZoom = useCallback(() => {
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setShowOriginalSize(false)
  }, [])

  // const handleOriginalSize = useCallback(() => {
  //   setImageScale(1)
  //   setImagePosition({ x: 0, y: 0 })
  //   setShowOriginalSize(true)
  // }, [])

  const handleToggleCaption = useCallback(() => {
    setShowCaption(prev => !prev)
  }, [])

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return

      if (e.key === 'Escape') {
        handleCloseImageModal()
      } else if (e.key === 'ArrowRight') {
        handleNextImage()
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, handleCloseImageModal, handleNextImage, handlePrevImage])

  if (isLoading) {
    return <StoryDetailSkeleton />
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageScale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageScale > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      // Scroll up - zoom in
      setImageScale(prev => Math.min(prev + 0.2, 5))
    } else {
      // Scroll down - zoom out
      setImageScale(prev => Math.max(prev - 0.2, 0.5))
    }
  }

  const storyDir = getTextDirection(story.storyLocale || 'en')

  return (
    <div
      className="min-h-screen bg-background story-content-wrapper"
      lang={getLangAttribute(story.storyLocale || 'en')}
      dir={storyDir}
    >
      {/* Global style to force font-size inheritance and direction isolation for article content */}
      <style>{`
        .article-content-text,
        .article-content-text * {
          font-size: inherit !important;
        }
        .article-content-text {
          font-size: ${fontSize}px !important;
        }

        /* Force story content to use its own direction, overriding parent HTML dir */
        .story-content-wrapper {
          direction: ${storyDir} !important;
          text-align: ${storyDir === 'rtl' ? 'right' : 'left'} !important;
        }

        .story-content-wrapper * {
          direction: inherit !important;
        }


      `}</style>

      {/* Reading Progress Line Bar */}

      {/* Sticky Header Bar - Appears while scrolling */}
      <div
        className={`fixed top-0 left-0 w-full bg-white dark:bg-popover border-b border-gray-200 dark:border-gray-700 z-40000 transition-transform duration-300 ${
          showHeaderBar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 md:py-4 flex items-center justify-center gap-12 md:gap-16 relative">
          {/* Audio Play */}
          {/* <button
            onClick={handleAudioToggle}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED] hover:bg-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red hover:bg-primary-PARI-Red'} border-1 py-1 px-3 rounded-full hover:text-white transition-all`}
            title={isAudioPlaying ? "Pause Audio" : "Play Audio"}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 8 11 24 23 16" fill="currentColor" stroke="none"/>
            </svg>
          </button> */}

          {/* Photo/Image */}
          <button
            onClick={handlePhotoClick}
            className={`${
              showPhotos
                ? story.isStudent
                  ? 'text-white bg-[#2F80ED] border-[#2F80ED]'
                  : 'text-white bg-primary-PARI-Red border-primary-PARI-Red'
                : story.isStudent
                  ? 'text-[#2F80ED] border-[#2F80ED]'
                  : 'text-primary-PARI-Red border-primary-PARI-Red'
            } rounded-full p-2 cursor-pointer`}
            title="Toggle Photos"
          >
            <ImageIcon size={28} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red'} rounded-full cursor-pointer`}
            title="Share"
          >
            <FiShare2 size={28} />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red'} rounded-full cursor-pointer`}
            title="Print"
          >
           <Printer size={28} />
          </button>

          {/* Font Size Controls */}
          <div className="relative flex items-center gap-4 md:gap-6">
            {/* Percentage Badge */}
            {/* <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${story.isStudent ? 'bg-[#2F80ED]' : 'bg-primary-PARI-Red'} text-white px-2 py-0.5 rounded-full text-xs font-medium`}>
              {fontSizePercentage}%
            </div> */}

            <button
              type="button"
              onClick={() => {
                decreaseFontSize()
              }}
              className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'}  hover:opacity-70 transition-opacity font-medium cursor-pointer leading-none`}
              style={{ fontSize: '28px' }}
              title="Decrease Font Size"
            >
              −
            </button>
            <span className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} font-medium`} style={{ fontSize: '24px' }}>T</span>
            <button
              type="button"
              onClick={() => {
                increaseFontSize()
              }}
              className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} hover:opacity-70 transition-opacity font-medium cursor-pointer leading-none`}
              style={{ fontSize: '28px' }}
              title="Increase Font Size"
            >
              +
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full ${story.isStudent ? 'bg-[#2F80ED]' : 'bg-primary-PARI-Red'} transition-all duration-150 ease-out`}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full">
        {story.coverImage && (
          <div className="relative w-full md:h-[100vh] h-[50vh]">
            {/* Desktop cover image */}
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="hidden md:block object-cover object-center md:rounded-none"
              priority
              unoptimized
            />
            {/* Mobile cover image - use mobileCoverImage if available, otherwise fallback to coverImage */}
            <Image
              src={story.mobileCoverImage || story.coverImage}
              alt={story.title}
              fill
              className="block md:hidden object-cover object-center"
              priority
              unoptimized
            />
          </div>

        )}
      </div>

      {/* White Card Overlay - Separate from content */}
      {showCard && (
        <div className={`relative mx-auto px-4 my-16 md:px-8 ${story.coverImage ? '-mt-32' : ''}`}>
          <div
            className="bg-white dark:bg-popover rounded-3xl p-[2.5rem]  lg:p-[4rem] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] relative mx-auto max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto"
            lang={getLangAttribute(story.storyLocale || 'en')}
            dir={getTextDirection(story.storyLocale || 'en')}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute md:top-6 top-2 right-2 md:right-6 w-10 h-10 flex items-center justify-center rounded-full border-1 ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white transition-colors`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Location and Date */}
            <div className="flex items-center  gap-2 mb-4">
              <h6 className={`${story.isStudent ? ' text-[#2F80ED]' : 'text-primary-PARI-Red'} font-noto-sans text-[14px] uppercase`}

              >
                {[ story.city, story.state].filter(Boolean).join(', ') || 'SANGUR, PUNJAB'}
              </h6>
              <span className="text-gray-400 dark:text-[#8e8888]">|</span>
              <h6 className="text-grey-300 dark:text-discreet-text font-noto-sans text-[14px]"
              >
                {formatDate(story.publishedDate)}
              </h6>
            </div>

            {/* Category Tags */}
            {story.categories && story.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Desktop: Show all categories */}
                <div className="hidden md:contents">
                  {story.categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        window.location.href = `/articles?types=${category.slug}`
                      }}
                      className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '100%'
                      }}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>

                {/* Mobile: Show with expand/collapse */}
                <div className="md:hidden contents">
                  {showAllCategories ? (
                    // Show all categories
                    <>
                      {story.categories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            window.location.href = `/articles?types=${category.slug}`
                          }}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer animate-slide-in-left`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          {category.title}
                        </button>
                      ))}
                      {/* Reset button */}
                      {story.categories.length > 2 && (
                        <button
                          onClick={() => setShowAllCategories(false)}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          -
                        </button>
                      )}
                    </>
                  ) : (
                    // Show only first 2 categories
                    <>
                      {story.categories.slice(0, 2).map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            window.location.href = `/articles?types=${category.slug}`
                          }}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          {category.title}
                        </button>
                      ))}
                      {/* Show more button */}
                      {story.categories.length > 2 && (
                        <button
                          onClick={() => setShowAllCategories(true)}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          +{story.categories.length - 2}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-foreground mb-2"
             
            >
              {story.title}
            </h1>

            {/* Subtitle */}
            {story.subtitle && (
              <h2
                className="text-foreground  mb-4"
                
                dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(story.subtitle) }}
              />
            )}

            {/* Divider Line */}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-8 "></div>

            {/* Authors Info - Dynamic */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="grid grid-cols-1 md:flex md:flex-row gap-6 md:gap-12 flex-1">
                {groupedAuthors.map((group, index) => (
                  <div key={index} >
                    <h6 className=" font-noto-sans text-grey-300 dark:text-discreet-text text-[14px] mb-2"
                    >
                      {group.title || getTranslatedLabel('author', currentLocale)}
                    </h6>
                    <div className="font-noto-sans text-foreground"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '140%'
                      }}
                    >
                      {group.names.map((name, nameIndex) => (
                        <span key={nameIndex}>
                          <button
                            onClick={() => {
                              window.location.href = `/articles?author=${encodeURIComponent(name)}`
                            }}
                            className={`transition-colors text-left ${story.isStudent ? 'hover:text-[#2F80ED] dark:hover:text-[#2F80ED]' : 'hover:text-primary-PARI-Red dark:hover:text-primary-PARI-Red'}`}
                          >
                            {name}
                          </button>
                          {nameIndex < group.names.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* See all credits button */}
              <button
                onClick={() => {
                  setShowCreditsModal(true)
                  // Scroll to credits section smoothly
                  setTimeout(() => {
                    const creditsSection = document.getElementById('credits-section')
                    if (creditsSection) {
                      creditsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }}
                className={`w-full md:w-auto md:ml-8 px-6 py-3 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} rounded-full font-noto-sans hover:text-white transition-colors whitespace-nowrap`}
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '100%'
                }}
              >
                {getTranslatedLabel('seeAllCredits', currentLocale)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Card Button - Appears when card is hidden */}
      {!showCard && (
        <div className="flex justify-end items-center max-w-7xl mx-auto px-4 md:px-8 -mt-12 mb-8 relative z-10">
          <button
            onClick={handleToggleCard}
            className="bg-white dark:bg-popover rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] hover:shadow-[0px_6px_30px_0px_rgba(0,0,0,0.15)] transition-all duration-300 flex items-center justify-center"
            style={{
              width: '70px',
              height: '70px'
            }}
          >
            <div className={`w-16 h-16 font-bold rounded-full  ${story.isStudent ? 'border-[#2F80ED]' : 'border-primary-PARI-Red'} flex items-center justify-center`}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className={story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'}
              >
                <line x1="20" y1="10" x2="20" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </button>
        </div>
      )}


      {/* Main Content - Always visible */}
      <div
        className="w-full lg:my-16 md:my-12 my-8 mx-auto  md:px-8"
        lang={getLangAttribute(story.storyLocale || 'en')}
        dir={getTextDirection(story.storyLocale || 'en')}
      >
        {story.content && story.content.length > 0 ? (
          <div>
              {(() => {
                // Group consecutive image components together
                const groupedContent: Array<string | ExtendedContentItem | ExtendedContentItem[]> = []
                let currentImageGroup: ExtendedContentItem[] = []

                story.content.forEach((item) => {
                  if (item && typeof item === 'object') {
                    const obj = item as ExtendedContentItem
                    if ('__component' in obj && (obj.__component === 'shared.media' || obj.__component === 'modular-content.media')) {
                      // Add to current image group
                      currentImageGroup.push(obj)
                    } else {
                      // Not an image - flush current group if any
                      if (currentImageGroup.length > 0) {
                        groupedContent.push([...currentImageGroup])
                        currentImageGroup = []
                      }
                      groupedContent.push(obj)
                    }
                  } else {
                    // Not an object - flush current group if any
                    if (currentImageGroup.length > 0) {
                      groupedContent.push([...currentImageGroup])
                      currentImageGroup = []
                    }
                    groupedContent.push(item)
                  }
                })

                // Flush any remaining images
                if (currentImageGroup.length > 0) {
                  groupedContent.push([...currentImageGroup])
                }

                return groupedContent.map((item, index) => {

                  // Handle grouped images (array of image components)
                  if (Array.isArray(item)) {
                    const imageGroup = item
                    const groupImageCount = imageGroup.length

                    // Extract all image data first
                    const allImageData = imageGroup.map(imgObj => extractImageData(imgObj)).filter(Boolean)

                    // For 2 or 4 images: use grid-cols-2
                    if (groupImageCount === 2 || groupImageCount === 4) {
                      return (
                        <div key={`image-group-${index}`} className="my-12 my-8 w-full flex justify-center">
                          <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allImageData.map((imageData, imgIndex) => (
                              <div key={`img-${index}-${imgIndex}`} className="space-y-3">
                                <div
                                  className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                  onClick={() => handleImageClick(imageData!.url, imageData!.alt || 'Article image', imageData!.caption)}
                                >
                                  <Image
                                    src={imageData!.url}
                                    alt={imageData!.alt || 'Article image'}
                                    width={500}
                                    height={400}
                                    className="w-full h-full object-cover md:rounded-lg"
                                    unoptimized
                                  />
                                  {/* Zoom Icon */}
                                  <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn className="w-5 h-5" />
                                  </div>
                                </div>
                                {imageData!.caption && (
                                  <div className="mt-3 px-2">
                                    <div className={`text-sm text-discreet-text `}>
                                      {imageData!.caption}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                    return (
                      <div key={`image-group-${index}`} className="my-12 w-full flex justify-center">
                        <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                          {/* First image - full width */}
                          {allImageData[0] && (
                            <div className="space-y-3">
                              <div
                                className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                onClick={() => handleImageClick(allImageData[0]!.url, allImageData[0]!.alt || 'Article image', allImageData[0]!.caption)}
                              >
                                <Image
                                  src={allImageData[0]!.url}
                                  alt={allImageData[0]!.alt || 'Article image'}
                                  width={allImageData[0]!.width || 1920}
                                  height={allImageData[0]!.height || 1080}
                                  className="w-full h-auto max-h-[600px] object-cover md:rounded-lg"
                                  unoptimized
                                />
                                {/* Zoom Icon */}
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-5 h-5" />
                                </div>
                              </div>
                              {allImageData[0].caption && (
                                <div className="mt-3">
                                  <p className="text-sm text-discreet-text italic leading-relaxed">
                                    {allImageData[0].caption}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Remaining images in grid-cols-2 */}
                          {allImageData.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {allImageData.slice(1).map((imageData, imgIndex) => (
                                <div key={`img-${index}-${imgIndex + 1}`} className="space-y-3">
                                  <div
                                    className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                    onClick={() => handleImageClick(imageData!.url, imageData!.alt || `Article image ${imgIndex + 2}`, imageData!.caption)}
                                  >
                                    <Image
                                      src={imageData!.url}
                                      alt={imageData!.alt || `Article image ${imgIndex + 2}`}
                                      width={500}
                                      height={400}
                                      className="w-full h-full object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {imageData!.caption && (
                                    <div className="mt-3 px-2">
                                      <div className={`text-sm text-discreet-text`}>
                                        {imageData!.caption}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Handle string content - Skip if showing photos only
                  if (typeof item === 'string' && item.trim().length > 0) {
                  if (showPhotos) return null

                  return (
                    <div key={index} className="my-6 max-w-3xl mx-auto px-8 md:px-10 lg:px-16">
                      
                      <div
                        className="article-content-text text-discreet-text leading-relaxed"
                        style={{
                           fontFamily: 'Noto Sans',
                          fontWeight: 400,
                          fontSize: `${fontSize}px`,
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
                  const obj = item as ExtendedContentItem

                  // Handle Strapi component types
                  if ('__component' in obj) {
                    switch (obj.__component) {
                      case 'shared.rich-text':
                      case 'modular-content.text':
                      case 'modular-content.paragraph':
                        // Skip text content if showing photos only
                        if (showPhotos) return null

                        // Debug log to see what data we're receiving
                        if (obj.__component === 'modular-content.text') {
                          console.log('##Rohit_Rocks## modular-content.text data:', obj)
                        }

                        // Try all possible field names for text content
                        const textContent = obj.Text || obj.Paragraph || obj.content || obj.text || obj.Body || obj.body || ''

                        if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
                          // Check if content is only stars (asterisks)
                          const strippedContent = stripHtmlCssWithStyledStrong(textContent)

                          // Debug: log the processed content
                          console.log('##Rohit_Rocks## Processed HTML:', strippedContent)

                          const isStarsOnly = /^[\s*]+$/.test(strippedContent)

                          return (
                            <div key={index} className="my-6 max-w-3xl mx-auto px-8 md:px-10 lg:px-16">
                              <style jsx>{`
                                .article-content-text {
                                  font-weight: 400;
                                  line-height: 1.8;
                                  white-space: pre-line;
                                }
                                .article-content-text :global(p) {
                                  margin-bottom: 0;
                                  font-weight: 400;
                                  white-space: normal;
                                }
                                .article-content-text :global(p + p) {
                                  margin-top: 1rem;
                                }
                                .article-content-text :global(br) {
                                  display: block !important;
                                  content: "" !important;
                                  line-height: 1.5em !important;
                                }
                                .article-content-text :global(br)::after {
                                  content: "" !important;
                                  display: block !important;
                                }
                                .article-content-text :global(a) {
                                  color: #B91C1C;
                                  text-decoration: underline;
                                }
                                .article-content-text :global(a:hover) {
                                  color: #991B1B;
                                }
                                .article-content-text :global(strong),
                                .article-content-text :global(b) {
                                  font-weight: 700 !important;
                                }
                                .article-content-text :global(em),
                                .article-content-text :global(i) {
                                  font-style: italic;
                                }
                              `}</style>
                              <div
                                className={`article-content-text text-discreet-text ${isStarsOnly ? 'text-center' : ''}`}
                                style={{
                                  fontFamily: 'Noto Sans',
                                  fontSize: `${fontSize}px`,
                                  lineHeight: '170%',
                                  letterSpacing: '-3%'
                                }}
                                dangerouslySetInnerHTML={{ __html: strippedContent }}
                              />
                            </div>
                          )
                        }
                        return null

                      case 'shared.media':
                      case 'modular-content.media':
                        // Images are now handled in the grouped section above
                        // This case should not be reached as images are filtered out during grouping
                        return null

                      case 'modular-content.single-caption-mul-img':
                        // Debug: log the component data
                        console.log('single-caption-mul-img component:', obj)

                        const multipleImages = extractMultipleImages(obj)
                        console.log('Extracted images:', multipleImages)

                        // Extract shared caption/content from the component
                        const sharedCaption = ('caption' in obj && typeof obj.caption === 'string') ? obj.caption :
                                             ('Caption' in obj && typeof obj.Caption === 'string') ? obj.Caption :
                                             ('content' in obj && typeof obj.content === 'string') ? obj.content : undefined

                        // Extract credits from the component level (if exists)
                        let singleCaptionCredits: string | undefined
                        if ('credits' in obj && obj.credits && typeof obj.credits === 'object') {
                          const creditsObj = obj.credits as Record<string, unknown>
                          if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
                            const creditsData = creditsObj.data as Record<string, unknown>
                            if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
                              const creditsAttrs = creditsData.attributes as Record<string, unknown>
                              if ('Name' in creditsAttrs && typeof creditsAttrs.Name === 'string') {
                                singleCaptionCredits = creditsAttrs.Name
                              }
                            }
                          }
                        }

                        if (multipleImages.length > 0) {
                          const imageCount2 = multipleImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (imageCount2 === 2 || imageCount2 === 4) {
                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multipleImages.map((img, imgIndex) => (
                                      <div key={imgIndex} className="space-y-3">
                                        <div
                                          className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 1}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 1}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shared caption and credits below all images */}
                                  {(sharedCaption || singleCaptionCredits) && (
                                    <div className="mt-3 md:px-10 px-8">
                                      {singleCaptionCredits && (
                                        <p className={`text-sm   mb-1`}>
                                        {singleCaptionCredits}
                                        </p>
                                      )}
                                      {sharedCaption && (
                                        <div
                                          className={`text-sm text-caption `}
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(sharedCaption) }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(multipleImages[0].url, multipleImages[0].alt || 'Image 1', multipleImages[0].caption)}
                                  >
                                    <Image
                                      src={multipleImages[0].url}
                                      alt={multipleImages[0].alt || 'Image 1'}
                                      width={multipleImages[0].width || 1920}
                                      height={multipleImages[0].height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {multipleImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multipleImages.slice(1).map((img, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        <div
                                          className="w-full cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 2}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 2}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Shared caption and credits below all images */}
                                {(sharedCaption || singleCaptionCredits) && (
                                  <div className="mt-3 md:px-10 px-8">
                                    {singleCaptionCredits && (
                                      <p className={`text-sm text-primary-PARI-Red  mb-1`}>
                                        {singleCaptionCredits}
                                      </p>
                                    )}
                                    {sharedCaption && (
                                      <div
                                        className={`text-sm text-caption `}
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(sharedCaption) }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.video':
                        // Skip videos if showing photos only
                        if (showPhotos) return null

                        const videoData = extractVideoData(obj)

                        if (videoData) {
                          return (
                            <div key={index} className="my-16">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                <video
                                  src={videoData.url}
                                  controls
                                  className="w-full h-full rounded-lg shadow-md"
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
                          )
                        }
                        return null

                      case 'modular-content.video-embed-url':
                        // Skip videos if showing photos only
                        if (showPhotos) return null

                        const embedUrl = 'video_embed_url' in obj && typeof obj.video_embed_url === 'string' ? obj.video_embed_url : null
                        const embedCaption = 'Video_caption' in obj && typeof obj.Video_caption === 'string' ? obj.Video_caption : null

                        if (embedUrl) {
                          // Convert YouTube watch URL to embed URL
                          let finalEmbedUrl = embedUrl
                          if (embedUrl.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(embedUrl.split('?')[1])
                            const videoId = urlParams.get('v')
                            if (videoId) {
                              finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          } else if (embedUrl.includes('youtu.be/')) {
                            const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0]
                            if (videoId) {
                              finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          }

                          return (
                            <div key={index} className="my-12">
                              <div className="relative max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto" style={{ aspectRatio: '16/9' }}>
                                <iframe
                                  src={finalEmbedUrl}
                                  className="w-full h-full md:rounded-lg shadow-md"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title="Embedded video"
                                />
                              </div>
                              {embedCaption && (
                                <div
                                  className={`text-sm ${story.isStudent ? 'text-[#2F80ED] dark:text-[#2F80ED]' : 'text-pari-red dark:text-pari-red'} mt-2 italic text-center`}
                                  dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(embedCaption) }}
                                />
                              )}
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.audio-embed-url':
                        // Skip audio if showing photos only
                        if (showPhotos) return null

                        const audioEmbedRaw = 'audio_embed_url' in obj && typeof obj.audio_embed_url === 'string' ? obj.audio_embed_url : null
                        const audioCaption = 'caption' in obj && typeof obj.caption === 'string' ? obj.caption : null
                        const audioContent = 'content' in obj && typeof obj.content === 'string' ? obj.content : null

                        if (audioEmbedRaw) {
                          // Extract src from iframe HTML if it's an iframe string
                          let audioEmbedUrl = audioEmbedRaw
                          if (audioEmbedRaw.includes('<iframe')) {
                            const srcMatch = audioEmbedRaw.match(/src=["']([^"']+)["']/)
                            if (srcMatch && srcMatch[1]) {
                              audioEmbedUrl = srcMatch[1]
                            }
                          }

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                  <iframe
                                    src={audioEmbedUrl}
                                    className="w-full rounded-lg border-0"
                                    height="200"
                                    allow="autoplay"
                                    title="Embedded audio"
                                  />
                                </div>
                                {audioCaption && (
                                  <div
                                    className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic text-center"
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(audioCaption) }}
                                  />
                                )}
                                {audioContent && (
                                  <div
                                    className="mt-3 text-foreground"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(audioContent) }}
                                  />
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.columnar-text':
                        // Skip columnar text if showing photos only
                        if (showPhotos) return null

                        // Extract Content array
                        const columnarContentArray = 'Content' in obj && Array.isArray(obj.Content) ? obj.Content : null

                        // Handle single column (when only 1 item in Content array)
                        if (columnarContentArray && columnarContentArray.length === 1) {
                          const singleColumn = columnarContentArray[0] as Record<string, unknown>
                          const singleText = 'Paragraph' in singleColumn && typeof singleColumn.Paragraph === 'string' ? stripHtmlCssWithStyledStrong(singleColumn.Paragraph) : ''

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto px-4">
                                <div className="flex justify-center">
                                  {/* Single Column */}
                                  <div
                                    className="text-foreground columnar-text-content max-w-2xl"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: singleText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // Handle two columns (when 2 or more items in Content array)
                        if (columnarContentArray && columnarContentArray.length >= 2) {
                          const leftColumn = columnarContentArray[0] as Record<string, unknown>
                          const rightColumn = columnarContentArray[1] as Record<string, unknown>

                          const leftText = 'Paragraph' in leftColumn && typeof leftColumn.Paragraph === 'string' ? stripHtmlCssWithStyledStrong(leftColumn.Paragraph) : ''
                          const rightText = 'Paragraph' in rightColumn && typeof rightColumn.Paragraph === 'string' ? stripHtmlCssWithStyledStrong(rightColumn.Paragraph) : ''

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto px-8 md:px-10 lg:px-16">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {/* Left Column */}
                                  <div
                                    className="text-discreet-text columnar-text-content"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: leftText }}
                                  />

                                  {/* Right Column */}
                                  <div
                                    className="text-discreet-text columnar-text-content"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: rightText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return null

                      case 'modular-content.single-columnar-text':
                        // Skip single columnar text if showing photos only
                        if (showPhotos) return null

                        // Extract Content array
                        const singleColumnarContentArray = 'Content' in obj && Array.isArray(obj.Content) ? obj.Content : null

                        if (singleColumnarContentArray && singleColumnarContentArray.length >= 1) {
                          const singleColumn = singleColumnarContentArray[0] as Record<string, unknown>
                          const singleText = 'Paragraph' in singleColumn && typeof singleColumn.Paragraph === 'string' ? stripHtmlCssWithStyledStrong(singleColumn.Paragraph) : ''

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto px-4">
                                <div className="flex justify-center">
                                  {/* Single Column */}
                                  <div
                                    className="text-foreground columnar-text-content max-w-2xl"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: singleText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return null

                      case 'modular-content.image':
                        if (obj.Image && typeof obj.Image === 'object') {
                          const imgData = obj.Image as Record<string, unknown>

                          // Extract URL from Strapi structure
                          let imgUrl: string | undefined
                          let imgWidth: number | undefined
                          let imgHeight: number | undefined

                          // Check for Strapi media structure (data.attributes.url)
                          if ('data' in imgData && imgData.data && typeof imgData.data === 'object') {
                            const dataObj = imgData.data as Record<string, unknown>
                            if ('attributes' in dataObj && dataObj.attributes && typeof dataObj.attributes === 'object') {
                              const attrs = dataObj.attributes as Record<string, unknown>
                              imgUrl = attrs.url as string | undefined
                              imgWidth = attrs.width as number | undefined
                              imgHeight = attrs.height as number | undefined
                            }
                          }
                          // Fallback to direct URL
                          else if ('url' in imgData && typeof imgData.url === 'string') {
                            imgUrl = imgData.url
                            imgWidth = imgData.width as number | undefined
                            imgHeight = imgData.height as number | undefined
                          }

                          // Extract caption and photographer - try multiple possible field names
                          let imgCaption: string | undefined
                          let imgPhotographer: string | undefined

                          // Try different caption field names
                          if ('Caption' in obj && obj.Caption) {
                            if (typeof obj.Caption === 'string') {
                              imgCaption = obj.Caption
                            } else if (typeof obj.Caption === 'object' && obj.Caption !== null) {
                              // Rich text format - extract text content
                              const captionObj = obj.Caption as Record<string, unknown>
                              if ('text' in captionObj && typeof captionObj.text === 'string') {
                                imgCaption = captionObj.text
                              } else if ('content' in captionObj && typeof captionObj.content === 'string') {
                                imgCaption = captionObj.content
                              } else {
                                // Try to stringify if it's an object
                                imgCaption = JSON.stringify(captionObj)
                              }
                            }
                          } else if ('caption' in obj && typeof obj.caption === 'string') {
                            imgCaption = obj.caption
                          }

                          // Try different photographer field names
                          if ('Photographer' in obj && obj.Photographer) {
                            if (typeof obj.Photographer === 'string') {
                              imgPhotographer = obj.Photographer
                            } else if (typeof obj.Photographer === 'object' && obj.Photographer !== null) {
                              const photogObj = obj.Photographer as Record<string, unknown>
                              if ('data' in photogObj && photogObj.data && typeof photogObj.data === 'object') {
                                const photogData = photogObj.data as Record<string, unknown>
                                if ('attributes' in photogData && photogData.attributes && typeof photogData.attributes === 'object') {
                                  const photogAttrs = photogData.attributes as Record<string, unknown>
                                  imgPhotographer = photogAttrs.Name as string || photogAttrs.name as string
                                }
                              }
                            }
                          } else if ('photographer' in obj && typeof obj.photographer === 'string') {
                            imgPhotographer = obj.photographer
                          } else if ('credits' in obj && obj.credits) {
                            const creditsObj = obj.credits as Record<string, unknown>
                            if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
                              const creditsData = creditsObj.data as Record<string, unknown>
                              if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
                                const creditsAttrs = creditsData.attributes as Record<string, unknown>
                                imgPhotographer = creditsAttrs.Name as string || creditsAttrs.name as string
                              }
                            }
                          }

                          if (imgUrl) {
                            const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`

                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div
                                    className="cursor-pointer relative group"
                                    onClick={() => handleImageClick(fullImgUrl, imgCaption || 'Article image', imgCaption, imgPhotographer)}
                                  >
                                    <Image
                                      src={fullImgUrl}
                                      alt={imgCaption || 'Article image'}
                                      width={imgWidth || 1920}
                                      height={imgHeight || 1080}
                                      className="md:rounded-lg shadow-md w-full h-auto max-h-[600px] object-cover"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {(imgCaption || imgPhotographer) && (
                                    <div className="mt-3 px-2">
                                      {imgPhotographer && (
                                        <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                           {imgPhotographer}
                                        </p>
                                      )}
                                      {imgCaption && (
                                        <div
                                          className={`text-sm text-caption `}
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(imgCaption) }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        }
                        return null

                      case 'modular-content.full-width-image':
                        const fullWidthImageData = extractImageData(obj)

                        // Extract credits information
                        let fullWidthCredits: string | undefined
                        if ('credits' in obj && obj.credits) {
                          if (typeof obj.credits === 'string') {
                            fullWidthCredits = obj.credits
                          } else if (typeof obj.credits === 'object' && obj.credits !== null) {
                            const creditsObj = obj.credits as Record<string, unknown>
                            if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
                              const creditsData = creditsObj.data as Record<string, unknown>
                              if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
                                const creditsAttrs = creditsData.attributes as Record<string, unknown>
                                fullWidthCredits = creditsAttrs.Name as string || creditsAttrs.name as string
                              }
                            }
                          }
                        }

                        if (fullWidthImageData) {
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(fullWidthImageData.url, fullWidthImageData.alt || 'Full width image', fullWidthImageData.caption, fullWidthCredits)}
                                  >
                                    <Image
                                      src={fullWidthImageData.url}
                                      alt={fullWidthImageData.alt || 'Full width image'}
                                      width={fullWidthImageData.width || 1920}
                                      height={fullWidthImageData.height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {(fullWidthImageData.caption || fullWidthCredits) && (
                                    <div className="mt-3 px-2">
                                      {fullWidthCredits && (
                                        <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                          {fullWidthCredits}
                                        </p>
                                      )}
                                      {fullWidthImageData.caption && (
                                        <div
                                          className={`text-sm text-caption `}
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(fullWidthImageData.caption) }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.mult-caption-mult-image':
                      case 'modular-content.mult_caption_mult_image':
                        const multCaptionImages = extractMultipleImages(obj)

                        if (multCaptionImages.length > 0) {
                          const imageCount = multCaptionImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (imageCount === 2 || imageCount === 4) {
                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {multCaptionImages.map((img, imgIndex) => (
                                    <div key={imgIndex} className="space-y-3">
                                      <div
                                        className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                        onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 1}`, img.caption)}
                                      >
                                        <Image
                                          src={img.url}
                                          alt={img.alt || `Image ${imgIndex + 1}`}
                                          width={500}
                                          height={400}
                                          className="w-full h-full object-cover md:rounded-lg"
                                          unoptimized
                                        />
                                        {/* Zoom Icon */}
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ZoomIn className="w-5 h-5" />
                                        </div>
                                      </div>
                                      {img.caption && (
                                        <div className="mt-3 px-2">
                                          <p className={`text-sm text-caption `}>
                                            {img.caption}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(multCaptionImages[0].url, multCaptionImages[0].alt || 'Image 1', multCaptionImages[0].caption)}
                                  >
                                    <Image
                                      src={multCaptionImages[0].url}
                                      alt={multCaptionImages[0].alt || 'Image 1'}
                                      width={multCaptionImages[0].width || 1920}
                                      height={multCaptionImages[0].height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {multCaptionImages[0].caption && (
                                    <div className="mt-3 px-2">
                                      <p className={`text-sm text-caption `}>
                                        {multCaptionImages[0].caption}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {multCaptionImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multCaptionImages.slice(1).map((img, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        <div
                                          className="w-full h-[300px] md:h-[400px] cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 2}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 2}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                        {img.caption && (
                                          <div className="mt-3 px-2">
                                            <p className={`text-sm text-caption `}>
                                              {img.caption}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.columnar-images-with-text':
                        const columnarImages = extractColumnarImages(obj, currentLocale)

                        if (columnarImages.length > 0) {
                          const columnarImageCount = columnarImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (columnarImageCount === 2 || columnarImageCount === 4) {
                            return (
                              <div key={index} className={showPhotos ? "mb-16 w-full flex justify-center" : "my-12 w-full flex justify-center"}>
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {columnarImages.map((item, imgIndex) => (
                                      <div key={imgIndex} className="space-y-3">
                                        {item.image && (
                                          <div
                                            className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                            onClick={() => handleImageClick(item.image!.url, item.image!.alt || `Image ${imgIndex + 1}`, item.caption, item.credits)}
                                          >
                                            <Image
                                              src={item.image.url}
                                              alt={item.image.alt || `Image ${imgIndex + 1}`}
                                              width={500}
                                              height={400}
                                              className="shadow-md w-full h-full object-cover md:rounded-lg"
                                              unoptimized
                                            />
                                            {/* Zoom Icon */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                              <ZoomIn className="w-5 h-5" />
                                            </div>
                                          </div>
                                        )}

                                        {item.credits && (
                                          <div className={`mt-3 mb-2 md:px-1 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                              {item.credits}
                                            </p>
                                          </div>
                                        )}

                                        {/* Individual caption for each image */}
                                        {item.caption && (
                                          <div className={`mt-1 md:px-1 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <div
                                              className={`text-sm text-caption  leading-relaxed`}
                                              dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.caption) }}
                                            />
                                          </div>
                                        )}

                                        {!showPhotos && item.text && (
                                          <div
                                            className="text-foreground"
                                            style={{
                                              fontFamily: 'Noto Sans',
                                              fontWeight: 400,
                                              fontSize: `${fontSize}px`,
                                              lineHeight: '170%',
                                              letterSpacing: '-3%'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.text) }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className={showPhotos ? "mb-8 w-full flex justify-center" : "my-12 w-full flex justify-center"}>
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  {columnarImages[0].image && (
                                    <div
                                      className="cursor-pointer relative group"
                                      onClick={() => handleImageClick(columnarImages[0].image!.url, columnarImages[0].image!.alt || 'Image 1', columnarImages[0].caption, columnarImages[0].credits)}
                                    >
                                      <Image
                                        src={columnarImages[0].image.url}
                                        alt={columnarImages[0].image.alt || 'Image 1'}
                                        width={400}
                                        height={600}
                                        className="md:rounded-lg shadow-md w-full h-auto max-h-[600px] object-cover"
                                        unoptimized
                                      />
                                      {/* Zoom Icon */}
                                      <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-5 h-5" />
                                      </div>
                                    </div>
                                  )}

                                  {columnarImages[0].credits && (
                                    <div className={`mt-3 mb-2 md:px-10 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                      <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                      {columnarImages[0].credits}
                                      </p>
                                    </div>
                                  )}

                                  {/* Individual caption for first image */}
                                  {columnarImages[0].caption && (
                                    <div className={`mt-1 md:px-10  px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                      <div
                                        className={`text-sm text-caption leading-relaxed`}
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(columnarImages[0].caption) }}
                                      />
                                    </div>
                                  )}

                                  {!showPhotos && columnarImages[0].text && (
                                    <div
                                      className="text-foreground"
                                      style={{
                                        fontFamily: 'Noto Sans',
                                        fontWeight: 400,
                                        fontSize: `${fontSize}px`,
                                        lineHeight: '170%',
                                        letterSpacing: '-3%'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(columnarImages[0].text) }}
                                    />
                                  )}
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {columnarImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {columnarImages.slice(1).map((item, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        {item.image && (
                                          <div
                                            className="w-full h-[300px] md:h-[400px] cursor-pointer relative group"
                                            onClick={() => handleImageClick(item.image!.url, item.image!.alt || `Image ${imgIndex + 2}`, item.caption, item.credits)}
                                          >
                                            <Image
                                              src={item.image.url}
                                              alt={item.image.alt || `Image ${imgIndex + 2}`}
                                              width={500}
                                              height={400}
                                              className="shadow-md w-full h-full object-cover md:rounded-lg"
                                              unoptimized
                                            />
                                            {/* Zoom Icon */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                              <ZoomIn className="w-5 h-5" />
                                            </div>
                                          </div>
                                        )}

                                        {item.credits && (
                                          <div className={`mt-3 mb-2 md:px-1 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                             {item.credits}
                                            </p>
                                          </div>
                                        )}

                                        {/* Individual caption for each remaining image */}
                                        {item.caption && (
                                          <div className={`mt-1 md:px-1 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <div
                                              className={`text-sm text-caption  leading-relaxed`}
                                              dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.caption) }}
                                            />
                                          </div>
                                        )}

                                        {!showPhotos && item.text && (
                                          <div
                                            className="text-foreground"
                                            style={{
                                              fontFamily: 'Noto Sans',
                                              fontWeight: 400,
                                              fontSize: `${fontSize}px`,
                                              lineHeight: '170%',
                                              letterSpacing: '-3%'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.text) }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.video-with-quote':
                      case 'modular-content.video_with_quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        // Try different field name variations for video URL
                        const videoWithQuoteUrl = ('Video' in obj && typeof obj.Video === 'string' ? obj.Video :
                                                   'video' in obj && typeof obj.video === 'string' ? obj.video :
                                                   'video_embed_url' in obj && typeof obj.video_embed_url === 'string' ? obj.video_embed_url : null)
                        const videoQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null
                        const videoWithQuoteCaption = 'Video_caption' in obj && typeof obj.Video_caption === 'string' ? obj.Video_caption : null

                        if (videoWithQuoteUrl) {
                          // Convert YouTube watch URL to embed URL
                          let finalVideoUrl = videoWithQuoteUrl
                          if (videoWithQuoteUrl.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(videoWithQuoteUrl.split('?')[1])
                            const videoId = urlParams.get('v')
                            if (videoId) {
                              finalVideoUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          } else if (videoWithQuoteUrl.includes('youtu.be/')) {
                            const videoId = videoWithQuoteUrl.split('youtu.be/')[1]?.split('?')[0]
                            if (videoId) {
                              finalVideoUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          }

                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Video */}
                                <div className="relative mb-3" style={{ aspectRatio: '16/9' }}>
                                  <iframe
                                    src={finalVideoUrl}
                                    className="w-full h-full rounded-lg shadow-md"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Video with quote"
                                  />
                                </div>

                                {/* Video Caption */}
                                {videoWithQuoteCaption && (
                                  <div className="mb-8">
                                    <p
                                      className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(videoWithQuoteCaption) }}
                                    />
                                  </div>
                                )}

                                {/* Quote with quotation mark */}
                                {videoQuoteText && (
                                  <div className="relative mt-8">
                                    {/* Large quotation mark */}
                                    <div className={`text-8xl font-serif leading-none ${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} mb-4`}>
                                      &ldquo;
                                    </div>
                                    <blockquote
                                      className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} -mt-12 pl-12`}
                                      style={{
                                        fontFamily: 'Noto Sans',
                                        fontWeight: 400,
                                        fontSize: `${Math.min(fontSize + 3, 21)}px`,
                                        lineHeight: '160%',
                                        letterSpacing: '-0.01em'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(videoQuoteText) }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.text-quote-image':
                        const quoteImageData = extractImageData(obj)
                        const quoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (quoteImageData || quoteText) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Quote with quotation mark */}
                                {quoteText && (
                                  <div className="relative  my-12 max-w-3xl mx-auto px-8 md:px-10   ">
                                    {/* Large quotation mark */}
                                    <div className={` text-[5rem] leading-0 font-serif text-primary-PARI-Red pt-9  `}>
                                      &ldquo;
                                    </div>
                                    <blockquote
                                      className="quote"
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssNoParagraphs(quoteText) }}
                                    />
                                  </div>
                                )}

                                {/* Image */}
                                {quoteImageData && (
                                  <div className="space-y-3">
                                    <div
                                      className="w-full cursor-pointer relative group"
                                      onClick={() => handleImageClick(quoteImageData.url, quoteImageData.alt || 'Quote image', quoteImageData.caption)}
                                    >
                                      <Image
                                        src={quoteImageData.url}
                                        alt={quoteImageData.alt || 'Quote image'}
                                        width={quoteImageData.width || 1920}
                                        height={quoteImageData.height || 1080}
                                        className="w-full h-auto max-h-[600px] object-cover md:rounded-lg  shadow-md"
                                        unoptimized
                                      />
                                      {/* Zoom Icon */}
                                      <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-5 h-5" />
                                      </div>
                                    </div>
                                    {quoteImageData.caption && (
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                        {quoteImageData.caption}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const simpleQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (simpleQuoteText) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Quote with quotation mark */}
                                <div className="relative">
                                  {/* Large quotation mark */}
                                  <div className="text-8xl font-serif leading-none quote mb-4">
                                    &ldquo;
                                  </div>
                                  <blockquote
                                    className="quote"
                                   
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(simpleQuoteText) }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.full-width-quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const fullWidthQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (fullWidthQuoteText) {
                          return (
                            <>
                              <div key={index} className="my-12 w-full bg-[#FFF8F0] dark:bg-gray-800 py-12 md:py-16">
                                <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto px-6 md:px-8">
                                  {/* Large quotation mark */}
                                  <div className="text-8xl md:text-9xl font-serif leading-none text-primary-PARI-Red mb-6">
                                    &ldquo;
                                  </div>
                                  <blockquote
                                    className="text-primary-PARI-Red -mt-16 md:-mt-20 pl-12 md:pl-16"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${Math.min(fontSize + 6, 24)}px`,
                                      lineHeight: '160%',
                                      letterSpacing: '-0.01em'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(fullWidthQuoteText) }}
                                  />
                                </div>
                              </div>
                              <br />
                            </>
                          )
                        }
                        return null

                      case 'modular-content.anthology-card':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const anthologyNumber = 'number' in obj && typeof obj.number === 'number' ? obj.number : null
                        const anthologyTitle = 'title' in obj && typeof obj.title === 'string' ? obj.title : null
                        const anthologyDescription = 'description' in obj && typeof obj.description === 'string' ? obj.description : null
                        const anthologyDate = 'date' in obj && typeof obj.date === 'string' ? obj.date : null
                        const anthologyAuthor = 'author' in obj && typeof obj.author === 'string' ? obj.author : null
                        const anthologyLocation = 'location' in obj && typeof obj.location === 'string' ? obj.location : null
                        const anthologySlug = 'slug' in obj && typeof obj.slug === 'string' ? obj.slug : null

                        // Extract image data
                        const anthologyImageData = extractImageData(obj)

                        if (anthologyTitle && anthologySlug) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                <div className="flex flex-col md:flex-row gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                  {/* Left side - Image and location */}
                                  <div className="flex-shrink-0 w-full md:w-56">
                                    {anthologyImageData && (
                                      <Link href={`/article/${anthologySlug}`}>
                                        <div className="relative w-full h-48 md:h-40 mb-2">
                                          <Image
                                            src={anthologyImageData.url}
                                            alt={anthologyTitle}
                                            fill
                                            className="object-cover md:rounded-lg"
                                          />
                                        </div>
                                      </Link>
                                    )}
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {anthologyTitle}
                                    </div>
                                    {anthologyLocation && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {anthologyLocation}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right side - Content */}
                                  <div className="flex-1">
                                    <Link href={`/article/${anthologySlug}`}>
                                      <h2 className="text-xl md:text-2xl font-bold text-primary-PARI-Red mb-3 hover:underline">
                                        {anthologyNumber && `${anthologyNumber}. `}{anthologyTitle}
                                      </h2>
                                    </Link>

                                    {anthologyDescription && (
                                      <p
                                        className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(anthologyDescription) }}
                                      />
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      {anthologyDate && <span>{anthologyDate}</span>}
                                      {anthologyAuthor && anthologyDate && <span>|</span>}
                                      {anthologyAuthor && (
                                        <span className="text-primary-PARI-Red font-medium">{anthologyAuthor}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.page-reference-with-text':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        console.log('##Rohit_Rocks## page-reference-with-text data:', obj)

                        // Extract text content
                        const pageRefText = 'Text_Content' in obj && typeof obj.Text_Content === 'string' ? obj.Text_Content : null

                        // Extract direct image from component
                        const pageRefDirectImage = extractImageData(obj)

                        // Extract article relation data
                        let pageRefArticle: {
                          title: string
                          slug: string
                          strap?: string
                          imageUrl?: string
                          authors?: string[]
                          date?: string
                          location?: string
                        } | null = null

                        if ('article' in obj && obj.article && typeof obj.article === 'object') {
                          const articleObj = obj.article as Record<string, unknown>

                          if ('data' in articleObj && articleObj.data && typeof articleObj.data === 'object') {
                            const articleData = articleObj.data as Record<string, unknown>

                            if ('attributes' in articleData && articleData.attributes && typeof articleData.attributes === 'object') {
                              const attrs = articleData.attributes as Record<string, unknown>

                              const title = 'Title' in attrs && typeof attrs.Title === 'string' ? attrs.Title : null
                              const slug = 'slug' in attrs && typeof attrs.slug === 'string' ? attrs.slug : null
                              const strap = 'Strap' in attrs && typeof attrs.Strap === 'string' ? attrs.Strap :
                                           ('strap' in attrs && typeof attrs.strap === 'string' ? attrs.strap : undefined)

                              // Extract location
                              let location: string | undefined
                              if ('location' in attrs && attrs.location && typeof attrs.location === 'object') {
                                const locationObj = attrs.location as Record<string, unknown>
                                if ('data' in locationObj && locationObj.data && typeof locationObj.data === 'object') {
                                  const locationData = locationObj.data as Record<string, unknown>
                                  if ('attributes' in locationData && locationData.attributes && typeof locationData.attributes === 'object') {
                                    const locationAttrs = locationData.attributes as Record<string, unknown>
                                    if ('name' in locationAttrs && typeof locationAttrs.name === 'string') {
                                      location = locationAttrs.name
                                    }
                                  }
                                }
                              }

                              // Extract cover image
                              let imageUrl: string | undefined
                              if ('Cover_image' in attrs && attrs.Cover_image && typeof attrs.Cover_image === 'object') {
                                const coverImage = attrs.Cover_image as Record<string, unknown>
                                if ('data' in coverImage && coverImage.data && typeof coverImage.data === 'object') {
                                  const imageData = coverImage.data as Record<string, unknown>
                                  if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
                                    const imageAttrs = imageData.attributes as Record<string, unknown>
                                    if ('url' in imageAttrs && typeof imageAttrs.url === 'string') {
                                      imageUrl = `${API_BASE_URL}${imageAttrs.url}`
                                    }
                                  }
                                }
                              }

                              // Extract authors
                              const authors: string[] = []
                              if ('Authors' in attrs && attrs.Authors && typeof attrs.Authors === 'object') {
                                const authorsObj = attrs.Authors as Record<string, unknown>
                                if ('data' in authorsObj && Array.isArray(authorsObj.data)) {
                                  authorsObj.data.forEach((authorItem: unknown) => {
                                    if (authorItem && typeof authorItem === 'object') {
                                      const authorData = authorItem as Record<string, unknown>
                                      if ('attributes' in authorData && authorData.attributes && typeof authorData.attributes === 'object') {
                                        const authorAttrs = authorData.attributes as Record<string, unknown>
                                        if ('author_name' in authorAttrs && authorAttrs.author_name && typeof authorAttrs.author_name === 'object') {
                                          const authorNameObj = authorAttrs.author_name as Record<string, unknown>
                                          if ('data' in authorNameObj && authorNameObj.data && typeof authorNameObj.data === 'object') {
                                            const authorNameData = authorNameObj.data as Record<string, unknown>
                                            if ('attributes' in authorNameData && authorNameData.attributes && typeof authorNameData.attributes === 'object') {
                                              const authorNameAttrs = authorNameData.attributes as Record<string, unknown>
                                              if ('Name' in authorNameAttrs && typeof authorNameAttrs.Name === 'string') {
                                                authors.push(authorNameAttrs.Name)
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  })
                                }
                              }

                              // Extract date
                              const date = 'Original_published_date' in attrs && typeof attrs.Original_published_date === 'string'
                                ? attrs.Original_published_date
                                : ('original_published_date' in attrs && typeof attrs.original_published_date === 'string'
                                  ? attrs.original_published_date
                                  : undefined)

                              if (title && slug) {
                                pageRefArticle = {
                                  title,
                                  slug,
                                  strap,
                                  imageUrl,
                                  authors: authors.length > 0 ? authors : undefined,
                                  date,
                                  location
                                }
                              }
                            }
                          }
                        }

                        // Show card if we have article data OR text content OR direct image
                        if (pageRefArticle || pageRefText || pageRefDirectImage) {
                          const displayImage = pageRefArticle?.imageUrl || (pageRefDirectImage ? pageRefDirectImage.url : null)
                          const displayTitle = pageRefArticle?.title || ''
                          const displaySlug = pageRefArticle?.slug || '#'

                          return (
                            <div key={index} className="my-6">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                <div className="flex flex-col md:flex-row gap-6 mb-8">
                                  {/* Left side - Image with title below */}
                                  {displayImage && (
                                    <div className="flex-shrink-0 w-full md:w-64">
                                      <Link href={`/article/${displaySlug}`}>
                                        <div className="relative w-full h-64 md:h-80 mb-3">
                                          <Image
                                            src={displayImage}
                                            alt={displayTitle || 'Article image'}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      </Link>
                                      {displayTitle && (
                                        <Link href={`/article/${displaySlug}`}>
                                          <h3 className="text-base font-semibold text-foreground leading-tight">
                                            {displayTitle}
                                          </h3>
                                        </Link>
                                      )}
                                    </div>
                                  )}

                                  {/* Right side - Content */}
                                  <div className="flex-1">
                                    {displayTitle && (
                                      <Link href={`/article/${displaySlug}`}>
                                        <h2 className="text-xl md:text-2xl font-bold mb-6 !text-primary-PARI-Red hover:underline leading-tight">
                                          {displayTitle}
                                        </h2>
                                      </Link>
                                    )}

                                    {/* Text content */}
                                    {pageRefText && (
                                      <>
                                        {console.log('##Rohit_Rocks## pageRefText HTML:', stripHtmlCssWithStyledStrong(pageRefText))}
                                        <div
                                          className="mb-4 text-foreground page-ref-text-content"
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(pageRefText) }}
                                        />
                                      </>
                                    )}

                                    {/* Date and Author */}
                                    {pageRefArticle && (pageRefArticle.date || pageRefArticle.authors) && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        {pageRefArticle.date && (
                                          <span>
                                            {new Date(pageRefArticle.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        )}
                                        {pageRefArticle.authors && pageRefArticle.authors.length > 0 && pageRefArticle.date && (
                                          <span>|</span>
                                        )}
                                        {pageRefArticle.authors && pageRefArticle.authors.length > 0 && (
                                          <span>
                                            Author: {pageRefArticle.authors.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      default:
                        return null
                    }
                  }
                }

                  return null
                })
              })()}
          </div>
        ) : (
          <p>No content available</p>
        )}

        {/* Action Buttons - Photo Story, Share, Print, Text Size */}

      </div>

      {/* Credits Section */}
      {showCreditsModal && (
        <div id="credits-section" className="w-full bg-[#ececec] dark:bg-[#1e1e1e] py-12 md:py-16  md:pb-16">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            {/* Donate Section */}
            <div className="bg-white dark:bg-popover  rounded-lg p-6 md:p-8 mb-8 shadow-sm">
              <h3 className={`text-2xl font-noto-sans mb-4 ${story.isStudent ? 'text-[#2F80ED] ' : 'text-primary-PARI-Red'}`}>
                {getTranslatedLabel('donateToPARI', currentLocale)}
              </h3>

              <p className="text-discreet font-noto-sans  mb-6">
                {getTranslatedLabel('donateDisclaimer', currentLocale)}
              </p>

              {/* Donate Button */}
              <button
                onClick={() => router.push('/donate')}
                className={`w-full rounded-full py-4 ${story.isStudent ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/90'} text-white rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2`}
              >
                {getTranslatedLabel('donateToPARI', currentLocale)}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* All Authors - Dynamic - Separate Cards */}
            {groupedAuthors.map((group, groupIndex) => (
              // Create separate card for each author in the group
              group.names.map((name, authorIndex) => {
                const bio = group.bios[authorIndex]
                const email = group.emails[authorIndex]
                const twitter = group.twitters[authorIndex]
                const facebook = group.facebooks[authorIndex]
                const instagram = group.instagrams[authorIndex]
                const linkedin = group.linkedins[authorIndex]

                const hasSocialLinks = email || twitter || facebook || instagram || linkedin

                return (
                  <div
                    key={`${groupIndex}-${authorIndex}`}
                    onClick={() => {
                      router.push(`/articles?author=${encodeURIComponent(name)}`)
                    }}
                    className="bg-white dark:bg-popover rounded-lg p-6 md:p-8 mb-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h6 className="font-noto-sans">
                      {group.title || getTranslatedLabel('author', currentLocale)}
                    </h6>
                    <div className={`text-2xl font-bold mb-4 ${story.isStudent ? 'text-[#2F80ED]' : 'text-foreground'}`}>
                      <h3 className='text-2xl font-noto-sans'>{name}</h3>
                    </div>

                    {/* Show bio if available */}
                    {bio && (
                      <div className="mb-6">
                        <p
                          className="text-discreet-text leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(bio) }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          router.push(`/articles?author=${encodeURIComponent(name)}`)
                        }}
                        className={`px-6 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} rounded-full hover:text-white transition-colors text-sm font-medium flex items-center gap-2`}
                      >
                        {getTranslatedLabel('seeMoreStories', currentLocale)}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>

                      {/* Social Media Links - Dynamic from API */}
                      {hasSocialLinks && (
                        <div className="flex gap-3">
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Email"
                            >
                              <FiMail className="w-6 h-6" />
                            </a>
                          )}
                          {instagram && (
                            <a
                              href={instagram}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Instagram"
                            >
                              <FaInstagram className="w-6 h-6" />
                            </a>
                          )}
                          {twitter && (
                            <a
                              href={twitter}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Twitter/X"
                            >
                              <FaXTwitter className="w-6 h-6" />
                            </a>
                          )}
                          {facebook && (
                            <a
                              href={facebook}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Facebook"
                            >
                              <FaFacebookF className="w-6 h-6" />
                            </a>
                          )}
                          {linkedin && (
                            <a
                              href={linkedin}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="LinkedIn"
                            >
                              <FaLinkedinIn className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ))}
          </div>
        </div>
      )}

      {/* Related Stories Section */}
      {relatedStories.length > 0 && (
        <div
          className="w-full bg-background py-12 md:py-16 related-stories-section"
          dir={storyDir}
          style={{
            direction: storyDir,
            textAlign: storyDir === 'rtl' ? 'right' : 'left'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 ">
            <h2
              className="font-noto-sans font-bold text-foreground text-3xl md:text-4xl mb-8"
              style={{
                textAlign: storyDir === 'rtl' ? 'right' : 'left'
              }}
            >
              Related Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedStories.map((relatedStory, index) => (
                <StoryCard
                  key={index}
                  title={relatedStory.title}
                  authors={relatedStory.authors}
                  imageUrl={relatedStory.imageUrl}
                  categories={relatedStory.categories}
                  slug={relatedStory.slug}
                  location={relatedStory.location}
                  date={relatedStory.date}
                  availableLanguages={relatedStory.availableLanguages}
                  currentLocale={currentLocale}

                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Language Selector - Show only if article has multiple languages */}
      {hasMultipleLanguages && (
        <>
          {/* Mobile Bottom Sheet - Only on Mobile */}
          {showLanguageSelector && availableLanguages.length > 0 && (
            <>
              {/* Backdrop - Only on Mobile */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowLanguageSelector(false)}
              />

              {/* Bottom Sheet Container - Only on Mobile */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-popover rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-2 duration-300 md:hidden">
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Available in {availableLanguages.length} languages
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select your preferred language
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLanguageSelector(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Language Grid */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-1 gap-3">
                    {availableLanguages.map((lang) => {
                      const languageData = allLanguages.find(l => l.code === lang.code)
                      if (!languageData) return null

                      // Use currentArticleLocale (extracted from slug) to check which language is currently being viewed
                      // This matches the behavior of LanguageToggle which uses the site-wide locale
                      const isSelected = currentArticleLocale === lang.code
                      const nativeName = languageData.names[1] || languageData.names[0]
                      const englishName = languageData.names[0]

                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            // Remove locale parameter only for Urdu, keep it for other languages
                            if (lang.code === 'ur') {
                              window.location.href = `/article/${lang.slug}`
                            } else {
                              window.location.href = (addLocaleToUrl(`/article/${lang.slug}`))
                            }
                            setShowLanguageSelector(false)
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? story?.isStudent
                                ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                                : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                              <span className="text-base font-medium">
                                {englishName}
                              </span>
                              {nativeName !== englishName && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  / {nativeName}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${story?.isStudent ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Desktop Modal - Centered */}
          {showLanguageSelector && availableLanguages.length > 0 && (
            <div className="hidden md:block fixed inset-0 md:flex md:items-center md:justify-center z-[60] bg-black/50" onClick={() => setShowLanguageSelector(false)}>
              <div className="bg-white dark:bg-popover rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 w-[90%] max-w-[600px]" onClick={(e) => e.stopPropagation()}>
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Available in {availableLanguages.length} languages
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select your preferred language
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLanguageSelector(false)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Language Grid */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-2 gap-3">
                    {availableLanguages.map((lang) => {
                      const languageData = allLanguages.find(l => l.code === lang.code)
                      if (!languageData) return null

                      // Use currentArticleLocale (extracted from slug) to check which language is currently being viewed
                      // This matches the behavior of LanguageToggle which uses the site-wide locale
                      const isSelected = currentArticleLocale === lang.code
                      const nativeName = languageData.names[1] || languageData.names[0]
                      const englishName = languageData.names[0]

                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            // Remove locale parameter only for Urdu, keep it for other languages
                            if (lang.code === 'ur') {
                              window.location.href = `/article/${lang.slug}`
                            } else {
                              router.push(addLocaleToUrl(`/article/${lang.slug}`))
                            }
                            setShowLanguageSelector(false)
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? story?.isStudent
                                ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                                : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                              <span className="text-base font-medium">
                                {englishName}
                              </span>
                              {nativeName !== englishName && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                 {nativeName}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${story?.isStudent ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-6 md:right-8 lg:right-10 z-50">

            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className={`relative h-[50px] w-[90px] sm:h-[55px] sm:w-[95px] md:h-[60px] md:w-[100px] lg:h-[65px] lg:w-[120px] active:outline-none gap-1 border-none rounded-full cursor-pointer ${story?.isStudent ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} text-white transition-all duration-200 ${
                showLanguageSelector ? 'scale-105 shadow-lg' : ''
              } ${
                showAnimation
                  ? `after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[80%] after:h-[105%] after:border-12 ${story?.isStudent ? 'after:border-[#1E5BB8]' : 'after:border-red-700'} after:rounded-full after:animate-ping`
                  : ""
              }`}
            >
              {(() => {
                // Use story.storyLocale instead of currentLocale to show the actual language of the current article
                const displayLocale = story?.storyLocale || currentLocale
                const currentLang = allLanguages.find(l => l.code === displayLocale)
                return currentLang ? (
                  <div className="flex flex-col items-center justify-center gap-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-xs md:text-sm font-bold">{currentLang.displayCode.en}</span>
                      <span className="text-[8px] sm:text-[10px] opacity-50">|</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-bold">{currentLang.displayCode.native}</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] opacity-80 font-normal">
                      {availableLanguages.length} {availableLanguages.length === 1 ? 'language' : 'languages'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-bold">LANG</span>
                )
              })()}
            </Button>
          </div>
        </>
      )}

      {/* Full-Screen Image Modal with Zoom & Pan */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-[99999] bg-background/98 dark:bg-popover/98 flex items-center justify-center"
          onClick={(e) => {
            // Only close if clicking the background, not the buttons or image
            if (e.target === e.currentTarget) {
              handleCloseImageModal()
            }
          }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCloseImageModal()
            }}
            className={`absolute top-3 right-3 md:top-4 md:right-4 z-[100001] w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors ${
              story?.isStudent
                ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
            }`}
            aria-label="Close image"
          >
            <svg
              width="28"
              height="28"
              className="md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Previous Image Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (allContentImages.length > 1) {
                handlePrevImage()
              }
            }}
            className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-[100001] w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all shadow-2xl  ${
              allContentImages.length <= 1
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-100 cursor-pointer hover:scale-110'
            } ${
              story?.isStudent
                ? 'bg-student-blue/40 hover:bg-student-blue/40 text-student-blue border-student-blue/50'
                : 'bg-primary-PARI-Red/40 hover:bg-primary-PARI-Red/40 text-primary-PARI-Red border-primary-PARI-Red/50'
            }`}
            aria-label="Previous image"
            title={`Previous image (←) - ${allContentImages.length} total images`}
            disabled={allContentImages.length <= 1}
          >
            <svg width="32" height="32" className="md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Next Image Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (allContentImages.length > 1) {
                handleNextImage()
              }
            }}
            className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-[100001] w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all shadow-2xl  ${
              allContentImages.length <= 1
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-100 cursor-pointer hover:scale-110'
            } ${
              story?.isStudent
                ? 'bg-student-blue/40 hover:bg-student-blue/40 text-student-blue border-student-blue/50'
                : 'bg-primary-PARI-Red/40 hover:bg-primary-PARI-Red/40 text-primary-PARI-Red border-primary-PARI-Red/50'
            }`}
            aria-label="Next image"
            title={`Next image (→) - ${allContentImages.length} total images`}
            disabled={allContentImages.length <= 1}
          >
            <svg width="32" height="32" className="md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-[100000] flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              className={`w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors ${
                story?.isStudent
                  ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                  : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
              }`}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <svg width="28" height="28" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              className={`w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors ${
                story?.isStudent
                  ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                  : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
              }`}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <svg width="28" height="28" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleResetZoom()
              }}
              className={`w-14 h-14 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors text-sm md:text-xs font-semibold ${
                story?.isStudent
                  ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                  : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
              }`}
              aria-label="Reset zoom"
              title="Reset zoom to fit screen"
            >
              1:1
            </button>
            {/* <button
              onClick={(e) => {
                e.stopPropagation()
                handleOriginalSize()
              }}
              className={`w-14 h-14 md:w-auto md:h-12 md:px-3 flex items-center justify-center rounded-full transition-colors text-[10px] md:text-xs font-semibold ${
                story?.isStudent
                  ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                  : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
              }`}
              aria-label="Original size"
              title="Show original image size"
            >
              <span className="hidden md:inline">Original</span>
              <span className="md:hidden">Orig</span>
            </button> */}
            {/* Only show caption toggle button if there's a caption or credits */}
            {(selectedImage.caption || selectedImage.credits) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleCaption()
                }}
                className={`w-14 h-14 md:w-auto md:h-12 md:px-3 flex items-center justify-center rounded-full transition-colors text-[10px] md:text-xs font-semibold ${
                  story?.isStudent
                    ? 'bg-student-blue/20 hover:bg-student-blue/30 text-student-blue'
                    : 'bg-primary-PARI-Red/20 hover:bg-primary-PARI-Red/30 text-primary-PARI-Red'
                }`}
                aria-label={showCaption ? "Hide caption" : "Show caption"}
                title={showCaption ? "Hide caption" : "Show caption"}
              >
                {showCaption ? <CaptionsOff size={28} className="md:w-6 md:h-6" /> : <Captions size={28} className="md:w-6 md:h-6" />}
              </button>
            )}
          </div>

          {/* Image Counter and Zoom Level */}
          <div className="absolute top-3 md:top-4 left-1/2 transform -translate-x-1/2 z-[100000] flex flex-col items-center gap-2">
            {allContentImages.length > 1 && (
              <div className={`px-5 py-2.5 md:px-4 md:py-2 rounded-lg text-base md:text-sm font-medium ${
                story?.isStudent
                  ? 'bg-student-blue/90 text-white'
                  : 'bg-primary-PARI-Red/90 text-white'
              }`}>
                {currentImageIndex + 1} / {allContentImages.length}
              </div>
            )}
            <div className={`px-5 py-2.5 md:px-4 md:py-2 rounded-lg text-base md:text-sm font-medium ${
              story?.isStudent
                ? 'bg-student-blue/90 text-white'
                : 'bg-primary-PARI-Red/90 text-white'
            }`}>
              {Math.round(imageScale * 100)}%
            </div>
          </div>

          {/* Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden px-20"
            style={{ pointerEvents: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <style jsx>{`
              @keyframes imageZoomAnimation {
                0% {
                  transform: scale(0.5);
                }
                50% {
                  transform: scale(1);
                }
                100% {
                  transform: scale(1);
                }
              }
            `}</style>
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                pointerEvents: 'auto',
                cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
              className="flex items-center justify-center"
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={0}
                height={0}
                sizes="100vw"
                className="w-auto h-auto object-contain"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: showOriginalSize ? 'none' : (imageScale === 1 ? '95vw' : 'none'),
                  maxHeight: showOriginalSize ? 'none' : (imageScale === 1 ? '95vh' : 'none'),
                  animation: imageAnimating ? 'imageZoomAnimation 1.5s ease-in-out' : 'none',
                }}
                unoptimized
                draggable={false}
              />
            </div>
          </div>

          {/* Instructions - Positioned above caption */}

          {/* Image Caption and Credits - Only show if there's an actual caption or credits */}
          {showCaption && (selectedImage.caption || selectedImage.credits) && (
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 px-6 py-3 md:px-6 md:py-3 rounded-lg min-w-[350px] max-w-4xl text-center z-[100001] ${
                story?.isStudent
                  ? 'backdrop-blur-sm bg-student-blue/50 text-white'
                  : 'backdrop-blur-sm bg-white/20  text-foreground'
              }`}
              style={{ bottom: imageScale > 1 ? '4.5rem' : '3rem ' }}
            >
              {selectedImage.credits && (
                <div className="text-sm md:text-sm font-semibold text-primary-PARI-Red mb-2">
                  {selectedImage.credits}
                </div>
              )}
              {selectedImage.caption && (
                <div
                  className="text-base md:text-base font-medium"
                  dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(selectedImage.caption) }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative bg-white dark:bg-popover rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Share Preview Card - YouTube Style */}
            <div className="relative">
              {/* Story Image */}
              {story.coverImage && (
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    className="object-cover md:rounded-lg"
                    unoptimized
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* PARI Logo */}
                  <div className="absolute top-3 left-3">
                    <Image
                      src="/pari-logo.png"
                      alt="PARI"
                      width={80}
                      height={30}
                      className="h-6 w-auto"
                      unoptimized
                    />
                  </div>

                  {/* Title and Strap on Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-semibold line-clamp-2 drop-shadow-lg">
                      {story.title}
                    </h3>
                    {story.subtitle && (
                      <p className="text-white/90 text-sm mt-2 line-clamp-2 drop-shadow-md">
                        {story.subtitle}
                      </p>
                    )}
                    {story.authors && story.authors.length > 0 && (
                      <p className="text-white/80 text-xs mt-2">
                        By {story.authors.map(a => a.name).slice(0, 2).join(', ')}
                        {story.authors.length > 2 && ' & others'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* No Cover Image Fallback */}
              {!story.coverImage && (
                <div className={`relative w-full h-48 ${story.isStudent ? 'bg-[#2F80ED]' : 'bg-primary-PARI-Red'} flex items-center justify-center`}>
                  <div className="absolute top-3 left-3">
                    <Image
                      src="/pari-logo.png"
                      alt="PARI"
                      width={80}
                      height={30}
                      className="h-6 w-auto"
                      unoptimized
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white text-lg font-semibold line-clamp-2">
                      {story.title}
                    </h3>
                    {story.subtitle && (
                      <p className="text-white/90 text-sm mt-2 line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Share Options */}
            <div className="p-5">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Share this story</h4>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaWhatsapp size={24} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaFacebookF size={22} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaXTwitter size={22} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">X</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={shareToInstagram}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaInstagram size={24} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Instagram</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaTelegram size={24} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Telegram</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareToLinkedIn}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FaLinkedinIn size={22} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
                </button>

                {/* Email */}
                <button
                  onClick={shareToEmail}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                    <FiMail size={22} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Email</span>
                </button>
              </div>

              {/* Copy Link Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex-1 truncate text-sm text-gray-600 dark:text-gray-400">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      linkCopied
                        ? 'bg-green-500 text-white'
                        : story.isStudent
                          ? 'bg-[#2F80ED] text-white hover:bg-[#2563EB]'
                          : 'bg-primary-PARI-Red text-white hover:opacity-90'
                    }`}
                  >
                    {linkCopied ? (
                      <>
                        <FiCheck size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Helper function to extract multiple images from content items
function extractMultipleImages(paragraph: FilterableContentItem): Array<{
  url: string;
  alt?: string;
  caption?: string;
  credits?: string;
  width?: number;
  height?: number;
}> {
  if (!paragraph || typeof paragraph !== 'object') {
    return []
  }

  const obj = paragraph as Record<string, unknown>
  const images: Array<{
    url: string;
    alt?: string;
    caption?: string;
    credits?: string;
    width?: number;
    height?: number;
  }> = []

  // Check for Images field (array of images)
  if ('Images' in obj && Array.isArray(obj.Images)) {
    obj.Images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const imgObj = imageItem as Record<string, unknown>
        if ('data' in imgObj && imgObj.data && typeof imgObj.data === 'object') {
          const imageData = imgObj.data as Record<string, unknown>
          if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
            const attrs = imageData.attributes as Record<string, unknown>
            if ('url' in attrs && typeof attrs.url === 'string') {
              images.push({
                url: `${API_BASE_URL}${attrs.url}`,
                alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                credits: undefined,
                width: typeof attrs.width === 'number' ? attrs.width : undefined,
                height: typeof attrs.height === 'number' ? attrs.height : undefined,
              })
            }
          }
        }
      }
    })
  }

  // Check for images field (lowercase) - for single-caption-mul-img component
  if ('images' in obj && Array.isArray(obj.images)) {
    obj.images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const item = imageItem as Record<string, unknown>

        // Check for nested 'image' field (single-caption-mul-img structure)
        if ('image' in item && item.image && typeof item.image === 'object') {
          const imageObj = item.image as Record<string, unknown>

          // Check if image has 'data' wrapper
          if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
            const imageData = imageObj.data as Record<string, unknown>
            if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
              const attrs = imageData.attributes as Record<string, unknown>
              if ('url' in attrs && typeof attrs.url === 'string') {
                images.push({
                  url: `${API_BASE_URL}${attrs.url}`,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                  credits: undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                })
              }
            }
          }
        }
        // Fallback: check for direct 'data' field
        else if ('data' in item && item.data && typeof item.data === 'object') {
          const imageData = item.data as Record<string, unknown>
          if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
            const attrs = imageData.attributes as Record<string, unknown>
            if ('url' in attrs && typeof attrs.url === 'string') {
              images.push({
                url: `${API_BASE_URL}${attrs.url}`,
                alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                credits: undefined,
                width: typeof attrs.width === 'number' ? attrs.width : undefined,
                height: typeof attrs.height === 'number' ? attrs.height : undefined,
              })
            }
          }
        }
      }
    })
  }

  // Check for Caption field (for single-caption-mul-img)
  let sharedCaption: string | undefined
  if ('Caption' in obj && typeof obj.Caption === 'string') {
    sharedCaption = obj.Caption
  }

  // Apply shared caption to all images if they don't have individual captions
  if (sharedCaption && images.length > 0) {
    images.forEach(img => {
      if (!img.caption) {
        img.caption = sharedCaption
      }
    })
  }

  return images
}

// Helper function to extract image data from content items
function extractImageData(paragraph: FilterableContentItem): {
  url: string;
  alt?: string;
  caption?: string;
  credits?: string;
  width?: number;
  height?: number;
} | null {
  if (!paragraph || typeof paragraph !== 'object') {
    return null
  }

  const obj = paragraph as Record<string, unknown>

  // First, check for caption at component level (not in media library)
  let componentCaption: string | undefined
  if ('caption' in obj && typeof obj.caption === 'string') {
    componentCaption = obj.caption
  } else if ('Caption' in obj && typeof obj.Caption === 'string') {
    componentCaption = obj.Caption
  }

  // Check for direct image properties
  if ('image' in obj && obj.image && typeof obj.image === 'object') {
    const imageObj = obj.image as Record<string, unknown>

    // Check for Strapi media structure
    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const fullUrl = `${API_BASE_URL}${attrs.url}`

          // Use component caption if available, otherwise use media library caption
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)

          return {
            url: fullUrl,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }

    // Check for direct URL in image object
    if ('url' in imageObj && typeof imageObj.url === 'string') {
      return {
        url: imageObj.url.startsWith('http') ? imageObj.url : `${API_BASE_URL}${imageObj.url}`,
        alt: typeof imageObj.alt === 'string' ? imageObj.alt : undefined,
        caption: componentCaption || (typeof imageObj.caption === 'string' ? imageObj.caption : undefined),
        credits: undefined,
      }
    }
  }

  // Check for media field
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
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

    if ('data' in photoObj && photoObj.data && typeof photoObj.data === 'object') {
      const photoData = photoObj.data as Record<string, unknown>
      if ('attributes' in photoData && photoData.attributes && typeof photoData.attributes === 'object') {
        const attrs = photoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Photo field (capitalized)
  if ('Photo' in obj && obj.Photo && typeof obj.Photo === 'object') {
    const photoObj = obj.Photo as Record<string, unknown>

    if ('data' in photoObj && photoObj.data && typeof photoObj.data === 'object') {
      const photoData = photoObj.data as Record<string, unknown>
      if ('attributes' in photoData && photoData.attributes && typeof photoData.attributes === 'object') {
        const attrs = photoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Media field (capitalized)
  if ('Media' in obj && obj.Media && typeof obj.Media === 'object') {
    const mediaObj = obj.Media as Record<string, unknown>

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Image field (capitalized)
  if ('Image' in obj && obj.Image && typeof obj.Image === 'object') {
    const imageObj = obj.Image as Record<string, unknown>

    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for full_width_image field
  if ('full_width_image' in obj && obj.full_width_image && typeof obj.full_width_image === 'object') {
    const imageObj = obj.full_width_image as Record<string, unknown>

    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            credits: undefined,
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
      url: obj.url.startsWith('http') ? obj.url : `${API_BASE_URL}${obj.url}`,
      alt: typeof obj.alt === 'string' ? obj.alt : undefined,
      caption: componentCaption || (typeof obj.caption === 'string' ? obj.caption : undefined),
      credits: undefined,
    }
  }

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

  // Check for direct video properties
  if ('video' in obj && obj.video && typeof obj.video === 'object') {
    const videoObj = obj.video as Record<string, unknown>

    // Check for Strapi media structure
    if ('data' in videoObj && videoObj.data && typeof videoObj.data === 'object') {
      const videoData = videoObj.data as Record<string, unknown>
      if ('attributes' in videoData && videoData.attributes && typeof videoData.attributes === 'object') {
        const attrs = videoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            poster: typeof attrs.poster === 'string' ? `${API_BASE_URL}${attrs.poster}` : undefined,
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
        url: videoObj.url.startsWith('http') ? videoObj.url : `${API_BASE_URL}${videoObj.url}`,
        poster: typeof videoObj.poster === 'string' ? videoObj.poster : undefined,
        caption: typeof videoObj.caption === 'string' ? videoObj.caption : undefined,
      }
    }
  }

  // Check for media field that might contain video
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>

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
              url: `${API_BASE_URL}${url}`,
              poster: typeof attrs.poster === 'string' ? `${API_BASE_URL}${attrs.poster}` : undefined,
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
      url: obj.video_url.startsWith('http') ? obj.video_url : `${API_BASE_URL}${obj.video_url}`,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  return null
}

// Helper function to extract columnar images with text
function extractColumnarImages(paragraph: FilterableContentItem, locale: string = 'en'): Array<{
  image?: { url: string; alt?: string; width?: number; height?: number };
  text?: string;
  caption?: string;
  credits?: string;
}> {
  if (!paragraph || typeof paragraph !== 'object') {
    return []
  }

  const obj = paragraph as Record<string, unknown>
  const results: Array<{
    image?: { url: string; alt?: string; width?: number; height?: number };
    text?: string;
    caption?: string;
    credits?: string;
  }> = []

  // Extract shared caption from the component level
  let sharedCaption: string | undefined
  if ('caption' in obj && typeof obj.caption === 'string') {
    sharedCaption = obj.caption
  } else if ('Caption' in obj && typeof obj.Caption === 'string') {
    sharedCaption = obj.Caption
  }



  // Check for columnar_images array (new structure)
  if ('columnar_images' in obj && obj.columnar_images && typeof obj.columnar_images === 'object') {
    const columnarImagesObj = obj.columnar_images as Record<string, unknown>

    if ('data' in columnarImagesObj && Array.isArray(columnarImagesObj.data)) {
      columnarImagesObj.data.forEach((imageItem: unknown) => {
        if (imageItem && typeof imageItem === 'object') {
          const item = imageItem as Record<string, unknown>

          if ('attributes' in item && item.attributes && typeof item.attributes === 'object') {
            const attrs = item.attributes as Record<string, unknown>

            if ('url' in attrs && typeof attrs.url === 'string') {
              const fullColumnarUrl = `${API_BASE_URL}${attrs.url}`

              results.push({
                image: {
                  url: fullColumnarUrl,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                },
                caption: sharedCaption
              })
            }
          }
        }
      })
    }
  }

  // Check for Images array (old structure)
  if (results.length === 0 && 'Images' in obj && Array.isArray(obj.Images)) {
    obj.Images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const item = imageItem as Record<string, unknown>

        const result: {
          image?: { url: string; alt?: string; width?: number; height?: number };
          text?: string;
          caption?: string;
          credits?: string;
        } = {}

        // Extract image (check both 'Image' and 'image')
        const imageField = ('Image' in item && item.Image) || ('image' in item && item.image)

        if (imageField && typeof imageField === 'object') {
          const imageObj = imageField as Record<string, unknown>

          if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
            const imageData = imageObj.data as Record<string, unknown>

            if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
              const attrs = imageData.attributes as Record<string, unknown>

              if ('url' in attrs && typeof attrs.url === 'string') {
                const fullColumnarUrl = `${API_BASE_URL}${attrs.url}`

                result.image = {
                  url: fullColumnarUrl,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                }
              }
            }
          }
        }

        // Extract text
        if ('Text' in item && typeof item.Text === 'string') {
          result.text = item.Text
        } else if ('text' in item && typeof item.text === 'string') {
          result.text = item.text
        }

        // Extract caption - check for localized captions first
        // Try caption_[locale] format (e.g., caption_en, caption_hi)
        const localeKey = `caption_${locale}`
        const LocaleKey = `Caption_${locale}`

        if (localeKey in item && typeof item[localeKey] === 'string') {
          result.caption = item[localeKey] as string
        } else if (LocaleKey in item && typeof item[LocaleKey] === 'string') {
          result.caption = item[LocaleKey] as string
        } else if ('Caption' in item && typeof item.Caption === 'string') {
          result.caption = item.Caption
        } else if ('caption' in item && typeof item.caption === 'string') {
          result.caption = item.caption
        }



        // Extract credits (photographer name)
        if ('credits' in item && item.credits && typeof item.credits === 'object') {
          const creditsObj = item.credits as Record<string, unknown>
          if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
            const creditsData = creditsObj.data as Record<string, unknown>
            if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
              const creditsAttrs = creditsData.attributes as Record<string, unknown>
              if ('Name' in creditsAttrs && typeof creditsAttrs.Name === 'string') {
                result.credits = creditsAttrs.Name
              }
            }
          }
        }

        if (result.image || result.text) {
          results.push(result)
        }
      }
    })
  }

  return results
}

// Function to fetch story by slug
// Note: Slugs are now in the same language/script as the article title
// Each localized version has its own unique slug without language suffix
async function fetchStoryBySlug(slug: string) {
  try {
    // First, try to find the article by slug in the main locale (English)
    // Then check if the slug matches any localization
    const query = {
      filters: {
        $or: [
          // Search in main article slug
          {
            slug: {
              $eq: slug
            }
          },
          // Search in localizations slug
          {
            localizations: {
              slug: {
                $eq: slug
              }
            }
          }
        ]
      },
      // Populate localizations to get all language versions
      locale: 'all', // Get all locales
      populate: {
        Cover_image: {
          fields: ['url']
        },
        mobilecover: {
          fields: ['url']
        },
        Authors: {
          populate: {
            author_name: {
              fields: ['Name', 'Bio', 'Description']
            },
            author_role: {
              fields: ['Name']
            }
          }
        },
        categories: {
          fields: ['Title', 'slug']
        },
        location: {
          fields: ['name', 'district', 'state']
        },
        localizations: '*',
        Related_stories: {
          filters: {
            locale: {
              $eq: 'en'
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
                }
              }
            },
            categories: {
              fields: ['Title']
            },
            location: {
              fields: ['name', 'district', 'state']
            },
            localizations: {
              fields: ['locale', 'slug']
            }
          },
          fields: ['Title', 'Strap', 'slug', 'Original_published_date', 'locale']
        },
        Modular_Content: {
          populate: {
            // Text component fields
            Text: true,
            text: true,
            Paragraph: true,
            paragraph: true,
            // Image related fields
            image: {
              populate: '*'
            },
            media: {
              populate: '*'
            },
            photo: {
              populate: '*'
            },
            video: {
              populate: '*'
            },
            Images: {
              populate: '*'
            },
            images: {
              populate: '*'
            },
            Photo: {
              populate: '*'
            },
            Media: {
              populate: '*'
            },
            Image: {
              populate: '*'
            },
            full_width_image: {
              populate: '*'
            },
            columnar_images: {
              populate: '*'
            },
            Columnar_images: {
              populate: '*'
            },
            credits: {
              populate: '*'
            },
            Columnar_text: {
              populate: '*'
            },
            columnar_text: {
              populate: '*'
            },
            Text_columns: {
              populate: '*'
            },
            text_columns: {
              populate: '*'
            },
            Columns: {
              populate: '*'
            },
            columns: {
              populate: '*'
            },
            Left_column: {
              populate: '*'
            },
            left_column: {
              populate: '*'
            },
            Right_column: {
              populate: '*'
            },
            right_column: {
              populate: '*'
            },
            Content: {
              populate: '*'
            },
            content: {
              populate: '*'
            },
            article: {
              populate: {
                Cover_image: {
                  fields: ['url']
                },
                Authors: {
                  populate: {
                    author_name: {
                      fields: ['Name']
                    }
                  }
                }
              },
              fields: ['Title', 'Strap', 'strap', 'slug', 'Original_published_date', 'original_published_date']
            }
          }
        },
      }
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`

    const response = await axios.get(apiUrl)

    if (!response.data?.data || response.data.data.length === 0) {
      throw new Error('Story not found')
    }

    let articleData = response.data.data[0] as ExtendedArticleData

    // Check if the slug matches the main article or a localization
    if (articleData.attributes.slug !== slug) {
      // The slug matches a localization, not the main article
      // Find which localization matches
      const matchingLocalization = articleData.attributes.localizations?.data?.find(
        (loc) => loc.attributes?.slug === slug
      )

      if (matchingLocalization && matchingLocalization.attributes) {
        const localeToFetch = matchingLocalization.attributes.locale

        // Fetch the full article data for this specific locale
        const localizedQuery = {
          filters: {
            slug: {
              $eq: slug
            }
          },
          locale: localeToFetch,
          populate: query.populate // Use the same populate structure
        }

        const localizedQueryString = qs.stringify(localizedQuery, { encodeValuesOnly: true })
        const localizedApiUrl = `${BASE_URL}api/articles?${localizedQueryString}`

        const localizedResponse = await axios.get(localizedApiUrl)

        if (localizedResponse.data?.data?.[0]) {
          articleData = localizedResponse.data.data[0] as ExtendedArticleData
        }
      }
    }

    // Format author data - fetch from authors API for complete details
    const authors: Array<{
      name: string;
      title: string;
      bio?: string;
      email?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    }> = []

    // Get story locale first
    const storyLocale = articleData.attributes.locale || 'en'

    if (articleData.attributes.Authors && Array.isArray(articleData.attributes.Authors)) {
      // Helper function to fetch author details from authors API
      const fetchAuthorDetails = async (authorId: number) => {
        try {
          const authorResponse = await axios.get(`${API_BASE_URL}/v1/api/authors/${authorId}`, {
            params: {
              populate: '*'
            }
          })
          return authorResponse.data.data.attributes
        } catch (error) {
          console.error('Error fetching author details:', error)
          return null
        }
      }

      // Helper function to get bio based on locale
      const getBioForLocale = (authorDetails: { [key: string]: string }, locale: string) => {
        // Map locale codes to bio field names
        const bioFieldMap: { [key: string]: string } = {
          'en': 'Bio',
          'hi': 'Bio_hi',
          'mr': 'Bio_mr',
          'bn': 'Bio_bn',
          'ta': 'Bio_ta',
          'te': 'Bio_te',
          'kn': 'Bio_kn',
          'ml': 'Bio_ml',
          'gu': 'Bio_gu',
          'pa': 'Bio_pa',
          'or': 'Bio_or',
          'as': 'Bio_as',
          'ur': 'Bio_ur'
        }

        const bioField = bioFieldMap[locale] || 'Bio'
        const localizedBio = authorDetails[bioField]

        // Return localized bio if exists, otherwise fallback to English Bio or Description
        return localizedBio || authorDetails.Bio || authorDetails.Description || ''
      }

      // Loop through all authors dynamically
      for (const authorItem of articleData.attributes.Authors) {
        let authorName = ''
        let authorRole = ''
        let authorBio = ''
        let authorEmail = ''
        let authorTwitter = ''
        let authorFacebook = ''
        let authorInstagram = ''
        let authorLinkedin = ''

        // Get author name
        if (authorItem?.author_name?.data?.id) {
          const authorDetails = await fetchAuthorDetails(authorItem.author_name.data.id)
          if (authorDetails) {
            authorName = authorDetails.Name || ''
            authorBio = getBioForLocale(authorDetails, storyLocale)
            authorEmail = authorDetails.Email || ''
            authorTwitter = authorDetails.TwitterURL || ''
            authorFacebook = authorDetails.FacebookURL || ''
            authorInstagram = authorDetails.InstagramURL || ''
            authorLinkedin = authorDetails.LinkedinURL || ''
          }
        }

        // Get author role
        if (authorItem?.author_role?.data?.attributes?.Name) {
          authorRole = authorItem.author_role.data.attributes.Name
        }

        // Only add if we have at least a name
        if (authorName) {
          authors.push({
            name: authorName,
            title: authorRole,
            bio: authorBio,
            email: authorEmail,
            twitter: authorTwitter,
            facebook: authorFacebook,
            instagram: authorInstagram,
            linkedin: authorLinkedin
          })
        }
      }
    }

    // Fallback if no authors found
    if (authors.length === 0) {
      authors.push({
        name: 'Unknown Author',
        title: '',
        bio: ''
      })
    }

    // Sort authors by role order
    const sortedAuthors = sortAuthorsByRole(authors)

    // Get cover image

    const coverImageUrl = articleData.attributes.Cover_image?.data?.attributes?.url
      ? `${API_BASE_URL}${articleData.attributes.Cover_image.data.attributes.url}`
      : undefined

    // Get mobile cover image
    const attrs = articleData.attributes as unknown as Record<string, unknown>
    const mobileCoverImageUrl =
      attrs.mobilecover &&
      typeof attrs.mobilecover === 'object' &&
      'data' in attrs.mobilecover &&
      attrs.mobilecover.data &&
      typeof attrs.mobilecover.data === 'object' &&
      'attributes' in attrs.mobilecover.data &&
      attrs.mobilecover.data.attributes &&
      typeof attrs.mobilecover.data.attributes === 'object' &&
      'url' in attrs.mobilecover.data.attributes &&
      typeof attrs.mobilecover.data.attributes.url === 'string'
        ? `${API_BASE_URL}${attrs.mobilecover.data.attributes.url}`
        : undefined

    // Get categories with title and slug
    const categories = articleData.attributes.categories?.data?.map(
      cat => ({
        title: cat.attributes.Title || '',
        slug: cat.attributes.slug || ''
      })
    ) || []

    // Get location
    const location = articleData.attributes.location?.data?.attributes?.name ||
                    articleData.attributes.location_auto_suggestion ||
                    undefined

    // Get city (district) and state
    const city = articleData.attributes.location?.data?.attributes?.district || undefined
    const state = articleData.attributes.location?.data?.attributes?.state || undefined

    // Get available languages from localizations with slugs
    let availableLanguages: Array<{ code: string; slug: string }> = []

    try {
      const localizationsData = articleData.attributes.localizations?.data || []
      const currentLocale = articleData.attributes.locale || 'en'
      const currentSlug = articleData.attributes.slug || slug

      // Build available languages array, filtering out duplicates and empty values
      const localizationLanguages = localizationsData
        .map((loc) => ({
          code: loc.attributes?.locale || '',
          slug: loc.attributes?.slug || ''
        }))
        .filter(lang => lang.code && lang.slug) // Remove empty values

      // Add current language first, then other localizations (avoiding duplicates)
      const filteredLocalizations = localizationLanguages.filter(lang => lang.code !== currentLocale)

      availableLanguages = [
        { code: currentLocale, slug: currentSlug },
        ...filteredLocalizations
      ]
    } catch (error) {
      console.error('Error extracting localizations:', error)
      // Fallback to just current language
      availableLanguages = [{ code: 'en', slug: slug }]
    }

    const finalContent = Array.isArray(articleData.attributes.Modular_Content)
      ? articleData.attributes.Modular_Content
      : []

    // Debug log to see the modular content structure
    console.log('##Rohit_Rocks## Modular_Content:', finalContent)

    const finalTitle = articleData.attributes.Title || "Untitled Story"

    // Extract Related_stories data
    const relatedStoriesData = articleData.attributes.Related_stories?.data || []

    // Extract is_student field
    const isStudent = Boolean(articleData.attributes.is_student)

    return {
      title: finalTitle,
      subtitle: articleData.attributes.Strap || articleData.attributes.strap || "",
      publishedDate: articleData.attributes.Original_published_date || new Date().toISOString(),
      authors: sortedAuthors,
      content: finalContent,
      coverImage: coverImageUrl,
      mobileCoverImage: mobileCoverImageUrl,
      categories,
      location,
      city,
      state,
      availableLanguages,
      relatedStoriesData,
      isStudent,
      storyLocale
    }
  } catch (error) {
    console.error('Error fetching story:', error)
    throw error
  }
}
