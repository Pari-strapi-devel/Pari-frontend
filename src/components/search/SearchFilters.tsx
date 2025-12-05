'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, PanelRightClose, Filter } from 'lucide-react'
import { languages } from '@/data/languages'

export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  author?: string
  location?: string
  language?: string
  contentType?: string[]
}

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  isOpen: boolean
  onToggle: () => void
}

export function SearchFiltersSidebar({
  filters,
  onFiltersChange,
  isOpen,
  onToggle
}: SearchFiltersProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters)

  // Sync temp filters with actual filters when they change externally
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  // Detect if sticky header is active
  useEffect(() => {
    const handleScroll = () => {
      const mainHeaderElement = document.querySelector('.main-header-section') as HTMLElement
      const mainHeaderHeight = mainHeaderElement ? mainHeaderElement.offsetHeight : 160
      setIsSticky(window.scrollY > mainHeaderHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const clearAllFilters = () => {
    setTempFilters({})
    onFiltersChange({})
  }

  const applyFilters = () => {
    onFiltersChange(tempFilters)
    // Close sidebar on mobile after applying filters
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyFilters()
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0)
  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters)

  return (
    <>
      {/* Mobile Overlay with Backdrop Blur */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[66] md:mt-10 md:hidden transition-all duration-300 ease-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onToggle}
          style={{ WebkitBackdropFilter: 'blur(8px)' }}
        />
      )}

      {/* Sidebar Content or Toggle Button */}
      {isOpen ? (
        /* Filter Sidebar - Full Content */
        <div className={`
          fixed md:sticky top-0 ${isSticky ? 'md:top-36' : 'md:top-60'} left-0 h-screen md:h-auto md:max-h-[calc(100vh-20rem)]
          w-[90vw] sm:w-96 md:w-72 lg:w-80 bg-popover border-r md:border border-border-line dark:border-popover
          shadow-2xl md:shadow-none  md:rounded-lg
          transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[70] md:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-3 border-b border-border-line dark:border-popover flex-shrink-0 bg-popover/50 backdrop-blur-sm">

            <div className="flex items-center gap-3">

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-10 w-10 md:h-8 md:w-8 p-2 md:p-1.5 transition-all duration-200 hover:bg-primary-PARI-Red/10 active:scale-95"
                aria-label="Close filters"
              >
                <PanelRightClose className="h-6 w-6 md:h-5 md:w-5 text-primary-PARI-Red" />
              </Button>
               {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-sm md:text-sm px-4 py-2 text-primary-PARI-Red hover:text-primary-PARI-Red/80 hover:bg-primary-PARI-Red/10 active:scale-95 transition-all"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

        {/* Filter Content */}
        <div className={`px-6 md:px-5 pb-24 md:pb-5 pt-6 md:pt-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-primary-PARI-Red/20 scrollbar-track-transparent ${isSticky ? 'md:mt-0' : ''}`}>
          <div className="space-y-7 md:space-y-6">
            {/* Author */}
            <div className="space-y-3 md:space-y-2">
            <label className="text-base md:text-sm font-semibold text-foreground block">Author name</label>
            <Input
              placeholder="Enter author name"
              value={tempFilters.author || ''}
              onChange={(e) => {
                const newFilters = { ...tempFilters, author: e.target.value }
                setTempFilters(newFilters)
                // Auto-apply on desktop
                if (window.innerWidth >= 768) {
                  onFiltersChange(newFilters)
                }
              }}
              onKeyDown={handleKeyDown}
              className="text-base md:text-sm h-14 md:h-12 focus-visible:ring-primary-PARI-Red focus-visible:ring-2 transition-all"
            />
          </div>

          {/* Location */}
          <div className="space-y-3 md:space-y-2">
            <label className="text-base md:text-sm font-semibold text-foreground block">Location</label>
            <Input
              placeholder="Enter location"
              value={tempFilters.location || ''}
              onChange={(e) => {
                const newFilters = { ...tempFilters, location: e.target.value }
                setTempFilters(newFilters)
                // Auto-apply on desktop
                if (window.innerWidth >= 768) {
                  onFiltersChange(newFilters)
                }
              }}
              onKeyDown={handleKeyDown}
              className="text-base md:text-sm h-14 md:h-12 focus-visible:ring-primary-PARI-Red focus-visible:ring-2 transition-all"
            />
          </div>

          {/* Language */}
          <div className="space-y-3 md:space-y-2">
            <label className="text-base md:text-sm font-semibold text-foreground block">Language</label>
            <select
              value={tempFilters.language || ''}
              onChange={(e) => {
                const newFilters = { ...tempFilters, language: e.target.value }
                setTempFilters(newFilters)
                // Auto-apply on desktop
                if (window.innerWidth >= 768) {
                  onFiltersChange(newFilters)
                }
              }}
              className="flex h-14 md:h-12 w-full rounded-md border border-input bg-background px-4 md:px-3 py-2 text-base md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-PARI-Red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.names[0]} {lang.names[1]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-3 md:space-y-2">
            <label className="text-base md:text-sm font-semibold text-foreground block">Date Range</label>
            <div className="space-y-4 md:space-y-2">
              <div>
                <label className="text-sm text-foreground mb-2 md:mb-1 block">From:</label>
                <div className="relative">
                  <Calendar className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 h-6 w-6 md:h-5 md:w-5 text-primary-PARI-Red pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={tempFilters.dateFrom || ''}
                    onChange={(e) => {
                      const newFilters = { ...tempFilters, dateFrom: e.target.value }
                      setTempFilters(newFilters)
                      // Auto-apply on desktop
                      if (window.innerWidth >= 768) {
                        onFiltersChange(newFilters)
                      }
                    }}
                    className="text-base md:text-sm h-14 md:h-12 pl-12 md:pl-10 cursor-pointer focus-visible:ring-primary-PARI-Red focus-visible:ring-2 transition-all [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground mb-2 md:mb-1 block">To:</label>
                <div className="relative">
                  <Calendar className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 h-6 w-6 md:h-5 md:w-5 text-primary-PARI-Red pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={tempFilters.dateTo || ''}
                    onChange={(e) => {
                      const newFilters = { ...tempFilters, dateTo: e.target.value }
                      setTempFilters(newFilters)
                      // Auto-apply on desktop
                      if (window.innerWidth >= 768) {
                        onFiltersChange(newFilters)
                      }
                    }}
                    className="text-base md:text-sm h-14 md:h-12 pl-12 md:pl-10 cursor-pointer focus-visible:ring-primary-PARI-Red focus-visible:ring-2 transition-all [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Type */}

          </div>
        </div>

        {/* Mobile Apply Filter Button - Fixed at bottom */}
        <div className="md:hidden border-t border-border-line z-1000 dark:border-popover p-4 bg-popover/80 backdrop-blur-sm flex-shrink-0">
          <Button
            onClick={applyFilters}
            className={`w-full h-14 text-base font-semibold bg-primary-PARI-Red hover:bg-primary-PARI-Red/90 text-white rounded-lg shadow-lg active:scale-95 transition-all duration-200 ${
              hasChanges ? 'animate-pulse' : ''
            }`}
          >
            Apply Filters
          </Button>
        </div>
        </div>
      ) : (
        /* Toggle Button - Shows when sidebar is closed */
        <div
          className={`hidden md:flex items-start justify-start`}
          style={{
            position: 'sticky',
            top: isSticky ? '10rem' : '16rem',
            paddingTop: '2rem',
          
          }}
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-full bg-popover cursor-pointer dark:bg-background border dark:ring-primary-PARI-Red border-border dark:border-primary-PARI-Red text-discreet-text dark:text-discreet-text hover:text-white transition-all duration-200 hover:bg-primary-PARI-Red dark:hover:bg-primary-PARI-Red"
            aria-label="Open filters"
          >
            <Filter className="w-5 h-5 pt-1 text-primary-PARI-Red" />
          </button>
        </div>
      )}
    </>
  )
}
