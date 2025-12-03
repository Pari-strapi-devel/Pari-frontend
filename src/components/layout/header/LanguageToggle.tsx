
"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from "@/components/ui/button"
import { useFilterStore } from '@/store/filterStore'
import { useLocale } from '@/lib/locale'
import { usePathname } from 'next/navigation'

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
    displayCode: { en: 'English', native: 'English' },
    name: 'English'
  },
  {
    code: 'ur',
    displayCode: { en: 'Urdu', native: 'اردو' },
    name: 'اردو / Urdu'
  },
  {
    code: 'mr',
    displayCode: { en: 'Marathi', native: 'मराठी' },
    name: 'मराठी / Marathi'
  },
  {
    code: 'hi',
    displayCode: { en: 'Hindi', native: 'हिंदी' },
    name: 'हिंदी / Hindi'
  },
  {
    code: 'or',
    displayCode: { en: 'Odia', native: 'ଓଡ଼ିଆ' },
    name: 'ଓଡ଼ିଆ / Odia'
  },
  {
    code: 'bn',
    displayCode: { en: 'Bengali', native: 'বাংলা' },
    name: 'বাংলা / Bengali'
  },
]

export function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const { language: selectedLanguage, setLanguage } = useLocale()
  const [isVisible, setIsVisible] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isFilterOpen = useFilterStore((state) => state.isOpen);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Hide on story detail pages (e.g., /article/some-slug)
    const isStoryDetailPage = pathname?.startsWith('/article/');
    setIsVisible(!isFilterOpen && !isStoryDetailPage);
    console.log('##Rohit_Rocks## Language Toggle Visibility:', !isFilterOpen && !isStoryDetailPage);
  }, [isFilterOpen, pathname]);

  useEffect(() => {
    // Stop animation after 5 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    console.log('##Rohit_Rocks## Language Selected:', languageCode);
    setLanguage(languageCode);
    setOpen(false);
  };

  const getDisplayCode = (code: string) => {
    const language = languages.find((lang: Language) => lang.code === code);
    const codeUpper = code.toUpperCase();
    const nativeScript = language?.displayCode.native || code;

    return (
      <div className="flex flex-col items-center justify-center gap-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold">{codeUpper}</span>
          <span className="text-white/70">|</span>
          <span className="font-bold">{nativeScript}</span>
        </div>
        <span className="text-[10px] sm:text-xs font-normal">{languages.length} languages</span>
      </div>
    );
  };

  if (!isVisible) return null;

  const modalContent = open && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={() => setOpen(false)}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Desktop Modal - Centered */}
      <div className="hidden md:flex items-center justify-center h-full p-4">
        <div className="relative w-full max-w-[540px] animate-in zoom-in-95 duration-200" style={{ position: 'relative', zIndex: 1 }}>
          <div className="bg-white dark:bg-popover rounded-3xl shadow-2xl p-8">
            <h3 className="text-lg font-semibold mb-4 border-b-2 pb-2 text-center">Site languages</h3>

            <div className="grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`px-6 py-4 rounded-2xl text-left transition-all duration-200 relative ${
                    selectedLanguage === language.code
                      ? 'bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red shadow-sm'
                      : 'bg-white dark:bg-background border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-normal">{language.name}</span>
                    {selectedLanguage === language.code && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-PARI-Red"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom duration-300" style={{ position: 'fixed', zIndex: 1 }}>
        <div className="bg-white dark:bg-popover rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          <h3 className="text-lg font-semibold mb-4 border-b-2 pb-2 text-center">Site languages</h3>

          <div className="grid grid-cols-1 gap-3">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`px-4 py-3 rounded-2xl text-left transition-all duration-200 relative ${
                  selectedLanguage === language.code
                    ? 'bg-white dark:bg-background border-2 border-primary-PARI-Red text-primary-PARI-Red shadow-sm'
                    : 'bg-white dark:bg-background border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal">{language.name}</span>
                  {selectedLanguage === language.code && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-PARI-Red"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Main Language Toggle Button */}
      <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-6 md:right-8 rounded-full lg:right-10 z-[100]">
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          className={`relative h-[45px] w-[100px] sm:h-[50px] sm:w-[110px] md:h-[55px] md:w-[120px] lg:h-[61px] lg:w-[130px] active:outline-none gap-2 border-none rounded-full cursor-pointer bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/80 backdrop-blur-3xl supports-[backdrop-filter]:bg-primary-PARI-Red transition-all duration-200 ${
            open ? 'scale-105 shadow-lg' : ''
          } ${
            showAnimation
              ? "after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[80%] after:h-[105%] after:border-12 after:border-red-700 after:rounded-full after:animate-ping"
              : ""
          }`}
        >
          <div className="flex items-center justify-center w-full h-full rounded-full gap-1 sm:gap-2 font-semibold text-[10px] sm:text-xs px-2">
            {getDisplayCode(selectedLanguage)}
          </div>
        </Button>
      </div>

      {/* Language Modal - Rendered via Portal */}
      {modalContent}
    </>
  );
}


