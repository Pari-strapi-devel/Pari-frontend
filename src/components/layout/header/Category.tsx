
import { useEffect, useState } from 'react'
import { LucideIcon } from "lucide-react"
import { BASE_URL, IMAGE_URL } from '@/config'


export interface FilterOption {
  id: string
  title?: string
  icon?: LucideIcon
  path?: string
  color?: string
  img?: string
}

export interface CategoryCard {
  id: number
  title: string
  imageUrl: string
  description: string
  slug: string
}

export type CategoryApiResponse = {
  data: Array<{
    id: number
    attributes: {
      Title: string
      sub_title: string
      slug: string
      createdAt: string
      updatedAt: string
      publishedAt: string
      category_image: {
        data: {
          attributes: {
            url: string
            formats: {
              thumbnail: { url: string }
              small: { url: string }
              medium: { url: string }
              large: { url: string }
            }
          }
        }
      }
    }
  }>
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Increase pagination limit to fetch all categories (default is 25)
        // Using pagination[limit] instead of pagination[pageSize] for Strapi v4
        const url = `${BASE_URL}api/categories?populate=*&pagination[limit]=100`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid API response structure');
        }

        const formattedCategories = data.data.map((category: CategoryApiResponse['data'][0]) => {
          let imageUrl = "/images/categories/default.jpg";
          
          if (category.attributes.category_image?.data?.attributes?.url) {
            const rawUrl = category.attributes.category_image.data.attributes.url;
            imageUrl = rawUrl.startsWith('http') 
              ? rawUrl 
              : `${IMAGE_URL}${rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl}`;
          }

          return {
            id: category.id,
            title: category.attributes.Title,
            description: category.attributes.sub_title,
            slug: category.attributes.slug,
            imageUrl
          };
        });

        setCategories(formattedCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories()
  }, []) // Empty dependency array means this effect runs once on mount

  return { categories, loading, error }
}

// Export filterOptions for backwards compatibility if needed
export const filterOptions: FilterOption[] = [
  {
    id: '1',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '2',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '3',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '4',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '5',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '6',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '7',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '8',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '9',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '10',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  },
  {
    id: '11',
    title: "Latest Stories",
    img: "/images/categories/category-img.png"
  }
,{
  id: '12',
  title: "Latest Stories",
  img: "/images/categories/category-img.png"
}
]

