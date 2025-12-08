import { ArrowRightIcon, ChevronDown,  Headphones, Play } from "lucide-react";
import { ComponentPropsWithoutRef, ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale";
import { languages as languagesList } from '@/data/languages';
import { createPortal } from 'react-dom';

// Global variables to track bottom sheet state
let globalSheetOpen = false;
let currentOpenSheet: (() => void) | null = null;
let currentOpenSheetId: string | null = null;
import { Button } from "@/components/ui/button";

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
  background?: ReactNode;
  imageUrl?: string;
  Icon?: React.ElementType;
  description: string;
  authors?: string[];
  href: string;
  cta: string;
  features: Category[];
  availableLanguages?: Array<{ code: string; name: string; slug: string }>;
  location?: string;
  date?: string;
  title?: string;
  type?: string;
  videoUrl?: string;
  audioUrl?: string;
  duration?: string;
  isStudentArticle?: boolean;
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
  imageUrl,
  description,
  authors,
  category,
  availableLanguages,
  location,
  date,
  title,
  videoUrl,
  audioUrl,
  duration,
  isStudentArticle = false,
  ...props
}: BentoCardProps) => {

  const { language: currentLocale } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);

  // Create unique ID for this card
  const cardId = `${name}-${title || 'card'}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSheetOpen]);



  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-1 md:col-span-3 w-full scale-100 hover:dark:border-border sm:hover:scale-103 transition-transform duration-300 flex flex-col overflow-hidden cursor-pointer rounded-2xl h-[760px]",
        "shadow-[0px_1px_2px_0px_#00000014] z-50 hover:border-border border border-border",
        className
      )}
      {...props}
    >
      <div className="relative h-[380px] w-full overflow-hidden rounded-t-2xl">
        {/* Story Card Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || name}
            fill
            className="object-cover transition-transform scale-102 shadow-lg duration-300 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : background ? (
          <div className="absolute inset-0 w-full h-full">
            {background}
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">No image</span>
          </div>
        )}
        {/* Categories */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {(category && category.length > 0) && (
            <>
              {/* Show 2 categories at a time */}
              {category.slice(categoryStartIndex, categoryStartIndex + 2).map((cat, index) => (
                <span
                  key={`${categoryStartIndex}-${index}`}
                  className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer animate-slide-in-left"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Get current URL and parameters
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);

                    // Get existing types if any
                    const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                    const categorySlug = cat.toLowerCase().replace(/\s+/g, '-');

                    // Add the new category if it's not already included
                    if (!existingTypes.includes(categorySlug)) {
                      existingTypes.push(categorySlug);
                    }

                    // Update the URL
                    params.set('types', existingTypes.join(','));

                    // Navigate to the updated URL
                    window.location.href = `/articles?${params.toString()}`;
                  }}
                >
                  {cat}
                </span>
              ))}

              {/* Next/Reset button */}
              {category.length > 2 && (
                <span
                  className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (categoryStartIndex + 2 >= category.length) {
                      // If at end, reset to beginning
                      setCategoryStartIndex(0);
                    } else {
                      // Move to next pair
                      setCategoryStartIndex(prev => prev + 2);
                    }
                  }}
                >
                  {categoryStartIndex + 2 >= category.length
                    ? '-'
                    : `+${category.length - (categoryStartIndex + 2)}`
                  }
                </span>
              )}
            </>
          )}
        </div>
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
        {audioUrl && (
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

      {/* Language Bottom Sheet - Between Image and Content */}
      {Array.isArray(availableLanguages) && availableLanguages.length > 0 && (
        <>
          <div className={`absolute ${currentLocale === 'ur' ? 'top-[230px]' : 'top-1/2'} left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20`}>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 h-[36px] ring-0  outline-none rounded-[48px] bg-white/80 dark:bg-background/90 border-none cursor-pointer shadow-md
                ${isStudentArticle
                  ? 'text-student-blue hover:bg-student-blue hover:text-white border-student-blue'
                  : 'text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white border-primary-PARI-Red/20'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Toggle behavior
                if (currentOpenSheetId === cardId && isSheetOpen) {
                  // Same card clicked - close it
                  globalSheetOpen = false;
                  currentOpenSheet = null;
                  currentOpenSheetId = null;
                  setIsSheetOpen(false);
                } else {
                  // Different card or no sheet open - close current and open new
                  if (globalSheetOpen && currentOpenSheet) {
                    currentOpenSheet(); // Close current sheet
                  }

                  // Open this sheet
                  globalSheetOpen = true;
                  currentOpenSheet = () => setIsSheetOpen(false);
                  currentOpenSheetId = cardId;
                  setIsSheetOpen(true);
                }
              }}
            >
              <span>{availableLanguages.length} Languages</span>
              <ChevronDown className="h-3 w-3 mt-[1px]" />
            </Button>
          </div>

          {/* Language Bottom Sheet - Portal to Body */}
          {mounted && isSheetOpen && createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 z-[9999] transition-opacity duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Only close sheet, don't navigate anywhere
                  globalSheetOpen = false;
                  currentOpenSheet = null;
                  currentOpenSheetId = null;
                  setIsSheetOpen(false);
                }}
              />

              {/* Bottom Sheet */}
              <div
                className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[10000] transform transition-transform duration-300 flex ease-out"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Only close sheet, don't navigate anywhere
                  globalSheetOpen = false;
                  currentOpenSheet = null;
                  currentOpenSheetId = null;
                  setIsSheetOpen(false);
                }}
              >
                <div
                  className="bg-white dark:bg-popover rounded-t-2xl md:rounded-2xl shadow-xl md:max-w-2xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {/* Handle Bar */}
                  <div className="flex justify-center py-3">
                    <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center border-b-2 justify-between px-6 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Available in {availableLanguages.length} languages
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Select your preferred language
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only close sheet, don't navigate anywhere
                        globalSheetOpen = false;
                        currentOpenSheet = null;
                        currentOpenSheetId = null;
                        setIsSheetOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Content - Language List */}
                  <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Sort languages to put selected language first */}
                      {[...availableLanguages].sort((a, b) => {
                        if (a.code === currentLocale) return -1;
                        if (b.code === currentLocale) return 1;
                        return 0;
                      }).map((language) => {
                        const languageData = languagesList.find(lang => lang.code === language.code);
                        return (
                          <button
                            key={`lang-${language.code}-${language.slug}`}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                              currentLocale === language.code
                                ? isStudentArticle
                                  ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                                  : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              globalSheetOpen = false;
                              currentOpenSheet = null;
                              currentOpenSheetId = null;
                              setIsSheetOpen(false);
                              window.location.href = `/article/${language.slug}`;
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <div className="text-base font-medium">
                                  {languageData ? languageData.names[0] : language.code.toUpperCase()}
                                </div>
                                {languageData && languageData.names[1] && (
                                  <div className="text-sm opacity-70">
                                    {languageData.names[1]}
                                  </div>
                                )}
                              </div>
                              {currentLocale === language.code && (
                                <div className={`w-3 h-3 rounded-full ${isStudentArticle ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
        </>
      )}

      {/* Content wrapper */}
      <div className="relative flex flex-col w-full pt-2 h-[380px] z-10 bg-white dark:bg-popover">
        <div className="px-6 py-6 w-full">
          <div className={`flex flex-col gap-1 ${currentLocale === 'ur' ? 'md:h-[180px] h-[190px]' : 'md:h-[150px] h-[160px]'}`}>
            <h3 className="font-noto-sans pb-4 h-20 flex  text-[26px] font-bold leading-[136%] tracking-[-0.04em]  text-foreground  !line-clamp-2">
              {title}
            </h3>
            <p className="text-discreet-text py-1 mb-4 line-clamp-2">{description}</p>
          </div>
          <h5 className=" text-grey-300 text-[15px] mb-2 line-clamp-1">
            {authors && authors.length > 0 ? (
              authors.map((author, index) => (
                <span key={index}>
                  <span
                    className="cursor-pointer hover:text-primary-PARI-Red transition-colors duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/articles?author=${encodeURIComponent(author.trim())}`;
                    }}
                  >
                    {author.trim()}
                  </span>
                  {index < authors.length - 1 && ', '}
                </span>
              ))
            ) : (
              'PARI'
            )}
          </h5>
          
          {/* Additional info */}
          <div className="flex flex-col font-noto-sans text-sm">

            {(location || date) && (
              <div className="flex gap-1 items-center text-primary-PARI-Red font-noto-sans text-[14px] font-medium leading-[160%] tracking-[-0.03em]">
                {location && <p className="text-sm font-noto-sans">{location}</p>}
                {location && date && <span>•</span>}
                {date && <p className="text-sm font-noto-sans">{date}</p>}
                <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export { BentoCard, BentoGrid };
