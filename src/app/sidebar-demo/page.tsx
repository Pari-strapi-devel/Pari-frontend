'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { PanelRightOpen } from 'lucide-react'

export default function SidebarDemoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePariSection, setActivePariSection] = useState('')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Define sections for the sidebar
  const sidebarSections = [
    { id: 'introduction', title: 'Introduction', iconType: 'FileText' },
    { id: 'where-pari-comes-in', title: 'Where PARI comes in', iconType: 'FileText' },
    { id: 'whats-on-pari', title: 'What\'s on PARI', iconType: 'FileText' },
    { id: 'climate-change', title: 'Climate Change', iconType: 'Sun' },
    { id: 'library', title: 'Library', iconType: 'BookMarked' },
    { id: 'farmers-protests', title: 'Farmer\'s Protests', iconType: 'Tractor' },
    { id: 'faces-of-india', title: 'Faces of India', iconType: 'Smile' },
    { id: 'livelihoods-under-lockdown', title: 'Livelihoods under lockdown', iconType: 'Lock' },
    { id: 'stories-on-art', title: 'Stories on art/artists/artisans/crafts', iconType: 'Amphora' },
    { id: 'grindmill-songs', title: 'Grindmill songs project and Kutchi songs archive', iconType: 'AudioLines' },
    { id: 'adivasi-childrens-art', title: 'Adivasi children\'s art', iconType: 'Brush' },
    { id: 'womens-health', title: 'PARI series on women\'s health', iconType: 'Lightbulb' },
    { id: 'visible-work-invisible-women', title: 'Visible work invisible women', iconType: 'EyeOff' },
    { id: 'freedom-fighters-gallery', title: 'Freedom fighters\' gallery', iconType: 'Flag' },
    { id: 'pari-in-classrooms', title: 'PARI in classrooms', iconType: 'Building2' }
  ]

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Scroll spy effect for PARI sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header

      // Define the sections to track
      const sectionIds = [
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

      // Find the current section
      let currentSection = ''
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId)
        if (element) {
          const elementTop = element.offsetTop
          if (scrollPosition >= elementTop) {
            currentSection = sectionId
          }
        }
      }

      setActivePariSection(currentSection)
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
  }, [])

  return (
    <div className="flex flex-col pt mx-auto md:flex-row min-h-screen bg-white dark:bg-background">
      {/* Main content */}
      <div className="flex flex-col gap-4 md:flex-row min-h-screen max-w-[1232px] mx-auto bg-white dark:bg-background">
        {/* Sidebar */}
        <div className={`hidden md:block flex-shrink-0 sticky top-4 self-start transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`} id="sidebar-container">
          <Sidebar
            activePage="introduction"
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            sections={sidebarSections}
            activeSection={activePariSection}
            scrollToSection={scrollToSection}
            sidebarTitle="PARI Demo"
          />
        </div>

        {/* Floating toggle button when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden md:block fixed top-4 left-4 z-50 p-2 bg-white dark:bg-background border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}

        {/* Main content area */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-[45.75rem] mx-auto">
            {/* Introduction Section */}
            <section id="introduction" className="mb-16 scroll-mt-20">
              <h1 className="text-3xl font-bold text-red-600 mb-6">
                Introduction
              </h1>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  Welcome to PARI (People&apos;s Archive of Rural India), a living journal and breathing archive
                  that documents the lives, struggles, and stories of rural India. This platform serves as 
                  a comprehensive repository of rural journalism, featuring stories that mainstream media 
                  often overlooks.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  PARI was founded with the vision of creating a space where rural voices can be heard, 
                  where the complexities of rural life are explored with depth and nuance, and where 
                  the rich cultural heritage of India&apos;s villages is preserved for future generations.
                </p>
              </div>
            </section>

            {/* Where PARI comes in Section */}
            <section id="where-pari-comes-in" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-bold text-red-600 mb-6">
                Where PARI comes in
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  In a media landscape dominated by urban perspectives, PARI fills a crucial gap by 
                  focusing exclusively on rural India. We provide in-depth coverage of issues that 
                  affect the majority of India&apos;s population but receive minimal attention in mainstream media.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  Our approach combines rigorous journalism with multimedia storytelling, creating 
                  immersive experiences that bring rural stories to life. Through photographs, videos, 
                  audio recordings, and written narratives, we capture the full spectrum of rural experiences.
                </p>
              </div>
            </section>

            {/* What's on PARI Section */}
            <section id="whats-on-pari" className="mb-16 scroll-mt-20">
              <h2 className="text-2xl font-bold text-red-600 mb-6">
                What&apos;s on PARI
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 mb-6" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  PARI hosts a diverse range of content covering various aspects of rural life. 
                  Our platform includes specialized sections that explore different themes and topics:
                </p>
              </div>
            </section>

            {/* Climate Change Section */}
            <section id="climate-change" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Climate Change
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Documenting the impact of climate change on rural communities, including stories 
                about changing weather patterns, agricultural challenges, and adaptation strategies.
              </p>
            </section>

            {/* Library Section */}
            <section id="library" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Library
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                A comprehensive collection of resources, research papers, and archived materials 
                related to rural India, serving as a valuable repository for researchers and students.
              </p>
            </section>

            {/* Continue with more sections... */}
            <section id="farmers-protests" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Farmer&apos;s Protests
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Coverage of farmer movements, protests, and advocacy efforts across India, 
                highlighting the challenges faced by agricultural communities.
              </p>
            </section>

            <section id="faces-of-india" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Faces of India
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Portrait stories that capture the diversity and richness of rural Indian life, 
                featuring individuals from different communities and backgrounds.
              </p>
            </section>

            <section id="livelihoods-under-lockdown" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Livelihoods under lockdown
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Documentation of how the COVID-19 pandemic and lockdown measures affected 
                rural livelihoods and communities across India.
              </p>
            </section>

            <section id="stories-on-art" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Stories on art, artists, artisans & crafts
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Celebrating the rich artistic traditions of rural India, featuring stories 
                about traditional crafts, folk art, and the artisans who keep these traditions alive.
              </p>
            </section>

            <section id="grindmill-songs" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Grindmill songs project and Kutchi songs archive
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Preserving traditional folk music and oral traditions through digital archives 
                of grindmill songs and Kutchi musical heritage.
              </p>
            </section>

            <section id="adivasi-childrens-art" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Adivasi children&apos;s art
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Showcasing the creative expressions of Adivasi children, highlighting their 
                unique perspectives and artistic talents.
              </p>
            </section>

            <section id="womens-health" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                PARI series on women&apos;s health
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                In-depth coverage of women&apos;s health issues in rural areas, including access
                to healthcare, maternal health, and gender-specific challenges.
              </p>
            </section>

            <section id="visible-work-invisible-women" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Visible work, invisible women
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Highlighting the often unrecognized contributions of women in rural economies 
                and communities, making visible their essential but overlooked work.
              </p>
            </section>

            <section id="freedom-fighters-gallery" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Freedom fighters&apos; gallery
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Commemorating the contributions of freedom fighters from rural areas, 
                preserving their stories and legacy for future generations.
              </p>
            </section>

            <section id="pari-in-classrooms" className="mb-16 scroll-mt-20">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                PARI in classrooms
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                Educational resources and materials designed to bring rural stories into 
                academic settings, fostering understanding and awareness among students.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
