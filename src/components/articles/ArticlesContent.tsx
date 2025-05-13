'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Header } from '@/components/layout/header/Header'
import { BASE_URL } from '@/config'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'


interface Story {
  audioUrl: string | undefined
  videoUrl: string | undefined
  id: number;
  title: string;
  // description: string;
  imageUrl: string;
  slug: string;
  categories: string[];
  authors: string[];
  localizations: Array<{ locale: string; title: string; strap: string; slug: string }>;
  location: string;
  date: string;
  type: string; 
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
  };
  author_name?: {
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

interface ArticleAttributes {
  location_auto_suggestion: string | undefined
  Title: string;
  Strap?: string;
  strap?: string;
  slug: string;
  Original_published_date?: string;
  type?: string;
  Cover_image?: {
    data?: {
      attributes?: {
        url: string;
      };
    };
  };
  Authors?: AuthorsWrapper | AuthorData[];
  categories?: {
    data?: Array<{
      attributes: {
        Title: string;
        slug?: string;
      };
    }>;
  };
  location?: {
    data?: {
      attributes?: {
        name?: string;
        district?: string;
        state?: string;
      };
    };
  };
  localizations?: {
    data?: Array<{
      attributes?: {
        locale: string;
        title: string;
        strap: string;
        slug: string;
      };
    }>;
  } | Array<{
    locale: string;
    title: string;
    strap: string;
    slug: string;
  }>;
}

interface ArticleData {
  id: number;
  attributes: ArticleAttributes;
}

interface LocalizationData {
  attributes?: {
    locale: string;
    title: string;
    strap: string;
    slug: string;
  };
  locale?: string;
  title?: string;
  strap?: string;
  slug?: string;
}

export default function ArticlesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
 
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<{
    types?: string[];
    author?: string;
    location?: string[];
    dates?: string[];
    type?: string[];
    content?: string[];
  }>({})

  // Get filter parameters from URL
  const types = searchParams?.get('types') || null
  const author = searchParams?.get('author') || null
  const location = searchParams?.get('location') || null
  const dates = searchParams?.get('dates') || null
  const content = searchParams?.get('content') || null

  // Check if any filters are applied
  const hasActiveFilters = types || author || location || dates || content

  // Parse and set active filters for display
  useEffect(() => {
    const filters: {
      types?: string[];
      author?: string;
      location?: string[];
      dates?: string[];
      type?: string[];
      content?: string[];
    } = {};

    if (types) filters.types = types.split(',');
    if (author) filters.author = author;
    if (location) filters.location = location.split(',');
    if (dates) filters.dates = dates.split(',');
    if (content) filters.content = content.split(',');

    setActiveFilters(filters);
  }, [types, author, location, dates, content]);

  // Function to clear all filters
  const clearFilters = () => {
    sessionStorage.removeItem('articleFilters')
    router.push('/articles')
  }

  // Function to clear a specific filter
  const clearFilter = (filterType: string, value?: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (filterType === 'types' && value) {
      // For category filters, remove just the specific category
      const currentTypes = params.get('types')?.split(',') || [];
      const updatedTypes = currentTypes.filter(t => t !== value);
      
      if (updatedTypes.length > 0) {
        params.set('types', updatedTypes.join(','));
      } else {
        params.delete('types');
      }
    } else if (filterType === 'dates' && value) {
      // For date filters, remove just the specific date range
      const currentDates = params.get('dates')?.split(',') || [];
      const updatedDates = currentDates.filter(d => d !== value);
      
      if (updatedDates.length > 0) {
        params.set('dates', updatedDates.join(','));
      } else {
        params.delete('dates');
      }
    } else if (filterType === 'content' && value) {
      // For content type filters, remove just the specific content type
      const currentContent = params.get('content')?.split(',') || [];
      const updatedContent = currentContent.filter(c => c !== value);
      
      if (updatedContent.length > 0) {
        params.set('content', updatedContent.join(','));
      } else {
        params.delete('content');
      }
    } else {
      // For other filters, remove the entire filter
      params.delete(filterType);
    }
    
    // Update sessionStorage with new filters
    const newFilters = {
      types: params.get('types') || null,
      author: params.get('author') || null,
      location: params.get('location') || null,
      dates: params.get('dates') || null,
      content: params.get('content') || null
    };
    
    sessionStorage.setItem('articleFilters', JSON.stringify(newFilters));
    
    // Navigate to the new URL
    const newSearchParams = params.toString();
    router.push(newSearchParams ? `/articles?${newSearchParams}` : '/articles');
  }

  // Get display name for date range
  const getDateRangeDisplay = (range: string) => {
    switch (range) {
      case '7days': return 'Past 7 days';
      case '14days': return 'Past 14 days';
      case '30days': return 'Past 30 days';
      case '1year': return 'Past 1 year';
      default: return range;
    }
  }

  // Get display name for content type
  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'Editorials': return 'Editorials';
      case 'Video Articles': return 'Video Articles';
      case 'Audio Articles': return 'Audio Articles';
      case 'Student Articles': return 'Student Articles';
      default: return type;
    }
  }

  // Preserve filters on page reload
  useEffect(() => {
    // This effect only runs on initial mount
    const hasFilters = types || author || location || dates || content;
    
    if (hasFilters) {
      // If we have filters in the URL, store them in sessionStorage
      const filters = { types, author, location, dates, content };
      sessionStorage.setItem('articleFilters', JSON.stringify(filters));
    } else {
      // If we don't have filters in the URL but have them in sessionStorage, restore them
      const storedFilters = sessionStorage.getItem('articleFilters');
      
      if (storedFilters) {
        try {
          const parsedFilters = JSON.parse(storedFilters);
          
          // Build new URL with stored filters
          const params = new URLSearchParams();
          if (parsedFilters.types) params.set('types', parsedFilters.types);
          if (parsedFilters.author) params.set('author', parsedFilters.author);
          if (parsedFilters.location) params.set('location', parsedFilters.location);
          if (parsedFilters.dates) params.set('dates', parsedFilters.dates);
          if (parsedFilters.content) params.set('content', parsedFilters.content);
          
          // Only redirect if we have filters to restore
          if (params.toString()) {
            // Use router.push instead of window.location for better Next.js integration
            router.push(`/articles?${params.toString()}`);
          }
        } catch (error) {
          console.error('Error restoring filters:', error);
          sessionStorage.removeItem('articleFilters');
        }
      }
    }
  }, [types, author, location, dates, content, router]); // Include all dependencies

  useEffect(() => {
    const fetchFilteredStories = async () => {
      try {
        setIsLoading(true)
        
        // Build filter query based on URL parameters
        const filters: {
          $and: Array<Record<string, unknown>>
          $or?: Array<Record<string, unknown>>
          categories?: { slug: { $in: string[] } };
          Authors?: { author_name: { Name: { $containsi: string } } };
          Original_published_date?: { $gte: string };
          location?: { name: { $containsi: string }} | { district: { $containsi: string }} | { state: { $containsi: string }};
          location_auto_suggestion?: { $containsi: string };
          type?: { $eq: string };
          is_student_article?: { $eq: boolean };
        } = { $and: [] }
        
        console.log('Starting to build filters with params:', { types, author, location, dates, content });
        
        // Category filters (from types parameter)
        if (types) {
          const categorySlugs = types.split(',')
          filters.categories = {
            slug: {
              $in: categorySlugs
            }
          }
          console.log('Added category filter:', filters.categories);
          setFilterTitle(`Category: ${categorySlugs.join(', ')}`)
        }
        
        // Author filter
        if (author) {
          filters.Authors = {
            author_name: {
              Name: {
                $containsi: author
              }
            }
          }
          console.log('Added author filter:', filters.Authors);
          setFilterTitle(`Author: ${author}`)
        }
        
        // Place filter
        if (location) {
          filters.$or = [
            { 'location.data.attributes.name': { $containsi: location } },
            { 'location.data.attributes.district': { $containsi: location } },
            { 'location.data.attributes.state': { $containsi: location } },
            { location_auto_suggestion: { $containsi: location } }
          ];
        }
        
        // Date range filter
        if (dates) {
          const dateRanges = dates.split(',')
          const today = new Date()
          let oldestDate = new Date()
          
          console.log('Processing date ranges:', dateRanges);
          
          // Find the oldest date in the selected ranges
          dateRanges.forEach(range => {
            if (range === '7days') {
              const date = new Date()
              date.setDate(today.getDate() - 7)
              if (date < oldestDate) oldestDate = date
            } else if (range === '14days') {
              const date = new Date()
              date.setDate(today.getDate() - 14)
              if (date < oldestDate) oldestDate = date
            } else if (range === '30days') {
              const date = new Date()
              date.setDate(today.getDate() - 30)
              if (date < oldestDate) oldestDate = date
            } else if (range === '1year') {
              const date = new Date()
              date.setFullYear(today.getFullYear() - 1)
              if (date < oldestDate) oldestDate = date
            }
          })
          
          filters.Original_published_date = {
            $gte: oldestDate.toISOString()
          }
          console.log('Added date filter:', filters.Original_published_date);
          setFilterTitle(`Date: Past ${dateRanges.join(', ')}`)
        }
        
        // Content type filter
        if (content) {
          const contentTypes = content.split(',')
          const contentFilters: Array<{ type?: { $eq: string }; is_student_article?: { $eq: boolean } }> = []
          
          console.log('Processing content types:', contentTypes);
          
          contentTypes.forEach(type => {
            if (type === 'Editorials') {
              contentFilters.push({ type: { $eq: 'article' } })
            } else if (type === 'Video Articles') {
              contentFilters.push({ type: { $eq: 'video' } })
            } else if (type === 'Audio Articles') {
              contentFilters.push({ type: { $eq: 'audio' } })
            } else if (type === 'Student Articles') {
              contentFilters.push({ is_student_article: { $eq: true } })
            }
          })
          
          if (contentFilters.length > 0) {
            // If filters.$or already exists, add contentFilters to it
            // Otherwise, create a new $or array with contentFilters
            if (filters.$or) {
              filters.$or = [...filters.$or, ...contentFilters];
            } else {
              filters.$or = contentFilters;
            }
            console.log('Added content filters:', filters.$or);
          }
          
          setFilterTitle(`Content: ${contentTypes.join(', ')}`)
        }
        
        // If multiple filters are applied, set a combined title
        if ([types, author, location, dates, content].filter(Boolean).length > 1) {
          setFilterTitle('Multiple Filters Applied');
        }
        
        // Build the query
        const query = {
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
              fields: ['Title', 'slug']
            },
            location: {
              fields: ['name', 'district', 'state']
            },
            localizations: {
              fields: ['locale', 'title', 'strap', 'slug']
            }
          },
          filters
        };
        
        // Log the final query for debugging
        console.log('Final query structure:', JSON.stringify(query, null, 2));
        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        console.log('Query string sent to API:', queryString);
        
        try {
          console.log('Sending request to API...');
          const response = await axios.get(`${BASE_URL}api/articles?${queryString}`);
          console.log('API response received');
          console.log('Number of articles returned:', response.data.data.length);
          
          // Debug: Check if any articles were returned
          if (response.data.data.length === 0) {
            console.log('No articles found with the current filters');
            console.log('Current filters:', JSON.stringify(filters, null, 2));
            
            // If location filter is active, try a test query without it
            if (location) {
              console.log('Testing query without location filter to check data exists');
              const testQuery = { ...query };
              // Remove location filter from test query
              if (testQuery.filters) {
                delete testQuery.filters.$or;
              }
              const testQueryString = qs.stringify(testQuery, { encodeValuesOnly: true });
              try {
                const testResponse = await axios.get(`${BASE_URL}api/articles?${testQueryString}`);
                console.log('Test query without location returned:', testResponse.data.data.length, 'articles');
              } catch (error) {
                console.error('Test query failed:', error);
              }
            }
          }
          
          // Format the stories
          const formattedStories = response.data.data.map((item: ArticleData) => {
            const attributes = item.attributes
            
            // Extract localizations if they exist
            const localizationsData = Array.isArray(attributes.localizations) 
            ? attributes.localizations 
            : (attributes.localizations?.data || []);

            const localizations = localizationsData.map(
              (loc: LocalizationData) => ({
                locale: loc.attributes?.locale || loc.locale || '',
                title: loc.attributes?.title || loc.title || '',
                strap: loc.attributes?.strap || loc.strap || '',
                slug: loc.attributes?.slug || loc.slug || ''
              })
            );
            
            // Extract authors
            let authors: string[] = ['PARI'];
            
            // Handle different Authors data structures
            const authorsData = attributes.Authors;
            if (authorsData) {
              if ('data' in authorsData && Array.isArray(authorsData.data)) {
                // Handle case where Authors is { data: [...] }
                authors = authorsData.data.map(author => {
                  const name = author?.attributes?.author_name?.data?.attributes?.Name;
                  return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI';
                });
              } else if (Array.isArray(authorsData)) {
                // Handle case where Authors is an array directly
                authors = authorsData.map(author => {
                  const name = author?.author_name?.data?.attributes?.Name;
                  return name && typeof name === 'string' && name.trim().length > 0 ? name : 'PARI';
                });
              }
            }
            
            // Extract categories
            const categories = attributes.categories?.data?.map(
              (cat: { attributes: { Title: string } }) => cat.attributes.Title
            ) || []
            
            // Format location
         
            const location = attributes.location?.data?.attributes?.name;
            if (location) {
              filters.$and.push({
                $or: [
                  { 'location.data.attributes.name': { $containsi: location } },
                  { 'location.data.attributes.district': { $containsi: location } },
                  { 'location.data.attributes.state': { $containsi: location } },
                  { location_auto_suggestion: { $containsi: location } }
                ]
              });
            }
            
            // Format date
            const date = attributes.Original_published_date
              ? new Date(attributes.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : ''
            
            // Explicitly check the Type field and set content type flags
            const articleType = attributes.type?.toLowerCase() || '';

            return {
              id: item.id,
              title: attributes.Title,
              // description: attributes.Strap || attributes.strap || '',
              imageUrl: attributes.Cover_image?.data?.attributes?.url
                ? `${BASE_URL}${attributes.Cover_image.data.attributes.url}`
                : '/images/categories/default.jpg',
              slug: attributes.slug,
              categories,
              authors,
              localizations,
              location: location,
              date,
              videoUrl: articleType.includes('video') ? 'true' : undefined,
              audioUrl: articleType.includes('audio') ? 'true' : undefined,
              type: articleType
            }
          })
          
          setStories(formattedStories)
        } catch (error) {
          console.error('API request failed:', error);
          if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            console.error('Request config:', error.config);
          }
          setStories([]);
        }
      } catch (error) {
        console.error('Error in fetchFilteredStories:', error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFilteredStories()
  }, [types, author, location, dates, content])
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[1232px] mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl ml-3 font-bold">Articles</h1>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-primary-PARI-Red rounded-[48px] hover:bg-primary-PARI-Red hover:text-white border-primary-PARI-Red "
              >
                Clear All Filters
              </Button>
            )}
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary-PARI-Red" />
                <h2 className="text-lg font-semibold">Active Filters: </h2>
              </div>
            </div>
          )}
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.types?.map(type => (
                <div key={`type-${type}`} className="flex items-center ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <span className="text-sm mr-2"> {type}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('types', type)}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              ))}
              
              {activeFilters.author && (
                <div className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <span className="text-sm mr-2">{activeFilters.author}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('author')}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              )}
              
              {activeFilters.location && (
                <div className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <span className="text-sm mr-2"> {activeFilters.location.join(', ')}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('location')}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              )}
              
              {activeFilters.dates?.map(dateRange => (
                <div key={`date-${dateRange}`} className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <span className="text-sm mr-2">Date: {getDateRangeDisplay(dateRange)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('dates', dateRange)}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              ))}
              
              {activeFilters.content?.map(contentType => (
                <div key={`content-${contentType}`} className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <span className="text-sm mr-2">Content: {getContentTypeDisplay(contentType)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('content', contentType)}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              ))}
            </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <p>Loading articles...</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stories.map((story: Story) => (
              <StoryCard
                key={story.id}
                title={story.title}
                // description={story.description}
                authors={Array.isArray(story.authors) ? story.authors.join(', ') : story.authors}
                imageUrl={story.imageUrl}
                categories={story.categories}
                slug={story.slug}
                location={story.location}
                date={story.date}
                localizations={story.localizations}
                videoUrl={story.type === 'video' ? 'true' : undefined}
                audioUrl={story.type === 'audio' ? 'true' : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">No articles found</h2>
            <p className="text-gray-600 text-center max-w-md">
              We couldn&apos;t find any articles matching your selected filters. 
              Try adjusting your filters or browse our categories.
            </p>
            {hasActiveFilters && (
              <Button 
                variant="secondary"
                className="mt-4 bg-primary-PARI-Red rounded-[48px] text-white hover:bg-primary-PARI-Red/80"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function setFilterTitle(title: string) {
  console.log('Filter title set:', title)
}
