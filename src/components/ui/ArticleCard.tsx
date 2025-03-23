import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ArticleCardProps {
  title: string
  description: string
  imageUrl: string
  categories: string[]
  slug: string
  authors: string[]
  readMore?: string
  location?: string
  date?: string
  className?: string
}

export function ArticleCard({
  title,
  description,
  imageUrl,
  categories,
  slug,
  authors,
  location,
  date,
  readMore,
  className
}: ArticleCardProps) {
  return (
    <Link 
      href={`/articles/${slug}`}
      className={className}
    >
      <article className="group rounded-lg overflow-hidden sm:pt-8 hover:rounded-xl hover:shadow-xl transition-discrete-00 transition-all duration-300 h-full">
        <div className="relative h-[306px] w-100% overflow-hidden rounded-2xl">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform scale-102 rounded-xl duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <div className="py-6 px-1 rounded-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <span 
                key={index}
                className="inline-block items-center px-2 py-1 ring-1 hover:bg-red-600 hover:text-white ring-red-600 text-xs text-red-600 rounded-full w-fit h-[23px] mb-2"
              >
                {category}
              </span>
            ))}
          </div>
          
          <h3 className="font-noto-sans text-[28px] font-bold leading-[130%] tracking-[-0.04em] text-foreground mb-3 line-clamp-2">
            {title}
          </h3>
          
          <p className="font-noto-sans text-base font-normal leading-[170%] tracking-[-0.01em] text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>
          
          <div className="flex items-center justify-between font-noto-sans text-sm text-muted-foreground">
            <div>
              <p className="font-noto-sans text-[15px] font-medium leading-[180%] tracking-[-0.02em] text-foreground">
                {authors.join(', ')}
              </p>
              <div className='flex gap-1 items-center text-red-700'> 
                {location && <p>{location}</p>}
                {location && date && '•'}
                {date && <p>{date}</p>}
                {readMore && <p>{readMore}</p>}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}