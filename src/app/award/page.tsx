'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { API_BASE_URL } from '@/utils/constants'

// Get API URL from centralized constants

// Types for API response
interface ApiPageResponse {
  data: {
    id: number
    attributes: {
      Title: string
      Strap: string
      createdAt: string
      updatedAt: string
      publishedAt: string
      locale: string
      Year: ApiYear[]
    }
  }
  meta: Record<string, unknown>
}

interface ApiYear {
  id: number
  Year: string
  AwardDetails: ApiAwardDetail[]
}

interface ApiAwardDetail {
  id: number
  Title: string
  Details: string
  URL?: string | null
  Image?: {
    data?: {
      id: number
      attributes: {
        name: string
        alternativeText?: string | null
        caption?: string | null
        width: number
        height: number
        formats: {
          large?: ImageFormat
          medium?: ImageFormat
          small?: ImageFormat
          thumbnail?: ImageFormat
        }
        url: string
        ext: string
        mime: string
        size: number
      }
    } | null
  }
}

interface ImageFormat {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: string | null
  size: number
  width: number
  height: number
  sizeInBytes: number
}

// Types for component use
interface Award {
  id: string
  title: string
  description: string
  recipient?: string
  month?: string
  image?: string
  url?: string | null
}

interface YearData {
  year: number
  awards: Award[]
}

