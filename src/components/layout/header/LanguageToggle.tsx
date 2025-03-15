
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'اردو' },
  { code: 'mr', name: 'मराठी' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'bn', name: 'বাংলা' },
]

export function LanguageToggle() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you can add logic to change the application language
  };


  return (
    <div className="fixed bottom-10 right-10 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-12 w-12 border-none rounded-full cursor-pointer bg-red-600 text-white hover:bg-red-700 backdrop-blur-3xl supports-[backdrop-filter]:bg-red-600/90 after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[110%] after:h-[110%] after:border-10 after:border-red-500/50 after:rounded-full after:animate-ping"
          >
            <div className="flex items-center justify-center w-6 h-6 font-semibold text-sm">
              {selectedLanguage.toUpperCase()}
            </div>
            <span className="sr-only">Toggle language</span>
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
                  className="h-8 w-8 text-red-600 cursor-pointer hover:bg-accent"
                  onClick={() => document.body.click()}
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