'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import { BASE_URL } from '@/config';

import Link from 'next/link';
import Image from 'next/image';

import { FiArrowRight, FiUser, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { EZFormWrapper, FormSuccessMessage, FormErrorMessage, FormValidationErrors, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { useContactFormBrevo } from '@/hooks/useBrevo';
import { useLocale } from '@/lib/locale';

// Article data interface
interface ArticleData {
  id: number;
  attributes: {
    Title: string;
    Strap: string;
    slug: string;
    Original_published_date: string;
    type?: string;
    Cover_image?: {
      data?: {
        attributes?: {
          url: string;
        };
      };
    };
    Authors?: Array<{
      author_name?: {
        data?: {
          attributes?: {
            Name: string;
          };
        };
      };
    }>;
    categories?: {
      data?: Array<{
        attributes: {
          Title: string;
          slug?: string;
        };
      }>;
    };
    location?: {
      data?: {
        attributes?: {
          name?: string;
          district?: string;
          state?: string;
        };
      };
    };
  };
}

// Add interface for This Week on PARI data
interface ThisWeekOnPariData {
  ThisWeek_On_Pari_Title?: string;
  ThisWeek_On_Pari_Icon?: {
    data?: {
      attributes?: {
        url: string;
        name?: string;
        alternativeText?: string;
      };
    };
  };
  article_with_lang_selection_1?: Array<{
    all_language?: {
      language_name: string;
    };
    article?: {
      data?: {
        attributes: {
          Title: string;
          Strap?: string;
          slug: string;
          Original_published_date?: string;
          type?: string;
          Cover_image?: {
            data?: {
              attributes?: {
                url: string;
              };
            };
          };
          Authors?: Array<{
            author_name?: {
              data?: {
                attributes?: {
                  Name: string;
                };
              };
            };
          }>;
          categories?: {
            data?: Array<{
              attributes: {
                Title: string;
                slug?: string;
              };
            }>;
          };
          location?: {
            data?: {
              attributes?: {
                name?: string;
                district?: string;
                state?: string;
              };
            };
          };
        };
      };
    };
  }>;
}

const ContactForm = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language } = useLocale();

  // Brevo integration for contact form
  const { submitForm: submitToBrevo } = useContactFormBrevo();

  // Add state for This Week on PARI data
  const [thisWeekData, setThisWeekData] = useState<ThisWeekOnPariData | null>(null);
  const [isLoadingThisWeek, setIsLoadingThisWeek] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    newsletter: false
  });

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch This Week on PARI data
  useEffect(() => {
    const fetchThisWeekData = async () => {
      try {
        const query = {
          populate: {
            fields: ['seeallStories'],
            thisWeekOnPari: {
              populate: {
                article_with_lang_selection_1: {
                  populate: {
                    all_language: true,
                    article: {
                      populate: {
                        Cover_image: true,
                        mobilecover: true,
                        Authors: {
                          populate: {
                            author_name: {
                              populate: true
                            },
                            author_role: true
                          }
                        },
                        categories: true,
                        location: true
                      }
                    }
                  }
                },
                ThisWeek_On_Pari_Title: true
              }
            }
          },
          locale: language
        };

        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const response = await axios.get(`${BASE_URL}api/home-page?${queryString}`);

        const weekData = response.data?.data?.attributes?.thisWeekOnPari;
        if (weekData) {
          setThisWeekData(weekData);
        }
      } catch (error) {
        console.error('Error fetching This Week on PARI data:', error);
      } finally {
        setIsLoadingThisWeek(false);
      }
    };

    fetchThisWeekData();
  }, [language]);

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const query = {
          populate: {
            Cover_image: {
              fields: ['url']
            },
            Authors: {
              populate: {
                author_name: {
                  fields: ['Name']
                }
              }
            },
            categories: {
              fields: ['Title', 'slug']
            },
            location: {
              fields: ['name', 'district', 'state']
            }
          },
          pagination: {
            limit: 6 // Fetch 6 articles for display
          }
        };

        const queryString = qs.stringify(query, { encodeValuesOnly: true });
        const response = await axios.get(`${BASE_URL}api/articles?${queryString}`);

        if (response.data?.data) {
          setArticles(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchArticles();
  }, []);

  // Background image rotation effect - rotate This Week articles
  useEffect(() => {
    const itemsToRotate = thisWeekData?.article_with_lang_selection_1?.length || articles.length;
    
    if (itemsToRotate > 1) {
      console.log('Starting rotation with', itemsToRotate, 'items');
      
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % itemsToRotate;
          console.log('Changing from', prevIndex, 'to', nextIndex);
          return nextIndex;
        });
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [thisWeekData?.article_with_lang_selection_1?.length, articles.length]);

  // Set mounted to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Remove the old handleSubmit function - we'll use EZForms instead

  // Helper function to format article data
  const formatArticleData = (article: ArticleData) => {
    const imageUrl = article.attributes.Cover_image?.data?.attributes?.url
      ? `${BASE_URL.replace('/v1/', '')}${article.attributes.Cover_image.data.attributes.url}`
      : '/images/placeholder.jpg';

    const authors = article.attributes.Authors?.map(author =>
      author.author_name?.data?.attributes?.Name || 'Unknown Author'
    ) || [];

    const categories = article.attributes.categories?.data?.map(cat =>
      cat.attributes.Title
    ) || [];

    const location = article.attributes.location?.data?.attributes?.name ||
                    article.attributes.location?.data?.attributes?.district || '';

    const date = article.attributes.Original_published_date
      ? new Date(article.attributes.Original_published_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';

    return {
      id: article.id,
      title: article.attributes.Title,
      description: article.attributes.Strap || '',
      imageUrl,
      slug: article.attributes.slug,
      authors,
      categories,
      location,
      date,
      type: article.attributes.type || 'article'
    };
  };

  // Use default opacity during SSR to prevent hydration mismatch
  const overlayOpacity = mounted ? (theme === 'dark' ? '0.8' : '0.6') : '0.6';

  // Debug: Add this to see what's happening
  console.log('Debug info:', {
    articlesLength: articles.length,
    hasThisWeekData: !!thisWeekData?.article_with_lang_selection_1?.[0],
    currentImageIndex,
    mounted
  });

  return (
    <div className="md:min-h-screen mx-auto relative dark:bg-background">
      {/* Animated Background Images */}
      <div className="absolute inset-0 overflow-hidden">
        {articles.length > 0 && articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url('${formatArticleData(article).imageUrl}')`
            }}
          />
        ))}
        
        {/* This Week Background Images - rotate through them */}
        {thisWeekData?.article_with_lang_selection_1 && thisWeekData.article_with_lang_selection_1.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === (currentImageIndex % (thisWeekData.article_with_lang_selection_1?.length || 1)) ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url('${item.article?.data?.attributes?.Cover_image?.data?.attributes?.url?.startsWith('http') ? item.article.data.attributes.Cover_image.data.attributes.url : `${BASE_URL}${item.article?.data?.attributes?.Cover_image?.data?.attributes?.url}`}')`
            }}
          />
        ))}
        
        {/* Fallback Background */}
        {articles.length === 0 && !thisWeekData?.article_with_lang_selection_1?.[0] && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url('/images/banners/library-banner.jpg')`
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-12 items-center min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-8rem)]">
          {/* Left Content Section - Update to show This Week data */}
          <div className="text-white flex flex-col justify-end max-w-[20.5rem] lg:justify-end h-full relative p-4 sm:p-6">
            {/* Show This Week on PARI content if available - but allow background rotation */}
            {thisWeekData?.article_with_lang_selection_1?.[0] && (
              <div className="space-y- border-t border-primary-PARI-Red pt-4 sm:space-y-1">
                {thisWeekData.ThisWeek_On_Pari_Title && (
                  <div className="flex items-center mb-2">
                    {thisWeekData.ThisWeek_On_Pari_Icon?.data?.attributes?.url && (
                      <Image 
                        src={thisWeekData.ThisWeek_On_Pari_Icon.data.attributes.url.startsWith('http') 
                          ? thisWeekData.ThisWeek_On_Pari_Icon.data.attributes.url 
                          : `${BASE_URL}${thisWeekData.ThisWeek_On_Pari_Icon.data.attributes.url}`
                        }
                        alt={thisWeekData.ThisWeek_On_Pari_Icon.data.attributes.alternativeText || 'This Week Icon'}
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                    )}
                  </div>
                )}
                <h4 className="text-[16px] font-bold leading-[130%] tracking-[-0.04em]" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                  {thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.Title}
                </h4>
                <p className="text-[15px] font-medium leading-[180%] tracking-[-0.02em] opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>
                  by {thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.Authors?.map(author =>
                    author.author_name?.data?.attributes?.Name || 'Unknown Author'
                  ).join(', ') || 'Unknown Author'}
                </p>
                <Link
                  href={`/article/${thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.slug}`}
                  className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200 pt-2"
                >
                  <span className="text-[14px] font-medium leading-[160%] tracking-[-0.03em]" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>Read story</span>
                  <FiArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </Link>
              </div>
            )}
            
            {/* Fallback to regular articles if This Week data not available */}
            {!thisWeekData?.article_with_lang_selection_1?.[0] && articles.length > 0 && (
              <div className="space-y- border-t border-primary-PARI-Red pt-4 sm:space-y-1">
                <h4 className="text-[16px] font-bold leading-[130%] tracking-[-0.04em]" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                  {articles[currentImageIndex].attributes.Title}
                </h4>
                <p className="text-[15px] font-medium leading-[180%] tracking-[-0.02em] opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>
                 by {formatArticleData(articles[currentImageIndex]).authors.join(', ') || 'Unknown Author'}
                </p>
                <Link
                  href={`/article/${articles[currentImageIndex].attributes.slug}`}
                  className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200 pt-2"
                >
                  <span className="text-[14px] font-medium leading-[160%] tracking-[-0.03em]" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>Read story</span>
                  <FiArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </Link>
              </div>
            )}
            
            {/* Loading and empty states */}
            {!thisWeekData?.article_with_lang_selection_1?.[0] && articles.length === 0 && !isLoadingArticles && !isLoadingThisWeek && (
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Contact PARI</h1>
                <p className="text-base sm:text-lg opacity-90">No featured articles available</p>
              </div>
            )}
            {(isLoadingArticles || isLoadingThisWeek) && (
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Contact PARI</h1>
                <p className="text-base sm:text-lg opacity-90">Loading featured content...</p>
              </div>
            )}
          </div>

          {/* Right Form Section */}
          <div className='flex flex-col justify-center h-full'>
          <div className="bg-popover p-6 sm:p-8 rounded-[16px] w-full max-w-md mx-auto" style={{ boxShadow: '0px 2px 2px 0px #0000001A', backdropFilter: 'blur(0px)' }}>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground text-sm">
                We&apos;d love to hear from you
              </p>
            </div>

            <EZFormWrapper
              formName="Contact Form"
              requiredFields={['name', 'email', 'message']}
              onSuccess={async () => {
                console.log('##Rohit_Rocks## ContactForm - Form Success, submitting to Brevo:', {
                  email: formData.email,
                  name: formData.name,
                  hasPhone: !!formData.phone,
                  hasMessage: !!formData.message,
                  timestamp: new Date().toISOString()
                });

                // Submit to Brevo for email automation
                try {
                  console.log('##Rohit_Rocks## ContactForm - Calling submitToBrevo');
                  const brevoResult = await submitToBrevo(
                    formData.email,
                    formData.name,
                    formData.phone || undefined,
                    formData.message || undefined
                  );
                  console.log('##Rohit_Rocks## ContactForm - Brevo submission result:', brevoResult);
                } catch (error) {
                  console.error('##Rohit_Rocks## ContactForm - Brevo submission error:', error);
                  console.error('Brevo submission error:', error);
                }

                console.log('##Rohit_Rocks## ContactForm - Resetting form data');
                // Reset form on success
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  message: '',
                  newsletter: false
                });
              }}
            >
              {({ isSubmitting, isSuccess, error, validationErrors, submitForm }) => (
                <>
                  {/* Success Message */}
                  {isSuccess && (
                    <FormSuccessMessage
                      message="Thank you for contacting us! We&apos;ll get back to you soon."
                      className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200"
                    />
                  )}

                  {/* Error Message */}
                  {error && (
                    <FormErrorMessage
                      error={error}
                      className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200"
                    />
                  )}

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <FormValidationErrors
                      errors={validationErrors}
                      className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200"
                    />
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await submitForm(formData);
                    }}
                    className="space-y-4 sm:space-y-6"
                  >
              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1  gap-3 sm:gap-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm sm:text-base"
                    />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm sm:text-base"
                    />
                  </div>
                </div>



                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Newsletter Subscription Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="newsletter"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-PARI-Red dark:text-primary focus:ring-primary-PARI-Red dark:focus:ring-primary border-gray-300 dark:border-border rounded dark:bg-background"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600 dark:text-muted-foreground">
                  Auto-subscribe to our monthly newsletter
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-PARI-Red dark:bg-primary-PARI-Red text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FormLoadingSpinner className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </> 
                ) : (
                  'Send message'
                )}
              </button>
            </form>
                </>
              )}
            </EZFormWrapper>
          </div>

          {/* Mailing Address below form */}
          <div className="mt-12 sm:mt-6 w-full max-w-md mx-auto">
            <p className="text-white dark:text-foreground text-xs sm:text-sm border-t border-white/20 dark:border-border pt-6 sm:pt-4 text-center lg:text-left">
              <span className="font-semibold mb-2">Mailing address</span>
              <br />
              27/43 Sagar Sangam, Bandra Reclamation, Bandra West, Mumbai, Maharashtra- 400050
            </p>
          </div>
        </div>
        </div>

        {/* Articles Section */}
     
      </div>
    </div>
  );
};

export { ContactForm };
