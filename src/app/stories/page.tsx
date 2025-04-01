
"use client"
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { Button } from '@/components/ui/button'
import { BASE_URL } from '@/config';

import axios from 'axios';
import { ChevronRight, Sparkle  } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Story {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  languages: string[];
  location: string;
  date: string;
}

interface ApiStoryItem {
  attributes: {
    Title: string;
    Strap: string;
    slug: string;
    location?: string;
    date?: string;
  }
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/articles?locale=all&filters`
        );
        const formattedStories = response.data.data.map((item: ApiStoryItem) => ({
          title: item.attributes.Title,
          authors: 'PARI Library',
          // Add other fields as needed
          imageUrl: "/images/categories/pari-re1.png", // Add proper image URL from API
          slug: item.attributes.slug || "default-slug",
          languages: ["Available in 6 languages"],
          location: item.attributes.location || "Location",
          date: item.attributes.date || "Date"
        }));
        setStories(formattedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  // Show all stories if showAll is true, otherwise show only 8
  const visibleStories = showAll ? stories : stories.slice(0, 8);

  return (
    <div className='max-w-[1232px] lg:px-0 py-10 px-4 hover:h-fit mx-auto'>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className='flex flex-row items-center gap-2'>
            <Sparkle className="h-7 w-7 text-red-700" />
            <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">
              Pari recommends
            </h2>
          </div>
          
          <Button 
            variant="secondary" 
            className="text-sm h-[32px] rounded-[48px] text-red-600"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : 'See all stories'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 bg-propover lg:grid-cols-4 gap-6 py-4 ${showAll ? 'h-auto' : ''}`}>
        {visibleStories.map((story: Story) => (
          <StoryCard key={story.slug} {...story} />
        ))}
      </div>
    </div>
  )
}
