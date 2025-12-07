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
  category?: string
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [sliderDirection, setSliderDirection] = useState<'left' | 'right'>('right')

  // Sync temp filters with actual filters when they change externally
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  // Handle animation timing when sidebar opens/closes
  useEffect(() => {
    if (isOpen) {
      // Render the component first
      setShouldRender(true)
      // Small delay to ensure the panel renders off-screen first, then slides in
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 50) // 50ms delay for smoother opening animation
      return () => clearTimeout(timer)
    } else {
      // Start closing animation
      setIsAnimating(false)
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // Match the transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

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

  // Drag handler to switch between left and right - only on drag indicator
  const handleSliderDrag = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to avoid interfering with other interactions
    e.stopPropagation()

    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX

    const handleMove = (moveEvent: TouchEvent | MouseEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const diff = currentX - startX

      // If dragged more than 100px, switch direction
      if (Math.abs(diff) > 100) {
        if (diff > 0 && sliderDirection === 'left') {
          setSliderDirection('right')
        } else if (diff < 0 && sliderDirection === 'right') {
          setSliderDirection('left')
        }
        cleanup()
      }
    }

    const handleEnd = () => {
      cleanup()
    }

    const cleanup = () => {
      document.removeEventListener('touchmove', handleMove as EventListener)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('mousemove', handleMove as EventListener)
      document.removeEventListener('mouseup', handleEnd)
    }

    document.addEventListener('touchmove', handleMove as EventListener)
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('mousemove', handleMove as EventListener)
    document.addEventListener('mouseup', handleEnd)
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0)
  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters)

  return (
    <>
      {/* Mobile Overlay with Backdrop Blur */}
      {shouldRender && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[66] md:mt-10 md:hidden transition-all duration-300 ease-out`}
          style={{
            opacity: isAnimating ? 1 : 0,
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar Content or Toggle Button */}
      {shouldRender ? (
        /* Filter Sidebar - Full Content */
        <div
          className={`
            fixed md:sticky top-0 ${isSticky ? 'md:top-44' : 'md:top-72'} h-screen md:h-auto md:max-h-[calc(100vh-20rem)]
            w-[90vw] sm:w-96 md:w-72 lg:w-80 bg-popover md:border border-border-line dark:border-popover
            shadow-2xl md:shadow-none md:rounded-lg z-[70] md:z-auto flex flex-col overflow-hidden
            ${sliderDirection === 'right' ? 'right-0 border-l' : 'left-0 border-r'}
          `}
          style={{
            transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
            transform: isAnimating
              ? 'translateX(0)'
              : sliderDirection === 'right'
                ? 'translateX(100%)'
                : 'translateX(-100%)',
            opacity: isAnimating ? 1 : 0,
            willChange: 'transform, opacity'
          }}
        >
          {/* Drag Handle Indicator */}
          <div
            className={`absolute top-20 ${sliderDirection === 'right' ? 'left-0' : 'right-0'} w-1 h-20 bg-primary-PARI-Red/30 rounded-full cursor-grab active:cursor-grabbing md:hidden`}
            title="Drag to switch sides"
            onTouchStart={handleSliderDrag}
            onMouseDown={handleSliderDrag}
          />

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

            {/* Mobile Apply Filter Button */}
            <div className="md:hidden">
              <Button
                onClick={applyFilters}
                size="sm"
                className={`h-8 px-4 text-sm font-semibold bg-primary-PARI-Red hover:bg-primary-PARI-Red/90 text-white rounded-full shadow-md active:scale-95 transition-all duration-200 ${
                  hasChanges ? 'ring-1 ring-primary-PARI-Red ring-offset-1' : ''
                }`}
              >
                Apply
              </Button>
            </div>
          </div>

        {/* Filter Content */}
        <div className={`px-6 md:px-5 pb-8 md:pb-5 pt-6 md:pt-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-primary-PARI-Red/20 scrollbar-track-transparent ${isSticky ? 'md:mt-0' : ''}`}>
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

          {/* Category */}
          <div className="space-y-3 md:space-y-2">
            <label className="text-base md:text-sm font-semibold text-foreground block">Category</label>
            <Input
              placeholder="Enter category"
              value={tempFilters.category || ''}
              onChange={(e) => {
                const newFilters = { ...tempFilters, category: e.target.value }
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
            <Filter className="w-5 h-5 pt-1 hover:text-white text-primary-PARI-Red" />
          </button>
        </div>
      )}
    </>
  )
}
