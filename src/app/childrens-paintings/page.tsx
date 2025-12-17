'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/locale'
import { LibraryGridSkeleton } from '@/components/skeletons/ArticleSkeletons'
import { API_BASE_URL } from '@/utils/constants'


const BASE_URL = `${API_BASE_URL}/v1/`
const IMAGE_BASE_URL = API_BASE_URL

interface ImageFormat {
  url: string
  width: number
  height: number
}

interface ImageData {
  data: {
    id: number
    attributes: {
      url: string
      formats?: {
        large?: ImageFormat
        medium?: ImageFormat
        small?: ImageFormat
        thumbnail?: ImageFormat
      }
    }
  } | null
}

interface PaintingData {
  id: number
  attributes: {
    Title: string
    Name: string
    Age: number
    Class: number
    School: string
    Tribe: string
    Village: string
    GP: string
    Block: string
    District: string
    State: string
    Medium: string
    Year: number
    ProjectTeacher: string
    Translation: string
    VideoLink: string
    slug: string
    VideoID: string
    Painting?: ImageData
    ChildPhoto?: ImageData
  }
}

interface ApiResponse {
  data: PaintingData[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface ModularContent {
  id: number
  __component: string
  Paragraph?: string
}

interface PageData {
  id: number
  attributes: {
    Title: string
    Strap: string | null
    Modular_Content: ModularContent[]
  }
}

interface PageApiResponse {
  data: PageData[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export default function ChildrensPaintingsPage() {
  const router = useRouter()
  const { language: locale } = useLocale()
  const [paintings, setPaintings] = useState<PaintingData[]>([])
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPaintings, setTotalPaintings] = useState(0)
  const pageSize = 12

  // Fetch page content from pages API
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoadingPage(true)

        // Fetch page by title "Adivasi Children's Art" with locale
        const response = await axios.get<PageApiResponse>(
          `${BASE_URL}api/pages?filters[Title][$eq]=Adivasi Children's Art&populate=deep,3&locale=${locale}`
        )

        if (response.data.data && response.data.data.length > 0) {
          setPageData(response.data.data[0])
        }
      } catch (err) {
        console.error('Error fetching page data:', err)
      } finally {
        setIsLoadingPage(false)
      }
    }

    fetchPageData()
  }, [locale])

  // Fetch paintings data with pagination
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<ApiResponse>(
          `${BASE_URL}api/childrens-paintings?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}&locale=${locale}`
        )
        setPaintings(response.data.data)
        setTotalPages(response.data.meta.pagination.pageCount)
        setTotalPaintings(response.data.meta.pagination.total)
      } catch (err) {
        console.error('Error fetching paintings:', err)
        setError('Failed to load paintings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaintings()
  }, [currentPage, locale])

  const handlePaintingClick = (slug: string) => {
    router.push(`/childrens-paintings/${slug}`)
  }

  // Helper function to strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Hardcoded content for the page
  const hardcodedContent = {
    subtitle: 'PAINTINGS FROM ODISHA - COLLECTION 1',
    title: 'The World Through the Art of Adivasi Children',
    shortDescription: 'PARI brings you the first ever archive of paintings by young Adivasi schoolchildren. The work recorded and documented here is from students in Classes 3 to 9 in schools in Jajapur and Kendujhar districts of Odisha.',
    fullContent: `
      <p>We have 111 paintings by 98 Adivasi schoolchildren from 57 schools in this first collection from Odisha. The children are in the age group 9 to 15 and studying in Classes 3 to 9. Within the young artists, girls outnumber boys 68 to 30. Each painting is accompanied by a 20-30 second video where the young artist introduces herself/himself and their work. Most have spoken in Odia, but a few have also recorded their videos in Adivasi languages including Ho, Munda and Birhor.</p>
      <p>The 12 tribes the children belong to are: Bathudi, Bhuiya, Bhumij, Gandia, Gond, Ho, Kolha, Mankirdia (also spelt as Mankidia – an offshoot of the Birhor tribe), Munda, Samti, Santal and Sounti. Some of these are classified as Particularly Vulnerable Tribal Groups.</p>
      <p>These young Adivasi students of limited means and resources, living in some of the remotest tribal hamlets in Odisha, worked and produced these vibrant paintings with crayons, pencil colours, cheap sketch pens – and just a few managed to use water colours. All the paintings are on ordinary chart paper, the only type available to them. This collection in the archive was built in collaboration with community-teachers of the non-profit Aspire and the Tata Steel Foundation under their joint 1,000 schools programme.</p>
      <p>The enormous amount of work that went into it on the ground, from the students and teachers involved, is truly inspiring. Aspire's community-teachers read out to children PARI stories on Adivasis and village communities, culture, gender, environment and climate change. The children responded to those themes, working on them further, directly relating them to their own lives, families and communities, retelling some parts of the stories in their immediate context – and in these beautiful paintings.</p>
      <p>[To know more about the volunteer-teachers' experiences read: <a href="#" class="text-primary-PARI-Red underline">History, Science and Geography, all in one class</a>; <a href="#" class="text-primary-PARI-Red underline">'Every child connects to stories about the environment'</a>; <a href="#" class="text-primary-PARI-Red underline">Deep dive into the climate crisis</a> and <a href="#" class="text-primary-PARI-Red underline">Climate crisis: buffaloes, elephants and people</a>].</p>
      <p>The 57 schools whose students participated in this endeavour are spread across 9 blocks. Of these, 55 are in Banspal, Champua, Danagadi, Ghatgaon, Jhumpura, Joda and Sukinda blocks of Jajapur and Kendujhar districts. Only four of the total of 98 Adivasi students are hostelites in schools located in Athagad and Bhubaneswar blocks of Cuttack and Khordha districts.</p>
      <p>PARI's tech partners DigiQuanta worked relentlessly to make this archival collection as creative and efficient as it is.</p>
    `
  }

  // Helper function to extract content from modular content
  const getPageContent = () => {
    if (!pageData?.attributes?.Modular_Content) {
      return hardcodedContent
    }

    const subtitle = pageData.attributes.Strap || hardcodedContent.subtitle
    const title = pageData.attributes.Title || hardcodedContent.title

    // Get all paragraph content
    const paragraphs = pageData.attributes.Modular_Content
      .filter(item => item.__component === 'modular-content.paragraph' && item.Paragraph)
      .map(item => item.Paragraph || '')

    const shortDescription = paragraphs.length > 0 ? stripHtml(paragraphs[0]) : hardcodedContent.shortDescription
    const fullContent = paragraphs.length > 1 ? paragraphs.slice(1).join('') : hardcodedContent.fullContent

    return { subtitle, title, shortDescription, fullContent }
  }

  const { subtitle, title, shortDescription, fullContent } = getPageContent()

  if (isLoading || isLoadingPage) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LibraryGridSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Noto Sans' }}>
      <div className="max-w-[1232px] mx-auto px-4 py-10 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 font-noto-sans dark:text-gray-400 mb-2 uppercase tracking-wider">
            {subtitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-noto-sans font-bold mb-4">
            {title}
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-base text-gray-700 font-noto-sans dark:text-gray-300 mb-4">
              {shortDescription}
            </p>
            {showFullDescription && fullContent && (
              <p
                className="text-left space-y-4 text-base text-gray-700 font-noto-sans dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: fullContent }}
              />
            )}
            {fullContent && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary-PARI-Red hover:underline font-noto-sans font-medium mt-4"
              >
                {showFullDescription ? 'Read Less...' : 'Read More...'}
              </button>
            )}
          </div>
        </div>

        {/* Paintings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paintings.map((painting) => {
            const paintingImage = painting.attributes.Painting?.data?.attributes
            const childPhoto = painting.attributes.ChildPhoto?.data?.attributes
            const imageUrl = paintingImage?.formats?.medium?.url || paintingImage?.url
            const childPhotoUrl = childPhoto?.url

            return (
              <div
                key={painting.id}
                className="group cursor-pointer"
                onClick={() => handlePaintingClick(painting.attributes.slug)}
              >
                <div className="relative bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-4 aspect-[4/3]">
                  {imageUrl ? (
                    <Image
                      src={`${IMAGE_BASE_URL}${imageUrl}`}
                      alt={painting.attributes.Title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br  from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-600 font-noto-sans dark:text-gray-300 mb-2">
                          {painting.attributes.Medium}
                        </p>
                        <p className="text-xs text-gray-500 font-noto-sans dark:text-gray-400">
                          {painting.attributes.Year}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Artist Avatar - Top Right Corner */}
                  <div className="absolute top-3 right-3 w-20 h-20 rounded-lg bg-white dark:bg-gray-700 border-1 border-white shadow-lg overflow-hidden">
                    {childPhotoUrl ? (
                      <Image
                        src={`${IMAGE_BASE_URL}${childPhotoUrl}`}
                        alt={painting.attributes.Name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-PARI-Red text-white font-bold">
                        {painting.attributes.Name.charAt(0)}
                      </div>
                    )}

                    {/* Video Icon Badge */}
                    {painting.attributes.VideoID && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/childrens-paintings/${painting.attributes.slug}?video=true`)
                        }}
                        className="absolute top-1/4 left-1/4 rounded-full bg-primary-PARI-Red hover:bg-red-700   shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
                      >
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                      </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Artist Information */}
                <div className="pl-2">
                  <h3 className="font-noto-sans font-bold text-lg mb-1 group-hover:text-primary-PARI-Red transition-colors">
                    {painting.attributes.Name}
                  </h3>
                  <p className="text-sm text-gray-600 font-noto-sans dark:text-gray-400">
                    {painting.attributes.Village}, {painting.attributes.District}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 rounded-full border border-primary-PARI-Red font-noto-sans text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full border transition-all ${
                      currentPage === page
                        ? 'bg-primary-PARI-Red text-white border-primary-PARI-Red'
                        : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 rounded-full border border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {paintings.length > 0 && (
          <div className="text-center mt-6 text-gray-600 font-noto-sans dark:text-gray-400">
            <p className=" font-noto-sans">
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalPaintings)} of {totalPaintings} paintings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

