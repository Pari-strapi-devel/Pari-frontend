
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FilterOption, filterOptions } from './Category'

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
          <label className="block text-sm font-medium">Author name</label>
          <input
            type="text"
            placeholder="Enter a name of author"
            className="w-full p-4 border h-[52px] rounded-[48px] shadow-md dark:bg-popover bg-popover "
            value={filters.authorName}
            onChange={(e) => setFilters(prev => ({ ...prev, authorName: e.target.value }))}
          />
        </div>

        {/* Place */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Place</label>
          <input
            type="text"
            placeholder="Enter a name of place"
            className="w-full p-4 border h-[52px] rounded-[48px] shadow-md dark:bg-popover bg-popover "
            value={filters.place}
            onChange={(e) => setFilters(prev => ({ ...prev, place: e.target.value }))}
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
                className="hover:bg-accent"
              >
                <X className="h-6 w-6 text-red-600" />
              </Button>
              <div className='flex flex-row space-x-2'>
                <Button 
                  variant="secondary"
                  className={`h-8 flex items-center ring-0 justify-center gap-2 ${
                    activeTab === 'cards' ? 'bg-red-700 text-white' : 'bg-gray-200'
                  } hover:bg-red-500`}
                  onClick={() => setActiveTab('cards')}
                >
                  Category
                </Button>
                <Button 
                  variant="secondary"
                  className={`h-8 flex items-center ring-0 justify-center gap-2 ${
                    activeTab === 'filters' ? 'bg-red-700 text-white' : 'bg-gray-200'
                  } hover:bg-red-500`}
                  onClick={() => setActiveTab('filters')}
                >
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto h-full p-4 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-100">
            {activeTab === 'filters' ? (
              <FilterOptionsView />
            ) : (
              <div className="grid grid-cols-2  gap-4">
                {filterOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`group relative overflow-hidden rounded-lg h-[164px] shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer ${
                      selectedOptions.some(opt => opt.id === option.id) 
                        ? ' ring-1 ring-red-600' 
                        : ''
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div 
                      className={`${option.color} p-4 text-white flex flex-col justify-end items-center h-full  ${
                        selectedOptions.some(opt => opt.id === option.id)
                          ? 'bg-gradient-to-t h-full from-red-700 via-red-700/90 to-transparent'
                          : ''
                      }`}
                    >
                      {option.icon && <option.icon className="h-6 w-6 mb-2" />}
                      <div 
                        className="absolute inset-0 bg-cover bg-center  h-full -z-10"
                        style={{
                          backgroundImage: `url(${option.img || `/images/categories/${option.path?.replace('/', '')}.jpg`})`
                        }}
                      />
                      <h3 className="font-semibold">{option.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {(selectedOptions.length > 0 || hasActiveFilters()) && (
            <div className="p-4 border-t dark:bg-popover bg-popover">
              <div className="flex items-center justify-center text-red-600 mb-3">
                <span className="text-lg font-medium">
                  {activeTab === 'cards' ? `Filters ${selectedOptions.length}` : 'Active Filters'}
                </span>
              </div>
              <Button 
                variant="secondary"
                className="w-full bg-red-700 ring-0  text-white hover:bg-red-500 px-8 py-4 text-lg font-semibold"
                onClick={handleConfirmSelection}
              >
                Confirm Selection
              </Button>
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