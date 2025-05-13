"use client"
import { useState, useEffect } from 'react'
import { Navigation } from './Navigation'
import { ThemeToggle } from "./ThemeToggle"
import { FilterMenu } from "./FilterMenu"
import { Button } from "@/components/ui/button"
import { Search, Menu, X } from "lucide-react"
import Image from 'next/image'
import { useFilterStore } from '@/store/filterStore'
import Link from 'next/link'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const isFilterOpen = useFilterStore((state) => state.isOpen)
  const setIsFilterOpen = useFilterStore((state) => state.setIsOpen)

  // Add useEffect to handle body scroll and blur
  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (isFilterOpen || isMenuOpen) {
      document.body.style.overflow = 'hidden'
      mainContent?.classList.add('content-blur')
    } else {
      document.body.style.overflow = 'unset'
      mainContent?.classList.remove('content-blur')
    }

    return () => {
      document.body.style.overflow = 'unset'
      mainContent?.classList.remove('content-blur')
    }
  }, [isFilterOpen, isMenuOpen])

  return (
    <>
      <header className={`border-b border-border dark:bg-popover h-[88px] flex bg-popover relative ${isFilterOpen ? 'z-30' : 'z-50'}`}>
        <div className="container mx-auto  top-0 px-4 max-w-[1282px]">
          <nav className="flex items-center justify-between  h-full">
            {/* Left side with logo and mobile menu */}
            <div className={`flex gap-2 items-center space-x-2 ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
              <Button
                variant="secondary"
                size="icon"
                className="md:hidden rounded-full h-[32px] w-[32px] dark:hover:bg-primary-PARI-Red dark:bg-popover bg-popover items-center justify-center p-2  text-primary-PARI-Red"
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
                <Link href="/">
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
                </Link>
              </div>
            </div>

            {/* Desktop Navigation or Search Input */}
            {isSearchExpanded ? (
              <div className={`flex-1 ${isSearchExpanded ? 'w-full absolute left-0 right-0 px-4 md:relative md:px-0 md:mx-4' : 'mx-4'}`}>
                <div className="flex items-center w-full bg-background dark:bg-background rounded-full border border-input">
                  <input 
                    type="text" 
                    placeholder="Search for anything..." 
                    className="flex-1  border-none focus:outline-none px-4 py-2 h-[48px]"
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    <X className="h-[2rem] w-[2rem] text-primary-PARI-Red" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-8">
                <Navigation />
              </div>
            )}

            {/* Right Side Actions */}
            <div className={`flex items-center  justify-center space-x-2 md:space-x-4 ${isSearchExpanded ? 'hidden md:flex' : 'flex'} ${isMenuOpen ? 'md:flex hidden' : 'flex'}`}>
              {!isSearchExpanded && (
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="rounded-full h-[32px] w-[32px]  dark:hover:bg-primary-PARI-Red dark:bg-popover bg-popover items-center justify-center p-2 text-primary-PARI-Red"
                  onClick={() => setIsSearchExpanded(true)}
                >
                  <Search className="h-[1.2rem] w-[1.2rem] cursor-pointer" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
              
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
                  className="rounded-2xl items-center hidden md:flex cursor-pointer w-[73px] h-[32px]"
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
          className={`fixed top-0 left-0 h-full w-full max-w-[395px]   bg-background border-r border-border transform transition-transform duration-300 ease-in-out z-[60] md:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col  h-full">
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
                  <X className="h-7 w-7 text-primary-PARI-Red" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <Navigation onLinkClick={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </div>

        {/* Overlay */}
        {(isMenuOpen || isFilterOpen) && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setIsMenuOpen(false)
              setIsFilterOpen(false)
            }}
          />
        )}

        {/* Filter Menu */}
        <FilterMenu 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
      </header>
    </>
  )
}