// Helper function to extract recipient from description
const extractRecipientFromDescription = (description: string): string | undefined => {
  // Try to extract names from common patterns in the descriptions
  const patterns = [
    /PARI[^<]*?([A-Z][a-z]+ [A-Z][a-z]+)/,
    /Reporter ([A-Z][a-z]+ [A-Z][a-z]+)/,
    /PARI's ([A-Z][a-z]+ [A-Z][a-z]+)/
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return undefined
}

// Helper function to extract month from description
const extractMonthFromDescription = (description: string): string | undefined => {
  const monthPattern = /In ([A-Z][a-z]+) \d{4}/
  const match = description.match(monthPattern)
  return match ? match[1] : undefined
}

// Helper function to strip HTML tags and decode HTML entities
const stripHtmlTags = (html: string): string => {
  if (!html) return ''

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')

  // Clean up extra whitespace and line breaks
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()

  return text
}

// Transform API Year data to component format
const transformApiYearDataToYearData = (apiYears: ApiYear[]): YearData[] => {
  return apiYears.map(apiYear => {
    const year = parseInt(apiYear.Year)
    const awards: Award[] = apiYear.AwardDetails.map(awardDetail => ({
      id: awardDetail.id.toString(),
      title: awardDetail.Title,
      description: stripHtmlTags(awardDetail.Details),
      // Extract recipient and month from the description if possible
      recipient: extractRecipientFromDescription(awardDetail.Details),
      month: extractMonthFromDescription(awardDetail.Details),
      image: getImageUrl(awardDetail.Image),
      url: awardDetail.URL
    }))

    return {
      year,
      awards
    }
  }).sort((a, b) => b.year - a.year) // Sort by year (newest first)
}

// Helper function to get the best image URL from API response
const getImageUrl = (imageData?: ApiAwardDetail['Image']): string => {
  if (!imageData?.data?.attributes) {
    return '/api/placeholder/400/300' // Default placeholder
  }

  const { attributes } = imageData.data
  const { formats, url } = attributes
  const baseUrl = `${API_BASE_URL}/v1`

  // Prefer medium size, fallback to large, small, thumbnail, or original
  if (formats?.medium?.url) {
    return `${baseUrl}${formats.medium.url}`
  }
  if (formats?.large?.url) {
    return `${baseUrl}${formats.large.url}`
  }
  if (formats?.small?.url) {
    return `${baseUrl}${formats.small.url}`
  }
  if (formats?.thumbnail?.url) {
    return `${baseUrl}${formats.thumbnail.url}`
  }
  if (url) {
    return `${baseUrl}${url}`
  }

  return '/api/placeholder/400/300' // Final fallback
}

// Props interfaces
interface YearBadgeProps {
  year: number
  isSelected: boolean
  onClick: (year: number) => void
}

interface TimelineProps {
  years: number[]
  selectedYear: number
  onYearSelect: (year: number) => void
}

interface AwardContentProps {
  yearData: YearData | undefined
}

interface AwardEntryProps {
  award: Award
  isLast?: boolean
}

// Styled Components
const YearBadge = ({ year, isSelected, onClick }: YearBadgeProps) => (
  <button
    onClick={() => onClick(year)}
    className={`w-12 h-7 sm:w-14 sm:h-8 md:w-16 md:h-8 bg-background  rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
      isSelected
        ? 'text-white shadow-lg hover:shadow-xl ring-2 ring-primary-PARI-Red/20'
        : 'text-[#606060] bg-propover  hover:shadow-lg  hover:border-primary-PARI-Red/30'
    }`}
    style={{
      backgroundColor: isSelected ? '#B82929' : undefined,
     
    }}
   
  >
    {year}
  </button>
)

const AwardEntry = ({ award, isLast = false }: AwardEntryProps) => (
  <div className={isLast ? "" : "mb-8 md:mb-12"}>
    <div className="flex flex-col md:flex-row md:items-start">
      <div className="w-full md:w-72 h-48 md:h-48 mb-4 md:mb-0 md:mr-8 flex-shrink-0">
        <div className="w-full h-full bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 relative">
          {award.image && award.image !== '/api/placeholder/400/300' ? (
            <Image
              src={award.image}
              alt={award.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 288px"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          {/* Fallback placeholder - shown when no image or image fails to load */}
          <div className={`w-full h-full bg-gradient-to-br from-primary-PARI-Red via-primary-PARI-Red/80 to-primary-PARI-Red/30 flex items-center justify-center relative ${award.image && award.image !== '/api/placeholder/400/300' ? 'hidden' : ''}`}>
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="text-center relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-2 flex items-center justify-center border border-white/30">
                <span className="text-white text-lg md:text-2xl drop-shadow-sm">🏆</span>
              </div>
              <span className="text-white text-xs md:text-sm font-semibold drop-shadow-sm">Award Ceremony</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl md:text-2xl mb-2 text-primary-PARI-Red transition-colors duration-200" style={{
         
        }}>
          {award.title}
        </h3>
        <p className=" text-discreet-text   text-sm sm:text-base leading-relaxed" style={{

        }}>
          {award.description}
        </p>

        {/* Read More link if URL is available */}
        {award.url && (
          <div className="mt-3 md:mt-4">
            <a
              href={award.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-PARI-Red hover:text-primary-PARI-Red/80 font-medium text-sm  transition-all duration-200 group border-1 border-primary-PARI-Red hover:border-primary-PARI-Red rounded-full px-4 py-2   hover:bg-primary-PARI-Red/5 hover:shadow-sm active:scale-95"
            >
              <span>Read the full story</span>
             
            </a>
          </div>
        )}
      </div>
    </div>
    {!isLast && <div className="mt-6 md:mt-8 border-b border-border dark:border-[#444444]"></div>}
  </div>
)

const Timeline = ({ years, selectedYear, onYearSelect }: TimelineProps) => (
  <div className="w-full md:w-36 flex md:flex-col">
    <div className="flex md:flex-col space-x-2 mr-2 md:space-x-0 md:space-y-4 lg:space-y-6 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
      {years.map((year) => (
        <div key={year} className="flex justify-start flex-shrink-0">
          <YearBadge
            year={year}
            isSelected={selectedYear === year}
            onClick={onYearSelect}
          />
        </div>
      ))}
    </div>
  </div>
)

const AwardContent = ({ yearData }: AwardContentProps) => {
  if (!yearData || yearData.awards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="text-center p-8 rounded-xl  ">
          <div className="w-16 h-16  rounded-full mx-auto mb-4 flex items-center justify-center">
           
          </div>
          <p className="text-grey-400 text-lg mb-2 font-medium">No awards data available</p>
          <p className="text-grey-400 text-sm">for {yearData?.year || 'this year'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 md:border-l border-border pt-8 md:pt-0 dark:border-[#444444]  md:pl-8">
      <div className="space-y-0 max-w-[900px] mx-auto">
        {yearData.awards.map((award, index) => (
          <AwardEntry
            key={award.id}
            award={award}
            isLast={index === yearData.awards.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

export default function AwardPage() {
  const [awardData, setAwardData] = useState<YearData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  // Function to fetch award data from API
  const fetchAwardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch with proper populate parameter to get Year, AwardDetails, and Images
      const apiUrl = `${API_BASE_URL}/v1/api/page-pari-award?populate%5BYear%5D%5Bpopulate%5D%5BAwardDetails%5D%5Bpopulate%5D=%2A`

      const response = await axios.get<ApiPageResponse>(apiUrl)

      if (response.data && response.data.data) {
        const pageData = response.data.data.attributes

        // Check if Year data exists in the response
        if (pageData.Year && Array.isArray(pageData.Year)) {
          const transformedData = transformApiYearDataToYearData(pageData.Year)
          setAwardData(transformedData)

          // Set the first available year as selected year
          if (transformedData.length > 0) {
            setSelectedYear(transformedData[0].year)
          }
        } else {
          // No Year data found, use fallback structure
          const fallbackYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]
          setAwardData(fallbackYears.map(year => ({ year, awards: [] })))
        }
      }
    } catch (err) {
      console.error('Error fetching award data:', err)
      setError('Failed to load award data. Please try again later.')

      // Fallback to empty data structure with common years
      const fallbackYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]
      setAwardData(fallbackYears.map(year => ({ year, awards: [] })))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchAwardData()
  }, [fetchAwardData])

  const years = awardData.map(data => data.year)
  const selectedYearData = awardData.find(data => data.year === selectedYear)

  // Loading state
  if (isLoading) {
    return (
      <div className="dark:bg-propover bg-popover min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-PARI-Red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading award data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="dark:bg-propover bg-popover min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center p-8 rounded-xl">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 dark:text-red-400 text-lg mb-2 font-medium">Error Loading Awards</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchAwardData}
                className="px-4 py-2 bg-primary-PARI-Red text-white rounded-lg hover:bg-primary-PARI-Red/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark:bg-propover  bg-popover min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Main Title and Subtitle - Enhanced Styling */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className=" mb-2">
            
             PARI&apos;s
            
            journalism prizes
            awards and honours
          </h1>
          <h2 className=" dark:text-discreet-text  max-w-3xl" 
            >
            PARI&apos;s won{' '}
            82 journalism awards
            since we began publishing in 2014.
          </h2>
        </div>

        {/* Timeline Layout - Responsive */}
        <div className="flex flex-col md:flex-row md:items-start">
          <Timeline
            years={years}
            selectedYear={selectedYear}
            onYearSelect={setSelectedYear}
          />
          <AwardContent yearData={selectedYearData} />
        </div>
      </div>
    </div>
  )
}
