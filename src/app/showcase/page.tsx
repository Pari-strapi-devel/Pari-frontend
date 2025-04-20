"use client"

import { ArticleCard } from '@/components/ui/ArticleCard'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { AudioVideoBigCard } from '@/components/layout/audioVideo/AudioVideoBigCard'
import { LanguageToggle } from '../../components/layout/header/LanguageToggle'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'

interface Article {
  id: number;
  attributes: {
    Title: string;
    Strap: string;
    slug: string;
    location?: string;
    date?: string;
    Cover_image?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface MediaContent {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'audio' | 'video';
  duration: string;
  categories: string[];
  slug: string;
  languages: string[];
  location: string;
  date: string;
}

interface Story {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  slug: string;
  authors: string | string[];
  location: string;
  date: string;
}

interface ApiStory {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Cover_image?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
    Categories?: string;
    slug: string;
    Authors?: string;
    Location?: string;
    PublishedDate?: string;
  };
}

interface ApiMediaContent {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Type?: string;
    Duration?: string;
    Categories?: string;
    slug: string;
    Languages?: string;
    Location?: string;
    PublishedDate?: string;
    Thumbnail?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ur', name: 'اردو' },
  
]

const getTextDirection = (langCode: string) => {
  // Languages that need RTL
  const rtlLanguages = ['ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
};

export default function ShowcasePage() {

  const { language, setLanguage } = useLocale()


  const [activeSection, setActiveSection] = useState<'articles' | 'stories' | 'media'>('articles')
  const [showExplanation, setShowExplanation] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [mediaContent, setMediaContent] = useState<MediaContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${BASE_URL}api/articles`, {  
          params: {
            'pagination[withCount]': false,
            locale:language,
            'populate[Cover_image]': true,
          }
        })
        
        setArticles(response.data.data)
        setLoading(false)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error('Error fetching articles:', err.message)
          setError(err.response?.status === 404 
            ? 'Articles not found' 
            : 'Failed to fetch articles')
        } else {
          console.error('Error fetching articles:', err)
          setError('Failed to fetch articles')
        }
        setLoading(false)
      }
    }

    const fetchStories = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${BASE_URL}api/articles`, {  // Changed from 'api/articles' to 'api/stories'
          params: {
            'pagination[withCount]': false,
            locale:language,
            'populate[Cover_image]': true,
          }
        })
        
        const formattedStories = response.data.data.map((story: ApiStory) => ({
          id: story.id,
          title: story.attributes.Title,
          description: story.attributes.Description,
          imageUrl: story.attributes.Cover_image?.data?.attributes?.url
            ? story.attributes.Cover_image.data.attributes.url.startsWith('http')
              ? story.attributes.Cover_image.data.attributes.url
              : `${BASE_URL}${story.attributes.Cover_image.data.attributes.url}`
            : "/images/categories/default.jpg",
          categories: story.attributes.Categories?.split(',') || ["Rural India"],
          slug: story.attributes.slug,
          authors: story.attributes.Authors?.split(',') || ["PARI"],
          location: story.attributes.Location || "India",
          date: story.attributes.PublishedDate ,
        }))
        
        setStories(formattedStories)
        setLoading(false)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error('Error fetching stories:', err.message)
          setError(err.response?.status === 404 
            ? 'Stories not found' 
            : 'Failed to fetch stories')
        } else {
          console.error('Error fetching stories:', err)
          setError('Failed to fetch stories')
        }
        setLoading(false)
        setStories([]) // Reset stories on error
      }
    }

    const fetchMediaContent = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          'https://beta.ruralindiaonline.org/v1/api/articles', {
          params: {
            'pagination[withCount]': true,
            'populate': 'video',
            locale: language
          }
        })
        
        const formattedMedia = response.data.data.map((media: ApiMediaContent) => ({
          id: media.id,
          title: media.attributes.Title,
          description: media.attributes.Description,
          imageUrl: media.attributes.Thumbnail?.data?.attributes?.url
            ? media.attributes.Thumbnail.data.attributes.url.startsWith('http')
              ? media.attributes.Thumbnail.data.attributes.url
              : `${BASE_URL}${media.attributes.Thumbnail.data.attributes.url}`
            : "/images/categories/default.jpg",
          type: media.attributes.Type || "video",
          duration: media.attributes.Duration || "00:00",
          categories: media.attributes.Categories?.split(',') || ["Rural India"],
          slug: media.attributes.slug,
          languages: media.attributes.Languages?.split(',') || ["English"],
          location: media.attributes.Location || "India",
          date: media.attributes.PublishedDate || new Date().toISOString()
        }))
        
        setMediaContent(formattedMedia)
        setLoading(false)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error('Error fetching media content:', err.message)
          setError(err.response?.status === 404 
            ? 'Media content not found' 
            : 'Failed to fetch media content')
        } else {
          console.error('Error fetching media content:', err)
          setError('Failed to fetch media content')
        }
        setLoading(false)
        setMediaContent([]) // Reset media content on error
      }
    }

    switch (activeSection) {
      case 'articles':
        fetchArticles()
        break
      case 'stories':
        fetchStories()
        break
      case 'media':
        fetchMediaContent()
        break
    }
  }, [language, activeSection])

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
  }

  const formatArticleData = (article: Article) => {
    const imageUrl = article.attributes.Cover_image?.data?.attributes?.url;
    const direction = getTextDirection(language);
    
    return {
      title: article.attributes.Title,
      description: article.attributes.Strap,
      imageUrl: imageUrl 
        ? imageUrl.startsWith('http') 
          ? imageUrl 
          : `${BASE_URL}${imageUrl}`
        : "/images/categories/default.jpg",
      categories: ["Rural India"],
      slug: article.attributes.slug,
      authors: ["PARI"],
      location: article.attributes.location || "India",
      date: article.attributes.date ,
      readMore: "Read full article",
      direction: direction
    }
  }

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-col gap-4">
          {/* Explanation Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="font-noto-sans text-sm h-[32px] text-red-700 hover:bg-red-50 p-0"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              What is PARI?
            </Button>
            {showExplanation && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="font-noto-sans text-sm text-gray-700">
                  PARI (Peoples Archive of Rural India) is a digital journalism platform that brings stories about rural India to a global audience. We document and showcase the diversity, complexity, and vibrancy of rural India through articles, photos, videos, and audio content.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="outline"
                      className={`h-8 px-3 text-sm ${
                        language === lang.code 
                          ? 'bg-red-700 text-white hover:bg-red-800' 
                          : 'text-red-700 hover:bg-red-50 hover:text-red-800'
                      }`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
          {/* Section Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline" 
              className={`font-noto-sans text-sm h-[32px] rounded-[48px] ${
                activeSection === 'articles'
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'text-red-700 hover:bg-red-50'
              }`}
              onClick={() => setActiveSection('articles')}
            >
              Articles
            </Button>
            <Button
              variant="outline" 
              className={`font-noto-sans text-sm h-[32px] rounded-[48px] ${
                activeSection === 'stories'
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'text-red-700 hover:bg-red-50'
              }`}
              onClick={() => setActiveSection('stories')}
            >
              Stories
            </Button>
            <Button
              variant="outline" 
              className={`font-noto-sans text-sm h-[32px] rounded-[48px] ${
                activeSection === 'media'
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'text-red-700 hover:bg-red-50'
              }`}
              onClick={() => setActiveSection('media')}
            >
              Media
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        {/* Articles Section */}
        {activeSection === 'articles' && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold">Featured Articles</h2>
               
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {articles.map((article) => {
                const formattedData = formatArticleData(article);
                return (
                  <div 
                    key={article.id} 
                    className={`${language === 'ur' ? 'text-right' : 'text-left'}`}
                    dir={getTextDirection(language)}
                  >
                    <ArticleCard {...formattedData} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Stories Section */}
        {activeSection === 'stories' && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold">Featured Stories</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div 
                  key={story.id}
                  className={`${language === 'ur' ? 'text-right' : 'text-left'}`}
                  dir={getTextDirection(language)}
                >
                  <StoryCard 
                    {...story} 
                    authors={typeof story.authors === 'string' ? story.authors : Array.isArray(story.authors) ? story.authors.join(', ') : 'PARI'}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audio/Video Section */}
        {activeSection === 'media' && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold">Media Content</h2>
              </div>
            </div>
            <div className="grid grid-cols-1  gap-6">
              {mediaContent.map((media) => (
                <div 
                  key={media.id}
                  className={`${language === 'ur' ? 'text-right' : 'text-left'}`}
                  dir={getTextDirection(language)}
                >
                  <AudioVideoBigCard {...media} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <LanguageToggle />
    </div>
  )
}
