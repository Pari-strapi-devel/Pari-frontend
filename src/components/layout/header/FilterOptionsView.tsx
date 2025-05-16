import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import qs from 'qs';
import { BASE_URL } from '@/config';

interface FilterState {
  authorName?: string;
  location?: string;
  dateRanges?: string[];
  contentTypes?: string[];
}

interface FilterOptionsViewProps {
  filters: FilterState;
  handleDateRangeChange: (range: string) => void;
  handleContentTypeChange: (type: string) => void;
  handleAuthorChange: (value: string) => void;
  handlePlaceChange: (value: string) => void;
}

interface AuthorSuggestion {
  id: number;
  name: string;
}

interface LocationSuggestion {
  id: number;
  name: string;
}

export function FilterOptionsView({
  filters,
  handleDateRangeChange,
  handleContentTypeChange,
  handleAuthorChange,
  handlePlaceChange
}: FilterOptionsViewProps) {
  const [authorSuggestions, setAuthorSuggestions] = useState<AuthorSuggestion[]>([]);
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
  const [isLoadingAuthorSuggestions, setIsLoadingAuthorSuggestions] = useState(false);
  const authorSuggestionsRef = useRef<HTMLDivElement>(null);
  
  const [placeSuggestions, setPlaceSuggestions] = useState<LocationSuggestion[]>([]);
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const [isLoadingPlaceSuggestions, setIsLoadingPlaceSuggestions] = useState(false);
  const placeSuggestionsRef = useRef<HTMLDivElement>(null);

  // Add a state to track if a selection has been made
  const [authorSelectionMade, setAuthorSelectionMade] = useState(false);
  const [placeSelectionMade, setPlaceSelectionMade] = useState(false);

  // Handle clicks outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authorSuggestionsRef.current && !authorSuggestionsRef.current.contains(event.target as Node)) {
        setShowAuthorSuggestions(false);
      }
      if (placeSuggestionsRef.current && !placeSuggestionsRef.current.contains(event.target as Node)) {
        setShowPlaceSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch author suggestions
  useEffect(() => {
    const fetchAuthorSuggestions = async () => {
      // Don't fetch if a selection has been made
      if (authorSelectionMade || !filters.authorName || filters.authorName.length < 1) {
        setAuthorSuggestions([]);
        setShowAuthorSuggestions(false);
        return;
      }
      
      setIsLoadingAuthorSuggestions(true);
      setShowAuthorSuggestions(true);
      
      try {
        const query = {
          filters: {
            Name: {
              $containsi: filters.authorName
            }
          },
          pagination: {
            limit: 5
          }
        };
        
        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const apiUrl = BASE_URL.endsWith('/') ? `${BASE_URL}api/authors` : `${BASE_URL}/api/authors`;
        
        const response = await axios.get(`${apiUrl}?${queryString}`);
        
        const suggestions = response.data.data.map((item: { id: number; attributes: { Name: string } }) => {
          return ({
            id: item.id,
            name: item.attributes.Name
          });
        });
        
        // Remove duplicates by name
        const uniqueSuggestions = Array.from(
          new Map(suggestions.map((item: AuthorSuggestion) => [item.name.toLowerCase(), item])).values()
        );
        
        setAuthorSuggestions(uniqueSuggestions as AuthorSuggestion[]);
      } catch (error) {
        console.error('Error fetching author suggestions:', error);
        setAuthorSuggestions([]);
      } finally {
        setIsLoadingAuthorSuggestions(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      if (filters.authorName && filters.authorName.length >= 1) {
        fetchAuthorSuggestions();
      } else {
        // Clear suggestions when input is empty
        setAuthorSuggestions([]);
        setShowAuthorSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [filters.authorName, authorSelectionMade]);

  // Handle author selection
  const handleAuthorSelect = (name: string) => {
    handleAuthorChange(name);
    setShowAuthorSuggestions(false);
    setAuthorSuggestions([]);
    setAuthorSelectionMade(true); // Mark that a selection has been made
  };
  
  // Handle place selection
  const handlePlaceSelect = (name: string) => {
    handlePlaceChange(name);
    setShowPlaceSuggestions(false);
    setPlaceSuggestions([]);
    setPlaceSelectionMade(true); // Mark that a selection has been made
  };

  // Reset selection state when input changes
  useEffect(() => {
    if (!filters.authorName) {
      setAuthorSelectionMade(false);
    }
  }, [filters.authorName]);

  useEffect(() => {
    if (!filters.location) {
      setPlaceSelectionMade(false);
    }
  }, [filters.location]);

  // Modify the input handlers to only show suggestions when typing
  const handleAuthorInputFocus = () => {
    // Only show suggestions if actively typing, not on initial focus
    if (filters.authorName && filters.authorName.length >= 1 && authorSuggestions.length > 0) {
      setShowAuthorSuggestions(true);
    }
  };

  const handlePlaceInputFocus = () => {
    // Only show suggestions if actively typing, not on initial focus
    if (filters.location && filters.location.length >= 1 && placeSuggestions.length > 0) {
      setShowPlaceSuggestions(true);
    }
  };

  // Add blur handlers to inputs
  const handleAuthorInputBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowAuthorSuggestions(false);
    }, 200);
  };
  

  const handlePlaceInputBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowPlaceSuggestions(false);
    }, 200);
  };

  // Fetch place suggestions
  useEffect(() => {
    const fetchPlaceSuggestions = async () => {
      // Don't fetch if a selection has been made
      if (placeSelectionMade || !filters.location || filters.location.length < 1) {
        setPlaceSuggestions([]);
        setShowPlaceSuggestions(false);
        return;
      }
      
      setIsLoadingPlaceSuggestions(true);
      setShowPlaceSuggestions(true);
      
      try {
        const query = {
          filters: {
            name: {
              $containsi: filters.location
            }
          },
          pagination: {
            limit: 5
          }
        };
        
        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const apiUrl = BASE_URL.endsWith('/') ? `${BASE_URL}api/locations` : `${BASE_URL}/api/locations`;
        
        const response = await axios.get(`${apiUrl}?${queryString}`);
        
        const suggestions = response.data.data.map((item: { id: number; attributes: { name: string } }) => ({
          id: item.id,
          name: item.attributes.name
        }));
        
        setPlaceSuggestions(suggestions as LocationSuggestion[]);
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
        setPlaceSuggestions([]);
      } finally {
        setIsLoadingPlaceSuggestions(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      if (filters.location && filters.location.length >= 1) {
        fetchPlaceSuggestions();
      } else {
        // Clear suggestions when input is empty
        setPlaceSuggestions([]);
        setShowPlaceSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [filters.location, placeSelectionMade]);

  return (
    <div className="p-4 space-y-6 bg-background dark:bg-background">
      <h2 className="text-xl font-semibold mb-4">Choose filters to apply</h2>
      
      {/* Author Name */}
      <div className="space-y-2 relative">
        <label htmlFor="authorName" className="block text-sm font-medium">Author name</label>
        <input
          id="authorName"
          type="text"
          value={filters.authorName || ''}
          onChange={(e) => handleAuthorChange(e.target.value)}
          onFocus={handleAuthorInputFocus}
          onBlur={handleAuthorInputBlur}
          placeholder="Enter a name of author"
          className="w-full p-4 border h-[52px] rounded-[8px] shadow-sm dark:bg-popover bg-popover focus:outline-none focus:ring-1 focus:ring-primary-PARI-Red"
        />
        
        {/* Author suggestions */}
        {(showAuthorSuggestions && filters.authorName && filters.authorName.length >= 1 && authorSuggestions.length > 0) && (
          <div 
            ref={authorSuggestionsRef}
            className="absolute z-10 w-full mt-1 bg-popover shadow-lg rounded-md border border-border dark:border-border"
          >
            {isLoadingAuthorSuggestions ? (
              <div className="p-3 text-center text-discreet-text">Loading...</div>
            ) : authorSuggestions.length > 0 ? (
              authorSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 hover:bg-background border-b border-border cursor-pointer"
                  onClick={() => handleAuthorSelect(suggestion.name)}
                >
                  {suggestion.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">No authors found</div>
            )}
          </div>
        )}
      </div>

      {/* Place */}
      <div className="space-y-2 relative">
        <label htmlFor="location" className="block text-sm font-medium">Place</label>
        <input
          id="location"
          type="text"
          value={filters.location || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('Changing location to:', newValue);
            handlePlaceChange(newValue);
          }}
          onFocus={handlePlaceInputFocus}
          onBlur={handlePlaceInputBlur}
          placeholder="Enter a name of place"
          className="w-full p-4 border h-[52px] rounded-[8px] shadow-sm dark:bg-popover bg-popover focus:outline-none focus:ring-1 focus:ring-primary-PARI-Red"
        />
        
        {/* Place suggestions */}
        {(showPlaceSuggestions && filters.location && filters.location.length >= 1 && placeSuggestions.length > 0) && (
          <div 
            ref={placeSuggestionsRef}
            className="absolute z-10 w-full bg-popover shadow-lg rounded-md border border-border dark:border-border"
          >
            {isLoadingPlaceSuggestions ? (
              <div className="p-3 text-center text-discreet-text">Loading...</div>
            ) : placeSuggestions.length > 0 ? (
              placeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 hover:bg-background border-b border-border cursor-pointer"
                  onClick={() => handlePlaceSelect(suggestion.name)}
                >
                  {suggestion.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">No places found</div>
            )}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Date Range</label>
        <div className=" border rounded-md shadow-sm hover:shadow-md dark:bg-popover bg-popover transition-shadow">
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
              className="w-6 h-6 rounded border border-border  bg-background appearance-none checked:bg-primary-PARI-Red checked:border-transparent relative cursor-pointer
              after:content-['✓'] font-bold after:absolute checked:text-white after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:opacity-0 checked:after:opacity-100"
            />

              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Content type</label>
        <div className=" border rounded-md shadow-sm dark:bg-popover bg-popover hover:shadow-md transition-shadow">
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
                className="w-6 h-6 rounded border border-border bg-background appearance-none checked:bg-primary-PARI-Red checked:border-transparent relative cursor-pointer
                after:content-['✓'] font-bold after:absolute  checked:text-white after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:opacity-0 checked:after:opacity-100"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
