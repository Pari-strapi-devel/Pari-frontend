import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Headphones } from 'lucide-react'

interface ArticleCardProps {
  title: string
  description: string
  imageUrl: string
  mobileImageUrl?: string;
  categories: string[]
  slug: string
  authors: string[]
  readMore?: string
  location?: string
  date?: string
  className?: string
  videoUrl?: string
  audioUrl?: string
  duration?: string
}

export function ArticleCard({
  title,
  description,
  imageUrl,
  mobileImageUrl,
  categories,
  slug,
  authors,
  location,
  date,
  readMore,
  className,
  videoUrl,
  audioUrl,
  duration
}: ArticleCardProps) {
  return (
    <Link 
      href={`/articles/${slug}`}
      className={className}
    >
      <article className="group rounded-lg  overflow-hidden sm:pt-8 hover:rounded-xl transition-discrete-00 transition-all duration-300 h-full">
        <div className="relative h-[376px] w-100% overflow-hidden rounded-2xl" style={{ boxShadow: '0px 1px 4px 0px #00000047' }}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className=" transition-transform sm:block scale-102 rounded-xl duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <Image
            src={mobileImageUrl || imageUrl}
            alt={title}
            fill
            className=" object-cover object-top bg-center sm:hidden flex  rounded-xl "
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Video overlay if videoUrl exists */}
          {videoUrl && (
            <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-PARI-Red hover:bg-primary-PARI-Red/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                {duration && (
                  <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                    {duration}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Audio overlay if audioUrl exists */}
          {audioUrl && !videoUrl && (
            <div className="absolute top-2.5 right-3 flex items-center justify-center transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-PARI-Red hover:bg-primary-PARI-Red/80 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                {duration && (
                  <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                    {duration}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
        <div className="py-5 px-1 rounded-2xl">
          <div className="flex flex-wrap gap-2 sm:mb-4">
            {categories?.length > 0 && (
              <>
                <span 
                  className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
                >
                  {categories[0]}
                </span>
                {categories.length > 1 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
                  >
                    {categories[1]}
                  </span>
                )}
                {categories.length > 2 && (
                  <span 
                    className="inline-block items-center px-2 py-1 ring-1 hover:bg-primary-PARI-Red hover:text-white ring-primary-PARI-Red text-xs text-primary-PARI-Red rounded-full w-fit h-[23px] mb-2"
                  >
                    +{categories.length - 2}
                  </span>
                )}
              </>
            )}
          </div>
          <div className=" ">

          <div className="flex flex-col h-[130px] gap-1 ">
          <h3 className="font-noto-sans text-[28px] font-bold leading-[130%] tracking-[-0.04em] text-foreground line-clamp-1">
            {title}
          </h3>
          
          <p className="!font-noto-sans text-[16px] text-discreet-text font-normal max-w-[500px] leading-[170%] tracking-[-0.01em]  line-clamp-3">
            {description}
          </p>
          </div>
              
          <div className="flex items-end justify-between font-noto-sans text-sm text-muted-foreground">
            <div>
              <p className="font-noto-sans text-[15px] font-medium leading-[180%] line-clamp-1 tracking-[-0.02em] text-[#828282]">
                {authors.join(', ')}
              </p>
              <div className='flex gap-1 items-center w-fit text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]'> 
                {location && <p>{location}</p>}
                {location && date && '•'}
                {date && <p>{date}</p>}
                {readMore && <p>{readMore}</p>}
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-5 gap-2 w-5" />
                </span>
              </div>
            </div>
          </div>
          </div>
  
      
        </div>
        </div>
        
      </article>
    </Link>
  )
}
