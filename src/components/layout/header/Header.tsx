"use client"
import { useState, useEffect, useRef, JSX } from 'react'
import { Navigation } from './Navigation'
import { ThemeToggle } from "./ThemeToggle"
import { FilterMenu } from "./FilterMenu"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import Image from 'next/image'
import { useFilterStore } from '@/store/filterStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'
import { BASE_URL, IMAGE_URL } from '@/config'
import { useLocale } from '@/lib/locale'

// Helper function to highlight matching text
const highlightMatch = (text: string, query: string): JSX.Element => {
  if (!query || query.length < 1) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={index} className="bg-yellow-100 dark:bg-yellow-800 font-medium">{part}</span> 
          : part
      )}
    </>
  );
};

interface SearchSuggestion {
  id: number;
  title: string;
  type: string;
}

interface HeaderApiResponse {
  data: {
    id: number;
    attributes: {
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      locale: string;
      Tagline: string;
      LogoText: string;
      MainLogo?: {
        data: {
          attributes: {
            url: string;
            alternativeText?: string;
            width?: number;
            height?: number;
          };
        };
      };

    };
  };
  meta: object;
}

export function Header() {
  const { language } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const [headerData, setHeaderData] = useState<HeaderApiResponse | null>(null)
  const isFilterOpen = useFilterStore((state) => state.isOpen)
  const setIsFilterOpen = useFilterStore((state) => state.setIsOpen)
  const router = useRouter()

  // Add state for suggestions
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Add this function to handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchExpanded(false)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setIsSearchExpanded(false)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  // Fetch header data from API
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const apiUrl = `${BASE_URL}api/header?populate=*&locale=${language}`


        const response = await fetch(apiUrl)
        const data: HeaderApiResponse = await response.json()

        if (data?.data?.attributes) {
          setHeaderData(data)
        }
      } catch (error) {
        console.error('Error fetching header data:', error)
      }
    }

    fetchHeaderData()
  }, [language])

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      // Get the height of the main header section (logo + tagline section)
      const mainHeaderElement = document.querySelector('.main-header-section') as HTMLElement
      const mainHeaderHeight = mainHeaderElement ? mainHeaderElement.offsetHeight : 160 // fallback to approximate height

      // Make sticky when main header is fully scrolled out of view
      const shouldBeSticky = scrollTop > mainHeaderHeight

      setIsSticky(shouldBeSticky)

      // Add/remove body padding when sticky
      if (shouldBeSticky) {
        document.body.classList.add('sticky-header-active')
      } else {
        document.body.classList.remove('sticky-header-active')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Test initial scroll position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.body.classList.remove('sticky-header-active')
    }
  }, [])
  
  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        // Build query for Strapi
        const query = {
          filters: {
            $or: [
              { Title: { $containsi: searchQuery } },
              { strap: { $containsi: searchQuery } }
            ]
          },
          fields: ['id', 'Title', 'type'],
          pagination: {
            page: 1,
            pageSize: 5
          }
        }
        
        const queryString = qs.stringify(query, { encodeValuesOnly: true })
        const response = await axios.get(`${BASE_URL}api/articles?${queryString}`)
        
        const formattedSuggestions = response.data.data.map((item: {id: number, attributes: {Title: string, type?: string}}) => ({
          id: item.id,
          title: item.attributes.Title,
          type: item.attributes.type || 'article'
        }))
        
        setSuggestions(formattedSuggestions)
        setShowSuggestions(formattedSuggestions.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      }
    }
    
    const debounceTimer = setTimeout(() => {
      fetchSuggestions()
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Add useEffect to handle body scroll and blur
  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (isFilterOpen || isMenuOpen) {
      document.body.style.overflow = 'hidden'
      mainContent?.classList.add('content-blur')
    } else {
      document.body.style.overflow = 'unset'
      mainContent?.classList.remove('content-blur')
    }

    return () => {
      document.body.style.overflow = 'unset'
      mainContent?.classList.remove('content-blur')
    }
  }, [isFilterOpen, isMenuOpen])

  // Add useEffect to handle page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.location.pathname.includes('/search')) {
        // Store a flag in sessionStorage to indicate we're refreshing from search page
        sessionStorage.setItem('redirectFromSearch', 'true');
      }
    };

    const checkRedirect = () => {
      // Check if we need to redirect after refresh
      const shouldRedirect = sessionStorage.getItem('redirectFromSearch') === 'true';
      if (shouldRedirect && window.location.pathname.includes('/search')) {
        // Clear the flag and redirect
        sessionStorage.removeItem('redirectFromSearch');
        router.push('/');
      }
    };

    // Add event listener for page refresh
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if we need to redirect (on component mount)
    checkRedirect();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  // Get data from header API response
  const tagline = headerData?.data?.attributes?.Tagline
  const logoText = headerData?.data?.attributes?.LogoText

  // Get logo URLs from API or use fallback images
  const getLogoUrl = (logoData: { data: { attributes: { url: string } } } | undefined) => {
    if (!logoData?.data?.attributes?.url) return '/pari-logo.png'

    const rawUrl = logoData.data.attributes.url
    if (rawUrl.startsWith('http')) return rawUrl
    // Fix double slash issue by ensuring proper URL construction
    const cleanUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
    return `${IMAGE_URL.replace(/\/$/, '')}${cleanUrl}`
  }

  // Test with known working logo URL from API
  const testLogoUrl = `${IMAGE_URL.replace(/\/$/, '')}/uploads/pari_logo_9d9d9407eb.svg`

  const mainLogoUrl = headerData?.data?.attributes?.MainLogo ? getLogoUrl(headerData.data.attributes.MainLogo) : testLogoUrl
  // Use MainLogo for sticky logo as well since StickyLogo doesn't exist in API
  const stickyLogoUrl = headerData?.data?.attributes?.MainLogo ? getLogoUrl(headerData.data.attributes.MainLogo) : testLogoUrl



  return (
    <>
      {/* Top Header with Logo and Title */}
      <div className="main-header-section bg-white dark:bg-popover md:pb-6 py-5 md:pt-2 border-b border-border dark:border-borderline">
        <div className="container mx-auto px-4 top-0 max-w-[1282px]">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Complete Header Content - Centered as a unit */}
            <div className="flex flex-col items-center -mt-1 mx-auto">
              {/* Logo and Title Row - Same layout on all devices */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-0">
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src={mainLogoUrl}
                    alt="PARI Logo"
                    width={70}
                    height={70}
                    priority
                    className="object-contain w-[90px] h-[80px]  md:w-[90px] md:h-[90px] lg:w-[100px] lg:h-[100px]"
                  />
                </Link>
                <div className="flex flex-col justify-center text-left">
                  {logoText ? (
                    // If logoText contains "of", split it into two lines
                    logoText.includes(' of ') ? (
                      logoText.split(' of ').map((part, index) => (
                        <h1 key={index} className="font-noto-serif text-[1rem] font-semibold text-black dark:text-white leading-tight" style={{
                          fontSize: 'clamp(14px, 4vw, 20px)',
                          lineHeight: '120%',
                          letterSpacing: '-3%'
                        }}>
                          {index === 0 ? part : `of ${part}`}
                        </h1>
                      ))
                    ) : (
                      // Single line if no "of" separator
                      <h1 className="font-noto-serif font-semibold text-black dark:text-white leading-tight" style={{
                        fontSize: 'clamp(14px, 4vw, 20px)',
                        lineHeight: '120%',
                        letterSpacing: '-3%'
                      }}>
                        {logoText}
                      </h1>
                    )
                  ) : null}
                </div>
              </div>

              {/* Tagline - Aligned with title text on all devices */}
              {tagline && (
                <div className="w-full flex md:-mt-4 mt-1">
                  <p className="font-noto font-semibold italic text-black dark:text-white text-left" style={{
                    fontSize: 'clamp(11px, 2.5vw, 15px)',
                    lineHeight: '110%',
                    letterSpacing: '-4%'
                  }}>
                    {tagline}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Header */}
      <header className={`border-b border-gray-200 dark:border-border dark:bg-popover bg-white transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative z-50'
      }`}>
        <div className="container mx-auto px-4 max-w-[1282px]">
          <nav className="flex items-center justify-between h-[60px]">
            {/* Left side with logo and mobile menu */}
            <div className={`flex items-center space-x-2 ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
              <Button
                variant="secondary"
                size="icon"
                className="md:hidden rounded-full h-[32px] w-[32px] dark:hover:bg-primary-PARI-Red dark:bg-popover bg-white items-center justify-center p-2 text-primary-PARI-Red"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>

              {/* Show sticky logo only when header is sticky */}
              {isSticky && (
                <Link href="/">
                  <Image
                    src={stickyLogoUrl}
                    alt="PARI Logo"
                    width={117}
                    height={64}
                    priority
                    className="h-8 w-auto"
                  />
                </Link>
              )}
            </div>

            {/* Desktop Navigation or Search Input */}
            {isSearchExpanded ? (
              <div className={`flex-1 ${isSearchExpanded ? 'w-full absolute left-0 right-0 px-4 md:relative md:px-0 md:mx-4' : 'mx-4'}`}>
                <form onSubmit={handleSearch} className="flex items-center w-full bg-background dark:bg-popover rounded-full border pr-2 md:pr-3  border-input">
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    className="flex-1 border-none focus:outline-none px-4 py-2 h-[48px]"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    <X className="h-[2rem] w-[2rem] text-primary-PARI-Red" />
                  </Button>

                </form>

                {/* Suggestions dropdown */}
                {isSearchExpanded && showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full bg-background border border-input rounded-md shadow-md mt-1 left-0 right-0 md:mx-0 px-4 md:px-0"
                  >
                    <div className="max-w-[1232px] mx-auto">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-3 hover:bg-muted cursor-pointer flex items-center border-b border-border last:border-0"
                          onClick={() => handleSuggestionSelect(suggestion.title)}
                        >
                          <div className="flex-1">
                            {highlightMatch(suggestion.title, searchQuery)}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {suggestion.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`hidden md:flex items-center space-x-8 ${
                isSticky && stickyLogoUrl ? '' : 'flex-1'
              }`}>
                <Navigation />
              </div>
            )}

            {/* Right Side Actions */}
            <div className={`flex items-center  justify-center space-x-2 md:space-x-4 ${isSearchExpanded ? 'hidden md:flex' : 'flex'} ${isMenuOpen ? 'md:flex hidden' : 'flex'}`}>
              {!isSearchExpanded && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-[32px] w-[32px]  dark:hover:bg-primary-PARI-Red dark:bg-popover bg-white items-center justify-center p-2 text-primary-PARI-Red"
                  onClick={() => setIsSearchExpanded(true)}
                >
                  <Search className="h-[1.2rem] w-[1.2rem] cursor-pointer" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
              
              <div className="flex items-center gap-x-2 md:space-x-2">
                <Button
                  variant="secondary"
                  className="rounded-2xl w-[73px] cursor-pointer  dark:hover:bg-primary-PARI-Red dark:bg-popover bg-white h-[32px] flex items-center gap-1"
                  onClick={() => setIsFilterOpen(true)}
                >
                  {isFilterOpen ? (
                    <X className="h-4 w-4" />
                  ) : null}
                  Filter
                </Button>

                <Link href="/donate">
                  <Button
                    variant="secondary"
                    className="rounded-2xl items-center sm:hidden md:flex dark:hover:bg-primary-PARI-Red dark:bg-popover bg-white cursor-pointer w-[73px] h-[32px]"
                  >
                    Donate
                  </Button>
                </Link>
              </div>
              
              <ThemeToggle />
            </div>
          </nav>
        </div>

        {/* Overlay */}
        {(isMenuOpen || isFilterOpen) && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65]"
            onClick={() => {
              setIsMenuOpen(false)
              setIsFilterOpen(false)
            }}
          />
        )}

      </header>

      {/* Mobile Menu Slider - Outside header for proper z-index layering */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[395px] bg-white dark:bg-popover border-r border-border transform transition-transform duration-300 ease-in-out z-[70] md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Image
                src={stickyLogoUrl}
                alt="PARI Logo"
                width={60}
                height={60}
                priority
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="md:hidden"
              >
                <X className="h-7 w-7 text-primary-PARI-Red" />
              </Button>
            </div>

            {/* Mobile Menu Action Buttons */}
           
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <Navigation onLinkClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      </div>

      {/* Filter Menu - Outside header for proper z-index layering */}
      <FilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  )
}
