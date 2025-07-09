'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import qs from 'qs'

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

export default function SearchPageContent() {
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
              fields: ['Title']
            },
            location: {
              fields: ['name', 'district', 'state']
            }
          },
          fields: ['Title', 'strap', 'slug', 'Original_published_date', 'type'],
          pagination: {
            page: 1,
            pageSize: 20
          }
        }
        
        const queryString = qs.stringify(strapiQuery, { encodeValuesOnly: true })
        const response = await axios.get(`${BASE_URL}api/articles?${queryString}`)
        
        // Transform the response to match our SearchResult interface
        const transformedResults: SearchResult[] = response.data.data.map((item: {
          id: number;
          attributes: {
            Title?: string;
            slug?: string;
            Original_published_date?: string;
            type?: string;
            Cover_image?: { data?: { attributes?: { url: string } } };
            Authors?: { data?: Array<{ attributes: { author_name: { data?: { attributes?: { Name: string } } } } }> };
            categories?: { data?: Array<{ attributes: { Title: string } }> };
            location?: { data?: { attributes?: { name: string; district: string; state: string } } };
          };
        }) => ({
          id: item.id,
          title: item.attributes.Title || '',
          imageUrl: item.attributes.Cover_image?.data?.attributes?.url 
            ? `${BASE_URL}${item.attributes.Cover_image.data.attributes.url}`
            : '/images/placeholder.jpg',
          slug: item.attributes.slug || '',
          categories: item.attributes.categories?.data?.map((cat: { attributes: { Title: string } }) => cat.attributes.Title) || [],
          authors: item.attributes.Authors?.data?.map((author: { attributes: { author_name: { data?: { attributes?: { Name: string } } } } }) =>
            author.attributes.author_name?.data?.attributes?.Name || 'Unknown'
          ) || [],
          location: item.attributes.location?.data?.attributes 
            ? `${item.attributes.location.data.attributes.name}, ${item.attributes.location.data.attributes.district}, ${item.attributes.location.data.attributes.state}`
            : '',
          date: item.attributes.Original_published_date || '',
          type: item.attributes.type || 'article'
        }))
        
        setResults(transformedResults)
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
    
      <main className="max-w-[1232px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          {query && (
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `Found ${results.length} results for "${query}"`}
            </p>
          )}
          {!query && (
            <p className="text-muted-foreground">Enter a search term to find articles</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <StoryCard
                key={result.id}
                title={result.title}
                imageUrl={result.imageUrl}
                slug={result.slug}
                categories={result.categories}
                authors={result.authors.join(', ')}
                location={result.location}
                date={result.date}
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
      </main>
    </div>
  )
}
