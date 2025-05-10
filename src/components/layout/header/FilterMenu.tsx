
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { CategoryCard, FilterOption } from './Category'
import { FilterOptionsView } from './FilterOptionsView'
import { useCategories } from './Category'

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilterState {
  date?: string;
  category?: string[];
  tags?: string[];
  status?: 'published' | 'draft' | 'archived';
  authorName?: string;
  place?: string;
  location?: string;
  dateRanges?: string[];
  contentTypes?: string[];
}

export function FilterMenu({ isOpen, onClose }: FilterMenuProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'cards' | 'filters'>('cards')
  const [selectedOptions, setSelectedOptions] = useState<FilterOption[]>([])
  const [filters, setFilters] = useState<FilterState>({
    authorName: '',
    place: '',
    dateRanges: [],
    contentTypes: []
  });
  const { categories } = useCategories()
  
  // Reset filters when menu is opened
  useEffect(() => {
    if (isOpen) {
      // Don't reset filters when opening to allow for multiple filter selection
      // Just keep the current state
    }
  }, [isOpen]);
  
  const handleOptionSelect = (option: FilterOption) => {
    setSelectedOptions(currentOptions => {
      const isSelected = currentOptions.some(opt => opt.id === option.id)
      if (isSelected) {
        return currentOptions.filter(opt => opt.id !== option.id)
      } else {
        return [...currentOptions, option]
      }
    })
  }

  const hasActiveFilters = () => {
    const hasAuthor = Boolean(filters.authorName?.trim());
    const hasPlace = Boolean(filters.place?.trim());
    const hasDateRanges = (filters.dateRanges?.length ?? 0) > 0;
    const hasContentTypes = (filters.contentTypes?.length ?? 0) > 0;

    return hasAuthor || hasPlace || hasDateRanges || hasContentTypes;
  };

  const handleConfirmSelection = () => {
    // Get existing query parameters
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (activeTab === 'cards' && selectedOptions.length > 0) {
      // Get existing types if any
      const existingTypes = params.get('types')?.split(',') || [];
      const newTypes = selectedOptions.map(opt => opt.path);
      
      // Combine existing and new types, removing duplicates
      const allTypes = [...new Set([...existingTypes, ...newTypes])];
      
      // Update the URL
      params.set('types', allTypes.join(','));
      router.push(`/articles?${params.toString()}`);
      onClose();
    } else if (activeTab === 'filters' && hasActiveFilters()) {
      // Handle author filter
      if (filters.authorName) {
        params.set('author', filters.authorName);
      }
      
      // Handle place filter
      if (filters.place) {
        params.set('location', filters.place);
      }
      
      // Handle date ranges
      if (filters.dateRanges?.length) {
        params.set('dates', filters.dateRanges.join(','));
      }
      
      // Handle content types
      if (filters.contentTypes?.length) {
        params.set('content', filters.contentTypes.join(','));
      }
      
      router.push(`/articles?${params.toString()}`);
      onClose();
    }
  }

  // Handler functions for FilterOptionsView
  const handleDateRangeChange = (range: string) => {
    setFilters(prev => {
      const ranges = prev.dateRanges || [];
      if (ranges.includes(range)) {
        return { ...prev, dateRanges: ranges.filter(r => r !== range) };
      } else {
        return { ...prev, dateRanges: [...ranges, range] };
      }
    });
  };

  const handleContentTypeChange = (type: string) => {
    setFilters(prev => {
      const types = prev.contentTypes || [];
      if (types.includes(type)) {
        return { ...prev, contentTypes: types.filter(t => t !== type) };
      } else {
        return { ...prev, contentTypes: [...types, type] };
      }
    });
  };
  
  const handleAuthorChange = (value: string) => {
    setFilters(prev => ({ ...prev, authorName: value }));
  };
  
  const handlePlaceChange = (value: string) => {
    console.log('FilterMenu: handlePlaceChange called with', value);
    setFilters(prev => {
      const newFilters = { ...prev, place: value, location: value };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
  };

  return (
    <>
      <div 
        className={`fixed top-0 right-0 h-full w-[545px] sm:max-w-[90vw] max-w-full bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="p-4 border-b dark:bg-popover bg-popover">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-primary-PARI-Red/40  rounded-full cursor-pointer"
              >
                <X className="h-6 w-6 text-primary-PARI-Red hover:text-white" />
              </Button>
              <div className='flex flex-row space-x-2'>
                <Button 
                  variant="secondary"
                  className={`h-8 flex items-center rounded-full cursor-pointer ring-0 justify-center gap-2 ${
                    activeTab === 'cards' ? 'bg-primary-PARI-Red text-white' : 'bg-gray-200'
                  } hover:bg-primary-PARI-Red/80`}
                  onClick={() => setActiveTab('cards')}
                >
                  Category
                </Button>
                <Button 
                  variant="secondary"
                  className={`h-8 flex items-center rounded-full cursor-pointer ring-0 justify-center gap-2 ${
                    activeTab === 'filters' ? 'bg-primary-PARI-Red text-white' : 'bg-gray-200'
                  } hover:bg-primary-PARI-Red/80`}
                  onClick={() => setActiveTab('filters')}
                >
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto h-full p-4 scrollbar-thin scrollbar-thumb-primary-PARI-Red scrollbar-track-gray-100">
            {activeTab === 'filters' ? (
              <FilterOptionsView 
                filters={filters}
                handleDateRangeChange={handleDateRangeChange}
                handleContentTypeChange={handleContentTypeChange}
                handleAuthorChange={handleAuthorChange}
                handlePlaceChange={handlePlaceChange}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category: CategoryCard) => (
                  <div
                    key={category.id}
                    className={`group relative overflow-hidden rounded-lg h-[164px] shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${
                      selectedOptions.some(opt => opt.id === category.id.toString()) 
                        ? ' ring-1 ring-primary-PARI-Red' 
                        : ''
                    }`}
                    onClick={() => handleOptionSelect({
                      id: category.id.toString(),
                      title: category.title,
                      path: category.slug,
                      img: category.imageUrl
                    })}
                  >
                    <div 
                      className={`p-4 text-white flex flex-col justify-end items-center h-full gradient-overlay ${
                        selectedOptions.some(opt => opt.id === category.id.toString())
                          ? 'bg-gradient-to-t h-full from-primary-PARI-Red via-primary-PARI-Red/90 to-transparent'
                          : ''
                      }`}
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center h-full group-hover:opacity-50 -z-10"
                        style={{
                          backgroundImage: `url(${category.imageUrl})`
                        }}
                      />
                      <h3 className="font-noto text-xs font-medium leading-[160%] mb-3 tracking-[-0.03em] text-center">{category.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {(selectedOptions.length > 0 || hasActiveFilters()) && (
            <div className="p-4 border-t dark:bg-popover bg-popover">
              <div className="flex items-center justify-center text-primary-PARI-Red mb-3">
                <span className="font-noto text-base font-medium leading-[160%] tracking-[-0.03em]">
                  {activeTab === 'cards' ? `${selectedOptions.length} Filters Selected` : 'Active Filters'}
                </span>
              </div>
              <div className='flex justify-center'>
              <Button 
                variant="secondary"
                className="w-[356px] h-[48px] bg-primary-PARI-Red rounded-[48px] ring-0 text-white hover:bg-primary-PARI-Red/80 px-7 py-3.5 text-[16px] font-semibold"
                onClick={handleConfirmSelection}
              >
                Confirm Selection
              </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
    </>
  )
}
