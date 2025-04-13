"use client"
import { useState, useEffect } from 'react'
import { Navigation } from './Navigation'
import { ThemeToggle } from "./ThemeToggle"
import { FilterMenu } from "./FilterMenu"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import Image from 'next/image'
import { useFilterStore } from '@/store/filterStore'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isFilterOpen = useFilterStore((state) => state.isOpen)
  const setIsFilterOpen = useFilterStore((state) => state.setIsOpen)

  // Add useEffect to handle body scroll
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="border-b border-border dark:bg-popover bg-popover relative">
      <div className="container mx-auto f top-0 px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Left side with logo and mobile menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
            <div className="flex items-center">
              <h3 className="sm:w-[180px] text-[13px] gap-2 flex items-center font-bold text-foreground">
                <Image 
                  src="/pari-logo.png" 
                  alt="pari-logo" 
                  width={90} 
                  height={90} 
                  priority
                /> 
                <p className='hidden sm:block'>People&apos;s Archive of Rural India</p>
              </h3>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Navigation />
          </div>

          {/* Right Side Actions */}
          <div className={`flex items-center space-x-2 md:space-x-4 ${isMenuOpen ? 'md:flex hidden' : 'flex'}`}>
            <Button 
              variant="outline" 
              size="icon"
              className="hover:bg-accent dark:bg-popover bg-popover items-center justify-center p-2"
            >
              <Search className="h-[1.2rem] w-[1.2rem] cursor-pointer text-red-600" />
              <span className="sr-only">Search</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                className="rounded-2xl w-[73px] cursor-pointer h-[32px] flex items-center gap-1"
                onClick={() => setIsFilterOpen(true)}
              >
                {isFilterOpen ? (
                  <X className="h-4 w-4" />
                ) : null}
                Filter
              </Button>

              <Button 
                variant="secondary" 
                className="rounded-2xl hidden md:block cursor-pointer w-[73px] h-[32px]"
              >
                Donate
              </Button>
            </div>
            
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile Menu Slider */}
      <div 
        className={`fixed top-0 left-0 h-full w-full max-w-[350px] bg-background border-r border-border transform transition-transform duration-300 ease-in-out z-[60] md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Image 
                src="/pari-logo.png" 
                alt="pari-logo" 
                width={60} 
                height={60} 
                priority
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <Navigation />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Filter Menu */}
      <FilterMenu 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </header>
  )
}
