import { Metadata } from 'next'
import { BASE_URL } from '@/config'
import { API_BASE_URL } from '@/utils/constants'
import axios from 'axios'
import qs from 'qs'

interface ArticleLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

// Generate metadata for the article page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    // Fetch article data for metadata
    const query = {
      filters: {
        slug: {
          $eq: slug
        }
      },
      populate: {
        Cover_image: {
          fields: ['url', 'alternativeText']
        }
      },
      fields: ['Title', 'Strap', 'slug']
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`
    
    const response = await axios.get(apiUrl)
    
    if (response.data?.data?.[0]) {
      const article = response.data.data[0]
      const attrs = article.attributes
      
      const title = attrs.Title || 'PARI - People\'s Archive of Rural India'
      const description = attrs.Strap || 'Stories from rural India'
      const coverImageUrl = attrs.Cover_image?.data?.attributes?.url
      const imageUrl = coverImageUrl 
        ? `${API_BASE_URL}${coverImageUrl}`
        : 'https://pari-project.vercel.app/images/header-logo/For-dark-mode/pari-english-dark.png'
      
      const articleUrl = `https://pari-project.vercel.app/article/${slug}`

      return {
        title: `${title} - PARI`,
        description,
        openGraph: {
          title,
          description,
          url: articleUrl,
          siteName: 'PARI - People\'s Archive of Rural India',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            }
          ],
          locale: 'en_US',
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
      }
    }
  } catch (error) {
    console.error('Error fetching article metadata:', error)
  }

  // Fallback metadata
  return {
    title: 'PARI - People\'s Archive of Rural India',
    description: 'Stories from rural India',
    openGraph: {
      title: 'PARI - People\'s Archive of Rural India',
      description: 'Stories from rural India',
      siteName: 'PARI - People\'s Archive of Rural India',
      images: [
        {
          url: 'https://pari-project.vercel.app/images/header-logo/For-dark-mode/pari-english-dark.png',
          width: 1200,
          height: 630,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'PARI - People\'s Archive of Rural India',
      description: 'Stories from rural India',
    },
  }
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return <>{children}</>
}

