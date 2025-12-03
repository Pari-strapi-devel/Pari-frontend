'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/utils/constants'

import { X, Mail } from 'lucide-react'
import { FaInstagram, FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6'

interface PhotoFormat {
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

interface PhotoAttributes {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: {
    large?: PhotoFormat
    medium?: PhotoFormat
    small?: PhotoFormat
    thumbnail?: PhotoFormat
  }
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: unknown
  createdAt: string
  updatedAt: string
}

interface Photo {
  data: {
    id: number
    attributes: PhotoAttributes
  } | null
}

interface TeamMember {
  id: number
  Name: string
  Designation: string
  Bio: string
  Email: string
  InstagramURL?: string
  TwitterURL?: string
  FacebookURL?: string
  LinkedinURL?: string
  CTA?: string
  CTAurl?: string
  Photo: Photo
}

interface ApiResponse {
  data: {
    id: number
    attributes: {
      Title: string
      TeamMember: TeamMember[]
    }
  }
}

export default function TeamsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [, setActiveSection] = useState<string>('')
  const [memberHasArticles, setMemberHasArticles] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    console.log('##rohiiiiii## Component mounted, starting to fetch team data...')
    fetchTeamData()
  }, [])

  // Scroll spy effect for team members
  useEffect(() => {
    if (teamMembers.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header

      // Find the current section
      let currentSection = ''
      for (const member of teamMembers) {
        const element = document.getElementById(`member-${member.id}`)
        if (element) {
          const elementTop = element.offsetTop
          if (scrollPosition >= elementTop) {
            currentSection = `member-${member.id}`
          }
        }
      }

      setActiveSection(currentSection)
    }

    // Throttle function to limit scroll event frequency
    const throttle = (func: () => void, limit: number) => {
      let inThrottle: boolean
      return function() {
        if (!inThrottle) {
          func()
          inThrottle = true
          setTimeout(() => inThrottle = false, limit)
        }
      }
    }

    const throttledScroll = throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledScroll)

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [teamMembers])

  const fetchTeamData = async () => {
    try {
      console.log('##rohiiiiii## Fetching team data from API...')
      console.log('##rohiiiiii## API URL:', `${API_BASE_URL}/v1/api/page-our-team?populate[TeamMember][populate]=*`)

      const response = await fetch(`${API_BASE_URL}/v1/api/page-our-team?populate[TeamMember][populate]=*`)
      console.log('##rohiiiiii## Response status:', response.status)
      console.log('##rohiiiiii## Response ok:', response.ok)

      const data: ApiResponse = await response.json()
      console.log('##rohiiiiii## Full API Response:', JSON.stringify(data, null, 2))

      // Check if data exists
      if (!data.data) {
        console.error('##rohiiiiii## No data returned from API')
        console.error('##rohiiiiii## Response was:', data)

        // Try alternative populate strategy
        console.log('##rohiiiiii## Trying alternative populate strategy...')
        const altResponse = await fetch(`${API_BASE_URL}/v1/api/page-our-team?populate=deep,3`)
        const altData: ApiResponse = await altResponse.json()
        console.log('##rohiiiiii## Alternative API Response:', JSON.stringify(altData, null, 2))

        if (altData.data && altData.data.attributes.TeamMember) {
          setTeamMembers(altData.data.attributes.TeamMember)
          console.log('##rohiiiiii## Team members set successfully from alternative API, count:', altData.data.attributes.TeamMember.length)
          return
        }

        return
      }

      console.log('##rohiiiiii## Team Members:', data.data.attributes.TeamMember)

      // Log image data for each member
      if (data.data.attributes.TeamMember) {
        data.data.attributes.TeamMember.forEach((member, index) => {
          console.log(`##rohiiiiii## Member ${index + 1} (${member.Name}):`, {
            hasPhoto: !!member.Photo?.data,
            photoData: member.Photo?.data?.attributes,
            imageUrl: member.Photo?.data ? `${API_BASE_URL}/v1${member.Photo.data.attributes.formats.medium?.url || member.Photo.data.attributes.url}` : 'No image'
          })
        })

        setTeamMembers(data.data.attributes.TeamMember)
        console.log('##rohiiiiii## Team members set successfully, count:', data.data.attributes.TeamMember.length)
      } else {
        console.error('##rohiiiiii## No TeamMember data in response')
      }
    } catch (error) {
      console.error('##rohiiiiii## Error fetching team data:', error)
    } finally {
      setLoading(false)
      console.log('##rohiiiiii## Loading finished')
    }
  }

  const handleImageError = (memberId: number, imageUrl: string) => {
    console.error(`##rohiiiiii## Image failed to load for member ID ${memberId}:`, imageUrl)
    setImageErrors(prev => new Set(prev).add(memberId))
  }

  const checkIfMemberHasArticles = async (memberName: string) => {
    try {
      console.log('##Rohit_Rocks## Checking if member has articles:', memberName)
      const response = await fetch(
        `${API_BASE_URL}/v1/api/articles?filters[Authors][author_name][Name][$containsi]=${encodeURIComponent(memberName)}&pagination[limit]=1`
      )
      const data = await response.json()
      const hasArticles = data.data && data.data.length > 0
      console.log('##Rohit_Rocks## Member has articles:', hasArticles)
      setMemberHasArticles(hasArticles)
    } catch (error) {
      console.error('##Rohit_Rocks## Error checking articles:', error)
      setMemberHasArticles(false)
    }
  }

  const handleMemberClick = (member: TeamMember) => {
    console.log('##Rohit_Rocks## Profile clicked, opening immediately:', member.Name)
    setSelectedMember(member)
    setIsSliderOpen(true)
    checkIfMemberHasArticles(member.Name)
  }

  const handleSeeStoriesClick = () => {
    if (selectedMember) {
      const authorParam = encodeURIComponent(selectedMember.Name)
      console.log('##Rohit_Rocks## Navigating to articles page for author:', selectedMember.Name)
      console.log('##Rohit_Rocks## URL:', `/articles?author=${authorParam}`)
      router.push(`/articles?author=${authorParam}`)
    }
  }

  const closeSlider = () => {
    setIsSliderOpen(false)
    setTimeout(() => {
      setSelectedMember(null)
      setMemberHasArticles(false)
    }, 300) // Wait for animation to complete
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-PARI-Red"></div>
          <p className="mt-4 text-foreground">Loading team members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className=" text-foreground mb-2 ">
            Our Team
          </h1>
          <h2 className=" text-muted-foreground px-4">
            PARI: A living journal, a breathing archive
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => handleMemberClick(member)}
            >
              {/* Profile Image with gray background and rounded corners */}
              <div className="w-full h-[200px] sm:h-[240px] lg:h-[268px] bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                {(() => {
                  console.log(`##rohiiiiii## Checking image for ${member.Name}:`, {
                    hasPhoto: !!member.Photo,
                    hasPhotoData: !!member.Photo?.data,
                    photoData: member.Photo?.data,
                    hasImageError: imageErrors.has(member.id)
                  })

                  if (member.Photo?.data && !imageErrors.has(member.id)) {
                    const imageUrl = `${API_BASE_URL}/v1${member.Photo.data.attributes.formats.medium?.url || member.Photo.data.attributes.url}`
                    console.log(`##rohiiiiii## Rendering image for ${member.Name}:`, imageUrl)
                    return (
                      <Image
                        src={imageUrl}
                        alt={member.Name}
                        fill
                        className="object-cover object-[center_10%] w-[500px] h-[500px]"
                        onError={() => handleImageError(member.id, imageUrl)}
                        onLoad={() => console.log(`##rohiiiiii## Image loaded successfully for ${member.Name}`)}
                      />
                    )
                  } else {
                    console.log(`##rohiiiiii## No image available for ${member.Name} or image failed to load`, {
                      reason: !member.Photo?.data ? 'No photo data' : 'Image error occurred'
                    })
                    return (
                      <Image
                        src="/team-dammy.png"
                        alt={`${member.Name} placeholder`}
                        fill
                        className="object-cover object-[center_10%] w-[500px] h-[500px]"
                      />
                    )
                  }
                })()}
              </div>

              {/* Member Info - positioned outside image with blue accent line */}
              <div className="relative ">
                <h3 className="text-lg  text-foreground mb-1">
                  {member.Name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {member.Designation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Extended • click here
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedMember && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/10 bg-opacity-50 z-40 transition-opacity duration-300 ${
              isSliderOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeSlider}
          />

          {/* Right Side Slider Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-background z-1000 transition-transform duration-300 ease-in-out ${
              isSliderOpen ? 'translate-x-0' : 'translate-x-full'
            } shadow-xl`}
          >
            {/* Close Button */}
            <button
              onClick={closeSlider}
              className="absolute top-4 left-4 p-2  text-primary-PARI-Red rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-primary-PARI-Red" />
            </button>

            {/* Content */}
            <div className="flex flex-col h-full px-4  sm:px-6">
              {/* Profile Image - Large and prominent */}
              <div className="w-full max-w-[436px] h-[268px] sm:w-full bg-gray-200 sm:h-72 rounded-[8px] overflow-hidden mt-16 mb-8 relative mx-auto sm:mx-0">
                {selectedMember.Photo?.data && !imageErrors.has(selectedMember.id) ? (() => {
                  const imageUrl = `${API_BASE_URL}/v1${selectedMember.Photo.data.attributes.formats.large?.url || selectedMember.Photo.data.attributes.url}`
                  console.log(`##rohiiiiii## Rendering modal image for ${selectedMember.Name}:`, imageUrl)
                  return (
                    <Image
                      src={imageUrl}
                      alt={selectedMember.Name}
                      fill
                      className="object-cover  object-[center_5%] rounded-lg"
                      onError={() => handleImageError(selectedMember.id, imageUrl)}
                      onLoad={() => console.log(`##rohiiiiii## Modal image loaded successfully for ${selectedMember.Name}`)}
                    />
                  )
                })() : (
                  <Image
                    src="/team-dammy.png"
                    alt={`${selectedMember.Name} placeholder`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 pb-4 flex flex-col">

                <div className="flex-1 overflow-y-auto pr-1">
                {/* Name and Role */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl  text-primary-PARI-Red mb-2">
                  {selectedMember.Name}
                </h3>
                <p className="text-foreground text-sm sm:text-base font-medium mb-6 sm:mb-8">
                  {selectedMember.Designation}
                </p>

                {/* Bio */}
                {selectedMember.Bio && (
                  <div
                    className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedMember.Bio }}
                  />
                )}

                {/* Social Links */}
                <div className="flex space-x-3 sm:space-x-4 mb-8 sm:mb-12 justify-start">
                  {selectedMember.Email && (
                    <a
                      href={`mailto:${selectedMember.Email}`}
                      className="w-12 h-12 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Mail className="w-6 h-6 text-white" />
                    </a>
                  )}
                  {selectedMember.InstagramURL && (
                    <a
                      href={selectedMember.InstagramURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <FaInstagram className="w-6 h-6 text-white" />
                    </a>
                  )}
                  {selectedMember.TwitterURL && (
                    <a
                      href={selectedMember.TwitterURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <FaXTwitter className="w-6 h-6" />
                    </a>
                  )}
                  {selectedMember.FacebookURL && (
                    <a
                      href={selectedMember.FacebookURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <FaFacebookF className="w-6 h-6" />
                    </a>
                  )}
                  {selectedMember.LinkedinURL && (
                    <a
                      href={selectedMember.LinkedinURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <FaLinkedinIn className="w-6 h-6" />
                    </a>
                  )}
                </div>

                </div>
                {/* See Stories Button - Only show if member has articles */}
                {memberHasArticles && (
                  <button
                    onClick={handleSeeStoriesClick}
                    className="mt-auto w-full bg-primary-PARI-Red text-white py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
                  >
                    See Stories
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


