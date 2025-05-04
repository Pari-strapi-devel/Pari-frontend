
import {  useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { CategoryCard, FilterOption } from './Category'

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
    if (activeTab === 'cards' && selectedOptions.length > 0) {
      const paths = selectedOptions.map(opt => opt.path).join(',')
      router.push(`/filter?types=${paths}`)
      onClose()
    } else if (activeTab === 'filters' && hasActiveFilters()) {
      const queryParams = new URLSearchParams();
      
      if (filters.authorName) queryParams.append('author', filters.authorName);
      if (filters.place) queryParams.append('place', filters.place);
      if (filters.dateRanges?.length) queryParams.append('dates', filters.dateRanges.join(','));
      if (filters.contentTypes?.length) queryParams.append('content', filters.contentTypes.join(','));
      
      router.push(`/filter?${queryParams.toString()}`);
      onClose()
    }
  }

  // Modify FilterOptionsView to accept and update filters directly
  const FilterOptionsView = () => {
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

    return (
      <div className="p-4 space-y-6 bg-background dark:bg-background">
        <h2 className="text-xl font-semibold mb-4">Choose filters to apply</h2>
        
        {/* Author Name */}
        <div className="space-y-2">
          <label htmlFor="authorName" className="block text-sm font-medium">Author name</label>
          <input
            id="authorName"
            type="text"
            placeholder="Enter a name of author"
            className="w-full p-4 border h-[52px] rounded-[48px] shadow-md dark:bg-popover bg-popover focus:outline-none focus:ring-2 focus:ring-red-600"
          
            
          
          />
        </div>

        {/* Place */}
        <div className="space-y-2">
          <label htmlFor="place" className="block text-sm font-medium">Place</label>
          <input
            id="place"
            type="text"
            placeholder="Enter a name of place"
            className="w-full p-4 border h-[52px] rounded-[48px] shadow-md dark:bg-popover bg-popover focus:outline-none focus:ring-2 focus:ring-red-600"
          
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date Range</label>
          <div className="space-y-2 border rounded-md shadow-lg hover:shadow-md dark:bg-popover bg-popover transition-shadow">
            {[
              { id: 'date-range-7', value: '7days', label: 'Past 7 days' },
              { id: 'date-range-14', value: '14days', label: 'Past 14 days' },
              { id: 'date-range-30', value: '30days', label: 'Past 30 days' },
              { id: 'date-range-365', value: '1year', label: 'Past 1 year' }
            ].map((range) => (
              <label 
                key={range.id}
                className={`flex items-center space-x-3 cursor-pointer hover:bg-accent/50 p-4 transition-colors ${
                  range.id !== 'date-range-365' ? 'border-b-2' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.dateRanges?.includes(range.value)}
                  onChange={() => handleDateRangeChange(range.value)}
                  className="w-6 h-6 rounded border-gray-900 accent-red-600 cursor-pointer"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Content type</label>
          <div className="space-y-2 border rounded-md shadow-lg dark:bg-popover bg-popover hover:shadow-md transition-shadow">
            {[
              { id: 'content-type-editorial', value: 'Editorials', label: 'Editorials' },
              { id: 'content-type-video', value: 'Video Articles', label: 'Video Articles' },
              { id: 'content-type-audio', value: 'Audio Articles', label: 'Audio Articles' },
              { id: 'content-type-student', value: 'Student Articles', label: 'Student Articles' }
            ].map((type) => (
              <label 
                key={type.id}
                className={`flex items-center space-x-3 cursor-pointer hover:bg-accent/50 p-4 transition-colors ${
                  type.id !== 'content-type-student' ? 'border-b-2' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.contentTypes?.includes(type.value)}
                  onChange={() => handleContentTypeChange(type.value)}
                  className="w-6 h-6 rounded border-gray-900 accent-red-600 cursor-pointer"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
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
              <FilterOptionsView />
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
                      className={`p-4 text-white flex flex-col justify-end items-center   h-full gradient-overlay ${
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
