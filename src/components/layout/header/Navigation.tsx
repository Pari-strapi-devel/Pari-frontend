"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Image from 'next/image'
import { ChevronDown, ChevronRight, Users, Video, FileUp, Headphones, HandCoins, ScrollText, BookOpen, Camera, Newspaper, MessageCircle, FileText , GraduationCap, UserPlus } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'


interface NavigationProps {
  onLinkClick?: () => void;
}

interface SubheaderItem {
  id: number;
  name: string;
  url: string | null;
  description: string | null;
}

interface ImageData {
  attributes: {
    url: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

interface HeaderItem {
  id: number;
  title: string;
  subheader: SubheaderItem[];
  image: {
    data: ImageData | null;
  };
}

interface HeaderApiResponse {
  data: Array<{
    id: number;
    attributes: {
      locale: string;
      Header: HeaderItem[];
    };
  }> | {
    attributes: {
      Header: HeaderItem[];
    };
  };
}

export function Navigation({ onLinkClick }: NavigationProps = {}) {
  const { language } = useLocale()
  const pathname = usePathname()

  // Set mobile items as collapsed by default (no expanded item)
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [headerData, setHeaderData] = useState<HeaderItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string>('');

  // Close dropdown when route changes
  useEffect(() => {
    setOpenDropdown('');
  }, [pathname]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch(`${BASE_URL}api/header?populate[Header][populate]=*&locale=${language}`);
        const data: HeaderApiResponse = await response.json();

        // Check the structure of the data
        if (!data || !data.data) {
          return;
        }

        // Handle different possible data structures
        let headerItems;

        if (Array.isArray(data.data)) {
          // If data.data is an array, find the English locale
          const englishData = data.data.find((item) => item.attributes?.locale === 'en') || data.data[0];
         
          headerItems = englishData?.attributes?.Header;
        } else if (data.data.attributes) {
          // If data.data is an object with attributes
          headerItems = data.data.attributes.Header;
        } else {
        
          return;
        }

        if (headerItems && Array.isArray(headerItems)) {
          setHeaderData(headerItems);
        } else {
        }

      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchHeaderData();
  }, [language]);

  useEffect(() => {
    // Header data loaded and ready for use
  }, [headerData]);

  const toggleMobileItem = (item: string) => {
    setExpandedMobileItem(prev => prev === item ? null : item);
  };

  const isMobileItemExpanded = (item: string) => {
    return expandedMobileItem === item;
  };



  // Helper function to get header item by index (filtering out logo items)
  const getHeaderItemByIndex = (index: number) => {
    if (!headerData || headerData.length === 0) {
      return undefined;
    }
    // Filter out items with title "logo" to get only navigation items
    const navigationItems = headerData.filter(item => item.title.toLowerCase() !== 'logo');
    return navigationItems[index];
  };



  // Wrapper for Link component to handle click events and preserve locale
  const LinkWithClose = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => {
    const { addLocaleToUrl } = useLocale();
    const urlWithLocale = addLocaleToUrl(href);

    const handleClick = () => {
      // Immediately close dropdown by setting to empty string
      setOpenDropdown('');

      // Call parent's onLinkClick if provided
      onLinkClick?.();
    };

    return (
      <Link
        href={urlWithLocale}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu
          value={openDropdown || ''}
          onValueChange={setOpenDropdown}
          className="w-full dark:bg-popover bg-white"
        >
          <NavigationMenuList className="w-full">
            {/* Stories */}
            <NavigationMenuItem value="stories">
              <NavigationMenuTrigger className="dark:bg-popover bg-white text-foreground transition-colors duration-150 font-medium">
             {getHeaderItemByIndex(0)?.title || 'Stories'}

              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[265px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[220px]">
                  <div className="w-[270px] pr-4 pb-5 bg-white dark:bg-popover">
                    <LinkWithClose href="/articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <Newspaper className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[0]?.name || 'All stories'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Video+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <Video className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[1]?.name || 'Video stories'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[2]?.name || 'Audio stories'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Photo+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background cursor-pointer">
                      <Camera className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[3]?.name || 'Photo stories'}</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[220px] relative">
                    <LinkWithClose href="/story-of-pari" className="cursor-pointer">
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/categories/navigation-imgs/Story-of-pari.jpeg"
                          alt="Story of Pari"
                          fill
                          className="object-cover rounded-[8px]"
                        />

                      </div>
                    </LinkWithClose>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Resources */}
            <NavigationMenuItem value="resources">
              <NavigationMenuTrigger className="dark:bg-popover bg-white text-foreground transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(1)?.title || 'Resources'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[800px] h-[250px] p-5">
                <div className="grid grid-cols-4 gap-4">
                  <LinkWithClose href="/library" className="group block cursor-pointer">
                  <div className="relative overflow-hidden rounded-md h-[210px]">

                      <Image
                        src="/images/categories/navigation-imgs/Library.jpeg"
                        alt="Library"
                        fill
                        className="w-full object-cover"
                      />

                    </div>
                  </LinkWithClose>

                  <LinkWithClose href="/faces-of-india" className="group block cursor-pointer">
                    <div className="relative overflow-hidden rounded-md h-[210px]">
                      <Image
                        src="/images/categories/faces-sm.png"
                        alt="The Faces of India"
                        fill
                        className="w-full object-cover"
                      />

                    </div>
                  </LinkWithClose>

                  <LinkWithClose href="/freedom-fighters" className="group block cursor-pointer">
                    <div className="relative overflow-hidden rounded-md h-[210px]">
                      <Image
                        src="/images/categories/ffg-sm.png"
                        alt="Freedom Fighters Gallery"
                        fill
                        className="w-full object-cover"
                      />

                    </div>
                  </LinkWithClose>

                  <LinkWithClose href="/adivasi-children-art" className="group block cursor-pointer">
                    <div className="relative overflow-hidden rounded-md h-[210px]">
                      <Image
                        src="/images/categories/printing.png"
                        alt="Adivasi Children Art"
                        fill
                        className="w-full object-cover"
                      />
                      
                    </div>
                  </LinkWithClose>
                </div>
              </NavigationMenuContent>
              
            </NavigationMenuItem>
            {/* Education */}
              {/* <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-popover bg-white text-foreground transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(2)?.title || 'Pari Education'}
              </NavigationMenuTrigger>
             
            </NavigationMenuItem> */}

            {/* About */}
            <NavigationMenuItem value="about">
              <NavigationMenuTrigger className="dark:bg-popover bg-white transition-colors duration-150 font-medium text-foreground">
                {getHeaderItemByIndex(3)?.title || 'About'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[250px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[210px]">
                  <div className="w-[260px]  pr-4 bg-white dark:bg-popover border-border">
                    <LinkWithClose href="/team" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <Users className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[1]?.name || 'Our Team'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/award" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[2]?.name || 'Contributors'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background cursor-pointer">
                      <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[3]?.name || 'Acknowledgements'}</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[210px] relative">
                    <LinkWithClose href="/languages-in-pari" className="cursor-pointer">
                    <Image
                      src="/images/categories/navigation-imgs/Languages.jpeg"
                      alt="Languages in Pari"
                      fill
                      className="object-cover rounded-[8px]"
                    />
                   </LinkWithClose>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Get Involved */}
            <NavigationMenuItem value="get-involved">
              <NavigationMenuTrigger className="dark:bg-popover bg-white text-foreground transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(4)?.title || 'Get Involved'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[540px] h-[325px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[280px]">
                  <div className="w-[270px] pr-4 pb-5 bg-white dark:bg-popover">
                    <LinkWithClose href="/contribute" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <FileUp className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[0]?.name || 'Contact'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/contribute/guidelines" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <FileText className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[1]?.name || 'Donate'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/volunteer" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <UserPlus className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[2]?.name || 'Volunteer'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/intern-with-us" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                      <GraduationCap className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[3]?.name || 'Intern'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/contact-us" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background cursor-pointer">
                      <MessageCircle className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[4]?.name || 'Contact'}</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[215px] h-[278px] relative">
                    <LinkWithClose href="/donate" className="cursor-pointer">
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/categories/navigation-imgs/Donate.jpeg"
                          alt="Support PARI - Donate"
                          fill
                          className="object-cover rounded-[8px]"
                        />
                      </div>
                    </LinkWithClose>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden w-full dark:bg-popover rounded-[8px] bg-popover">
        {/* Stories Section */}
        <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center  text-foreground cursor-pointer"
            onClick={() => toggleMobileItem('stories')}
          >
            <h2 className="text-md font-medium">{getHeaderItemByIndex(0)?.title || 'Stories'}</h2>
            {isMobileItemExpanded('stories') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('stories') && (
            <div className="grid grid-cols-1 px-4 py-3 gap-2">
            <div className="w-full bg-white dark:bg-popover border-border">
              <LinkWithClose href="/articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <BookOpen className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[0]?.name || 'All stories'}</span>
              </LinkWithClose>
              <LinkWithClose href="/articles?content=Video+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <Video className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[1]?.name || 'Video stories'}</span>
              </LinkWithClose>
              <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[2]?.name || 'Audio stories'}</span>
              </LinkWithClose>
              <LinkWithClose href="/articles?content=Photo+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background cursor-pointer">
                <Camera className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(0)?.subheader[3]?.name || 'Photo stories'}</span>
              </LinkWithClose>
            </div>
           <div className="w-full h-[180px] mt-1 relative">
            <LinkWithClose href="/language-universe" className="cursor-pointer">
              <div className="relative w-full h-full">
                <Image
                  src="/images/categories/navigation-imgs/story-of-pari.jpeg"
                  alt="PARI Languages"
                  fill
                  className="object-cover rounded-[8px]"
                />

              </div>
            </LinkWithClose>
          </div>
          </div>
          )}
        </div>

        {/* Get Involved Section */}
        <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center text-foreground cursor-pointer"
            onClick={() => toggleMobileItem('get-involved')}
          >
            <h2 className="text-md font-medium">{getHeaderItemByIndex(4)?.title || 'Get Involved'}</h2>
            {isMobileItemExpanded('get-involved') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('get-involved') && (
            <div className="grid grid-cols-1 px-4 py-3 gap-2">
            <div className="w-full bg-white dark:bg-popover border-border">
              <LinkWithClose href="/contribute" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <FileUp className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[0]?.name || 'Contact'}</span>
              </LinkWithClose>
              <LinkWithClose href="/contribute/guidelines" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <FileText className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[1]?.name || 'Donate'}</span>
              </LinkWithClose>
              <LinkWithClose href="/volunteer" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <UserPlus className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[2]?.name || 'Volunteer'}</span>
              </LinkWithClose>
              <LinkWithClose href="/intern-with-us" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
                <GraduationCap className="h-5 w-5 text-primary-PARI-Red" />
                <span className="text-discreet-text text-md font-medium">{getHeaderItemByIndex(4)?.subheader[3]?.name || 'Intern'}</span>
              </LinkWithClose>
              <LinkWithClose href="/contact-us" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background cursor-pointer">
                <MessageCircle className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(4)?.subheader[4]?.name || 'Contact'}</span>
              </LinkWithClose>
            </div>
           <div className="w-full h-[180px] mt-1 relative">
            <LinkWithClose href="/donate" className="cursor-pointer">
              <div className="relative w-full h-full">
                <Image
                  src="/images/categories/navigation-imgs/Donate.jpeg"
                  alt="Support PARI - Donate"
                  fill
                  className="object-cover rounded-[8px]"
                />
              </div>
            </LinkWithClose>
          </div>
          </div>
          )}
        </div>

        {/* About Section */}
        <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center text-foreground cursor-pointer"
            onClick={() => toggleMobileItem('about')}
          >
            <h2 className="text-md font-medium">{getHeaderItemByIndex(3)?.title || 'About'}</h2>
            {isMobileItemExpanded('about') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('about') && (
        <div className="grid grid-cols-1 py-3 px-4 gap-2">
        <div className="w-full bg-white pr-4 dark:bg-popover border-border">
          <LinkWithClose href="/team" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
            <Users className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[1]?.name || 'Our Team'}</span>
          </LinkWithClose>
          <LinkWithClose href="/contributors" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
            <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[2]?.name || 'Contributors'}</span>
          </LinkWithClose>
          <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border cursor-pointer">
            <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium text-md text-discreet-text">{getHeaderItemByIndex(3)?.subheader[3]?.name || 'Acknowledgements'}</span>
          </LinkWithClose>
        </div>
        <div className="w-full h-[180px] border-border border-t mt-2 relative">
          <Image
            src="/images/categories/navigation-imgs/Languages.jpeg"
            alt="About PARI"
            fill
            className="object-cover bg rounded-[8px]"
          />
        </div>
      </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center text-foreground cursor-pointer"
            onClick={() => toggleMobileItem('resources')}
          >
            <h2 className="text-md font-medium">{getHeaderItemByIndex(1)?.title || 'Resources'}</h2>
            {isMobileItemExpanded('resources') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('resources') && (
           <div className="grid grid-cols-2 py-3 px-4 gap-4">
           <LinkWithClose href="/library" className="group block cursor-pointer">
           <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/navigation-imgs/Library.jpeg"
                 alt="Library"
                 fill
                 className="w-full object-cover"
               />
             </div>
           </LinkWithClose>

           <LinkWithClose href="/faces-of-india" className="group block cursor-pointer">
             <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/faces-sm.png"
                 alt="The Faces of India"
                 fill
                 className="w-full object-cover"
               />
             </div>
           </LinkWithClose>

           <LinkWithClose href="/freedom-fighters" className="group block cursor-pointer">
             <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/ffg-sm.png"
                 alt="Freedom Fighters Gallery"
                 fill
                 className="w-full object-cover"
               />
             </div>
           </LinkWithClose>

           <LinkWithClose href="/adivasi-children-art" className="group block cursor-pointer">
             <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/printing.png"
                 alt="Adivasi Children Art"
                 fill
                 className="w-full object-cover"
               />
             </div>
           </LinkWithClose>
         </div>
          )}
        </div>

        {/* Education Section - No Dropdown */}
        {/* <div className="border-b border-border">
          <LinkWithClose
            href="/education"
            className="p-4 block text-grey-300 cursor-pointer"
          >
            <h2 className="text-lg font-semibold">{getHeaderItemByIndex(2)?.title || 'Education'}</h2>
          </LinkWithClose>
        </div> */}
      </div>
    </>
  );
}

