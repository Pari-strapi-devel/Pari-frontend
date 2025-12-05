'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const BASE_URL = 'https://merge.ruralindiaonline.org/v1/'
const IMAGE_BASE_URL = 'https://merge.ruralindiaonline.org'

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

export default function PaintingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [painting, setPainting] = useState<PaintingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)

  // Check if video parameter is in URL
  useEffect(() => {
    const videoParam = searchParams.get('video')
    if (videoParam === 'true') {
      setShowVideo(true)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchPaintingData = async () => {
      try {
        setIsLoading(true)

        // Fetch current painting by slug
        const response = await axios.get<ApiResponse>(
          `${BASE_URL}api/childrens-paintings?filters[slug][$eq]=${slug}&populate=*`
        )

        if (response.data.data.length > 0) {
          setPainting(response.data.data[0])
        } else {
          setError('Painting not found')
        }
      } catch (err) {
        console.error('Error fetching painting:', err)
        setError('Failed to load painting')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaintingData()
  }, [slug])



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p>Loading painting...</p>
        </div>
      </div>
    )
  }

  if (error || !painting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Painting not found'}</p>
          <button
            onClick={() => router.push('/childrens-paintings')}
            className="text-primary-PARI-Red hover:underline"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    )
  }

  const paintingImage = painting.attributes.Painting?.data?.attributes
  const imageUrl = paintingImage?.url

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/childrens-paintings')}
          className="mb-6 hover:text-primary-PARI-Red flex items-center gap-2"
        >
          <FiChevronLeft size={20} />
          Back to Gallery
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image/Video */}
          <div className="space-y-4">
            {/* Image/Video Display */}
            <div className="relative w-full h-[400px] aspect-video bg-popover rounded-lg overflow-hidden border">
              {/* Image */}
              <div
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  showVideo ? '-translate-x-full' : 'translate-x-0'
                }`}
              >
                {imageUrl ? (
                  <Image
                    src={`${IMAGE_BASE_URL}${imageUrl}`}
                    alt={painting.attributes.Title}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No image available</p>
                  </div>
                )}
              </div>

              {/* Video */}
              {painting.attributes.VideoID && (
                <div
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                    showVideo ? 'translate-x-0' : 'translate-x-full'
                  }`}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${painting.attributes.VideoID}`}
                    title={painting.attributes.Title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                </div>
              )}
            </div>

            {/* Navigation and Thumbnails */}
            <div className="flex items-center justify-between gap-4">
              {/* Previous Button - Switch to Image */}
              <button
                onClick={() => setShowVideo(false)}
                disabled={!showVideo}
                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {paintingImage?.formats?.thumbnail && (
                  <button
                    onClick={() => setShowVideo(false)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      !showVideo
                        ? 'border-primary-PARI-Red border-2'
                        : 'border-1 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={`${IMAGE_BASE_URL}${paintingImage.formats.thumbnail.url}`}
                      alt="Image Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                )}
                {painting.attributes.VideoID && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      showVideo
                        ? 'border-primary-PARI-Red border-2'
                        : 'border-1 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${painting.attributes.VideoID}/mqdefault.jpg`}
                      alt="Video Thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Next Button - Switch to Video */}
              <button
                onClick={() => setShowVideo(true)}
                disabled={showVideo || !painting.attributes.VideoID}
                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Artist Details */}
            <div className="space-y-6">
              {/* NAME */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">NAME</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Name}</p>
              </div>

              {/* AGE */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">AGE</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Age}</p>
              </div>

              {/* CLASS */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">CLASS</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Class}</p>
              </div>

              {/* SCHOOL NAME */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">SCHOOL NAME</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.School}</p>
              </div>

              {/* SCHOOL BLOCK */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">SCHOOL BLOCK</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Block}</p>
              </div>

              {/* SCHOOL DISTRICT */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">SCHOOL DISTRICT</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.District}</p>
              </div>

              {/* SCHOOL STATE */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">SCHOOL STATE</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.State}</p>
              </div>

              {/* TRIBE */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">TRIBE</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Tribe}</p>
              </div>

              {/* MEDIUM */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">MEDIUM</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Medium}</p>
              </div>

              {/* DATE */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">DATE</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.Year}</p>
              </div>

              {/* PROJECT TEACHER */}
              <div className="flex gap-8 pb-2 border-b">
                <h4 className="uppercase font-semibold text-sm w-48">PROJECT TEACHER</h4>
                <p className="font-normal text-lg flex-1">{painting.attributes.ProjectTeacher}</p>
              </div>
            </div>

            {/* Translation/Description */}
            {painting.attributes.Translation && (
              <div className="p-6 rounded-lg border-l-4 border-primary-PARI-Red">
                <p className="italic leading-relaxed">
                  &quot;{painting.attributes.Translation}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

