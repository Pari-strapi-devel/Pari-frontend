
import { LucideIcon } from "lucide-react"

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

export const categories: CategoryCard[] = [
  {
    id: 1,
    title: "Rural India",
    imageUrl: "/images/categories/rural-india.jpg",
    description: "Stories from rural communities across India",
    slug: "rural-india"
  },
  {
    id: 2,
    title: "Agriculture",
    imageUrl: "/images/categories/agriculture.jpg",
    description: "Coverage of farming and agricultural practices",
    slug: "agriculture"
  },
  {
    id: 3,
    title: "Education",
    imageUrl: "/images/categories/education.jpg",
    description: "Stories about rural education and literacy",
    slug: "education"
  },
  {
    id: 4,
    title: "Healthcare",
    imageUrl: "/images/categories/healthcare.jpg",
    description: "Rural healthcare and medical facilities",
    slug: "healthcare"
  },
  {
    id: 5,
    title: "Environment",
    imageUrl: "/images/categories/environment.jpg",
    description: "Environmental issues and conservation",
    slug: "environment"
  },
  {
    id: 6,
    title: "Culture",
    imageUrl: "/images/categories/culture.jpg",
    description: "Traditional arts and cultural practices",
    slug: "culture"
  }
]
