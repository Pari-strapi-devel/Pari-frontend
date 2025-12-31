import { Metadata } from 'next'
import { BASE_URL } from '@/config'
import { API_BASE_URL } from '@/utils/constants'
import axios from 'axios'
import qs from 'qs'

interface DraftLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

// Fetch draft article localizations for SEO tags
async function getDraftLocalizations(slug: string): Promise<string[]> {
  try {
    const query = {
      filters: {
        slug: {
          $eq: slug
        }
      },
      publicationState: 'preview', // Include draft articles
      populate: {
        localizations: {
          fields: ['locale']
        }
      },
      fields: ['locale']
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`

    const response = await axios.get(apiUrl)

    if (response.data?.data?.[0]) {
      const article = response.data.data[0]
      const currentLocale = article.attributes.locale || 'en'

      // Get all localization locales
      const localizationsData = article.attributes.localizations?.data || []
      const localizationLocales = localizationsData.map((loc: { attributes: { locale: string } }) => loc.attributes.locale)

      // Return current locale + all localizations
      return [currentLocale, ...localizationLocales]
    }
  } catch (error) {
    console.error('Error fetching draft localizations:', error)
  }

  // Default to English only
  return ['en']
}

// Generate metadata for the draft page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    // Fetch draft article data for metadata
    const query = {
      filters: {
        slug: {
          $eq: slug
        }
      },
      publicationState: 'preview', // Include draft articles
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
      
      const title = attrs.Title || 'Draft - PARI'
      const description = attrs.Strap || 'Draft story from rural India'
      const coverImageUrl = attrs.Cover_image?.data?.attributes?.url
      const imageUrl = coverImageUrl
        ? `${API_BASE_URL}${coverImageUrl}`
        : 'https://ruralindiaonline.org/images/header-logo/For-dark-mode/pari-english-dark.png'

      return {
        title: `[Draft] ${title} - PARI`,
        description,
        robots: {
          index: false, // Don't index draft pages
          follow: false,
        },
        openGraph: {
          title: `[Draft] ${title}`,
          description,
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
      }
    }
  } catch (error) {
    console.error('Error fetching draft metadata:', error)
  }

  // Fallback metadata
  return {
    title: '[Draft] - PARI',
    description: 'Draft story from rural India',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function DraftLayout({ children, params }: DraftLayoutProps) {
  const { slug } = await params

  // Fetch available languages for this draft article
  const availableLanguages = await getDraftLocalizations(slug)
  
  // Log for debugging
  console.log('##Rohit_Rocks## Draft page loaded for slug:', slug, 'with languages:', availableLanguages)

  return <>{children}</>
}

