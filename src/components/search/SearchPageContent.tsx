'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { languages as languagesList } from '@/data/languages'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchResult {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
  categories: string[];
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
  console.log('##Rohit_Rocks## About to set up useEffect with query dependency:', query)
  console.log('##Rohit_Rocks## FORCE RECOMPILE v2 - Component is definitely running new code')

  // Fetch search results using Strapi
  console.log('##Rohit_Rocks## About to define useEffect, query is:', query)

  // Define fetchSearchResults function outside useEffect so it can be used by pagination
  const fetchSearchResults = useCallback(async (page: number = 1) => {
    console.log('##Rohit_Rocks## fetchSearchResults called with query:', query, 'page:', page)
    if (!query) {
      console.log('##Rohit_Rocks## No query provided, clearing results')
      setResults([])
      setIsLoading(false)
      setTotalResults(0)
      setTotalPages(0)
      return
    }

    try {
      setIsLoading(true)

      // Build query for Strapi
      const strapiQuery = {
        filters: {
          $or: [
            { Title: { $containsi: query } },
            { strap: { $containsi: query } },
            { categories: { Title: { $containsi: query } } },
            { location: { name: { $containsi: query } } },
            { location: { district: { $containsi: query } } },
            { location: { state: { $containsi: query } } },
            { Authors: { author_name: { Name: { $containsi: query } } } }
          ]
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
            fields: ['locale', 'title', 'strap', 'slug']
          }
        },
        fields: ['Title', 'strap', 'slug', 'Original_published_date', 'type', 'locale'],
        pagination: {
          page: page,
          pageSize: pageSize
        }
      }

      const queryString = qs.stringify(strapiQuery, { encodeValuesOnly: true })
      const response = await axios.get(`${BASE_URL}api/articles?${queryString}`)

      console.log('##Rohit_Rocks## Search API Response:', {
        query,
        url: `${BASE_URL}api/articles?${queryString}`,
        resultCount: response.data.data?.length || 0,
        firstResult: response.data.data?.[0] || null,
        pagination: response.data.meta?.pagination
      })

      // Update pagination state
      if (response.data.meta?.pagination) {
        setTotalResults(response.data.meta.pagination.total)
        setTotalPages(response.data.meta.pagination.pageCount)
      }

      // Transform the response to match our SearchResult interface
      const transformedResults: SearchResult[] = response.data.data.map((item: SearchApiItem) => {
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

        const detailedResult = {
          id: item.id,
          title: item.attributes.Title || '',
          imageUrl: item.attributes.Cover_image?.data?.attributes?.url
            ? `${BASE_URL}${item.attributes.Cover_image.data.attributes.url}`
            : '/images/placeholder.jpg',
          slug: item.attributes.slug || '',
          categories: item.attributes.categories?.data?.map((cat: { attributes: { Title: string } }) => cat.attributes.Title) || [],
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
          date: item.attributes.Original_published_date || '',
          type: item.attributes.type || 'article',
          availableLanguages: availableLanguages.length > 0 ? availableLanguages : undefined
        };

        // Determine what type of match this is for detailed results
        const detailedMatchTypes = []
        if (detailedResult.title.toLowerCase().includes(query.toLowerCase())) detailedMatchTypes.push('title')
        if (detailedResult.authors.some((author: string) => author.toLowerCase().includes(query.toLowerCase()))) detailedMatchTypes.push('author')
        if (detailedResult.location.toLowerCase().includes(query.toLowerCase())) detailedMatchTypes.push('location')
        if (detailedResult.categories.some((cat: string) => cat.toLowerCase().includes(query.toLowerCase()))) detailedMatchTypes.push('category')

        console.log('##Rohit_Rocks## Detailed search result item:', {
          title: detailedResult.title,
          authors: detailedResult.authors,
          location: detailedResult.location,
          categories: detailedResult.categories,
          matchTypes: detailedMatchTypes,
          query: query
        })

        return detailedResult;
      })

      setResults(transformedResults)
    } catch (error) {
      console.error('Error fetching search results:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, pageSize])

  // Test useEffect
  useEffect(() => {
    console.log('##Rohit_Rocks## TEST useEffect is working!')
    console.log('##Rohit_Rocks## Query in useEffect:', query)

    // Simple search implementation
    if (query && query.trim()) {
      console.log('##Rohit_Rocks## Making API call for query:', query)
      setIsLoading(true)

      const searchAPI = async (page: number = 1) => {
        try {
          const response = await axios.get(`${BASE_URL}api/articles`, {
            params: {
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
              'fields[0]': 'Title',
              'fields[1]': 'strap',
              'fields[2]': 'slug',
              'fields[3]': 'Original_published_date'
            }
          })

          console.log('##Rohit_Rocks## API Response received:', response.data.data?.length || 0, 'results')
          console.log('##Rohit_Rocks## Pagination info:', response.data.meta?.pagination)

          // Update pagination state
          if (response.data.meta?.pagination) {
            setTotalResults(response.data.meta.pagination.total)
            setTotalPages(response.data.meta.pagination.pageCount)
          }

          if (response.data.data) {
            const searchResults = response.data.data.map((item: SearchApiItem) => {
              // Extract authors using the same logic as the detailed search
              const authors = item.attributes.Authors
                ? 'data' in item.attributes.Authors
                  ? item.attributes.Authors.data?.map((author: AuthorData) =>
                      author.attributes?.author_name?.data?.attributes?.Name || 'PARI'
                    ) || ['PARI']
                  : (item.attributes.Authors as AuthorData[]).map((author: AuthorData) =>
                      author.author_name?.data?.attributes?.Name || 'PARI'
                    )
                : ['PARI']

              const result = {
                id: item.id,
                title: item.attributes.Title || '',
                imageUrl: item.attributes.Cover_image?.data?.attributes?.url
                  ? `${BASE_URL.replace('/v1/', '')}${item.attributes.Cover_image.data.attributes.url}`
                  : '',
                slug: item.attributes.slug || '',
                categories: item.attributes.categories?.data?.map((cat: { attributes: { Title: string } }) => cat.attributes.Title) || [],
                authors: authors,
                localizations: [],
                location: item.attributes.location?.data?.attributes
                  ? `${item.attributes.location.data.attributes.name}, ${item.attributes.location.data.attributes.district}, ${item.attributes.location.data.attributes.state}`
                  : '',
                date: item.attributes.Original_published_date || '',
                type: 'article'
              }

              // Determine what type of match this is
              const matchTypes = []
              if (result.title.toLowerCase().includes(query.toLowerCase())) matchTypes.push('title')
              if (result.authors.some((author: string) => author.toLowerCase().includes(query.toLowerCase()))) matchTypes.push('author')
              if (result.location.toLowerCase().includes(query.toLowerCase())) matchTypes.push('location')
              if (result.categories.some((cat: string) => cat.toLowerCase().includes(query.toLowerCase()))) matchTypes.push('category')

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
        } finally {
          setIsLoading(false)
        }
      }

      searchAPI()
    } else {
      console.log('##Rohit_Rocks## No query, clearing results')
      setResults([])
      setIsLoading(false)
    }
  }, [query, pageSize])


  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect triggered with query:', query, 'type:', typeof query, 'length:', query?.length, 'timestamp:', new Date().toISOString())
    console.log('##Rohit_Rocks## About to call fetchSearchResults function')
    fetchSearchResults(1).catch(error => {
      console.error('##Rohit_Rocks## Error in fetchSearchResults:', error)
    })
  }, [query, fetchSearchResults])

  console.log('##Rohit_Rocks## useEffect has been set up, current query:', query, 'results length:', results.length)

  // Reset to page 1 when query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

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
    const maxVisiblePages = isMobile ? 4 : 9;
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
      <div className="mt-8">
        <div className={`flex items-center justify-center gap-2 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>

          {/* Jump back 5 pages button */}
          {currentPage > 5 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevSet}
              className="text-primary-PARI-Red rounded-2xl"
            >
              Prev 5
            </Button>
          )}
          {/* Previous button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-primary-PARI-Red rounded-2xl mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>


          {/* Page numbers - hide some on very small screens */}
          <div className={`flex flex-wrap justify-center gap-2 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
            {visiblePages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "secondary"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? "bg-primary-PARI-Red text-white rounded-2xl" : "text-primary-PARI-Red rounded-2xl"}
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
            className="text-primary-PARI-Red rounded-2xl ml-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Jump forward 5 pages button */}
          {currentPage + 5 <= totalPages && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNextSet}
              className="text-primary-PARI-Red rounded-2xl"
            >
              Next 5
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
    
      <main className="max-w-[1232px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          {query && (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {isLoading ? 'Searching...' : `Found ${totalResults || results.length} results for "${query}"`}
              </p>
              {!isLoading && results.length > 0 && (
                <div className="text-sm text-muted-foreground">
                
                </div>
              )}
            </div>
          )}
          {!query && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Enter a search term to find articles</p>
              <div className="text-sm text-muted-foreground">
                <p className="mb-1">You can search by:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
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
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
              <p>Searching...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No results found for &quot;{query}&quot;</p>
            <p className="text-sm text-muted-foreground">Try different keywords or check your spelling</p>
          </div>
        )}

        {/* Pagination Component */}
        <Pagination />

        {/* Pagination Info */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing page {currentPage} of {totalPages} ({totalResults} total results)
          </div>
        )}

      </main>
    </div>
  )
}
