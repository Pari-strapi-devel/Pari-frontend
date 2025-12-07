'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { languages as languagesList } from '@/data/languages'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { SearchFiltersSidebar, SearchFilters } from './SearchFilters'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchResult {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
  categories: Array<{ title: string; slug: string }>;
  authors: string[];
  localizations: Array<{
    locale: string;
    title: string;
    strap: string;
    slug: string;
  }>;
  location: string;
  date: string;
  type: string;
  availableLanguages?: Array<{
    code: string;
    name: string;
    slug: string;
  }>;
  currentLanguage?: string;
  currentLanguageName?: string;
}

interface AuthorData {
  attributes?: {
    author_name?: {
      data?: {
        attributes?: {
          Name: string;
        };
      };
    };
    author_role?: {
      data?: {
        attributes?: {
          Name: string;
        };
      };
    };
  };
  author_name?: {
    data?: {
      attributes?: {
        Name: string;
      };
    };
  };
  author_role?: {
    data?: {
      attributes?: {
        Name: string;
      };
    };
  };
}

interface AuthorsWrapper {
  data?: AuthorData[];
}

interface SearchApiItem {
  id: number;
  attributes: {
    Title?: string;
    slug?: string;
    Original_published_date?: string;
    type?: string;
    locale?: string;
    Cover_image?: {
      data?: {
        attributes?: {
          url: string
        }
      }
    };
    Authors?: AuthorsWrapper | AuthorData[];
    categories?: {
      data?: Array<{
        attributes: {
          Title: string
        }
      }>
    };
    location?: {
      data?: {
        attributes?: {
          name: string;
          district: string;
          state: string
        }
      }
    };
    localizations?: {
      data?: Array<{
        attributes: {
          locale: string;
          title: string;
          strap: string;
          slug: string
        }
      }>
    };
  };
}

