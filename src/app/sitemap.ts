import { MetadataRoute } from 'next'
import axios from 'axios'
import qs from 'qs'
import { BASE_URL } from '@/config'

export async function generateSitemaps() {
  try {
    // Query to get the count of articles
    const countQuery = {
      pagination: { pageSize: 1 }
    }
    const countQueryString = qs.stringify(countQuery, { encodeValuesOnly: true })
    const countResponse = await axios.get(`${BASE_URL}api/articles?${countQueryString}`)
    
    const total = countResponse.data?.meta?.pagination?.total || 0
    const sitemapsNeeded = Math.ceil(total / 50000) // Google's limit is 50,000 URLs per sitemap
    
    return Array.from({ length: sitemapsNeeded }, (_, i) => ({ id: i }))
  } catch (error) {
    console.error('Error generating sitemaps:', error)
    return [{ id: 0 }] // Fallback to at least one sitemap
  }
}

export default async function sitemap({ id }: { id: number } = { id: 0 }): Promise<MetadataRoute.Sitemap> {
  // Base URLs for static pages
  const baseUrl = 'https://pari-project.vercel.app'
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/articles`, lastModified: new Date() },
    { url: `${baseUrl}/library`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
  ]

  // Only include static pages in the first sitemap
  if (id !== 0) {
    staticPages.length = 0
  }

  // Try to fetch dynamic article URLs for this sitemap
  let articlePages: { url: string, lastModified: Date, changeFrequency: string, priority: number }[] = []
  try {
    const pageSize = 50000
    const page = id + 1 // Sitemap IDs are 0-based, but pagination is 1-based
    
    // Query for articles for this sitemap chunk
    const query = {
      fields: ['slug', 'updatedAt'],
      pagination: { page, pageSize },
      sort: ['updatedAt:desc']
    }
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const response = await axios.get(`${BASE_URL}api/articles?${queryString}`)
    
    if (response.data?.data) {
      articlePages = response.data.data.map((article: { attributes: { slug: string; updatedAt?: string } }) => ({
        url: `${baseUrl}/articles/${article.attributes.slug}`,
        lastModified: new Date(article.attributes.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7
      }))
    }
  } catch (error) {
    console.error(`Error fetching articles for sitemap ${id}:`, error)
  }

  // Combine static and dynamic pages
  return [...staticPages, ...articlePages]
}
