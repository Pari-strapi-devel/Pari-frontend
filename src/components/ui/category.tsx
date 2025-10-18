"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface CategoryProps {
  name: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function Category({
  name,
  selected = false,
  onClick,
  className,
}: CategoryProps) {
  return (
    <span 
      className={cn(
        "inline-block items-center px-2 py-1 ring-1 text-xs rounded-full w-fit h-[23px] mb-2 cursor-pointer transition-colors",
        selected 
          ? "bg-primary-PARI-Red text-white ring-primary-PARI-Red" 
          : "ring-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white",
        className
      )}
      onClick={onClick}
    >
      {name}
    </span>
  )
}

interface CategoryListProps {
  categories: string[]
  className?: string
  onCategoryClick?: (category: string) => void
}

export function CategoryList({ categories, className, onCategoryClick }: CategoryListProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Current category - always visible */}
      <Category
        key={currentCategoryIndex}
        name={categories[currentCategoryIndex]}
        className="animate-slide-in-left"
        onClick={() => onCategoryClick?.(categories[currentCategoryIndex])}
      />

      {/* Next/Reset category button */}
      {categories.length > 1 && (
        <Category
          name={currentCategoryIndex === categories.length - 1
            ? '-'
            : `+${categories.length - currentCategoryIndex - 1}`
          }
          onClick={() => {
            if (currentCategoryIndex === categories.length - 1) {
              // If at last category, reset to first
              setCurrentCategoryIndex(0)
            } else {
              // Move to next category
              setCurrentCategoryIndex(prev => prev + 1)
            }
          }}
        />
      )}
    </div>
  )
}
