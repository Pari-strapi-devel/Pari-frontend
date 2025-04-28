
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
        const url = `${BASE_URL}api/categories?populate=*`;
        console.log('Fetching categories from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Log the entire response structure
        console.log('Complete API Response:', JSON.stringify(data, null, 2));

        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid API response structure');
        }

        const formattedCategories = data.data.map((category: CategoryApiResponse['data'][0]) => {
          // Log individual category data
          console.log('Processing category:', {
            id: category.id,
            title: category.attributes.Title,
            imageData: category.attributes.category_image
          });

          let imageUrl = "/images/categories/default.jpg";
          
          if (category.attributes.category_image?.data?.attributes?.url) {
            const rawUrl = category.attributes.category_image.data.attributes.url;
            imageUrl = rawUrl.startsWith('http') 
              ? rawUrl 
              : `${IMAGE_URL}${rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl}`;
            
            console.log('Category Image Details:', {
              title: category.attributes.Title,
              rawUrl,
              finalImageUrl: imageUrl
            });
          }

          return {
            id: category.id,
            title: category.attributes.Title,
            description: category.attributes.sub_title,
            slug: category.attributes.slug,
            imageUrl
          };
        });

        console.log('Final formatted categories:', formattedCategories);
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
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

