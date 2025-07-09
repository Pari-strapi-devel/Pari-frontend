import { ArrowRightIcon, ChevronDown,  Headphones, Play } from "lucide-react";
import { ComponentPropsWithoutRef, ReactNode,  } from "react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/lib/locale";
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
  background: ReactNode;
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

  const handleArticleLanguageSelect = (slug: string) => {
    if (!slug) return;
    window.location.href = `https://ruralindiaonline.org/article/${slug}`;
  };

  return (
    <div
      key={name}
      className={cn(
        "relative col-span-1 md:col-span-3 w-full scale-100 hover:dark:border-border sm:hover:scale-103 transition-transform duration-300 flex flex-col justify-between sm:min-h-[150px] min-h-[160px] overflow-hidden cursor-pointer rounded-2xl bg-[linear-gradient(180deg,rgba(0,0,0,0)_36.67%,#000000_70%)]",
        "shadow-[0px_1px_2px_0px_#00000014] z-50 hover:border-border border border-border",
        className
      )}
      {...props}
    >
      {/* Background */}
      <div className="absolute inset-0 w-full h-full object-cover hover:p-3 transition-transform shadow-lg rounded-xl duration-300 group-hover:scale-108" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 36.67%, #000000 70%)" }}>
        {background}
      </div>
      <div className="absolute inset-0 w-full h-full" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 36.67%, #000000 70%)" }}>
      </div>
      <div className="relative h-[180px] w-full overflow-hidden rounded-t-2xl">
        {/* Categories */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          {(category && category.length > 0) && (
            <>
              {/* First category */}
              <span className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Get current URL and parameters
                  const url = new URL(window.location.href);
                  const params = new URLSearchParams(url.search);
                  
                  // Get existing types if any
                  const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                  const categorySlug = category[0].toLowerCase().replace(/\s+/g, '-');
                  
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
                {category[0]}
              </span>
              
              {/* Second category if available */}
              {category.length > 1 && (
                <span className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get current URL and parameters
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);
                    
                    // Get existing types if any
                    const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                    const categorySlug = category[1].toLowerCase().replace(/\s+/g, '-');
                    
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
                  {category[1]}
                </span>
              )}
              
              {/* +X more categories if there are more than 2 */}
              {category.length > 2 && (
                <span className="inline-block px-2 py-1 bg-white text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white text-xs rounded-full w-fit h-[24px] mb-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get current URL and parameters
                    const url = new URL(window.location.href);
                    const params = new URLSearchParams(url.search);
                    
                    // Get existing types if any
                    const existingTypes = params.get('types')?.split(',').filter(Boolean) || [];
                    
                    // Add all categories if they're not already included
                    category.forEach(cat => {
                      const categorySlug = cat.toLowerCase().replace(/\s+/g, '-');
                      if (!existingTypes.includes(categorySlug)) {
                        existingTypes.push(categorySlug);
                      }
                    });
                    
                    // Update the URL
                    params.set('types', existingTypes.join(','));
                    
                    // Navigate to the updated URL
                    window.location.href = `/articles?${params.toString()}`;
                  }}
                >
                  +{category.length - 2}
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

      {/* Content wrapper with gradient */}
      <div className="relative flex flex-col w-full justify-end h-full z-10">
        <div className="px-6 pb-6 w-full">
          <h3 className="text-xl h-[50px] font-semibold text-white line-clamp-2 mb-2">
            {title || name}
          </h3>
          <p className="dark:text-discreet-text text-[#969696] mb-4 line-clamp-2">{description}</p>
          <p className="text-grey-300 text-[15px] font-medium mb-2 line-clamp-1">{authors?.join(', ')}</p>
          
          {/* Additional info */}
          <div className="flex flex-col font-noto-sans text-sm">
            {Array.isArray(availableLanguages) && availableLanguages.length > 0 && (
              <div className="font-noto-sans text-[14px] leading-[160%] tracking-[-0.03em] text-white flex items-center gap-1">
                {/* <span>Available in {availableLanguages.length} languages</span> */}
                <div className="absolute  top-[154px]  left-23 z-20 transform -translate-1/2">
                   <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 h-[36px] ring-black/10 outline-0 rounded-[48px] bg-black/40 dark:bg-background/80 backdrop-blur-sm cursor-pointer
                  ${isStudentArticle 
                    ? 'text-student-blue hover:bg-student-blue hover:text-white' 
                    : 'text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span>{availableLanguages.length} Languages</span>
          
                <ChevronDown className="h-3 w-3 mt-[1px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[250px] p-2">
              <div className="p-2 border-b">
                <h3 className="text-xs font-medium">This story is available in {availableLanguages.length} languages</h3>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                {availableLanguages.map((language) => (
                  <DropdownMenuItem
                    key={`lang-${language.code}-${language.slug}`}
                    className={`flex items-center cursor-pointer p-2 text-xs ${
                      currentLocale === language.code 
                        ? isStudentArticle
                          ? 'bg-student-blue/10 text-student-blue font-medium'
                          : 'bg-primary-PARI-Red/10 text-primary-PARI-Red font-medium'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleArticleLanguageSelect(language.slug);
                    }}
                  >
                    <span>{language.name}</span>
                    {currentLocale === language.code && (
                      <span className="ml-auto">•</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
                </div>
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
};

export { BentoCard, BentoGrid };
