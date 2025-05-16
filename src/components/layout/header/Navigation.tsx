"use client"

import * as React from "react"
import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Image from 'next/image'
import { ChevronDown, ChevronRight, Users, Handshake, Video, Headphones, Mailbox, HandCoins, ScrollText, ImageIcon } from "lucide-react"
import Link from "next/link"

interface NavigationProps {
  onLinkClick?: () => void;
}

export function Navigation({ onLinkClick }: NavigationProps = {}) {
  // Set "stories" as the default expanded item
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>("stories");

  const toggleMobileItem = (item: string) => {
    setExpandedMobileItem(prev => prev === item ? null : item);
  };

  const isMobileItemExpanded = (item: string) => {
    return expandedMobileItem === item;
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
        <NavigationMenu className="w-full dark:bg-popover bg-popover">
          <NavigationMenuList className="w-full">
            {/* Stories */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-popover bg-popover text-foreground transition-colors duration-150 font-medium">
                Stories
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[250px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[210px] ">
                  <div className="w-[260px]  pr-4 bg-white dark:bg-popover border-border">
                    <LinkWithClose href="/articles?content=Video+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Video className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Video stories</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Audio stories</span>
                    </LinkWithClose>
                    <LinkWithClose href="/articles?content=Photo+Articles" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background">
                      <ImageIcon className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Photo stories</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[210px] border-border relative">
                  <LinkWithClose href="/articles">
                    <Image
                      src="/images/categories/languages.png"
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
              <NavigationMenuTrigger className="dark:bg-popover bg-popover text-foreground transition-colors duration-150 font-medium">
                Resources
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

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="dark:bg-popover bg-popover transition-colors duration-150 font-medium text-foreground">
                About
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-[500px] h-[250px] p-5 rounded-lg overflow-hidden">
                <div className="flex h-[210px]">
                  <div className="w-[260px]  pr-4 bg-white dark:bg-popover border-border">
                    <LinkWithClose href="/team" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <Users className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Our Team</span>
                    </LinkWithClose>
                    <LinkWithClose href="/contributors" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                      <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Contributors</span>
                    </LinkWithClose>
                    <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-background">
                      <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
                      <span className="font-medium">Acknowledgements</span>
                    </LinkWithClose>
                  </div>
                  <div className="w-[192px] h-[210px] relative">
                    <Image
                      src="/images/categories/pari.png"
                      alt="About PARI"
                      fill
                      className="object-cover rounded-[8px]"
                    />
                   
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Get Involved */}
            <NavigationMenuItem className="w-full">
              <NavigationMenuTrigger className="w-full text-foreground    dark:bg-popover bg-popover transition-colors duration-150 font-medium">
                Get Involved
              </NavigationMenuTrigger>
              <NavigationMenuContent className=" p-5  h-[250px] rounded-[16px] overflow-hidden">
                <div className="flex">
                  <div className="w-[350px] bg-white dark:bg-popover  border-border pr-4">
                    <div className="mb-8">
                      <LinkWithClose href="/contribute" className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                          <Handshake className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-lg">Contribute to PARI</span>
                      </LinkWithClose>
                      <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        India&apos;s largest archive needs everyone to participate to make journalism better.
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-border dark:border-border">
                      <LinkWithClose href="/contact-us" className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                          <Mailbox className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-lg">Contact us</span>
                      </LinkWithClose>
                      <p className="text-sm text-discreet-text dark:text-discreet-text ml-9">
                        We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-[200px] relative">
                    <Image
                      src="/images/categories/donations.png"
                      alt="Donations"
                      fill
                      className="object-cover  rounded-[8px]"
                    />
                  
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Education */}
            <NavigationMenuItem>
            <div 
            className="p-4 flex font-medium justify-between items-center cursor-pointer"
            onClick={() => toggleMobileItem('education')}
          >
            <p className="text-[14px] text-foreground font-medium">Education</p>
          
          </div>
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
            <h2 className="text-lg  font-semibold">Stories</h2>
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
                <span className="font-medium">Video stories</span>
              </LinkWithClose>
              <LinkWithClose href="/articles?content=Audio+Articles" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                <Headphones className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium">Audio stories</span>
              </LinkWithClose>
              <LinkWithClose href="/photo-stories" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
                <ImageIcon className="h-5 w-5 text-primary-PARI-Red" />
                <span className="font-medium">Photo stories</span>
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
            <h2 className="text-lg font-semibold">Get Involved</h2>
            {isMobileItemExpanded('get-involved') ? 
              <ChevronDown className="h-5 w-5" /> : 
              <ChevronRight className="h-5 w-5" />
            }
          </div>
          
          {isMobileItemExpanded('get-involved') && (
             <div className="grid grid-cols-1 py-3 px-4 gap-2">
           <div className="w-full bg-white dark:bg-popover  border-border pr-4">
             <div className="mb-4 px-4 ">
               <LinkWithClose href="/contribute" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Handshake className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">Contribute to PARI</span>
               </LinkWithClose>
               <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 India&apos;s largest archive needs everyone to participate to make journalism better.
               </p>
             </div>
             
             <div className="p-4 border-y border-border dark:border-border">
               <LinkWithClose href="/contact-us" className="flex items-center gap-3  mb-2">
                 <div className="w-6 h-6 flex items-center justify-center text-primary-PARI-Red">
                   <Mailbox className="h-6 w-6" />
                 </div>
                 <span className="font-medium text-lg">Contact us</span>
               </LinkWithClose>
               <p className="text-sm text-discreet-text line-clamp-2 dark:text-discreet-text ml-9">
                 We&lsquo;d love to hear from you. To reach the PARI team, please write to us.
               </p>
             </div>
           </div>
           
           <div className="w-full h-[180px] border-border border-t mt-2 relative">
            <Image
              src="/images/categories/pari.png"
              alt="Donations"
              fill
              className="object-cover rounded-[8px]"
            />
           
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
            <h2 className="text-lg font-semibold">About</h2>
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
            <span className="font-medium">Our Team</span>
          </LinkWithClose>
          <LinkWithClose href="/contributors" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
            <HandCoins className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium">Contributors</span>
          </LinkWithClose>
          <LinkWithClose href="/acknowledgements" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-background border-b border-border">
            <ScrollText className="h-5 w-5 text-primary-PARI-Red" />
            <span className="font-medium">Acknowledgements</span>
          </LinkWithClose>
        </div>
        <div className="w-full h-[180px] border-border border-t mt-2 relative">
          <Image
            src="/images/categories/pari.png"
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
            <h2 className="text-lg font-semibold">Resources</h2>
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
                 src="/images/categories/art-sm.png"
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
            <h2 className="text-lg font-semibold">Education</h2>
          
          </div>
          
          
        </div>
      </div>
    </>
  );
}

