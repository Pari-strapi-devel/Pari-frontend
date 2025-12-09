'use client'

import { useEffect, useState, } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Skeleton } from '@/components/ui/skeleton'
import { BASE_URL } from '@/config'
import { X,  ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { languages as languagesList } from '@/data/languages';
import { useLocale } from '@/lib/locale'


// Import the getTextDirection function or define it here
export function getTextDirection(locale: string) {
  return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
}

export interface Story {
  audioUrl: string | undefined
  videoUrl: string | undefined
  id: number;
  title: string;
  // description: string;
  imageUrl: string;
  slug: string;
  categories: Array<{ title: string; slug: string }>;
  authors: string[];
  localizations: Array<{ locale: string; title: string; strap: string; slug: string }>;
  location: string;
  date: string;
  type: string;
  isStudentArticle: boolean;
  availableLanguages?: string[]; // Add this property
}

export interface AuthorData {
  attributes?: {
    author_name?: {
      data?: {
        id: number;
        attributes?: {
          Name: string;
          Bio?: string;
          Description?: string;
        };
      };
    };
    author_role?: {
      data?: {
        id: number;
        attributes?: {
          Name: string;
        };
      };
    };
  };
  author_name?: {
    data?: {
      id: number;
      attributes?: {
        Name: string;
        Bio?: string;
        Description?: string;
      };
    };
  };
  author_role?: {
    data?: {
      id: number;
      attributes?: {
        Name: string;
      };
    };
  };
}

export interface AuthorsWrapper {
  data?: AuthorData[];
}

export interface ArticleAttributes {
  location_auto_suggestion: string | undefined
  Title: string;
  Strap?: string;
  strap?: string;
  slug: string;
  Original_published_date?: string;
  type?: string;
  is_student?: boolean;
  locale?: string;
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

export interface ArticleData {
  id: number;
  attributes: ArticleAttributes;
}

export interface LocalizationData {
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
  const { language: currentLocale } = useLocale()
  const textDirection = getTextDirection(currentLocale)
 
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<{
    types?: string[];
    author?: string;
    location?: string[];
    dates?: string[];
    type?: string[];
    content?: string[];
    languages?: string[];
  }>({})
  const [categoryTitles, setCategoryTitles] = useState<Record<string, string>>({})

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Responsive page size - 6 for mobile, 20 for desktop
  const [pageSize, setPageSize] = useState(20)
  
  // Update page size based on screen width
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
    console.log('Current page size:', pageSize);
  }, [pageSize]);
  
  // Get filter parameters from URL
  const types = searchParams?.get('types') || null
  const author = searchParams?.get('author') || null
  const location = searchParams?.get('location') || null
  const dates = searchParams?.get('dates') || null
  const content = searchParams?.get('content') || null
  const languages = searchParams?.get('languages') || null

  // Log author parameter for debugging
  useEffect(() => {
    if (author) {
      console.log('##Rohit_Rocks## Author parameter detected in URL:', author)
      console.log('##Rohit_Rocks## Full URL search params:', searchParams?.toString())
    }
  }, [author, searchParams])
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [types, author, location, dates, content, languages])
  
  // Check if any filters are applied
  const hasActiveFilters = types || author || location || dates || content || languages

  // Parse and set active filters for display
  useEffect(() => {
    const filters: {
      types?: string[];
      author?: string;
      location?: string[];
      dates?: string[];
      type?: string[];
      content?: string[];
      languages?: string[];
    } = {};

    if (types) filters.types = types.split(',');
    if (author) filters.author = author;
    if (location) filters.location = location.split(',');
    if (dates) filters.dates = dates.split(',');
    if (content) filters.content = content.split(',');
    if (languages) filters.languages = languages.split(',');

    setActiveFilters(filters);
  }, [types, author, location, dates, content, languages]);

  // Fetch category titles for the slugs
  useEffect(() => {
    const fetchCategoryTitles = async () => {
      if (!types) return;

      const categorySlugs = types.split(',');
      const titles: Record<string, string> = {};

      try {
        // Fetch all categories
        const response = await axios.get(`${BASE_URL}api/categories`, {
          params: {
            'filters[slug][$in]': categorySlugs,
            'fields[0]': 'Title',
            'fields[1]': 'slug',
            'pagination[limit]': 100
          }
        });

        // Map slugs to titles
        response.data.data.forEach((category: { attributes: { slug: string; Title: string } }) => {
          titles[category.attributes.slug] = category.attributes.Title;
        });

        setCategoryTitles(titles);
      } catch (error) {
        console.error('Error fetching category titles:', error);
        // Fallback: use slugs as titles
        categorySlugs.forEach(slug => {
          titles[slug] = slug;
        });
        setCategoryTitles(titles);
      }
    };

    fetchCategoryTitles();
  }, [types]);

  // Function to clear all filters
  const clearFilters = () => {
    // Remove filters from sessionStorage
    sessionStorage.removeItem('articleFilters')
    // Navigate to articles page without query params
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
    } else if (filterType === 'dates') {
      // For date filters, remove all date filters at once
      params.delete('dates');
      
      // Reset to page 1 when changing filters
      setCurrentPage(1);
    } else if (filterType === 'content' && value) {
      // For content type filters, remove just the specific content type
      const currentContent = params.get('content')?.split(',') || [];
      const updatedContent = currentContent.filter(c => c !== value);
      
      if (updatedContent.length > 0) {
        params.set('content', updatedContent.join(','));
      } else {
        params.delete('content');
      }
    } else if (filterType === 'languages' && value) {
      // For language filters, remove just the specific language
      const currentLanguages = params.get('languages')?.split(',') || [];
      const updatedLanguages = currentLanguages.filter(l => l !== value);
      
      if (updatedLanguages.length > 0) {
        params.set('languages', updatedLanguages.join(','));
      } else {
        params.delete('languages');
      }
      
      // Reset to page 1 when changing filters
      setCurrentPage(1);
    } else {
      // For other filters, remove the entire filter
      params.delete(filterType);
    }
    
    // Preserve locale if it exists
    if (currentLocale && currentLocale !== 'en') {
      params.set('locale', currentLocale);
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
    if (range.startsWith('start:')) {
      const dateStr = range.replace('start:', '');
      if (dateStr) {
        const date = new Date(dateStr);
        return `From: ${date.toLocaleDateString()}`;
      }
    } else if (range.startsWith('end:')) {
      const dateStr = range.replace('end:', '');
      if (dateStr) {
        const date = new Date(dateStr);
        return `To: ${date.toLocaleDateString()}`;
      }
    } else if (range.startsWith('date:')) {
      const dateStr = range.replace('date:', '');
      if (dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      }
    }
    
    switch (range) {
      case '7days': return 'Past 7 days';
      case '14days': return 'Past 14 days';
      case '30days': return 'Past 30 days';
      case '1year': return 'Past 1 year';
      default: return range;
    }
  }

  // Get display name for content type
  const getContentTypeDisplay = (contentType: string): string => {
    switch (contentType) {
      case"all stories":
        return 'All Stories';
      case 'Video Articles':
        return 'Video Articles';
      case 'Audio Articles':
        return 'Audio Articles';
      case 'Student Articles':
        return 'Student Articles';
        case 'Photo Articles':
        return 'Photo Articles';
        case 'Library':
        return 'Library';
        case 'FACES':
        return 'FACES';
      default:
        return contentType;
    }
  }

  // Preserve filters on page reload
  useEffect(() => {
    // This effect runs only once when the component mounts
    
    // Check if this is a page refresh/reload
    const isPageRefresh = window.performance.getEntriesByType('navigation')
      .some((nav) => (nav as PerformanceNavigationTiming).type === 'reload');
    
    if (isPageRefresh) {
      console.log('Page was refreshed - clearing filters');
      // Clear filters from sessionStorage
      sessionStorage.removeItem('articleFilters');
      
      // Redirect to articles page without query params if we have query params
      if (window.location.search) {
        router.replace('/articles');
      }
    }
  }, [router]);

  useEffect(() => {
    // This effect runs when filter params change
    const hasFilters = types || author || location || dates || content;
    
    if (hasFilters) {
      // If we have filters in the URL, store them in sessionStorage
      const filters = { types, author, location, dates, content };
      sessionStorage.setItem('articleFilters', JSON.stringify(filters));
    } else {
      // If we don't have filters in the URL, clear sessionStorage
      sessionStorage.removeItem('articleFilters');
    }
  }, [types, author, location, dates, content]); // Include all dependencies

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
          Original_published_date?: { $gte?: string; $lte?: string };
          location?: { name: { $containsi: string } };
          location_auto_suggestion?: { $containsi: string };
          type?: { $eq: string };
          is_student?: { $eq: boolean };
        } = { $and: [] }
        
        console.log('Starting to build filters with params:', { types, author, location, dates, content, languages });
        
        // Category filters (from types parameter)
        if (types) {
          const categorySlugs = types.split(',')
          filters.categories = {
            slug: {
              $in: categorySlugs
            }
          }
     
          setFilterTitle(`${categorySlugs.join(', ')}`)
        }
        
        // Author filter - using URL parameter approach like search
        if (author) {
          // We'll handle this differently using URL parameters
          setFilterTitle(`Author: ${author}`)
        }
        
        // Place filter
        if (location) {
          filters.location = { name: { $containsi: location } }
        }
        
        // Date range filter
        if (dates) {
          const dateRanges = dates.split(',');
          const today = new Date();
          let startDate: Date | null = null;
          let endDate: Date | null = null;
          
          console.log('Processing date ranges:', dateRanges);
          
          // Process date ranges
          dateRanges.forEach(range => {
            if (range.startsWith('start:')) {
              // Handle start date
              const dateStr = range.replace('start:', '');
              if (dateStr) {
                startDate = new Date(dateStr);
                // Set to start of day
                startDate.setHours(0, 0, 0, 0);
              }
            } else if (range.startsWith('date:')) {
              // Handle date range
              const dateStr = range.replace('date:', '');
              if (dateStr) {
                startDate = new Date(dateStr);
              }
            } else if (range.startsWith('end:')) {
              // Handle end date
              const dateStr = range.replace('end:', '');
              if (dateStr) {
                endDate = new Date(dateStr);
                // Set to end of day
                endDate.setHours(23, 59, 59, 999);
              }
            } else if (range === '7days') {
              // Handle predefined ranges for backward compatibility
              const date = new Date();
              date.setDate(today.getDate() - 7);
              if (!startDate || date < startDate) startDate = date;
            } else if (range === '14days') {
              const date = new Date();
              date.setDate(today.getDate() - 14);
              if (!startDate || date < startDate) startDate = date;
            } else if (range === '30days') {
              const date = new Date();
              date.setDate(today.getDate() - 30);
              if (!startDate || date < startDate) startDate = date;
            } else if (range === '1year') {
              const date = new Date();
              date.setFullYear(today.getFullYear() - 1);
              if (!startDate || date < startDate) startDate = date;
            }
          });
          
          // Build date filter
          if (startDate && endDate) {
            // Between start and end dates
            filters.Original_published_date = {
              $gte: (startDate as Date).toISOString(),
              $lte: (endDate as Date).toISOString()
            };
            console.log('Added date range filter:', filters.Original_published_date);
            setFilterTitle(`Date: ${(startDate as Date).toLocaleDateString()} - ${(endDate as Date).toLocaleDateString()}`);
          } else if (startDate) {
            // Only start date (from this date onwards)
            filters.Original_published_date = {
              $gte: (startDate as Date).toISOString()
            };
            console.log('Added start date filter:', filters.Original_published_date);
            setFilterTitle(`Date: From ${(startDate as Date).toLocaleDateString()}`);
          } else if (endDate) {
            // Only end date (until this date)
            filters.Original_published_date = {
              $lte: (endDate as Date).toISOString()
            };
            console.log('Added end date filter:', filters.Original_published_date);
            setFilterTitle(`Date: Until ${(endDate as Date).toLocaleDateString()}`);
          }
        }
        
        // Content type filter
        if (content) {
          const contentTypes = content.split(',')
          const contentFilters: Array<Record<string, unknown>> = []
          
          console.log('Processing content types:', contentTypes);
          
          contentTypes.forEach(type => {
            if (type === 'Editorials') {
              contentFilters.push({ type: { $eq: 'article' } })
            } else if (type === 'Video Articles') {
              contentFilters.push({ type: { $eq: 'video' } })
            } else if (type === 'Audio Articles') {
              contentFilters.push({ type: { $eq: 'audio' } })
            } else if (type === 'Student Articles') {
              contentFilters.push({ is_student: { $eq: true } })
            }
          })
          
          if (contentFilters.length > 0) {
            // If we have content filters, add them as an $or condition
            filters.$or = contentFilters;
            console.log('Added content filters:', filters.$or);
          }
          
          setFilterTitle(`Content: ${contentTypes.join(', ')}`)
        }
        
        // Language filter
        if (languages) {
          const languageCodes = languages.split(',');
          
          // Get language names for display
          const languageNames = languageCodes.map(code => {
            const language = languagesList.find(lang => lang.code === code);
            return language ? language.name : code;
          });
          
          console.log('Language filter will be applied:', languageCodes);
          setFilterTitle(`Language: ${languageNames.join(', ')}`);
        } else {
          // If no language filter specified, default to current locale
          console.log('No language filter, using current locale:', currentLocale);
        }

        // If multiple filters are applied, set a combined title
        if ([types, author, location, dates, content, languages].filter(Boolean).length > 1) {
          setFilterTitle('Multiple Filters Applied');
        }

        // Clean up filters - remove empty $and array if no filters are applied
        const cleanedFilters: Record<string, unknown> = {}

        if (filters.categories) cleanedFilters.categories = filters.categories
        if (filters.Authors) cleanedFilters.Authors = filters.Authors
        if (filters.Original_published_date) cleanedFilters.Original_published_date = filters.Original_published_date
        if (filters.location) cleanedFilters.location = filters.location
        if (filters.location_auto_suggestion) cleanedFilters.location_auto_suggestion = filters.location_auto_suggestion
        if (filters.type) cleanedFilters.type = filters.type
        if (filters.is_student) cleanedFilters.is_student = filters.is_student
        if (filters.$or) cleanedFilters.$or = filters.$or
        if (filters.$and && filters.$and.length > 0) cleanedFilters.$and = filters.$and

        // Build the query with pagination and sorting by date
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
            },
            type: true,
            is_student: true
          },
          ...(Object.keys(cleanedFilters).length > 0 ? { filters: cleanedFilters } : {}),
          pagination: {
            page: currentPage,
            pageSize: pageSize
          },
          sort: ['Original_published_date:desc']
        };

        // Add detailed logging to help debug
        console.log('Final query structure:', JSON.stringify(query, null, 2));

        try {
          console.log('Sending request to API...');
          
          let allResults: ArticleData[] = [];
          
          if (languages) {
            // If language filter is applied, make a request for each language
            const languageCodes = languages.split(',');
            console.log('Making separate requests for languages:', languageCodes);
            
            // Make a request for each language
            const requests = languageCodes.map(async (langCode) => {
              // Check if the language code is valid before making the request
              // Some languages like Bhojpuri might have custom handling
              const langQuery = { ...query, locale: langCode };
              const queryString = qs.stringify(langQuery, { encodeValuesOnly: true });
              console.log(`Query string for ${langCode}:`, queryString);
              
              try {
                const response = await axios.get(`${BASE_URL}api/articles?${queryString}`);
                console.log(`Response for ${langCode}:`, response.data?.data?.length || 0, 'articles');
                return response.data;
              } catch (error) {
                console.error(`Error fetching articles for language ${langCode}:`, error);
                return { data: [] };
              }
            });
            
            // Wait for all requests to complete
            const responses = await Promise.all(requests);
            
            // Combine results from all languages
            allResults = responses.flatMap(response => response.data || []);
            console.log('Combined results from all languages:', allResults.length);
            
            // Set total pages based on the combined results
            const totalItems = allResults.length;
            setTotalPages(Math.ceil(totalItems / pageSize));
          } else {
            // If no language filter, make a single request with the current locale
            let response;

            if (author) {
              // Use axios params for author filter like search functionality
              console.log('##Rohit_Rocks## Filtering articles by author:', author);
              const params: Record<string, string | number | boolean> = {
                'filters[Authors][author_name][Name][$containsi]': author,
                'pagination[page]': currentPage,
                'pagination[pageSize]': pageSize,
                'populate[Cover_image][fields][0]': 'url',
                'populate[Authors][populate][author_name][fields][0]': 'Name',
                'populate[categories][fields][0]': 'Title',
                'populate[categories][fields][1]': 'slug',
                'populate[location][fields][0]': 'name',
                'populate[location][fields][1]': 'district',
                'populate[location][fields][2]': 'state',
                'populate[localizations][fields][0]': 'locale',
                'populate[localizations][fields][1]': 'title',
                'populate[localizations][fields][2]': 'strap',
                'populate[localizations][fields][3]': 'slug',
                'populate[type]': true,
                'populate[is_student]': true,
                'sort[0]': 'Original_published_date:desc',
                'locale': currentLocale
              };

              console.log('##Rohit_Rocks## Making author filter API call with params:', params);
              response = await axios.get(`${BASE_URL}api/articles`, { params });
              console.log('##Rohit_Rocks## Articles returned for author:', response.data.data?.length || 0);
            } else {
              // Use the existing query structure for other filters
              const queryWithLocale = { ...query, locale: currentLocale };
              const queryString = qs.stringify(queryWithLocale, { encodeValuesOnly: true });
              console.log('Query string sent to API:', queryString);

              response = await axios.get(`${BASE_URL}api/articles?${queryString}`);
            }

            allResults = response.data.data;
            
            // Set total pages from pagination metadata
            if (response.data.meta && response.data.meta.pagination) {
              setTotalPages(response.data.meta.pagination.pageCount || 1);
            }
          }
          
          console.log('Number of articles returned:', allResults.length);

          // Format the results
          const formattedStories = allResults.map((item: ArticleData) => {
            const attributes = item.attributes;

            // Extract authors
            const authors = attributes.Authors
              ? 'data' in attributes.Authors
                ? attributes.Authors.data?.map(
                    (author: AuthorData) =>
                      author.attributes?.author_name?.data?.attributes?.Name || 'PARI'
                  ) || ['PARI']
                : (attributes.Authors as AuthorData[]).map(
                    (author: AuthorData) =>
                      author.author_name?.data?.attributes?.Name || 'PARI'
                  )
              : ['PARI'];

            // Log authors if filtering by author
            if (author) {
              console.log('##Rohit_Rocks## Article:', attributes.Title, '| Authors:', authors.join(', '));
            }
            
            // Extract localizations
            const localizations = attributes.localizations
              ? 'data' in attributes.localizations
                ? attributes.localizations.data?.map(
                    (loc: LocalizationData) => ({
                      locale: loc.attributes?.locale || '',
                      title: loc.attributes?.title || '',
                      strap: loc.attributes?.strap || '',
                      slug: loc.attributes?.slug || ''
                    })
                  ) || []
                : (attributes.localizations as LocalizationData[]).map(
                    (loc: LocalizationData) => ({
                      locale: loc.locale || '',
                      title: loc.title || '',
                      strap: loc.strap || '',
                      slug: loc.slug || ''
                    })
                  )
              : [];
            
            // Determine article type
            let articleType = attributes.type || 'article';
            if (attributes.is_student) {
              articleType = 'student';
            }
            
            // Extract available languages
            const availableLanguages = localizations.map((loc: { locale: string }) => {
              const langCode = loc.locale;
              const language = languagesList.find(lang => lang.code === langCode);
              return language ? language.name : langCode;
            });
            
            // Extract categories with both title and slug
            const categories = attributes.categories?.data?.map(
              (cat: { attributes: { Title: string; slug?: string } }) => ({
                title: cat.attributes.Title,
                slug: cat.attributes.slug || ''
              })
            ) || [];
            
            // Format date
            const date = attributes.Original_published_date
              ? new Date(attributes.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : '';

            return {
              id: item.id,
              title: attributes.Title,
              imageUrl: attributes.Cover_image?.data?.attributes?.url
                ? `${BASE_URL}${attributes.Cover_image.data.attributes.url}`
                : '/images/categories/default.jpg',
              slug: attributes.slug,
              categories,
              authors,
              localizations,
              location: attributes.location?.data?.attributes?.name || attributes.location_auto_suggestion || 'India',
              date,
              videoUrl: articleType === 'video' ? 'true' : undefined,
              audioUrl: articleType === 'audio' ? 'true' : undefined,
              type: articleType,
              isStudentArticle: Boolean(attributes.is_student),
              availableLanguages: availableLanguages.length > 0 ? availableLanguages : [languagesList.find(lang => lang.code === currentLocale)?.name || 'English']
            }
          });

          setStories(formattedStories);
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
  }, [types, author, location, dates, content, languages, currentPage, pageSize, currentLocale])
  
  // Add page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  // Add pagination UI component
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

  // Add state for tracking which article's dropdown is open

  
  // Function to handle language selection for an article
  // Remove this unused function

  return (
    <div className="min-h-screen">
      
      <main className="max-w-[1232px] mx-auto px-4 py-8" dir={textDirection}>
        <div className="mb-8 pl-3">
          <div className={`flex items-center justify-between mb-4 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-4xl font-noto-sans font-bold">Articles</h1>
              {/* Author-specific title */}
              {activeFilters.author && (
                <h2 className="text-xl ml-3 mt-2 font-noto-sans font-semibold text-primary-PARI-Red">
                  Stories by {activeFilters.author}
                </h2>
              )}
            </div>
           
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className={`flex items-center justify-between mb-4 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
             
            </div>
          )}
            <div className={`flex flex-wrap gap-4 mb-4 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
              {activeFilters.types?.map(type => (
                <div key={`type-${type}`} className={`flex items-center ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background rounded-full px-3 py-1 ${currentLocale === 'ur' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm mr-2">{categoryTitles[type] || type}</span>
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
               {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                className="text-primary-PARI-Red font-noto-sans rounded-[48px] hover:bg-primary-PARI-Red hover:text-white border-primary-PARI-Red"
              >
                Clear all filters
              </Button>
            )}
              
              {activeFilters.author && (
                <div className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background  rounded-full px-3 py-1">
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
                <div className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background  rounded-full px-3 py-1">
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
              
              {/* Date filters - show start and end dates in a single chip */}
              {activeFilters.dates && activeFilters.dates.length > 0 && (
                <div className="flex items-center ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background rounded-full px-3 py-1">
                  <span className="text-sm mr-2">
                    {(() => {
                      const startDateStr = activeFilters.dates.find(d => d.startsWith('start:'))?.replace('start:', '');
                      const endDateStr = activeFilters.dates.find(d => d.startsWith('end:'))?.replace('end:', '');
                      
                      if (startDateStr && endDateStr) {
                        const startDate = new Date(startDateStr);
                        const endDate = new Date(endDateStr);
                        return `Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                      } else if (startDateStr) {
                        const startDate = new Date(startDateStr);
                        return `Date: From ${startDate.toLocaleDateString()}`;
                      } else if (endDateStr) {
                        const endDate = new Date(endDateStr);
                        return `Date:  ${endDate.toLocaleDateString()}`;
                      } else {
                        // For predefined ranges
                        const rangeDisplay = activeFilters.dates.map(range => getDateRangeDisplay(range)).join(', ');
                        return `Date: ${rangeDisplay}`;
                      }
                    })()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('dates')}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                </div>
              )}
              
              {activeFilters.content?.map(contentType => (
                <div key={`content-${contentType}`} className="flex items-center  ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background  rounded-full px-3 py-1">
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
              
              {activeFilters.languages?.map(lang => {
                const language = languagesList.find((l) => l.code === lang);
                return (
                  <div key={`language-${lang}`} className="flex items-center ring-1 text-primary-PARI-Red ring-primary-PARI-Red bg-background rounded-full px-3 py-1">
                    <span className="text-sm mr-2">Language: {language?.name || lang}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearFilter('languages', lang)}
                      className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20"
                    >
                      <X className="h-3 w-3 text-primary-PARI-Red" />
                    </Button>
                  </div>
                );
              })}
            </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: pageSize > 12 ? 12 : pageSize }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {/* Image skeleton */}
                <Skeleton className="w-full aspect-[4/3] rounded-lg mb-4" />

                {/* Category tags skeleton */}
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Title skeleton */}
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-4/5 mb-3" />

                {/* Author skeleton */}
                <Skeleton className="h-4 w-3/5 mb-2" />

                {/* Location and date skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${currentLocale === 'ur' ? 'rtl' : 'ltr'}`}>
            {stories.map((story: Story) => {
              // Get available languages from localizations
              const availableLanguages = story.localizations?.map(loc => {
                const langCode = loc.locale;
                const language = languagesList.find(lang => lang.code === langCode);
                return {
                  code: langCode,
                  name: language?.name || langCode,
                  slug: loc.slug
                };
              }) || [];
              
              // Add current language if not in localizations
              const hasCurrentLocale = availableLanguages.some(lang => lang.code === currentLocale);
              if (!hasCurrentLocale && story.slug) {
                const currentLanguage = languagesList.find(lang => lang.code === currentLocale);
                if (currentLanguage) {
                  availableLanguages.unshift({
                    code: currentLocale,
                    name: currentLanguage.name,
                    slug: story.slug
                  });
                }
              }
              
              return (
                <div key={story.id} className="relative">
                  <StoryCard
                    title={story.title}
                    authors={Array.isArray(story.authors) ? story.authors.join(', ') : story.authors}
                    imageUrl={story.imageUrl}
                    categories={story.categories}
                    slug={story.slug}
                    localizations={story.localizations}
                    location={story.location}
                    date={story.date}
                    videoUrl={story.videoUrl}
                    audioUrl={story.audioUrl}
                    isStudentArticle={story.isStudentArticle}
                    className={currentLocale === 'ur' ? 'text-right' : 'text-left'}
                    availableLanguages={availableLanguages}
                    currentLocale={currentLocale}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-noto-sans font-semibold mb-4">No articles found</h2>
            <p className="text-gray-600 text-center max-w-md">
              We couldn&apos;t find any articles matching your selected filters. 
              Try adjusting your filters or browse our categories.
            </p>
            {hasActiveFilters && (
              <Button 
                variant="secondary"
                className="mt-4 bg-primary-PARI-Red font-noto-sans rounded-[48px] text-white hover:bg-primary-PARI-Red/80"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
        
        <Pagination />
      </main>
    </div>
  )
}

function setFilterTitle(title: string) {
  console.log('Filter title set:', title)
}
