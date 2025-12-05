'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { FaXTwitter, FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa6'

import { BASE_URL } from '@/config'
import { useLocale } from '@/lib/locale'
import { useNewsletterSubscription } from '@/hooks/useBrevo'
import { NewsletterBottomSheet } from '@/components/newsletter/NewsletterBottomSheet'


interface FooterLink {
  link: string;
  name: string;
  icon?: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
}

interface SocialLink {
  id: number;
  attributes: {
    name: string;
    url: string;
    icon: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface PaymentIcon {
  id: number;
  attributes: {
    name: string;
    url: string;
    icon: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
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
        data: SocialLink[];
      };
      payment_icons: {
        data: PaymentIcon[];
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
  const { language, addLocaleToUrl } = useLocale()

  // Newsletter subscription state
  const [email, setEmail] = useState('')
  const { subscribe, isLoading: isSubscribing, isSuccess, error: subscribeError, reset } = useNewsletterSubscription()

  // Newsletter bottom sheet state
  const [isNewsletterSheetOpen, setIsNewsletterSheetOpen] = useState(false)

  // Newsletter form submission handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const result = await subscribe(email.trim())

    if (result.success) {
      setEmail('') // Clear form on success
    }
  }

  // Auto-reset newsletter subscription status after 5 seconds
  useEffect(() => {
    if (isSuccess || subscribeError) {
      const timer = setTimeout(() => {
        reset()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, subscribeError, reset])

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
              populate: {
                icon: {
                  fields: ['url']
                }
              }
            },
            logo: {
              fields: ['url'],
            },
            social_links: {
              populate: {
                icon: {
                  fields: ['url']
                }
              }
            },
            payment_icons: {
              populate: {
                icon: {
                  fields: ['url']
                }
              }
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
      } catch {
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
  const socialLinks = footerData?.data?.attributes?.social_links?.data || []
  const paymentIcons = footerData?.data?.attributes?.payment_icons?.data || []
  const title = footerData?.data?.attributes?.title || 'Default title'
  const description = footerData?.data?.attributes?.description || 'Default description'

  return (
    <>
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
              <h5 className="font-noto-sans text-[18px]  text-foreground mb-2">
               {title}
              </h5>
              <p className="font-noto-sans text-[15px] text-discreet-text  font-normal leading-[150%] tracking-[-0.03em] mb-10">
                {description}
              </p>
            </div>
            
            <div className="mt-4">
              <div className="bg-transparent shadow-none p-0 max-w-none">
                <h5 className="font-noto-sans text-[18px]  text-foreground mb-4">
                  {footerData?.data?.attributes?.sign_up_for_our_newsletter || 'Sign up for our newsletter'}
                </h5>

                {isSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200 text-sm">
                    Successfully subscribed to newsletter!
                  </div>
                )}

                {subscribeError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200 text-sm">
                    {subscribeError}
                  </div>
                )}

                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                  
                    <button
                      type="button"
                      disabled={isSubscribing}
                      className="px-4 py-2 bg-primary-PARI-Red text-white rounded-[26px] hover:bg-primary-PARI-Red/90 focus:outline-none focus:ring-2 focus:ring-primary-PARI-Red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-noto-sans text-[15px] font-medium"
                      onClick={() => {
                       
                        setIsNewsletterSheetOpen(true);
                      }}
                    >
                      {isSubscribing ? 'Subscribing...' : (footerData?.data?.attributes?.subscribe || 'Subscribe')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className='flex justify-between md:col-span-2 md:py-6 sm:py-10 pt-12 flex-col gap-8'>
            <div className='grid sm:grid-cols-4 grid-cols-2 gap-4'>
             
              {footerLinks.map((footerLink, index) => {
                // Add defensive check
                if (!footerLink) return null;

                // const iconUrl = footerLink.icon?.data?.attributes?.url;

                return (
                  <div key={`footer-link-${index}`} className="space-y-3 flex items-end gap-2">
                    <nav className="space-y-3 gap-y-2 flex flex-col">
                      <Link
                        href={addLocaleToUrl(footerLink.link || '/')}
                        className="flex items-center gap-2 text-discreet-text hover:text-foreground transition-colors group font-noto-sans text-[15px] leading-[170%] tracking-[-0.03em]"
                      >
                        {/* {iconUrl && (
                          <div className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0">
                            <Image
                              src={`${BASE_URL}${iconUrl}`}
                              alt={footerLink.name || 'Icon'}
                              width={20}
                              height={20}
                              className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        )} */}
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
                  {paymentIcons.length > 0 ? (
                    paymentIcons.map((payment) => {
                      const iconUrl = payment.attributes?.icon?.data?.attributes?.url
                      return (
                        <Link
                          key={payment.id}
                          href={payment.attributes?.url || '#'}
                          className="group flex items-center justify-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {iconUrl ? (
                            <div className="w-[80px] h-[40px] flex items-center justify-center">
                              <Image
                                src={`${BASE_URL}${iconUrl}`}
                                alt={payment.attributes?.name || 'Payment Option'}
                                width={80}
                                height={40}
                                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <span className="text-sm">{payment.attributes?.name}</span>
                          )}
                        </Link>
                      )
                    })
                  ) : (
                    // Fallback to hardcoded payment icons if API data is not available
                    <>
                      <Link
                        href="#"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-[80px] h-[40px] flex items-center justify-center">
                          <Image
                            src="/images/categories/paymant.png"
                            alt="Payment Options"
                            width={80}
                            height={40}
                            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </Link>
                      <Link
                        href="#"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-[80px] h-[40px] flex items-center justify-center">
                          <Image
                            src="/images/categories/razorpay.png"
                            alt="Razorpay"
                            width={80}
                            height={40}
                            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </Link>
                    </>
                  )}
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center w-full md:justify-center justify-evenly  md:space-x-8">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((social) => {
                      const iconUrl = social.attributes?.icon?.data?.attributes?.url
                      return (
                        <Link
                          key={social.id}
                          href={social.attributes?.url || '#'}
                          className="group flex items-center justify-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {iconUrl ? (
                            <div className="w-[30px] h-[30px] flex items-center justify-center">
                              <Image
                                src={`${BASE_URL}${iconUrl}`}
                                alt={social.attributes?.name || 'Social Media'}
                                width={30}
                                height={30}
                                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <span className="text-sm">{social.attributes?.name}</span>
                          )}
                        </Link>
                      )
                    })
                  ) : (
                    // Fallback to hardcoded icons if API data is not available
                    <>
                      <Link
                        href="https://x.com/PARInetwork"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X (Twitter)"
                      >
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                          <FaXTwitter className="w-full h-full text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      <Link
                        href="https://facebook.com/PARInetwork"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                      >
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                          <FaFacebookF className="w-full h-full text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      <Link
                        href="https://instagram.com/pari.network"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                          <FaInstagram className="w-full h-full text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      <Link
                        href="https://youtube.com/@PARInetwork"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                      >
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                          <FaYoutube className="w-full h-full text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      <Link
                        href="https://linkedin.com/company/pari-network"
                        className="group flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                      >
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                          <FaLinkedinIn className="w-full h-full text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </footer>

      {/* Newsletter Bottom Sheet */}
      <NewsletterBottomSheet
        isOpen={isNewsletterSheetOpen}
        onClose={() => setIsNewsletterSheetOpen(false)}
        title={footerData?.data?.attributes?.sign_up_for_our_newsletter || 'Sign up for our newsletter'}
      />
    </>
  )
}
