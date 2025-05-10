import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";


interface Category {
  title: string;
}

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  category: string[];
  background: ReactNode;
  Icon?: React.ElementType;
  description: string;
  authors?: string[];
  href: string;
  cta: string;
  features: Category[];
  localizations?: Array<{ locale: string; title: string; strap: string; slug: string }>;
  location?: string;
  date?: string;
  title?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full md:pb-0 pb-10 grid-cols-1 md:grid-cols-3  gap-4 auto-rows-fr",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  description,
  authors,
  category,
  localizations,
  location,
  date,
  title,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 md:col-span-3 w-full scale-100   sm:hover:scale-103 transition-transform duration-300 flex flex-col justify-between sm:min-h-[150px] min-h-[160px] overflow-hidden opacity-90 cursor-pointer rounded-2xl bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
      
      "shadow-[0px_1px_2px_0px_#00000014] z-50",
      className
    )}
    {...props}
  >
    {/* Background */}
    <div className="absolute inset-0 w-full h-full object-cover transition-transform scale-102 shadow-lg rounded-xl duration-300 group-hover:scale-108" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 36.67%, #000000 70%)" }}>
      {background}
    </div>
    <div className="absolute inset-0 w-full h-full" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 36.67%, #000000 70%)" }}>
   
    </div>

    {/* Categories */}
    <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-50">
      {(category && category.length > 0) && (
        <>
          <span className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2">
            {category[0]}
          </span>
          {category.length > 1 && (
            <span className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2">
              {category[1]}
            </span>
          )}
          {category.length > 2 && (
            <span className="inline-block px-2 py-1 bg-white/80 text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2">
              +{category.length - 2}
            </span>
          )}
        </>
      )}
    </div>

    {/* Content wrapper with gradient */}
    <div className="relative flex flex-col w-full justify-end h-full z-10">
      <div className="px-6 pb-6 w-full">
        <h3 className="text-xl font-semibold text-white line-clamp-1 mb-2">
          {title || name}
        </h3>
        <p className="dark:text-discreet-text text-[#969696] mb-4  line-clamp-2">{description}</p>
        <p className="text-grey-300 text-[15px] font-medium mb-2 line-clamp-1">{authors?.join(', ')}</p>
        
        {/* Additional info */}
        <div className="flex flex-col  font-noto-sans text-sm">
          {Array.isArray(localizations) && localizations.length > 0 && (
            <div className="font-noto-sans text-[14px]  leading-[160%] tracking-[-0.03em] text-white flex items-center gap-1">
              <span>Available in {localizations.length} languages</span>
            </div>
          )}

          {(location || date) && (
            <div className="flex gap-1 items-center text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
              {location && <p>{location}</p>}
              {location && date && <span>•</span>}
              {date && <p>{date}</p>}
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                <ArrowRightIcon className="h-5 w-5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent pointer-events-none" />
  </div>
); 
 


export { BentoCard, BentoGrid };
