"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

export function Navigation() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleItemClick = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedItems(prevItems => {
      const isSelected = prevItems.includes(item);
      if (isSelected) {
        return prevItems.filter(i => i !== item);
      } else {
        return [...prevItems, item];
      }
    });
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedItems.length > 0) {
      console.log('Selected items:', selectedItems);
      setSelectedItems([]); // Reset selections
    }
  };

  return (
    <NavigationMenu className="max-md:w-full dark:bg-popover bg-popover">
      <NavigationMenuList className="max-md:flex-col max-md:space-y-2 max-md:w-full">
        <NavigationMenuItem className="max-md:w-full">
          <NavigationMenuTrigger className="max-md:w-full dark:bg-popover bg-popover max-md:justify-start">
            Stories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] max-md:w-full">
              {[
                { id: 'featured', label: 'Featured Stories' },
                { id: 'categories', label: 'Categories' },
                { id: 'recent', label: 'Recent Stories' }
              ].map((item) => (
                <div 
                  key={item.id}
                  className={`cursor-pointer p-2 rounded transition-colors ${
                    selectedItems.includes(item.id) ? 'bg-accent/50' : 'hover:bg-accent/30'
                  }`}
                  onClick={(e) => handleItemClick(e, item.id)}
                >
                  {item.label}
                </div>
              ))}

              {selectedItems.length > 0 && (
                <Button 
                  variant="secondary"
                  className="w-full bg-red-600 text-white hover:bg-red-700 mt-4"
                  onClick={handleConfirm}
                >
                  Confirm Selection ({selectedItems.length})
                </Button>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="max-md:w-full">
          <NavigationMenuTrigger className="max-md:w-full dark:bg-popover bg-popover max-md:justify-start">
            Library
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] max-md:w-full">
              <div className="cursor-pointer p-2 hover:bg-accent/30 rounded">Books</div>
              <div className="cursor-pointer p-2 hover:bg-accent/30 rounded">Documents</div>
              <div className="cursor-pointer p-2 hover:bg-accent/30 rounded">Resources</div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="max-md:w-full  ">
          <NavigationMenuTrigger className="max-md:w-full dark:bg-popover bg-popover max-md:justify-start">
            Education
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] max-md:w-full">
              <Link href="/courses" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Courses
                </NavigationMenuLink>
              </Link>
              <Link href="/workshops" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Workshops
                </NavigationMenuLink>
              </Link>
              <Link href="/resources" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Learning Resources
                </NavigationMenuLink>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="max-md:w-full">
          <NavigationMenuTrigger className="max-md:w-full dark:bg-popover bg-popover max-md:justify-start">
            About
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] max-md:w-full">
              <Link href="/mission" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Our Mission
                </NavigationMenuLink>
              </Link>
              <Link href="/team" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Team
                </NavigationMenuLink>
              </Link>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className="cursor-pointer p-2 hover:bg-accent/30 rounded">
                  Contact
                </NavigationMenuLink>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}