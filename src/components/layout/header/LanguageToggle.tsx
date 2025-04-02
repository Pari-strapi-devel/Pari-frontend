
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFilterStore } from '@/store/filterStore'

interface Language {
  code: string;
  displayCode: {
    en: string;    // English script
    native: string; // Native script
  };
  name: string;
}

// interface FilterState {
//   isOpen: boolean;
// }

const languages: Language[] = [
  { 
    code: 'en', 
    displayCode: { en: 'EN', native: 'EN' }, 
    name: 'English' 
  },
  { 
    code: 'ur', 
    displayCode: { en: 'UR', native: 'اردو' }, 
    name: 'اردو' 
  },
  { 
    code: 'mr', 
    displayCode: { en: 'MR', native: 'मरा' }, 
    name: 'मराठी' 
  },
  { 
    code: 'hi', 
    displayCode: { en: 'HI', native: 'हि' }, 
    name: 'हिंदी' 
  },
  { 
    code: 'or', 
    displayCode: { en: 'OR', native: 'ଓଡ଼ି' }, 
    name: 'ଓଡ଼ିଆ' 
  },
  { 
    code: 'bn', 
    displayCode: { en: 'BN', native: 'বাং' }, 
    name: 'বাংলা' 
  },
]

export function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isVisible, setIsVisible] = useState(true);
  const isFilterOpen = useFilterStore((state) => state.isOpen);

  useEffect(() => {
    setIsVisible(!isFilterOpen);
  }, [isFilterOpen]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setOpen(false);
  };

  const getDisplayCode = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? (
      <div className="flex items-center gap-2">
        <span>{language.displayCode.en}</span>
        <span className="text-xs opacity-50">|</span>
        <span>{language.displayCode.native}</span>
      </div>
    ) : code;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 md:bottom-8  rounded-full lg:bottom-10 right-4 sm:right-6 md:right-8 lg:right-10 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-[40px] w-[80px] sm:h-[45px]  sm:w-[85px] md:h-[50px] md:w-[90px] lg:h-[61px] lg:w-[110px] active:outline-none gap-2 border-none rounded-full cursor-pointer bg-red-700 text-white hover:bg-red-600 hover:text-white backdrop-blur-3xl supports-[backdrop-filter]:bg-red-600/90 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[80%] after:h-[105%] after:border-12 after:border-red-500/50 after:rounded-full after:animate-ping"
          >
            <div className="flex items-center justify-center w-full h-full rounded-full gap-1 sm:gap-2 font-semibold text-[10px] sm:text-xs">
              {getDisplayCode(selectedLanguage)}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-[320px]  p-4  dark:bg-background bg-background mt-2 mr-1"
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 cursor-pointer hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <div className="flex items-center pl-2 sm:pl-4 gap-2">
                <h1 className="font-bold text-base sm:text-lg md:text-[22px] leading-[130%] tracking-[-0.05em] font-noto-sans">
                  Select Language
                </h1>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 hover:text-red-700 gap-3 sm:gap-2 p-2 sm:p-4'>
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                className={`flex items-center cursor-pointer p-2 dark:bg-popover bg-popover text-red-700 justify-center h-8 sm:h-10 md:h-12 text-xs sm:text-sm ${
                  selectedLanguage === language.code 
                    ? 'ring-1 ring-red-700' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span className="text-center">{language.name}</span>
                {selectedLanguage === language.code && (
                  <span className="ml-1"></span>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


