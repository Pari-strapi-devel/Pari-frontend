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
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { useTheme } from 'next-themes'
import { ArticleData, AuthorData } from '@/components/articles/ArticlesContent'

// Helper function to get current date
const getCurrentDate = (monthsObj: Record<string, string>, weekDaysObj: Record<string, string>) => {
  if (!monthsObj || !weekDaysObj) return '';

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentDay = currentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

  // Map month index to month name in monthsObj
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const currentMonthName = monthsObj[monthNames[currentMonthIndex]];
  const currentDayName = weekDaysObj[currentDay];

  return `${currentDayName}, ${currentMonthName} ${currentDate.getDate()}, ${currentDate.getFullYear()}`.toUpperCase();
};

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
  authors?: string[];
  location?: string;
  categories?: Array<{ title: string; slug: string }>;
}

// Helper function to get logo path based on theme and language
const getLogoPath = (language: string, theme: string | undefined): string => {
  // Map language codes to logo file names
  const languageMap: { [key: string]: string } = {
    'en': 'english',
    'hi': 'hindi',
    'bn': 'bangla',
    'mr': 'marathi',
    'or': 'odia',
    'ur': 'urdu'
  }

  const langName = languageMap[language] || 'english'
  const mode = theme === 'dark' ? 'dark' : 'light'
  const modeFolder = theme === 'dark' ? 'For-dark-mode' : 'For-light-mode'

  // Note: There's a typo in the light mode urdu filename (udru instead of urdu)
  const fileName = language === 'ur' && theme !== 'dark'
    ? `pari-udru-${mode}.png`
    : `pari-${langName}-${mode}.png`

  return `/images/header-logo/${modeFolder}/${fileName}`
}