export default function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  const { language: currentLocale } = useLocale()



  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalResults, setTotalResults] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(20)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [filters, setFilters] = useState<SearchFilters>({})

  // Function to clear a specific filter
  const clearFilter = (filterKey: keyof SearchFilters) => {
    const newFilters = { ...filters }
    delete newFilters[filterKey]
    setFilters(newFilters)
  }

  // Update page size based on screen width (responsive like articles page)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setPageSize(isMobile ? 6 : 20);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Log page size changes for debugging
  useEffect(() => {
    console.log('##Rohit_Rocks## Current page size:', pageSize);
  }, [pageSize]);

  console.log('##Rohit_Rocks## SearchPageContent rendered with query:', query, 'type:', typeof query, 'length:', query?.length, 'timestamp:', new Date().toISOString())

  // Test useEffect to see if it runs
  useEffect(() => {
    console.log('##Rohit_Rocks## TEST useEffect is running! Query:', query)
    console.log('##Rohit_Rocks## Window object available:', typeof window !== 'undefined')
    console.log('##Rohit_Rocks## Current results length:', results.length)
  }, [query, results.length])

  // Main search function
  const fetchSearchResults = useCallback(async (page: number = 1) => {
    console.log('##Rohit_Rocks## fetchSearchResults called with query:', query, 'page:', page, 'filters:', filters)
    if (!query || !query.trim()) {
      console.log('##Rohit_Rocks## No query provided, clearing results')
      setResults([])
      setIsLoading(false)
      setTotalResults(0)
      setTotalPages(0)
      return
    }

    try {
      setIsLoading(true)
      console.log('##Rohit_Rocks## Making API call for query:', query)

      // Build base search parameters
      const searchParams: Record<string, string | number> = {
        'filters[$or][0][Title][$containsi]': query,
        'filters[$or][1][strap][$containsi]': query,
        'filters[$or][2][location][name][$containsi]': query,
        'filters[$or][3][location][district][$containsi]': query,
        'filters[$or][4][location][state][$containsi]': query,
        'filters[$or][5][Authors][author_name][Name][$containsi]': query,
        'filters[$or][6][categories][Title][$containsi]': query,
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'populate[Cover_image][fields][0]': 'url',
        'populate[location][fields][0]': 'name',
        'populate[location][fields][1]': 'district',
        'populate[location][fields][2]': 'state',
        'populate[Authors][populate][author_name][fields][0]': 'Name',
        'populate[categories][fields][0]': 'Title',
        'populate[localizations][fields][0]': 'locale',
        'populate[localizations][fields][1]': 'title',
        'populate[localizations][fields][2]': 'strap',
        'populate[localizations][fields][3]': 'slug',
        'fields[0]': 'Title',
        'fields[1]': 'strap',
        'fields[2]': 'slug',
        'fields[3]': 'Original_published_date',
        'fields[4]': 'type',
        'fields[5]': 'locale'
      }

      // Add filter parameters
      let filterIndex = 7 // Continue from where search filters left off

      // Language filter - use current locale, explicit filter, or search all languages
      const targetLocale = filters.language || currentLocale;
      console.log('##Rohit_Rocks## Using locale for search:', targetLocale, 'from filters:', filters.language, 'current locale:', currentLocale);

      // Only set locale parameter if not searching all languages
      if (targetLocale !== 'all') {
        searchParams['locale'] = targetLocale
      } else {
        console.log('##Rohit_Rocks## Searching all languages - no locale filter applied');
      }

      // Date range filters
      if (filters.dateFrom) {
        searchParams[`filters[$and][${filterIndex}][Original_published_date][$gte]`] = filters.dateFrom
        filterIndex++
      }
      if (filters.dateTo) {
        searchParams[`filters[$and][${filterIndex}][Original_published_date][$lte]`] = filters.dateTo
        filterIndex++
      }

      // Author filter
      if (filters.author) {
        searchParams[`filters[$and][${filterIndex}][Authors][author_name][Name][$containsi]`] = filters.author
        filterIndex++
      }

      // Location filter
      if (filters.location) {
        searchParams[`filters[$and][${filterIndex}][$or][0][location][name][$containsi]`] = filters.location
        searchParams[`filters[$and][${filterIndex}][$or][1][location][district][$containsi]`] = filters.location
        searchParams[`filters[$and][${filterIndex}][$or][2][location][state][$containsi]`] = filters.location
        filterIndex++
      }

      // Category filter
      if (filters.category) {
        searchParams[`filters[$and][${filterIndex}][categories][Title][$containsi]`] = filters.category
        filterIndex++
      }

      console.log('##Rohit_Rocks## Final API params being sent:', searchParams);
      console.log('##Rohit_Rocks## Full API URL will be:', `${BASE_URL}api/articles`);

      const response = await axios.get(`${BASE_URL}api/articles`, {
        params: searchParams
      })

      console.log('##Rohit_Rocks## Full request URL:', response.config.url);

      console.log('##Rohit_Rocks## API Response received:', response.data.data?.length || 0, 'results')
      console.log('##Rohit_Rocks## Pagination info:', response.data.meta?.pagination)
      console.log('##Rohit_Rocks## First few results locales:', response.data.data?.slice(0, 3).map((item: SearchApiItem) => ({
        id: item.id,
        title: item.attributes?.Title,
        locale: item.attributes?.locale
      })))

      // Update pagination state
      if (response.data.meta?.pagination) {
        setTotalResults(response.data.meta.pagination.total)
        setTotalPages(response.data.meta.pagination.pageCount)
      }

      if (response.data.data) {
        const searchResults = response.data.data.map((item: SearchApiItem) => {
          // Get localizations
          const localizations = item.attributes.localizations?.data || [];

          // Build available languages array
          const availableLanguages = localizations.map((loc: { attributes: { locale: string; slug: string } }) => {
            const langCode = loc.attributes.locale;
            const language = languagesList.find((lang: { code: string; name: string }) => lang.code === langCode);
            return {
              code: langCode,
              name: language ? language.name : langCode,
              slug: loc.attributes.slug
            };
          });

          // Add current language if not in localizations
          const currentArticleLocale = item.attributes.locale || 'en';
          const hasCurrentLocale = availableLanguages.some((lang: { code: string }) => lang.code === currentArticleLocale);
          if (!hasCurrentLocale) {
            const currentLanguage = languagesList.find((lang: { code: string; name: string }) => lang.code === currentArticleLocale);
            if (currentLanguage) {
              availableLanguages.unshift({
                code: currentArticleLocale,
                name: currentLanguage.name,
                slug: item.attributes.slug || ''
              });
            }
          }

          // Extract authors using the same logic as ArticlesContent
          const authors = item.attributes.Authors
            ? 'data' in item.attributes.Authors
              ? item.attributes.Authors.data?.map((author: AuthorData) =>
                  author.attributes?.author_name?.data?.attributes?.Name || 'PARI'
                ) || ['PARI']
              : (item.attributes.Authors as AuthorData[]).map((author: AuthorData) =>
                  author.author_name?.data?.attributes?.Name || 'PARI'
                )
            : ['PARI']

          // Get current language name for display
          const currentLanguageName = languagesList.find((lang: { code: string; name: string }) => lang.code === currentArticleLocale)?.name || currentArticleLocale;

          const result = {
            id: item.id,
            title: item.attributes.Title || '',
            imageUrl: item.attributes.Cover_image?.data?.attributes?.url
              ? `${BASE_URL.replace('/v1/', '')}${item.attributes.Cover_image.data.attributes.url}`
              : '/images/placeholder.jpg',
            slug: item.attributes.slug || '',
            categories: item.attributes.categories?.data
              ?.map((cat: { attributes: { Title: string; slug?: string } }) => ({
                title: cat.attributes.Title || 'Uncategorized',
                slug: cat.attributes.slug || cat.attributes.Title?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'
              }))
              .filter((cat: { title: string; slug: string }) => cat.title && cat.slug) || [],
            authors: authors,
            localizations: localizations.map((loc: { attributes: { locale: string; title: string; slug: string } }) => ({
              locale: loc.attributes.locale,
              title: loc.attributes.title,
              strap: '', // Add empty strap as it's required by StoryCard
              slug: loc.attributes.slug
            })),
            location: item.attributes.location?.data?.attributes
              ? `${item.attributes.location.data.attributes.name}, ${item.attributes.location.data.attributes.district}, ${item.attributes.location.data.attributes.state}`
              : '',
            date: item.attributes.Original_published_date
              ? new Date(item.attributes.Original_published_date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })
              : '',
            type: item.attributes.type || 'article',
            availableLanguages: availableLanguages.length > 0 ? availableLanguages : undefined,
            currentLanguage: currentArticleLocale,
            currentLanguageName: currentLanguageName
          }

          // Determine what type of match this is
          const matchTypes = []
          if (result.title.toLowerCase().includes(query.toLowerCase())) matchTypes.push('title')
          if (result.authors.some((author: string) => author.toLowerCase().includes(query.toLowerCase()))) matchTypes.push('author')
          if (result.location.toLowerCase().includes(query.toLowerCase())) matchTypes.push('location')
          if (result.categories.some((cat: { title: string; slug: string | undefined }) => cat.title.toLowerCase().includes(query.toLowerCase()))) matchTypes.push('category')

          console.log('##Rohit_Rocks## Search result item:', {
            title: result.title,
            authors: result.authors,
            location: result.location,
            categories: result.categories,
            matchTypes: matchTypes,
            query: query
          })

          return result
        })

        console.log('##Rohit_Rocks## Setting results:', searchResults.length)
        setResults(searchResults)
      }
    } catch (error) {
      console.error('##Rohit_Rocks## API Error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, pageSize, filters, currentLocale])

  // Main useEffect for search
  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect triggered with query:', query, 'type:', typeof query, 'length:', query?.length, 'timestamp:', new Date().toISOString())
    console.log('##Rohit_Rocks## Current filters:', filters)
    console.log('##Rohit_Rocks## About to call fetchSearchResults')
    fetchSearchResults(1).catch(error => {
      console.error('##Rohit_Rocks## Error in fetchSearchResults:', error)
    })
  }, [query, fetchSearchResults, filters])

  // Reset to page 1 when query or locale changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query, currentLocale])

  // Refresh search when locale changes
  useEffect(() => {
    if (query && query.trim()) {
      console.log('##Rohit_Rocks## Locale changed to:', currentLocale, 'refreshing search with article locale filtering');
      fetchSearchResults(1).catch(error => {
        console.error('##Rohit_Rocks## Error refreshing search after locale change:', error)
      })
    }
  }, [currentLocale, fetchSearchResults, query])



  // Pagination functions
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return

    setCurrentPage(newPage)
    setIsLoading(true)
    window.scrollTo(0, 0)

    try {
      // Use the detailed search function for pagination
      await fetchSearchResults(newPage)
    } catch (error) {
      console.error('##Rohit_Rocks## Error changing page:', error)
    }
  }

  // Add pagination UI component (matching articles page style)
  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Show fewer pages on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxVisiblePages = isMobile ? 3 : 5;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Create array of visible page numbers
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    // Function to handle "+" button clicks
    const handleNextSet = () => {
      const nextPage = Math.min(totalPages, currentPage + 5);
      handlePageChange(nextPage);
    };

    // Function to handle "-" button clicks
    const handlePrevSet = () => {
      const prevPage = Math.max(1, currentPage - 5);
      handlePageChange(prevPage);
    };

    return (
      <div className="mt-6 sm:mt-8">
        <div className={`flex items-center justify-center gap-1 sm:gap-2 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>

          {/* Jump back 5 pages button - hidden on mobile */}
          {currentPage > 5 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevSet}
              className="text-primary-PARI-Red rounded-full hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden md:inline">Prev 5</span>
              <span className="md:hidden">-5</span>
            </Button>
          )}
          {/* Previous button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-primary-PARI-Red rounded-full mr-1 sm:mr-2 h-8 w-8  p-0"
          >
            <ChevronLeft className="h-6 w-6 " />
          </Button>


          {/* Page numbers - responsive */}
          <div className={`flex flex-wrap justify-center gap-1 sm:gap-2 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
            {visiblePages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "secondary"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`${currentPage === page ? "bg-primary-PARI-Red text-white" : "text-primary-PARI-Red"} rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm`}
              >
                {page}
              </Button>
            ))}
          </div>



          {/* Next button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-primary-PARI-Red rounded-full ml-1 sm:ml-2 h-8 w-8  p-0"
          >
            <ChevronRight className="h-6 w-6 " />
          </Button>

          {/* Jump forward 5 pages button - hidden on mobile */}
          {currentPage + 5 <= totalPages && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNextSet}
              className="text-primary-PARI-Red rounded-full hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden md:inline">Next 5</span>
              <span className="md:hidden">+5</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row gap-0 max-w-[1232px] mx-auto md:gap-6 lg:gap-16">
        {/* Filter Sidebar */}
        <SearchFiltersSidebar
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Main Content */}
        <main className={`flex-1 w-full ${isFilterOpen ? 'md:max-w-[calc(100%-20rem)] lg:max-w-[calc(100%-24rem)]' : ''} px-4 sm:px-6 md:px-0 py-6 md:py-8`}>
          {/* Header with Filter Toggle */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Search Results</h1>
              <Button
                variant="secondary"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden flex items-center rounded-full p-2 gap-1.5 h-10 px-3 text-sm shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Filters</span>
              </Button>
            </div>

            {query && (
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {isLoading ? 'Searching...' : `Found ${totalResults || results.length} results for "${query}"`}
                  {filters.language === 'all' && !isLoading && (
                    <span className="ml-2 text-primary-PARI-Red font-medium text-xs sm:text-sm">(across all languages)</span>
                  )}
                </p>
                {!isLoading && results.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {filters.language === 'all' && (
                      <p className="text-primary-PARI-Red">
                        Results include articles from all available languages. Use language selection on each card to view in different languages.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Active Filters Display */}
            {(filters.category || filters.author || filters.location || filters.dateFrom || filters.dateTo) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.category && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red rounded-full text-sm font-medium">
                    <span>{filters.category}</span>
                    <button
                      onClick={() => clearFilter('category')}
                      className="hover:bg-primary-PARI-Red/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove category filter"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {filters.author && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red rounded-full text-sm font-medium">
                    <span>Author: {filters.author}</span>
                    <button
                      onClick={() => clearFilter('author')}
                      className="hover:bg-primary-PARI-Red/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove author filter"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {filters.location && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red rounded-full text-sm font-medium">
                    <span>Location: {filters.location}</span>
                    <button
                      onClick={() => clearFilter('location')}
                      className="hover:bg-primary-PARI-Red/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove location filter"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red rounded-full text-sm font-medium">
                    <span>
                      Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                    </span>
                    <button
                      onClick={() => {
                        clearFilter('dateFrom')
                        clearFilter('dateTo')
                      }}
                      className="hover:bg-primary-PARI-Red/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove date filter"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            {!query && (
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground">Enter a search term to find articles</p>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="mb-1 font-medium">You can search by:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 sm:ml-4">
                    <li>Article titles and content</li>
                    <li>Author names (e.g., &quot;P. Sainath&quot;, &quot;Kavitha Iyer&quot;)</li>
                    <li>Locations (e.g., &quot;Maharashtra&quot;, &quot;Telangana&quot;, &quot;Wayanad&quot;)</li>
                    <li>Categories and topics</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

        {isLoading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-5 md:gap-6`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="animate-pulse">
                <Skeleton className="w-full h-48 rounded-lg mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-5 md:gap-6`}>
            {results.map((result) => (
              <StoryCard
                key={result.id}
                title={result.title}
                imageUrl={result.imageUrl}
                slug={result.slug}
                categories={result.categories}
                authors={result.authors.join(', ')}
                localizations={result.localizations}
                location={result.location}
                date={result.date}
                availableLanguages={result.availableLanguages}
                currentLocale={currentLocale}
              />
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && query && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-4">No results found for &quot;{query}&quot;</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Try different keywords or check your spelling</p>
          </div>
        )}

        {/* Pagination Component */}
        <Pagination />

        {/* Pagination Info */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            Showing page {currentPage} of {totalPages} ({totalResults} total results)
          </div>
        )}

        </main>
      </div>
    </div>
  )
}
