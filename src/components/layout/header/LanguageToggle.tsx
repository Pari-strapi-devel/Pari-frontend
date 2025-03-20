
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
    <div className="fixed bottom-10 h-[61px] w-[110px] rounded-full right-10 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-[61px] w-[110px] gap-2 border-none rounded-full cursor-pointer bg-red-600 text-white hover:bg-red-700 backdrop-blur-3xl supports-[backdrop-filter]:bg-red-600/90 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[90%] after:h-[110%] after:border-12 after:border-red-500/50 after:rounded-full after:animate-ping"
          >
            <div className="flex items-center justify-center w-14 h-6 gap-2 font-semibold text-xs">
              {getDisplayCode(selectedLanguage)}
            </div>
          
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="w-[350px] dark:bg-background bg-background mt-2"
        >
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-600 cursor-pointer hover:bg-accent ${} "
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center pl-4 gap-2">
                <h1 className="font-bold text-[22px] leading-[130%] tracking-[-0.05em] font-noto-sans">
                  Select Language
                </h1>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 hover:text-red-600 gap-2 p-4'>
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                className={`flex items-center cursor-pointer dark:bg-popover bg-popover text-red-600 justify-center h-12 ${
                  selectedLanguage === language.code 
                    ? 'ring-1 ring-red-600' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span className="text-center">{language.name}</span>
                {selectedLanguage === language.code && (
                  <span className="ml-2"></span>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


