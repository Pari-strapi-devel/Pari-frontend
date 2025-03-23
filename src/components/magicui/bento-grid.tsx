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
        "grid w-full max-h-[900px]  grid-cols-3 g gap-4",
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
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      "bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)] [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "transform-gpu dark:bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 w-full h-2/3">{background}</div>

    <div className="absolute flex gap-2 left-9 top-4 mb-4 z-80">
      {features.map((category: Category, index: number) => (
        <span
          key={index}
          className="inline-block items-center px-2 py-1 ring-1 z-40 hover:bg-red-600 hover:text-white ring-red-600 text-xs text-red-600 rounded-full w-fit h-[23px]  "
        >
          {category.title}
        </span>
      ))}
    </div>
 <div className="relative z-10 flex flex-col bg-gradient-to-t from-black/80 to-transparent h-full">
    <div className="pointer-events-none h-full z-10 flex  -bottom-5 justify-end transform-gpu flex-col gap-1 px-6 transition-all duration-300 group-hover:-translate-y-20">
      <h3 className="text-xl font-semibold text-white">
        {title || name}
      </h3>
      <p className=" text-white/70">{description}</p>
      <div className="pointer-events-none absolute -bottom-20 left-0 right-0 flex transform-gpu flex-col p-6 transition-all duration-300 bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex flex-col justify-between  font-noto-sans text-sm text-white/70">
        {languages && (
          <div className="font-noto-sans text-[15px] font-medium leading-[180%] tracking-[-0.02em] text-white flex items-center gap-1">
            <span>{languages?.join(', ')}</span>
          </div>
        )}

        {(location || date) && (
          <div className="flex gap-1 items-center text-red-400">
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

   
    
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 bg-black/[.09] dark:bg-neutral-800/10" />
 
  </div>
 
 
);

export { BentoCard, BentoGrid };
