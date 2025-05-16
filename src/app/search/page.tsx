'use client'

import { useState, useEffect,  } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'
import { Header } from '@/components/layout/header/Header'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { BASE_URL } from '@/config'

interface SearchResult {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
  categories: string[];
  authors: string[];
  location: string;
  date: string;
  type: string;
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch search results using Strapi
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([])
        setIsLoading(false)
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
              { categories: { Title: { $containsi: query } } }
              
              
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
              fields: ['Title', 'slug']
            },
            location: {
              fields: ['name', 'district', 'state']
            }
          },
          pagination: {
            page: 1,
            pageSize: 50
          },
          sort: ['Original_published_date:desc']
        }
        
        const queryString = qs.stringify(strapiQuery, { 
          encodeValuesOnly: true,
          arrayFormat: 'indices' 
        })
        const response = await axios.get(`${BASE_URL}api/articles?${queryString}`)
        console.log('API response received');
        console.log('Number of articles returned:', response.data.data.length);
        
        // Format the results to match your SearchResult interface
        const formattedResults = response.data.data.map((item: {id: number, attributes: {
          Title?: string;
          slug?: string;
          Original_published_date?: string;
          type?: string;
          location_auto_suggestion?: string;
          Cover_image?: { data?: { attributes?: { url: string } } };
          Authors?: { data?: Array<{ attributes: { author_name: { data?: { attributes?: { Name: string } } } } }> };
          categories?: { data?: Array<{ attributes: { Title: string } }> };
          location?: { data?: { attributes?: { district: string; state: string } } };
        }}) => {

          console.log('Item attributes:', item.attributes);

          const attributes = item.attributes;
          
          // Extract categories
          const categories = attributes.categories?.data?.map((cat: {attributes: {Title: string}}) => 
            cat.attributes.Title
          ) || []
          
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
       
          // Safely extract image URL
          const imageUrl = attributes.Cover_image?.data?.attributes?.url
            ? `${BASE_URL}${attributes.Cover_image.data.attributes.url}`
            : '/images/categories/default.jpg'
          
          // Safely extract location
          const location = attributes.location?.data?.attributes?.district
            ? `${attributes.location.data.attributes.district} ${attributes.location.data.attributes.state}${attributes.location.data.attributes.state ? ', ' + attributes.location.data.attributes.state : ''}`
            : attributes.location_auto_suggestion || 'India'
            console.log('Location:', location);
          
          return {
            id: item.id,
            title: attributes.Title || '',
            imageUrl,
            slug: attributes.slug || '',
            categories,
            authors,
            location,
            date: attributes.Original_published_date
              ? new Date(attributes.Original_published_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                })
              : '',
            type: attributes.type || 'article',
          }
        })
        
        setResults(formattedResults)
      } catch (error) {
        console.error('Error fetching search results:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSearchResults()
  }, [query])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1232px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {query.length ? `Showing results for "${query}"` : 'Enter a search term in the header to find articles'}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <p>Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((result) => (
              <StoryCard
                key={result.id}
                title={result.title}
                imageUrl={result.imageUrl}
                categories={result.categories}
                authors={result.authors.join(', ')}
                slug={result.slug}
                location={result.location}
                date={result.date}
                videoUrl={result.type === 'video' ? 'true' : undefined}
                audioUrl={result.type === 'audio' ? 'true' : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">No results found</h2>
            <p className="text-gray-600 text-center max-w-md">
              We couldn&apos;t find any articles matching your search term.
              Try using different keywords or browse our categories.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

import { Suspense } from 'react'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-[1232px] mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-muted-foreground">Loading search results...</p>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <p>Searching...</p>
          </div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
