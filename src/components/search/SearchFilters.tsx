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

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0)

  return (
    <>
      {/* Mobile Overlay with Backdrop Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black backdrop-blur-sm z-[60] md:mt-10 md:hidden transition-opacity duration-300"
          onClick={onToggle}
          style={{ WebkitBackdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar Content or Toggle Button */}
      {isOpen ? (
        /* Filter Sidebar - Full Content */
        <div className={`
          fixed md:sticky top-0 ${isSticky ? 'md:top-36' : 'md:top-60'} left-0 h-screen md:h-auto md:max-h-[calc(100vh-20rem)]
          w-[85vw] sm:w-80 md:w-72 lg:w-80 bg-popover border md:border border-border-line dark:border-popover
          shadow-lg md:shadow-none rounded-r-lg md:rounded-lg
          transform transition-transform duration-300 ease-in-out z-[70] md:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-3 border-b border-border-line dark:border-popover flex-shrink-0">

            <div className="flex items-center gap-2">
             
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 p-1.5 transition-all duration-200"
                aria-label="Close filters"
              >
                <PanelRightClose className="h-5 w-5" />
              </Button>
               {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs md:text-sm text-primary-PARI-Red hover:text-primary-PARI-Red/80 hover:bg-primary-PARI-Red/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

        {/* Filter Content */}
        <div className={`px-6 md:px-5 pb-6 md:pb-5 pt-4 overflow-y-auto flex-1 ${isSticky ? 'md:mt-0' : ''}`}>
          <div className="space-y-6">
            {/* Author */}
            <div className="space-y-2">
            <label className="text-base font-semibold text-foreground block">Author name</label>
            <Input
              placeholder="author"
              value={filters.author || ''}
              onChange={(e) => onFiltersChange({ ...filters, author: e.target.value })}
              className="text-sm h-12 focus-visible:ring-primary-PARI-Red"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-base font-semibold text-foreground block">Location</label>
            <Input
              placeholder="location"
              value={filters.location || ''}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              className="text-sm h-12 focus-visible:ring-primary-PARI-Red"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-base font-semibold text-foreground block">Language</label>
            <select
              value={filters.language || ''}
              onChange={(e) => onFiltersChange({ ...filters, language: e.target.value })}
              className="flex h-12 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-PARI-Red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="space-y-2">
            <label className="text-base font-semibold text-foreground block">Date Range</label>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-foreground mb-1 block">From:</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-PARI-Red pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                    className="text-sm h-12 pl-10 cursor-pointer focus-visible:ring-primary-PARI-Red [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground mb-1 block">To:</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-PARI-Red pointer-events-none z-10" />
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                    className="text-sm h-12 pl-10 cursor-pointer focus-visible:ring-primary-PARI-Red [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Type */}

          </div>
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
