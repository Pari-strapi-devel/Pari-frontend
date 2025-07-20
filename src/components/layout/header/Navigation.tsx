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
import { ChevronDown, ChevronRight, Users, Handshake, Video, Headphones, Mailbox, HandCoins, ScrollText, ImageIcon, Hand, HeartHandshake } from "lucide-react"
import Link from "next/link"
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

  // Set "stories" as the default expanded item
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>("stories");
  const [headerData, setHeaderData] = useState<HeaderItem[]>([]);

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

  // Helper function to get header item by index (more reliable than title matching)
  const getHeaderItemByIndex = (index: number) => {
    if (!headerData || headerData.length === 0) {
      return undefined;
    }
    return headerData[index];
  };



  // Wrapper for Link component to handle click events
  const LinkWithClose = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className={className}
      onClick={onLinkClick}
    >
      {children}
    </Link>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu className="w-full dark:bg-background bg-popover">
          <NavigationMenuList className="w-full">
            {/* Stories */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-background bg-popover text-foreground transition-colors duration-150 font-medium">
             {getHeaderItemByIndex(0)?.title || 'Stories'}

              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[250px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[210px] ">
                  <div className="w-[260px]  pr-4 bg-white dark:bg-popover border-border">
                    <LinkWithClose href="/articles?content=Video+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Video className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[1]?.name || 'Video stories'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[2]?.name || 'Audio stories'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Photo+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background">
                      <ImageIcon className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[3]?.name || 'Photo stories'}</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[210px] border-border relative">
                  <LinkWithClose href="/introduction">
                    <Image
                      src="/images/categories/pari.png"
                      alt="PARI Languages"
                      fill
                      className="object-cover rounded-[8px]"
                    />
                    </LinkWithClose>
                   
                   
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Resources */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-background bg-popover text-foreground transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(1)?.title || 'Resources'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[800px] h-[250px] p-5">
                <div className="grid grid-cols-4 gap-4">
                  <LinkWithClose href="/library" className="group block">
                  <div className="relative overflow-hidden rounded-md h-[210px]">
                     
                      <Image
                        src="/images/categories/library1.png"
                        alt="Library"
                        fill
                        className="w-full object-cover"
                      />
                     
                    </div>
                  </LinkWithClose>
                  
                  <LinkWithClose href="/faces-of-india" className="group block">
                    <div className="relative overflow-hidden rounded-md h-[210px]">
                      <Image
                        src="/images/categories/faces-sm.png"
                        alt="The Faces of India"
                        fill
                        className="w-full object-cover"
                      />
                     
                    </div>
                  </LinkWithClose>
                  
                  <LinkWithClose href="/freedom-fighters" className="group block">
                    <div className="relative overflow-hidden rounded-md h-[210px]">
                      <Image
                        src="/images/categories/ffg-sm.png"
                        alt="Freedom Fighters Gallery"
                        fill
                        className="w-full object-cover"
                      />
                      
                    </div>
                  </LinkWithClose>
                  
                  <LinkWithClose href="/adivasi-children-art" className="group block">
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
              <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-background bg-popover text-foreground transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(2)?.title || 'Pari Education'}
              </NavigationMenuTrigger>
             
            </NavigationMenuItem>

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-background bg-popover transition-colors duration-150 font-medium text-foreground">
                {getHeaderItemByIndex(3)?.title || 'About'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[250px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[210px]">
                  <div className="w-[260px]  pr-4 bg-white dark:bg-popover border-border">
                    <LinkWithClose href="/teams" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Users className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[1]?.name || 'Our Team'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/award" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[2]?.name || 'Contributors'}</span>
                    </LinkWithClose>
                    <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background">
                      <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[3]?.name || 'Acknowledgements'}</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[210px] relative">
                    <LinkWithClose href="/language-universe">
                    <Image
                      src="/images/categories/languages.png"
                      alt="Language Universe"
                      fill
                      className="object-cover rounded-[8px]"
                    />
                   </LinkWithClose>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Get Involved */}
            <NavigationMenuItem className="w-full">
              <NavigationMenuTrigger className="w-full text-foreground    dark:bg-background bg-popover transition-colors duration-150 font-medium">
                {getHeaderItemByIndex(4)?.title || 'Get Involved'}
              </NavigationMenuTrigger>
              <NavigationMenuContent className=" p-5  h-[250px] rounded-[16px] overflow-hidden">
                <div className="flex">
                  <div className="w-[350px] bg-white dark:bg-popover  border-border pr-4">
                    <div className=" p-3">
                      <LinkWithClose href="/contact" className="flex items-center gap-3 m-1">
                        <div className="w-5 h-5 flex items-center justify-center text-primary-PARI-Red">
                          <Handshake className="h-5 w-5" />
                        </div>
                        <span className="font-medium ">{getHeaderItemByIndex(4)?.subheader[0]?.name || 'Contact us'}</span>
                      </LinkWithClose>
                      {/* <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        India&apos;s largest archive needs everyone to participate to make journalism better.
                      </p> */}
                    </div>

                    <div className="p-3 border-t border-border dark:border-border">
                      <LinkWithClose href="/donate" className="flex items-center gap-3 m-1">
                        <div className="w-5 h-5 flex items-center justify-center text-primary-PARI-Red">
                          <Mailbox className="h-5 w-5" />
                        </div>
                        <span className="font-medium ">{getHeaderItemByIndex(4)?.subheader[1]?.name || 'Contact us'}</span>
                      </LinkWithClose>
                      {/* <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
                      </p> */}
                    </div>
                    <div className="p-3 border-t border-border dark:border-border">
                      <LinkWithClose href="/intern" className="flex items-center gap-3 m-1">
                        <div className="w-5 h-5 flex items-center justify-center text-primary-PARI-Red">
                          <Hand className="h-5 w-5" />
                        </div>
                        <span className="font-medium ">{getHeaderItemByIndex(4)?.subheader[3]?.name || 'Contact us'}</span>
                      </LinkWithClose>
                      {/* <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
                      </p> */}
                    </div>
                    <div className="p-3 border-t border-border dark:border-border">
                      <LinkWithClose href="/volunteer" className="flex items-center gap-3 m-1">
                        <div className="w-5 h-5 flex items-center justify-center text-primary-PARI-Red">
                          <HeartHandshake className="h-5 w-5" />
                        </div>
                        <span className="font-medium ">{getHeaderItemByIndex(4)?.subheader[4]?.name || 'Contact us'}</span>
                      </LinkWithClose>
                      {/* <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
                      </p> */}
                    </div>
                  </div>
                  
                  <div className="w-[192px] mb-5 relative">
                    <LinkWithClose href="/donate">
                    <Image
                      src="/images/categories/donations.png"
                      alt="Donations"
                      fill
                      className="object-cover  rounded-[8px]"
                    />
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
            className="p-4 flex justify-between items-center text-grey-300  cursor-pointer"
            onClick={() => toggleMobileItem('stories')}
          >
            <h2 className="text-lg  font-semibold">{getHeaderItemByIndex(0)?.title || 'Stories'}</h2>
            {isMobileItemExpanded('stories') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('stories') && (
            <div className="grid grid-cols-1 px-4 py-3 gap-2  ">
            <div className="w-full bg-white dark:bg-popover border-border">
              <LinkWithClose href="/articles?content=Video+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                <Video className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[1]?.name || 'Video stories'}</span>
              </LinkWithClose>
              <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[2]?.name || 'Audio stories'}</span>
              </LinkWithClose>
              <LinkWithClose href="/photo-stories" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                <ImageIcon className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium">{getHeaderItemByIndex(0)?.subheader[3]?.name || 'Photo stories'}</span>
              </LinkWithClose>
            </div>
           <div className="w-full h-[180px] mt-1  relative">
            <LinkWithClose href="/articles">
              <Image
              src="/images/categories/languages.png"
              alt="Donations"
              fill
              className="object-cover  rounded-[8px]"
            />
            </LinkWithClose>
           
           
          </div>
          </div>
          )}
        </div>
  
       
        {/* Get Involved Section */}
        <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center text-grey-300  cursor-pointer"
            onClick={() => toggleMobileItem('get-involved')}
          >
            <h2 className="text-lg font-semibold">{getHeaderItemByIndex(4)?.title || 'Get Involved'}</h2>
            {isMobileItemExpanded('get-involved') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('get-involved') && (
             <div className="grid grid-cols-1 py-3 px-4 gap-2">
           <div className="w-full bg-white dark:bg-popover  border-border pr-4">
             <div className="mb-4 px-4 ">
               <LinkWithClose href="/contact" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Handshake className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">{getHeaderItemByIndex(4)?.subheader[0]?.name || 'Contribute to PARI'}</span>
               </LinkWithClose>
               {/* <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 India&apos;s largest archive needs everyone to participate to make journalism better.
               </p> */}
             </div>

             <div className="p-4 border-y border-border dark:border-border">
               <LinkWithClose href="/donate" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Mailbox className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">{getHeaderItemByIndex(4)?.subheader[1]?.name || 'Contact us'}</span>
               </LinkWithClose>
               {/* <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
               </p> */}
             </div>
             <div className="p-4 border-y border-border dark:border-border">
               <LinkWithClose href="/intern" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Mailbox className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">{getHeaderItemByIndex(4)?.subheader[3]?.name || 'Contact us'}</span>
               </LinkWithClose>
               {/* <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
               </p> */}
             </div> 
             <div className="p-4 border-y border-border dark:border-border">
               <LinkWithClose href="/volunteer" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Mailbox className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">{getHeaderItemByIndex(4)?.subheader[4]?.name || 'Contact us'}</span>
               </LinkWithClose>
               {/* <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
               </p> */}
             </div>
           </div>
           
           <div className="w-full h-[180px] border-border border-t mt-2 relative">
            <LinkWithClose href="/donate">
            <Image
              src="/images/categories/pari.png"
              alt="Donations"
              fill
              className="object-cover rounded-[8px]"
            />
           </LinkWithClose>
          </div>
         </div>
          )}
        </div>
        
         {/* About Section */}
         <div className="border-b border-border">
          <div
            className="p-4 flex justify-between items-center text-grey-300  cursor-pointer"
            onClick={() => toggleMobileItem('about')}
          >
            <h2 className="text-lg font-semibold">{getHeaderItemByIndex(3)?.title || 'About'}</h2>
            {isMobileItemExpanded('about') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>

          {isMobileItemExpanded('about') && (

        <div className="grid grid-cols-1 py-3 px-4 gap-2">
        <div className="w-full bg-white pr-4 dark:bg-popover border-border">
          <LinkWithClose href="/team" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
            <Users className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[1]?.name || 'Our Team'}</span>
          </LinkWithClose>
          <LinkWithClose href="/contributors" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
            <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[2]?.name || 'Contributors'}</span>
          </LinkWithClose>
          <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
            <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium">{getHeaderItemByIndex(3)?.subheader[3]?.name || 'Acknowledgements'}</span>
          </LinkWithClose>
        </div>
        <div className="w-full h-[180px] border-border border-t mt-2 relative">
          <Image
            src="/images/categories/languages.png"
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
            className="p-4 flex justify-between items-center text-grey-300  cursor-pointer"
            onClick={() => toggleMobileItem('resources')}
          >
            <h2 className="text-lg font-semibold">{getHeaderItemByIndex(1)?.title || 'Resources'}</h2>
            {isMobileItemExpanded('resources') ?
              <ChevronDown className="h-5 w-5" /> :
              <ChevronRight className="h-5 w-5" />
            }
          </div>
          
          {isMobileItemExpanded('resources') && (
           <div className="grid grid-cols-2  py-3 px-4  gap-4">
           <LinkWithClose href="/library" className="group block">
           <div className="relative overflow-hidden  rounded-md h-[200px]">
              
               <Image
                 src="/images/categories/library1.png"
                 alt="Library"
                 fill
                 className="w-full object-cover"
               />
               
             </div>
           </LinkWithClose>
           
           <LinkWithClose href="/faces-of-india" className="group block">
             <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/faces-sm.png"
                 alt="The Faces of India"
                 fill
                 className="w-full object-cover"
               />
               
             </div>
           </LinkWithClose>
           
           <LinkWithClose href="/freedom-fighters" className="group block">
             <div className="relative overflow-hidden rounded-md h-[200px]">
               <Image
                 src="/images/categories/ffg-sm.png"
                 alt="Freedom Fighters Gallery"
                 fill
                 className="w-full object-cover"
               />
               
             </div>
           </LinkWithClose>
           
           <LinkWithClose href="/adivasi-children-art" className="group block">
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
        
        {/* Education Section */}
        <div>
          <div
            className="p-4 flex justify-between items-center text-grey-300  cursor-pointer"
            onClick={() => toggleMobileItem('education')}
          >
            <h2 className="text-lg font-semibold">{getHeaderItemByIndex(2)?.title || 'Education'}</h2>

          </div>


        </div>
      </div>
    </>
  );
}

