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
  athor?: string;
  href: string;
  cta: string;
  features: Category[];
  languages?: string[];
  location?: string;
  date?: string;
  title?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full md:pb-0 pb-10   grid-cols-3  gap-4",
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
  athor,
  features,
  languages,
  location,
  date,
  title,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3  flex flex-col justify-between h-full overflow-hidden opacity-90  cursor-pointer rounded-2xl",
      "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
      "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "transform-gpu dark:bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
      "dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props}
  >
    {/* Background */}
    <div className="absolute inset-0 group-hover:scale-104 bg-no-repeat ,#000000_70%)] scale-102 duration-300 w-full ]">{background}</div>

    {/* Categories - Now in a fixed position */}
    <div className="absolute flex gap-2 h-20 left-9 top-4 z-50">
      {features.map((category: Category, index: number) => (
        <span
          key={index}
          className="inline-block items-center px-2 py-1 ring-1 hover:bg-red-600 hover:text-white ring-red-600 text-xs text-red-600 rounded-full w-fit h-[23px]"
        >
          {category.title}
        </span>
      ))}
    </div>

    {/* Content wrapper with gradient */}
    <div className="relative flex flex-col justify-end h-full">
      {/* Main content that slides up */}
      <div className="relative !overflow-hidden -bottom-11 z-10 f">
      <div className="transform-gpu  transition-all  -bottom-12 relative overflow-hidden   duration200 group-hover:-translate-y-20 px-6 pb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          {title || name}
        </h3>
        <p className="text-white mb-4 line-clamp-2">{description}</p>
        <p>{athor}</p>
        {/* Additional info */}
        <div className="flex flex-col gap-2 font-noto-sans text-sm text-white">
          {languages && (
            <div className="font-noto-sans text-[15px]  font-medium leading-[180%] tracking-[-0.02em] text-white flex items-center gap-1">
              <span>{languages?.join(', ')}</span>
            </div>
          )}

          {(location || date) && (
            <div className="flex gap-1 items-center text-red-500">
              {location && <p>{location}</p>}
              {location && date && '•'}
              {date && <p>{date}</p>}
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      </div>
      
    </div>

    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent pointer-events-none" />
  </div>
); 
 


export { BentoCard, BentoGrid };
