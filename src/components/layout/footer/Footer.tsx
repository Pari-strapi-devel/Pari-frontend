"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '../../../components/ui/input'
import Image from 'next/image'
import {
  Book, Info, Users,GraduationCap, User, FileText,
  Heart, PenTool, History, 
  
} from 'lucide-react'


interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

// Define navigation items
const navigationItems = {
  column1: [
    { href: "/library", icon: Book, label: "Library" },
    { href: "/about", icon: Info, label: "About" },
    { href: "/volunteer", icon: Users, label: "Volunteer" },
   
  ],
  column2: [
    { href: "/education", icon: GraduationCap, label: "Education" },
    { href: "/p-sainath", icon: User, label: "P Sainath" },
    { href: "/guidelines", icon: FileText, label: "Guidelines" },
   
  ],
  column3: [
    { href: "/donate", icon: Heart, label: "Donate" },
    { href: "/contribute", icon: PenTool, label: "Contribute" },
    { href: "/story", icon: History, label: "Story of PARI" },
  
  ],
  column4: [
    { href: "/donate", icon: Heart, label: "Donate" },
    { href: "/contribute", icon: PenTool, label: "Contribute" },
    { href: "/story", icon: History, label: "Story of PARI" },
    
  ],
}

const NavigationColumn = ({ items }: { items: NavigationItem[] }) => (
  <div className="space-y-3 flex  items-end gap-2">
    <nav className="space-y-3 gap-y-2 flex   flex-col">
      {items.map((item: NavigationItem) => (
        <Link 
          key={item.href}
          href={item.href} 
          className="flex items-center gap-2  text-muted-foreground hover:text-foreground transition-colors group font-noto-sans text-[15px] leading-[170%] tracking-[-0.03em]"
        >
          <item.icon className="h-4 w-4 text-red-600 group-hover:text-red-700" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  </div>
)

export function Footer() {
  return (
    <footer className="bg-white dark:bg-popover text-card-foreground px-5 py-8 sm:py-12 md:py-16">
      <div className="max-w-[1232px] mx-auto px-4">
        <div className="grid lg:grid-cols-3  grid-cols-1 gap-x-40">
          {/* First Column - Welcome & Newsletter */}
          <div>
            <div>
              <h3 className="font-noto-sans text-[18px] font-semibold leading-[160%] tracking-[-0.04em] text-foreground mb-2">Welcome to PARI</h3>
              <p className="font-noto-sans text-[15px] text-[#4F4F4F] font-normal leading-[150%] tracking-[-0.03em] mb-10">
                All our content is, and will forever be free to consume. If you enjoy our work, you can support us by becoming a volunteer or by donating to help fund our work.
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-noto-sans text-[16px] sm:text-[18px] font-semibold leading-[140%] tracking-[-0.04em] text-foreground pb-1 sm:pb-2">
                Sign up for our newsletter
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  className="h-8 sm:h-9 w-full bg-background rounded-full ring-none !ring-red-700 text-foreground text-sm"
                />
                
                <Button 
                  variant="default"
                  className="h-8 sm:h-9 w-full sm:w-auto min-w-[100px] bg-red-600 rounded-full text-white hover:bg-red-700 text-sm"
                >
                  <span>Subscribe</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className='flex justify-between md:col-span-2 md:py-6 sm:py-10 pt-12 flex-col gap-8'>
            <div className='grid  sm:grid-cols-4 grid-cols-2  gap-4'>
              <NavigationColumn items={navigationItems.column1} />
              <NavigationColumn items={navigationItems.column2} />
              <NavigationColumn items={navigationItems.column3} />
              <NavigationColumn items={navigationItems.column4} />
            </div>

            {/* Social Media Links */}
            <div>
              <div className="flex items-center justify-between space-x-6 pr-9 pt-4">
              <div className="flex items-center space-x-4">
                  <Link 
                    href="#" 
                    className="group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image 
                      src="/images/categories/paymant.png"
                      alt="Payment Options"
                      width={80}
                      height={40}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                   
                  </Link>
                  <Link 
                    href="#" 
                    className="group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image 
                      src="/images/categories/razorpay.png"
                      alt="Razorpay"
                      width={80}
                      height={40}
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <span className="sr-only">Razorpay</span>
                  </Link>
                </div>
                {/* Social Media Icons */}
                <div className="flex items-center space-x-8">
                  {[
                    { 
                      href: "https://twitter.com/PARInetwork", 
                      imgSrc: "/images/categories/twitter.png", 
                      label: "Twitter"
                    },
                    { 
                      href: "https://facebook.com/PARInetwork", 
                      imgSrc: "/images/categories/facebook.png", 
                      label: "Facebook"
                    },
                    { 
                      href: "https://instagram.com/pari.network", 
                      imgSrc: "/images/categories/insta.png", 
                      label: "Instagram"
                    },
                    { 
                      href: "https://youtube.com/PARInetwork", 
                      imgSrc: "/images/categories/youtube.png", 
                      label: "YouTube"
                    },
                  ].map(({ href, imgSrc, label }) => (
                    <Link 
                      key={href} 
                      href={href} 
                      className="group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image 
                        src={imgSrc}
                        alt={label}
                        width={24}
                        height={24}
                        className="opacity-100 hover:opacity-100 transition-opacity"
                      />
                     
                    </Link>
                  ))}
                </div>

                {/* Vertical Divider */}
            

                {/* Payment Icons */}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}