export function Header() {
  const { language, addLocaleToUrl } = useLocale()
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const isFilterOpen = useFilterStore((state) => state.isOpen)
  const setIsFilterOpen = useFilterStore((state) => state.setIsOpen)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Add state for suggestions
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Add state for date data
  const [months, setMonths] = useState<Record<string, string>>({})
  const [weekDays, setWeekDays] = useState<Record<string, string>>({})

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch months and weekDays data
  useEffect(() => {
    const fetchDateData = async () => {
      try {
        const query = {
          populate: {
            Months: true,
            week_days: true,
          },
          locale: language
        }

        const queryString = qs.stringify(query, {
          encodeValuesOnly: true,
          addQueryPrefix: false
        })

        const response = await axios.get(`${BASE_URL}api/home-page?${queryString}`)

        const week_days = response.data?.data?.attributes?.week_days
        const monthsData = response.data?.data?.attributes?.Months

        setMonths(monthsData || {})
        setWeekDays(week_days || {})
      } catch (error) {
        console.error('Error fetching date data:', error)
      }
    }

    fetchDateData()
  }, [language])

  // Add this function to handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (language && language !== 'en') {
        params.set('locale', language);
      }
      router.push(`/search?${params.toString()}`)
      setIsSearchExpanded(false)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    const params = new URLSearchParams();
    params.set('q', suggestion);
    if (language && language !== 'en') {
      params.set('locale', language);
    }
    router.push(`/search?${params.toString()}`)
    setIsSearchExpanded(false)
    setSearchQuery('')
    setShowSuggestions(false)
  }

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
        // Build search parameters to search by title, strap, and author name
        const searchParams: Record<string, string | number> = {
          'filters[$or][0][Title][$containsi]': searchQuery,
          'filters[$or][1][strap][$containsi]': searchQuery,
          'filters[$or][2][Authors][author_name][Name][$containsi]': searchQuery,
          'pagination[page]': 1,
          'pagination[pageSize]': 5,
          'fields[0]': 'id',
          'fields[1]': 'Title',
          'fields[2]': 'type',
          'populate[Authors][populate][author_name][fields][0]': 'Name',
          'populate[location][fields][0]': 'name',
          'populate[location][fields][1]': 'district',
          'populate[location][fields][2]': 'state',
          'populate[categories][fields][0]': 'Title',
          'populate[categories][fields][1]': 'slug'
        }

        const response = await axios.get(`${BASE_URL}api/articles`, { params: searchParams })

        const formattedSuggestions = response.data.data.map((item: ArticleData) => {
          // Extract authors
          const authors = item.attributes.Authors
            ? 'data' in item.attributes.Authors
              ? item.attributes.Authors.data?.map(
                  (author: AuthorData) =>
                    author.attributes?.author_name?.data?.attributes?.Name || 'PARI'
                ) || ['PARI']
              : (item.attributes.Authors as AuthorData[]).map(
                  (author: AuthorData) =>
                    author.author_name?.data?.attributes?.Name || 'PARI'
                )
            : ['PARI'];

          // Extract location
          const location = item.attributes.location?.data?.attributes?.name ||
                          item.attributes.location_auto_suggestion ||
                          'India';

          // Extract categories
          const categories = item.attributes.categories?.data?.map((cat: { attributes: { Title: string; slug?: string } }) => ({
            title: cat.attributes.Title,
            slug: cat.attributes.slug || ''
          })) || [];

          return {
            id: item.id,
            title: item.attributes.Title,
            type: item.attributes.type || 'article',
            authors,
            location,
            categories
          };
        })

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

  // Get logo path based on current theme and language
  // Use 'light' as default during SSR to prevent hydration mismatch
  const logoPath = mounted ? getLogoPath(language, theme) : getLogoPath(language, 'light')



  return (
    <>
      {/* Top Header with Logo and Title */}
      <div className="main-header-section bg-white dark:bg-popover md:py-8 py-5  border-b border-border dark:border-borderline">
        <div className="container mx-auto px-4 top-0 max-w-[1282px]">
          <div className="flex flex-col items-center justify-center w-full z-1000">
            {/* Complete Header Content - Centered as a unit */}
            <div className="flex flex-col items-center -mt-1 mx-auto">
              {/* Date Section */}
               <div className={`${language === 'ur' ? 'text-right' : 'text-left'}`}>
        <div className=" max-w-[1232px] mx-auto px-6 ">
          <h6 className="text-grey-300 dark:text-discreet-text ">
            {String(getCurrentDate(months, weekDays))}
          </h6>
        </div>
      </div>
              {/* Logo - Centered */}
              <div className="flex items-center justify-center mb-0">
                <Link href={addLocaleToUrl("/")} className="flex-shrink-0">
                  <Image
                    src={logoPath}
                    alt="PARI Logo"
                    width={300}
                    height={100}
                    priority
                    className="object-contain w-[250px] h-[100px] sm:w-[280px] sm:h-[100px] md:w-[300px] md:h-[100px] lg:w-[350px] lg:h-[120px]"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Section */}
     

      {/* Sticky Navigation Header */}
      <header className={`border-b border-gray-200 dark:border-border dark:bg-popover bg-white transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative z-40'
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
                <Link href={addLocaleToUrl("/")}>
                  <Image
                    src="/pari-logo.png"
                    alt="PARI Logo"
                    width={70}
                    height={70}
                    priority
                    className="h-12 w-12 md:w-16 md:h-16 object-contain"
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
                    className="absolute z-50 w-full bg-background dark:bg-popover border border-input rounded-md shadow-md mt-1 left-0 right-0 md:mx-0 px-4 md:px-0"
                  >
                    <div className="max-w-[1232px] mx-auto">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
                          onClick={() => handleSuggestionSelect(suggestion.title)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {highlightMatch(suggestion.title, searchQuery)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {suggestion.authors && suggestion.authors.length > 0 && (
                                <span>
                                  Author {suggestion.authors.map((author, idx) => (
                                    <span key={idx}>
                                      {idx > 0 && ', '}
                                      {highlightMatch(author, searchQuery)},
                                    </span>
                                  ))}
                                </span>
                              )}
                              Location {suggestion.location && (
                                <span className="flex items-center">
                                  <span className="mx-1">•</span>
                                  {highlightMatch(suggestion.location, searchQuery)}
                                </span>
                              )}
                             
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`hidden md:flex items-center space-x-8 ${
                isSticky && logoPath ? '' : 'flex-1'
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <Image
                  src="/pari-logo.png"
                  alt="PARI Logo"
                  width={60}
                  height={60}
                  priority
                  className="h-16 w-16 object-contain"
                />
               
              </div>
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
