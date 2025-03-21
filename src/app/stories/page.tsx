import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Button } from '@/components/ui/button'
import { ChevronRight, Sparkle  } from 'lucide-react'

// Example story with video

const stories = [
  {
    title: "Makers of instruments",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re1.png",
    slug: "makers-of-instruments",
    languages: ["Available in 6 languages"],
    location: "Banaskantha",
    date: "Dec 8, 2022"
  },
  {
    title: "Women's Health in Rural Communities",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re2.png",
    slug: "womens-health-rural",
    languages: ["Available in 6 languages"],
    location: "Maharashtra",
    date: "Jan 15, 2023"
  },
  {
    title: "Rural Education Chronicles",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re3.png",
    slug: "rural-education",
    languages: ["Available in 6 languages"],
    location: "Kerala",
    date: "Feb 20, 2023"
  },
  {
    title: "Farming Traditions",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re4.png",
    slug: "farming-traditions",
    languages: ["Available in 6 languages"],
    location: "Punjab",
    date: "Mar 5, 2023"
  },
  {
    title: "Artisans of Rural India",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re1.png",
    slug: "rural-artisans",
    languages: ["Available in 6 languages"],
    location: "Rajasthan",
    date: "Apr 12, 2023"
  },
  {
    title: "Water Conservation Stories",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re2.png",
    slug: "water-conservation",
    languages: ["Available in 6 languages"],
    location: "Gujarat",
    date: "May 18, 2023"
  },
  {
    title: "Rural Sports Legacy",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re3.png",
    slug: "rural-sports",
    languages: ["Available in 6 languages"],
    location: "Tamil Nadu",
    date: "Jun 25, 2023"
  },
  {
    title: "Village Food Stories",
    description: "PARI Library",
    imageUrl: "/images/categories/pari-re4.png",
    slug: "village-food",
    languages: ["Available in 6 languages"],
    location: "West Bengal",
    date: "Jul 30, 2023"
  }
]

export default function StoriesPage() {
  return (
    <div className='max-w-[1232px] pt-20 mx-auto'>
       <div>
        <div className="flex justify-between items-center mb-4">
            <div className='flex flex-row items-center gap-2'>
                 <Sparkle  className="h-4 w-4 text-red-600" />
                <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">This week on PARI</h2>
            </div>
          
          <Button variant={"secondary"} className="text-sm h-[32px] rounded-[48px] text-red-600">See all storys
          <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 bg-propover  lg:grid-cols-4  gap-6 py-4">
     
      {stories.map((story) => (
        <StoryCard key={story.slug} {...story} />
      ))}
    </div>
    </div>
  )
}