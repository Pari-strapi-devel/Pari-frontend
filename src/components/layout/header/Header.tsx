"use client"
import { useState,  } from 'react'
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

  return (
    <header className="border-b border-border dark:bg-popover bg-popover relative">
      <div className="container mx-auto px-4">
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
              <h3 className=" sm:w-[180px]  text-[13px] gap-2 flex items-center font-bold text-foreground">
                <Image 
                  src="/pari-logo.png" 
                  alt="pari-logo" 
                  width={90} 
                  height={90} 
                  priority
                /> 
                <p className='hidden sm:block'>  People’s Archive
                of Rural India</p>
               
              </h3>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden   md:flex items-center space-x-8">
            <Navigation />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              className="hover:bg-accent  dark:bg-popover bg-popover items-center justify-center p-2"
            >
              <Search className="h-[1.2rem] w-[1.2rem ] cursor-pointer text-red-600" />
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
                className="rounded-2xl hidden  md:block cursor-pointer w-[73px] h-[32px]"
              >
                Donate
              </Button>
            </div>
            
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border sm:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Navigation />
            </div>
          </div>
        </div>
      )}

      {/* Filter Menu */}
      <FilterMenu 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </header>
  )
}