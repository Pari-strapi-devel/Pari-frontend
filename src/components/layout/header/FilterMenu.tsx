"use client"

import { useState, useEffect, } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { CategoryCard, FilterOption } from './Category'
import { FilterOptionsView } from './FilterOptionsView'
import { useCategories } from './Category'
import { useLocale } from '@/lib/locale'


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
  languages?: string[];
}

export function FilterMenu({ isOpen, onClose }: FilterMenuProps) {
  const router = useRouter()
  const { language: currentLocale } = useLocale()
  const [activeTab, setActiveTab] = useState<'cards' | 'filters'>('cards')
  const [selectedOptions, setSelectedOptions] = useState<FilterOption[]>([])
  const [filters, setFilters] = useState<FilterState>({
    authorName: '',
    place: '',
    dateRanges: [],
    contentTypes: [],
    languages: []
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
    const hasLanguages = (filters.languages?.length ?? 0) > 0;

    return hasAuthor || hasPlace || hasDateRanges || hasContentTypes || hasLanguages;
  };

  const handleConfirmSelection = () => {
    // Get existing query parameters
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Preserve locale if it exists
    if (currentLocale && currentLocale !== 'en') {
      params.set('locale', currentLocale);
    }

    if (activeTab === 'cards' && selectedOptions.length > 0) {
      // Use only the newly selected types (don't combine with existing)
      const newTypes = selectedOptions.map(opt => opt.path);

      // Update the URL with only the new selections
      params.set('types', newTypes.join(','));
      router.push(`/articles?${params.toString()}`);

      // Clear selected options after confirming
      setSelectedOptions([]);
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
      
      // Handle language filters
      if (filters.languages?.length) {
        params.set('languages', filters.languages.join(','));
      }

      router.push(`/articles?${params.toString()}`);

      // Clear selected options after confirming
      setSelectedOptions([]);
      onClose();
    }
  }

  // Handler functions for FilterOptionsView
  const handleDateRangeChange = (range: string) => {
    setFilters(prev => {
      const ranges = prev.dateRanges || [];
      
      // If the range is empty, it means we're clearing that type of date
      if (range === 'start:' || range === 'end:') {
        // Remove any existing start or end date based on which one is being cleared
        const filteredRanges = range === 'start:' 
          ? ranges.filter(r => !r.startsWith('start:'))
          : ranges.filter(r => !r.startsWith('end:'));
        return { ...prev, dateRanges: filteredRanges };
      }
      
      // Check if this is a start or end date
      if (range.startsWith('start:')) {
        // Remove any existing start date
        const filteredRanges = ranges.filter(r => !r.startsWith('start:'));
        return { ...prev, dateRanges: [...filteredRanges, range] };
      } else if (range.startsWith('end:')) {
        // Remove any existing end date
        const filteredRanges = ranges.filter(r => !r.startsWith('end:'));
        return { ...prev, dateRanges: [...filteredRanges, range] };
      } else {
        // For other range types (legacy support)
        // Remove any existing start/end dates
        const filteredRanges = ranges.filter(r => !r.startsWith('start:') && !r.startsWith('end:'));
        return { ...prev, dateRanges: [...filteredRanges, range] };
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
    // If a full author name is selected (not just typing), prevent further suggestions
    if (value && !value.endsWith(' ')) {
      // This is likely a complete selection
      console.log('Complete author selected:', value);
    }
  };
  
  const handlePlaceChange = (value: string) => {
    console.log('FilterMenu: handlePlaceChange called with', value);
    setFilters(prev => {
      const newFilters = { ...prev, place: value, location: value };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
    // If a full place name is selected (not just typing), prevent further suggestions
    if (value && !value.endsWith(' ')) {
      // This is likely a complete selection
      console.log('Complete place selected:', value);
    }
  };



  const handleLanguageChange = (language: string) => {
    setFilters(prev => {
      const languages = prev.languages || [];
      if (languages.includes(language)) {
        return { ...prev, languages: languages.filter(l => l !== language) };
      } else {
        return { ...prev, languages: [...languages, language] };
      }
    });
  };

  function clearFilters(): void {
    setFilters({
      authorName: '',
      place: '',
      dateRanges: [],
      contentTypes: [],
      languages: [],
      category: []
    });
  }

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-[545px] sm:max-w-[90vw] max-w-full bg-background border-l border-border transform transition-transform duration-300 ease-in-out z-[60] ${
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
                    activeTab === 'cards' ? 'bg-primary-PARI-Red text-white' : 'ring-1 ring-primary-PARI-Red'
                  } hover:bg-primary-PARI-Red/80`}
                  onClick={() => setActiveTab('cards')}
                >
                  Category
                </Button>
                <Button 
                  variant="secondary"
                  className={`h-8 flex items-center rounded-full cursor-pointer ring-0 justify-center gap-2 ${
                    activeTab === 'filters' ? 'bg-primary-PARI-Red text-white' : 'ring-1 ring-primary-PARI-Red'
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
                handleLanguageChange={handleLanguageChange}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category: CategoryCard) => (
                  <div
                    key={category.id}
                    className={`group relative overflow-hidden rounded-lg h-[200px] shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${
                      selectedOptions.some(opt => opt.id === category.id.toString())
                        ? ' ring-2 ring-primary-PARI-Red '
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
                      className={`p-4 text-white flex flex-col justify-end items-center h-full  ${
                        selectedOptions.some(opt => opt.id === category.id.toString())
                          ? 'bg-gradient-to-t h-full from-primary-PARI-Red  via-primary-PARI-Red/40 to-transparent'
                          : 'gradient-overlay'
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
                  {activeTab === 'cards'
                    ? selectedOptions.length === 1
                      ? '1 Filter selected'
                      : `${selectedOptions.length} Filters selected`
                    : 'Active Filters'}
                </span>
                {activeTab === 'filters' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    className="h-5 w-5 p-0 rounded-full hover:bg-primary-PARI-Red/20 ml-2"
                  >
                    <X className="h-3 w-3 text-primary-PARI-Red" />
                  </Button>
                )}
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
          onClick={onClose}
        />
      )}
    </>
  )
}
