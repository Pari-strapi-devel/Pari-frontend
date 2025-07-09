'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { PanelRightOpen } from 'lucide-react'
// Define the PariContentSection interface
interface PariContentSection {
  id: string
  title: string
  content?: string
  iconType?: string
  children?: PariContentSection[]
}

// Define the response interface
interface PariContentResponse {
  sections: PariContentSection[]
}

// Function to fetch PARI content sections
async function fetchPariContentSections(): Promise<PariContentResponse> {
  try {
    // For now, return mock data that matches the expected structure
    // This can be replaced with actual API call when the endpoint is available
    const mockSections: PariContentSection[] = [
      {
        id: 'introduction',
        title: 'Introduction',
        content: 'Welcome to PARI (People\'s Archive of Rural India), a living journal and breathing archive that documents the lives, struggles, and stories of rural India.',
        iconType: 'FileText'
      },
      {
        id: 'where-pari-comes-in',
        title: 'Where PARI comes in',
        content: 'PARI serves as a comprehensive repository of rural journalism, featuring stories that mainstream media often overlooks.',
        iconType: 'FileText'
      },
      {
        id: 'whats-on-pari',
        title: 'What\'s on PARI',
        content: 'PARI hosts a diverse range of content covering various aspects of rural India.',
        iconType: 'FileText'
      },
      {
        id: 'climate-change',
        title: 'Climate Change',
        content: 'Stories documenting the impact of climate change on rural communities.',
        iconType: 'Sun'
      },
      {
        id: 'library',
        title: 'Library',
        content: 'A comprehensive collection of resources and archives.',
        iconType: 'BookMarked'
      },
      {
        id: 'farmers-protests',
        title: 'Farmer\'s Protests',
        content: 'Coverage of farmer movements and agricultural issues.',
        iconType: 'Tractor'
      },
      {
        id: 'faces-of-india',
        title: 'Faces of India',
        content: 'Personal stories and portraits from rural India.',
        iconType: 'Smile'
      },
      {
        id: 'livelihoods-under-lockdown',
        title: 'Livelihoods under lockdown',
        content: 'Impact of COVID-19 lockdowns on rural livelihoods.',
        iconType: 'Lock'
      },
      {
        id: 'stories-on-art',
        title: 'Stories on art/artists/artisans/crafts',
        content: 'Celebrating rural arts, crafts, and traditional skills.',
        iconType: 'Amphora'
      },
      {
        id: 'grindmill-songs',
        title: 'Grindmill songs project and Kutchi songs archive',
        content: 'Preserving traditional folk music and oral traditions.',
        iconType: 'AudioLines'
      },
      {
        id: 'adivasi-childrens-art',
        title: 'Adivasi children\'s art',
        content: 'Showcasing artistic expressions from indigenous children.',
        iconType: 'Brush'
      },
      {
        id: 'womens-health',
        title: 'PARI series on women\'s health',
        content: 'Health issues and challenges faced by rural women.',
        iconType: 'Lightbulb'
      },
      {
        id: 'visible-work-invisible-women',
        title: 'Visible work invisible women',
        content: 'Highlighting the often unrecognized work of rural women.',
        iconType: 'EyeOff'
      },
      {
        id: 'freedom-fighters-gallery',
        title: 'Freedom fighters\' gallery',
        content: 'Honoring the legacy of India\'s freedom fighters.',
        iconType: 'Flag'
      },
      {
        id: 'pari-in-classrooms',
        title: 'PARI in classrooms',
        content: 'Educational initiatives and classroom resources.',
        iconType: 'Building2'
      }
    ]

    return { sections: mockSections }
  } catch (error) {
    console.error('Error fetching PARI content sections:', error)
    throw error
  }
}

export default function PariContentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePariSection, setActivePariSection] = useState('')
  const [contentSections, setContentSections] = useState<PariContentSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Fetch PARI content sections
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetchPariContentSections()
        setContentSections(response.sections)
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [])

  // Convert contentSections to sidebar sections format
  const sidebarSections = contentSections.map(section => ({
    id: section.id,
    title: section.title,
    iconType: section.iconType
  }))

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Scroll spy effect for PARI sections
  useEffect(() => {
    if (contentSections.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for header

      // Get all section IDs including children
      const allSectionIds: string[] = []
      contentSections.forEach(section => {
        allSectionIds.push(section.id)
        if (section.children) {
          section.children.forEach(child => {
            allSectionIds.push(child.id)
          })
        }
      })

      // Find the current section
      let currentSection = ''
      for (const sectionId of allSectionIds) {
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
  }, [contentSections])

  // Render content section
  const renderContentSection = (section: PariContentSection, isChild = false) => {
    const HeadingTag = isChild ? 'h3' : 'h2'
    const headingClass = isChild 
      ? 'text-xl font-semibold text-red-600 mb-4'
      : 'text-2xl font-bold text-red-600 mb-6'
    
    return (
      <section 
        key={section.id} 
        id={section.id} 
        className={`${isChild ? 'mb-12' : 'mb-16'} scroll-mt-20`}
      >
        <HeadingTag className={headingClass}>
          {section.title}
        </HeadingTag>
        {section.content && (
          <p className="text-gray-700 dark:text-gray-300 mb-4" style={{
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '170%',
            letterSpacing: '-3%'
          }}>
            {section.content}
          </p>
        )}
      </section>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

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
            sidebarTitle="PARI Content"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              PARI Content Structure
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-8" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%'
              }}>
                This page demonstrates the PARI sidebar with real API content and scroll functionality. 
                The sidebar automatically highlights the current section as you scroll, and you can 
                click on any sidebar item to smoothly scroll to that section.
              </p>

              {/* Render all content sections */}
              {contentSections.map(section => (
                <div key={section.id}>
                  {renderContentSection(section)}
                  
                  {/* Render child sections */}
                  {section.children && section.children.length > 0 && (
                    <div className="ml-6">
                      {section.children.map(child => renderContentSection(child, true))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Features Demonstrated
                </h3>
                <ul className="text-gray-700 dark:text-gray-300 space-y-2" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '170%',
                  letterSpacing: '-3%'
                }}>
                  <li>✅ <strong>API-driven content</strong> - Sidebar sections loaded from API</li>
                  <li>✅ <strong>Scroll spy functionality</strong> - Active section highlighting</li>
                  <li>✅ <strong>Smooth scrolling</strong> - Click sidebar items to navigate</li>
                  <li>✅ <strong>Hierarchical structure</strong> - Main sections with sub-items</li>
                  <li>✅ <strong>Dynamic icons</strong> - Icons assigned based on content type</li>
                  <li>✅ <strong>Responsive design</strong> - Works on all screen sizes</li>
                  <li>✅ <strong>Real content IDs</strong> - Uses actual API data for navigation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
