"use client"

import { cn } from "@/lib/utils"

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
          ? "bg-red-700 text-white ring-red-700" 
          : "ring-red-700 text-red-700 hover:bg-red-700 hover:text-white",
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
}

export function CategoryList({ categories, className }: CategoryListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(categories && categories.length > 0) && (
        <>
          <Category name={categories[0]} />
          {categories.length > 2 && (
            <Category name={`+${categories.length - 1}`} />
          )}
        </>
      )}
    </div>
  )
}
