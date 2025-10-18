'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import { BASE_URL } from '@/config';

import Link from 'next/link';

import { FiArrowRight, FiUser, FiMail, FiPhone, FiMessageSquare, FiEdit3, FiUsers, FiBookOpen, FiHeart } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { EZFormWrapper, FormSuccessMessage, FormErrorMessage, FormValidationErrors, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { useBrevo } from '@/hooks/useBrevo';
import { useLocale } from '@/lib/locale';

// Location data interfaces
interface Country {
  id: string;
  name: string;
  iso2: string;
}

interface State {
  id: number;
  name: string;
  iso2: string;
}

interface District {
  id: number;
  name: string;
}

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

  // Brevo integration for contact form and newsletter
  const { submitContactForm, subscribeNewsletter } = useBrevo();

  // Add state for This Week on PARI data
  const [thisWeekData, setThisWeekData] = useState<ThisWeekOnPariData | null>(null);
  const [isLoadingThisWeek, setIsLoadingThisWeek] = useState(true);



  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    reason: '',
    message: '',
    agreeTerms: true, // Default checked
    subscribeNewsletter: false,
    newsletterLanguage: 'English'
  });

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Location data state
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Static placeholder data for form fields (removed API call to avoid 404 error)
  const contactPageData = {
    attributes: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone"
    }
  };

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

  // Fetch countries from multiple APIs (same as intern page)
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);

      // Primary API: REST Countries API
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2');
        if (response.data && response.data.length > 0) {
          const countryData = response.data
            .map((country: { name: { common: string }, cca2: string }) => ({
              id: country.cca2,
              name: country.name.common,
              iso2: country.cca2
            }))
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

          setCountries(countryData);
          return;
        }
      } catch (error) {
        console.error('REST Countries API failed:', error);
      }

      // Secondary API: CountryStateCity API (with working API key from intern page)
      try {
        const response = await axios.get('https://api.countrystatecity.in/v1/countries', {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });

        if (response.data && response.data.length > 0) {
          const countryData = response.data
            .map((country: { id: number, name: string, iso2: string }) => ({
              id: country.iso2,
              name: country.name,
              iso2: country.iso2
            }))
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

          setCountries(countryData);
          return;
        }
      } catch (error) {
        console.error('CountryStateCity API failed:', error);
      }

      setCountries([]);
    } catch (error) {
      console.error('Error in fetchCountries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states for a selected country using multiple APIs (same as intern page)
  const fetchStates = async (countryCode: string) => {
    try {
      setLoadingStates(true);
      setStates([]);
      setDistricts([]);

      // Primary API: CountryStateCity API
      try {
        const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        });

        if (response.data && response.data.length > 0) {
          const stateData = response.data.map((state: { id: number, name: string, iso2: string }) => ({
            id: state.id,
            name: state.name,
            iso2: state.iso2
          })).sort((a: State, b: State) => a.name.localeCompare(b.name));

          setStates(stateData);
          return;
        }
      } catch (error) {
        console.error('CountryStateCity API failed:', error);
      }

      setStates([]);
    } catch (error) {
      console.error('Error in fetchStates:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch districts for a selected state using multiple APIs (same as intern page)
  const fetchDistricts = async (stateCode: string, countryCode: string) => {
    try {
      setLoadingDistricts(true);
      setDistricts([]);

      // Primary API: CountryStateCity API
      if (countryCode && stateCode) {
        try {
          const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
            headers: {
              'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
            }
          });

          if (response.data && response.data.length > 0) {
            const cityData = response.data.map((city: { id: number, name: string }, index: number) => ({
              id: city.id || index + 1,
              name: city.name
            })).sort((a: District, b: District) => a.name.localeCompare(b.name));

            setDistricts(cityData);
            return;
          }
        } catch (error) {
          console.error('CountryStateCity API failed for cities:', error);
        }
      }

      setDistricts([]);
    } catch (error) {
      console.error('Error in fetchDistricts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Helper function to check if India is selected
  const isIndiaSelected = () => {
    const selectedCountry = countries.find(c => c.iso2 === formData.country);
    return selectedCountry?.name.toLowerCase() === 'india' || formData.country === 'IN';
  };



  // Load countries on component mount
  useEffect(() => {
    console.log('##Rohit_Rocks## Component mounted, fetching data...');
    fetchCountries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Handle location changes
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.iso2 === value);
      const countryName = selectedCountry?.name || '';

      setFormData(prev => ({
        ...prev,
        country: value,
        state: '', // Reset state when country changes
        city: '' // Reset district when country changes
      }));

      setStates([]);
      setDistricts([]);

      // Only initialize states if India is selected
      if (value && (countryName.toLowerCase() === 'india' || value === 'IN')) {
        fetchStates(value);
      }
    } else if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: '' // Reset district when state changes
      }));

      setDistricts([]);

      // Only initialize districts if India is selected and state is selected
      const selectedCountry = countries.find(c => c.iso2 === formData.country);
      const countryName = selectedCountry?.name || '';
      if (value && (countryName.toLowerCase() === 'india' || formData.country === 'IN')) {
        const selectedState = states.find(state => state.iso2 === value);
        if (selectedState) {
          fetchDistricts(value, formData.country);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
          {/* Left Content Section - Get in touch with us */}
          <div className="text-white flex flex-col justify-center h-full relative p-4 sm:p-6 space-y-8">
            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                Get in touch with us
              </h1>
              <p className="text-xl sm:text-2xl font-medium opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>
                We&apos;d love to hear from you
              </p>
            </div>

            {/* Action Cards */}
            <div className="space-y-3">
              {/* Contribute Card */}
              <Link href="/contribute" className="block">
                <div className="backdrop-blur-sm bg-white/20 rounded-xl p-6 hover:bg-white/30 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FiEdit3 className="h-6 w-6 text-white hover:text-white transition-colors duration-300" />
                      <h3 className="text-xl font-bold text-white hover:text-white transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                        Contribute
                      </h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed pl-9 hover:text-white/90 transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      India&apos;s biggest archive of itself needs everyone to participate. Join us.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Volunteer Card */}
              <Link href="/volunteer" className="block">
                <div className="backdrop-blur-sm bg-white/20 rounded-xl p-6 hover:bg-white/40 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FiUsers className="h-6 w-6 text-white hover:text-white transition-colors duration-300" />
                      <h3 className="text-xl font-bold text-white hover:text-white transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                        Volunteer
                      </h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed pl-9 hover:text-white/90 transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      Engage with today&apos;s issues
                    </p>
                  </div>
                </div>
              </Link>

              {/* Intern Card */}
              <Link href="/intern" className="block">
                <div className="backdrop-blur-sm bg-white/20 rounded-xl p-6 hover:bg-white/30 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FiBookOpen className="h-6 w-6 text-white hover:text-white transition-colors duration-300" />
                      <h3 className="text-xl font-bold text-white hover:text-white transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                        Intern
                      </h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed pl-9 hover:text-white/90 transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      We need your support
                    </p>
                  </div>
                </div>
              </Link>

              {/* Donate Card */}
              <Link href="/donate" className="block">
                <div className="backdrop-blur-sm bg-white/20 rounded-xl p-6 hover:bg-white/30 hover:backdrop-blur-md hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FiHeart className="h-6 w-6 text-white hover:text-white transition-colors duration-300" />
                      <h3 className="text-xl font-bold text-white hover:text-white transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                        Donate
                      </h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed pl-9 hover:text-white/90 transition-colors duration-300" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      We can do this without governments – and will. We can&apos;t do it without you.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* NOW ON PARI Section */}
            <div className="border-t border-white/20 pt-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold tracking-wider opacity-80" style={{ fontFamily: 'Noto Sans', fontWeight: 600 }}>
                  NOW ON PARI
                </p>

                {/* Show This Week on PARI content if available */}
                {thisWeekData?.article_with_lang_selection_1?.[0] && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                      {thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.Title}
                    </h4>
                    <p className="text-sm opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      by {thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.Authors?.map(author =>
                        author.author_name?.data?.attributes?.Name || 'Unknown Author'
                      ).join(', ') || 'Unknown Author'}
                    </p>
                    <Link
                      href={`/article/${thisWeekData.article_with_lang_selection_1[currentImageIndex % thisWeekData.article_with_lang_selection_1.length]?.article?.data?.attributes?.slug}`}
                      className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200 pt-2"
                    >
                      <span className="text-sm font-medium" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>Read story</span>
                      <FiArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                )}

                {/* Fallback to regular articles if This Week data not available */}
                {!thisWeekData?.article_with_lang_selection_1?.[0] && articles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                      {articles[currentImageIndex].attributes.Title}
                    </h4>
                    <p className="text-sm opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      by {formatArticleData(articles[currentImageIndex]).authors.join(', ') || 'Unknown Author'}
                    </p>
                    <Link
                      href={`/article/${articles[currentImageIndex].attributes.slug}`}
                      className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200 pt-2"
                    >
                      <span className="text-sm font-medium" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>Read story</span>
                      <FiArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                )}

                {/* Loading and empty states */}
                {!thisWeekData?.article_with_lang_selection_1?.[0] && articles.length === 0 && !isLoadingArticles && !isLoadingThisWeek && (
                  <div>
                    <h4 className="text-lg font-bold leading-tight mb-2" style={{ fontFamily: 'Noto Sans', fontWeight: 700 }}>
                      Agriculture in the age of inequality
                    </h4>
                    <p className="text-sm opacity-90 mb-2" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>
                      by P. Sainath
                    </p>
                    <div className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200">
                      <span className="text-sm font-medium" style={{ fontFamily: 'Noto Sans', fontWeight: 500 }}>Read story</span>
                      <FiArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                )}
                {(isLoadingArticles || isLoadingThisWeek) && (
                  <div>
                    <p className="text-sm opacity-90" style={{ fontFamily: 'Noto Sans', fontWeight: 400 }}>Loading featured content...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className='flex flex-col justify-center h-full'>
          <div className="bg-white dark:bg-popover p-8 rounded-2xl w-full max-w-2xl mx-auto shadow-xl" style={{ boxShadow: '0px 4px 20px 0px rgba(0,0,0,0.1)' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
                Contact us
              </h2>
            </div>

            <EZFormWrapper
              formName="Contact Form"
              requiredFields={['firstName', 'lastName', 'email']}
              onSuccess={async () => {
                console.log('##Rohit_Rocks## ContactForm - Form Success, submitting to API and Brevo:', {
                  email: formData.email,
                  name: `${formData.firstName} ${formData.lastName}`,
                  hasPhone: !!formData.phone,
                  hasMessage: !!formData.message,
                  timestamp: new Date().toISOString()
                });

                // Submit to PARI Contact API (Strapi) - Always send regardless of newsletter checkbox
                try {
                  console.log('##Rohit_Rocks## ContactForm - Submitting to PARI Strapi API');

                  // Get actual names instead of codes
                  const selectedCountry = countries.find(c => c.iso2 === formData.country);
                  const selectedState = states.find(s => s.iso2 === formData.state);
                  const selectedDistrict = districts.find(d => d.name === formData.city);

                  // Map reason value to full text
                  const reasonTextMap: { [key: string]: string } = {
                    'submit_story': 'Would you like to submit a story, photo essay or video for review by PARI\'s editorial team?',
                    'volunteer': 'Would you like to volunteer your time to help PARI\'s Library or Translation teams?',
                    'internship': 'Are you seeking an internship or job at PARI for yourself or your students?',
                    'workshop': 'Would you like to invite PARI to your school / university / organisation for a workshop, session or collaboration?',
                    'contact_author': 'Would you like to get in touch with an author at PARI?',
                    'republish': 'Would you like to republish a PARI story?',
                    'donate': 'Would you like to donate to PARI?',
                    'other': 'Others'
                  };

                  const apiPayload = {
                    data: {
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email,
                      phone: formData.phone,
                      country: selectedCountry?.name || formData.country,
                      state: selectedState?.name || formData.state,
                      city: selectedDistrict?.name || formData.city, // City field
                      district: selectedDistrict?.name || formData.city, // District field (same as city)
                      reason: reasonTextMap[formData.reason] || formData.reason, // Send full text instead of value
                      message: formData.message,
                      agreeTerms: formData.agreeTerms,
                      subscribeNewsletter: formData.subscribeNewsletter, // Track if user wants newsletter
                      newsletterLanguage: formData.newsletterLanguage // Track preferred language
                    }
                  };

                  console.log('##Rohit_Rocks## ContactForm - Strapi API Payload:', JSON.stringify(apiPayload, null, 2));

                  const apiResponse = await axios.post(`${BASE_URL}api/form-contact-paris`, apiPayload, {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });

                  console.log('##Rohit_Rocks## ContactForm - Strapi API submission successful:', {
                    status: apiResponse.status,
                    statusText: apiResponse.statusText,
                    data: apiResponse.data
                  });
                } catch (error) {
                  const axiosError = error as { message?: string; response?: { data?: unknown; status?: number; statusText?: string } };
                  console.error('##Rohit_Rocks## ContactForm - Strapi API submission error:', {
                    message: axiosError?.message || 'Unknown error',
                    response: axiosError?.response?.data,
                    status: axiosError?.response?.status,
                    statusText: axiosError?.response?.statusText
                  });
                  // Don't throw error to prevent form from showing error state
                }

                // If newsletter checkbox is checked, also submit to Strapi newsletter endpoint
                if (formData.subscribeNewsletter) {
                  try {
                    console.log('##Rohit_Rocks## ContactForm - Newsletter checked, submitting to Strapi Newsletter API');

                    // Get actual names instead of codes for newsletter
                    const selectedCountry = countries.find(c => c.iso2 === formData.country);
                    const selectedState = states.find(s => s.iso2 === formData.state);
                    const selectedDistrict = districts.find(d => d.name === formData.city);

                    const newsletterPayload = {
                      data: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        country: selectedCountry?.name || formData.country,
                        state: selectedState?.name || formData.state,
                        district: selectedDistrict?.name || formData.city,
                        language: formData.newsletterLanguage,
                        subscribedAt: new Date().toISOString()
                      }
                    };

                    console.log('##Rohit_Rocks## ContactForm - Strapi Newsletter API Payload:', JSON.stringify(newsletterPayload, null, 2));

                    const newsletterApiResponse = await axios.post(`${BASE_URL}api/newslatters`, newsletterPayload, {
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });

                    console.log('##Rohit_Rocks## ContactForm - Strapi Newsletter API submission successful:', {
                      status: newsletterApiResponse.status,
                      statusText: newsletterApiResponse.statusText,
                      data: newsletterApiResponse.data
                    });
                  } catch (error) {
                    const axiosError = error as { message?: string; response?: { data?: unknown; status?: number; statusText?: string } };
                    console.error('##Rohit_Rocks## ContactForm - Strapi Newsletter API submission error:', {
                      message: axiosError?.message || 'Unknown error',
                      response: axiosError?.response?.data,
                      status: axiosError?.response?.status,
                      statusText: axiosError?.response?.statusText
                    });
                    // Don't throw error to prevent form from showing error state
                  }
                }

                // Submit to Brevo for email automation
                try {
                  console.log('##Rohit_Rocks## ContactForm - Submitting to Brevo Contact List');

                  // Always submit to contact list
                  const contactResult = await submitContactForm(
                    formData.email,
                    `${formData.firstName} ${formData.lastName}`,
                    formData.phone || undefined,
                    formData.message || undefined
                  );
                  console.log('##Rohit_Rocks## ContactForm - Contact list submission result:', contactResult);

                  // If newsletter checkbox is checked, also submit to Brevo newsletter list
                  if (formData.subscribeNewsletter) {
                    console.log('##Rohit_Rocks## ContactForm - Newsletter checked, submitting to Brevo Newsletter List');

                    // Get actual names instead of codes for newsletter
                    const selectedCountry = countries.find(c => c.iso2 === formData.country);
                    const selectedState = states.find(s => s.iso2 === formData.state);
                    const selectedDistrict = districts.find(d => d.name === formData.city);

                    const newsletterResult = await subscribeNewsletter(
                      formData.email,
                      `${formData.firstName} ${formData.lastName}`,
                      formData.phone || undefined,
                      selectedCountry?.name || formData.country || undefined,
                      selectedState?.name || formData.state || undefined,
                      selectedDistrict?.name || formData.city || undefined,
                      formData.newsletterLanguage || language || undefined
                    );
                    console.log('##Rohit_Rocks## ContactForm - Brevo Newsletter submission result:', newsletterResult);
                  } else {
                    console.log('##Rohit_Rocks## ContactForm - Newsletter not checked, skipping Brevo newsletter submission');
                  }
                } catch (error) {
                  console.error('##Rohit_Rocks## ContactForm - Brevo submission error:', error);
                  console.error('Brevo submission error:', error);
                }

                console.log('##Rohit_Rocks## ContactForm - Resetting form data');
                // Reset form on success
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  country: '',
                  state: '',
                  city: '',
                  reason: '',
                  message: '',
                  agreeTerms: true, // Keep checked by default after reset
                  subscribeNewsletter: false,
                  newsletterLanguage: 'English'
                });
                // Clear location data to force fresh fetch
                setStates([]);
                setDistricts([]);
              }}
            >
              {({ isSubmitting, isSuccess, error, validationErrors, submitForm }) => (
                <>
                  {/* Success Message */}
                  {isSuccess && (
                    <FormSuccessMessage
                      message="Thank you for contacting us! Your message has been submitted successfully. We&apos;ll get back to you soon."
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
                      console.log('##Rohit_Rocks## ContactForm - Form submitted with data:', formData);
                      await submitForm(formData);
                    }}
                    className="space-y-4 sm:space-y-6"
                  >
              <div className="space-y-6">
                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      name="firstName"
                      placeholder={contactPageData?.attributes?.firstName || "First Name"}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder={contactPageData?.attributes?.lastName || "Last Name"}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
                  <input
                    type="email"
                    name="email"
                    placeholder={contactPageData?.attributes?.email || "Email"}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={contactPageData?.attributes?.phone || "Phone"}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* Country, State, District Row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Country dropdown - always visible and enabled */}
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={loadingCountries}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">{loadingCountries ? 'Loading countries...' : 'Country'}</option>
                    {(() => {
                      // Sort countries with India at the top
                      const sortedCountries = [...countries].sort((a, b) => {
                        if (a.name.toLowerCase() === 'india') return -1;
                        if (b.name.toLowerCase() === 'india') return 1;
                        return a.name.localeCompare(b.name);
                      });

                      return sortedCountries.map((country) => (
                        <option key={country.id} value={country.iso2}>
                          {country.name}
                        </option>
                      ));
                    })()}
                  </select>

                  {/* State dropdown - always visible but disabled unless India is selected */}
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={loadingStates || !isIndiaSelected()}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">{loadingStates ? 'Loading states...' : 'State'}</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.iso2}>
                        {state.name}
                      </option>
                    ))}
                  </select>

                  {/* District dropdown - always visible but disabled unless India is selected and state is chosen */}
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loadingDistricts || !isIndiaSelected() || !formData.state.trim()}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">{loadingDistricts ? 'Loading districts...' : 'District'}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason for reaching out */}
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-5 w-5" />
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">Reason for reaching out</option>
                    <option value="submit_story">Would you like to submit a story, photo essay or video for review by PARI&apos;s editorial team?</option>
                    <option value="volunteer">Would you like to volunteer your time to help PARI&apos;s Library or Translation teams?</option>
                    <option value="internship">Are you seeking an internship or job at PARI for yourself or your students?</option>
                    <option value="workshop">Would you like to invite PARI to your school / university / organisation for a workshop, session or collaboration?</option>
                    <option value="contact_author">Would you like to get in touch with an author at PARI?</option>
                    <option value="republish">Would you like to republish a PARI story?</option>
                    <option value="donate">Would you like to donate to PARI?</option>
                    <option value="other">Others</option>
                  </select>
                </div>

                {/* Message */}
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-muted-foreground h-4 w-4" />
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red dark:focus:ring-primary focus:border-transparent outline-none resize-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>
              </div>

              {/* Terms and Newsletter Checkboxes */}
              <div className="space-y-3">
                {/* Terms of Service Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    required
                    className="h-4 w-4 text-primary-PARI-Red dark:text-primary focus:ring-primary-PARI-Red dark:focus:ring-primary border-gray-300 dark:border-border rounded dark:bg-background"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600 dark:text-muted-foreground">
                    I agree to PARI&apos;s{' '}
                    <a href="https://ruralindiaonline.org/termsofservices" target="_blank" rel="noopener noreferrer" className="text-primary-PARI-Red hover:underline">
                      terms of service
                    </a>
                  </label>
                </div>

                {/* Newsletter Subscription with Language Dropdown */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="subscribeNewsletter"
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                  />
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <label htmlFor="subscribeNewsletter" className="text-sm text-gray-600 dark:text-muted-foreground">
                      Subscribe to our newsletter in
                    </label>
                    <select
                      name="newsletterLanguage"
                      value={formData.newsletterLanguage}
                      onChange={handleInputChange}
                      className="pl-3 pr-8 py-2 text-sm rounded-full bg-primary-PARI-Red/20 border-none outline-none focus:ring-0 text-primary-PARI-Red appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="English">English</option>

                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-PARI-Red dark:bg-primary-PARI-Red text-white py-4 px-6 rounded-full font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default ContactForm;
