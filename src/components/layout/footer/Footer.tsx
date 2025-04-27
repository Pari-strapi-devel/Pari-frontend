"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import axios from 'axios'
import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'


interface FooterLink {
  link: string;
  name: string;
}

interface FooterApiResponse {
  data: {
    attributes: {
      footer_links: FooterLink[];
      logo: {
        data: {
          attributes: {
            url: string;
          };
        };
      };
      social_links: {
        data: Array<{
          attributes: {
            name: string;
            url: string;
          };
        }>;
      };
      title: string;
      description: string;
      sign_up_for_our_newsletter: string;
      email_address: string;
      subscribe: string;
    };
  };
}

export function Footer() {
  const [footerData, setFooterData] = useState<FooterApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLocale()

  useEffect(() => {
    let mounted = true;

    const fetchFooterData = async () => {
      if (!mounted) return;
      
      try {
        setIsLoading(true)
        setError(null)

        const query = {
          populate: {
            footer_links: {
              populate: true
            },
            logo: {
              fields: ['url'],
            },
            menus: {
              fields: ['title', 'slug'],
            },
          },
          locale: language || 'en'
        }

        const response = await axios.get<FooterApiResponse>(
          `${BASE_URL}api/footer`, 
          { params: query }
        )

        if (mounted) {
          setFooterData(response.data)
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
        if (mounted) {
          setError('Failed to load footer data')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchFooterData()

    return () => {
      mounted = false
    }
  }, [language])

  if (isLoading) return <div className="font-noto-sans text-[15px] text-[#4F4F4F] font-normal leading-[150%] tracking-[-0.03em]">Loading...</div>
  if (error) return <div className="font-noto-sans text-[15px] text-[#4F4F4F] font-normal leading-[150%] tracking-[-0.03em]">Error: {error}</div>

  const logoUrl = footerData?.data?.attributes?.logo?.data?.attributes?.url
 
  const footerLinks = footerData?.data?.attributes?.footer_links || []
  const title = footerData?.data?.attributes?.title || 'Default title'
  const description = footerData?.data?.attributes?.description || 'Default description'

  return (
    <footer className="bg-white dark:bg-popover text-card-foreground px-5 py-8 sm:py-12 md:py-16">
      <div className="max-w-[1232px] mx-auto px-4">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-x-40">
          {/* First Column - Welcome & Newsletter */}
          <div>
            {logoUrl && (
              <div className="mb-6">
                <Image
                  src={`${BASE_URL}${logoUrl}`}
                  alt="Footer Logo"
                  width={150}
                  height={50}
                  className="h-auto"
                />
              </div>
            )}
            <div>
              <h3 className="font-noto-sans text-[18px] font-semibold leading-[160%] tracking-[-0.04em] text-foreground mb-2">
               {title}
              </h3>
              <p className="font-noto-sans text-[15px] text-[#4F4F4F] font-normal leading-[150%] tracking-[-0.03em] mb-10">
                {description}
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-noto-sans text-[16px] sm:text-[18px] font-semibold leading-[140%] tracking-[-0.04em] text-foreground pb-1 sm:pb-2">
                {footerData?.data?.attributes?.sign_up_for_our_newsletter || 'Sign up for our newsletter'}
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder={footerData?.data?.attributes?.email_address || 'Enter your email'} 
                  className="h-8 sm:h-9 w-full bg-background rounded-full ring-none !ring-red-700 text-foreground text-sm"
                />
                <Button 
                  variant="default"
                  className="h-8 sm:h-9 w-full sm:w-auto min-w-[100px] bg-red-600 rounded-full text-white hover:bg-red-700 text-sm"
                >
                  <span>{footerData?.data?.attributes?.subscribe || 'Subscribe'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className='flex justify-between md:col-span-2 md:py-6 sm:py-10 pt-12 flex-col gap-8'>
            <div className='grid sm:grid-cols-4 grid-cols-2 gap-4'>
             
              {footerLinks.map((footerLink, index) => {
                // Add defensive check
                if (!footerLink) return null;
                
                return (
                  <div key={`footer-link-${index}`} className="space-y-3 flex items-end gap-2">
                    <nav className="space-y-3 gap-y-2 flex flex-col">
                      <Link
                        href={footerLink.link || '/'}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group font-noto-sans text-[15px] leading-[170%] tracking-[-0.03em]"
                      >
                        <span className="font-noto-sans text-[15px] font-medium leading-[170%] tracking-[-0.03em]">{footerLink.name}</span>
                      </Link>
                    </nav>
                  </div>
                );
              })}
            </div>
          
            {/* Social Media Links */}
            <div className='w-full'>
              <div className="flex w-full items-center md:justify-between justify-center flex-col md:flex-row gap-4 space-x-6 md:pr-9 pt-4">
                <div className="flex items-center  w-full md:justify-start justify-center space-x-4">
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
                  </Link>
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center w-full md:justify-center justify-evenly  md:space-x-8">
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
                        width={30}
                        height={30}
                        className="opacity-100 hover:opacity-100 transition-opacity"
                      />
                     
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
