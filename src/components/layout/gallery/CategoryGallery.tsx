"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useCategories } from "@/components/layout/header/Category"
import { useState } from 'react'

export function CategoryGallery() {
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { categories, loading, error } = useCategories()

  const handleCategorySelect = (slug: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(slug)) {
        return prev.filter(item => item !== slug)
      }
      return [...prev, slug]
    })
  }

  const handleConfirmSelection = () => {
    if (selectedCategories.length > 0) {
      const categoryQuery = selectedCategories.join(',')
      router.push(`/categories?selected=${categoryQuery}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.slug)
          return (
            <div 
              key={category.id}
              className={`relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300
                ${isSelected ? 'ring-2 ring-red-600' : ''}`}
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-sm text-gray-200 mb-4">{category.description}</p>
                
                <Button 
                  variant="secondary"
                  className={`w-full ${
                    isSelected 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-white/90 text-red-600 hover:bg-red-600 hover:text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCategorySelect(category.slug)
                  }}
                >
                  {isSelected ? (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      Selected
                    </>
                  ) : (
                    'Select Category'
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
          <Button 
            variant="secondary"
            className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 rounded-full shadow-lg text-lg font-semibold"
            onClick={handleConfirmSelection}
          >
            Confirm Selection ({selectedCategories.length})
          </Button>
        </div>
      )}
    </div>
  )
}
