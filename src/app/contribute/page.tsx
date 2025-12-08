'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { EZFormWrapper, FormSuccessMessage, FormErrorMessage, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { EZFormData } from '@/lib/ezforms';
import { PencilRuler } from 'lucide-react';
import { useContributeBrevo } from '@/hooks/useBrevo';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
import { useLocale } from '@/lib/locale';
import Link from 'next/link';
import { API_BASE_URL } from '@/utils/constants';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';

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

interface ContributeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  district: string;
  organization: string;
  uploadFile?: File | null;
  fileLink: string;
  agreeToTerms: boolean;
}

// Types for pages API response
interface ModularContentItem {
  id: number;
  __component: string;
  Paragraph?: string;
  Align_content?: string | null;
}

interface ContributePageData {
  id: number;
  attributes: {
    Title: string;
    Strap: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    Author: {
      data?: {
        attributes?: {
          author_name?: {
            data?: {
              attributes?: {
                Name: string;
              };
            };
          };
          author_role?: {
            data?: {
              attributes?: {
                Name: string;
              };
            };
          };
        };
      };
    } | null;
    Modular_Content: ModularContentItem[];
    localizations: {
      data: Array<{
        id: number;
        attributes: {
          locale: string;
          title?: string;
          strap?: string;
          slug?: string;
        };
      }>;
    };
  };
}

const ContributeContent = () => {
  const [mounted, setMounted] = useState(false);
  const { language: currentLocale } = useLocale();

  // Page content data states
  const [pageData, setPageData] = useState<ContributePageData | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form configuration data states - REMOVED (not used)

  // Location data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Brevo integration for contribute form
  const { submitForm: submitToBrevo } = useContributeBrevo();

  // Font class state for language-specific fonts
  const [fontClass, setFontClass] = useState('font-noto');

  const [formData, setFormData] = useState<ContributeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    district: '',
    organization: '',
    uploadFile: null,
    fileLink: '',
    agreeToTerms: true
  });

  // Fetch countries from multiple APIs
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

      // Secondary API: CountryStateCity API
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

  // Fetch states for a selected country using multiple APIs
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

  // Fetch districts/cities for a selected state using multiple APIs
  const fetchDistricts = async (stateCode: string, countryCode?: string) => {
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

  // Helper function to extract hero content from API
  const getHeroContent = () => {
    if (!pageData?.attributes) {
      return {
        title: 'Cover your country',
        description: "India's biggest archive of itself needs everyone to participate. Join us."
      };
    }

    // Use the Title and Strap directly from the API response
    const title = pageData.attributes.Title || 'Cover your country';
    const description = pageData.attributes.Strap || "India's biggest archive of itself needs everyone to participate. Join us.";

    return { title, description };
  };

  // Helper function to render modular content with custom styling
  const renderModularContent = (modularContent: ModularContentItem[]) => {
    return modularContent.map((item, index) => {
      if (item.__component === 'modular-content.paragraph' && item.Paragraph) {
        let content = item.Paragraph;

        // Remove h6 headings from content (since we show them separately at the top)
        if (content.includes('<h6>')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const h6Elements = tempDiv.querySelectorAll('h6');
          h6Elements.forEach(h6 => h6.remove());
          content = tempDiv.innerHTML;
        }

        // Handle content with HTML lists - convert to custom styled lists
        if (content.includes('<ul>') && content.includes('<li>')) {
          // Parse HTML to extract list items
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const listItems = tempDiv.querySelectorAll('li');
          const beforeList = content.split('<ul>')[0];

          return (
            <div key={index} className="space-y-4">
              {/* Render any content before the list */}
              {beforeList && beforeList.trim() && (
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: beforeList }}
                />
              )}

              {/* Custom styled list */}
              <ul className="space-y-4 list-none">
                {Array.from(listItems).map((listItem, listIndex) => (
                  <li key={listIndex} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0"></span>
                    <p
                      className="leading-relaxed text-discreet-text font-noto-sans prose-links:text-foreground prose-links:underline"
                      dangerouslySetInnerHTML={{ __html: listItem.innerHTML }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Handle content with headings - extract only paragraph content, skip headings
        if (content.includes('<h2>')) {
          // Extract only paragraph content, skip the headings since we have custom ones
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const paragraphs = tempDiv.querySelectorAll('p');

          // Skip the first paragraph if it's the hero description (already shown above)
          const paragraphsToShow = Array.from(paragraphs).slice(1);

          return (
            <div key={index} className="space-y-4">
              {paragraphsToShow.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: paragraph.innerHTML }}
                />
              ))}
            </div>
          );
        }

        // Default paragraph rendering
        return (
          <div
            key={index}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Fetch contribute page data from pages API
  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect triggered for locale:', currentLocale);

    const fetchContributePageData = async () => {
      try {
        setIsLoadingPageData(true);
        setPageError(null);

        console.log('##Rohit_Rocks## Fetching contribute page with locale:', currentLocale);

        // Fetch all pages and find "Cover your country" by title
        const listResponse = await axios.get<{ data: ContributePageData[]; meta: Record<string, unknown> }>(
          `${API_BASE_URL}/v1/api/pages?filters[Title][$eq]=Cover your country&populate=deep,3&locale=en`
        );

        if (!listResponse.data.data || listResponse.data.data.length === 0) {
          throw new Error('Contribute page not found');
        }

        const response = { data: { data: listResponse.data.data[0], meta: {} } };

        const mainData = response.data.data;
        console.log('##Rohit_Rocks## Main data locale:', mainData.attributes.locale);
        console.log('##Rohit_Rocks## Available localizations:', mainData.attributes.localizations);

        // If current locale is English, use the main data
        if (currentLocale === 'en') {
          console.log('##Rohit_Rocks## Using English content');
          setPageData(mainData);
        } else if (mainData.attributes.localizations?.data?.length > 0) {
          // Check if requested locale exists in localizations
          const localization = mainData.attributes.localizations.data.find(
            (loc) => loc.attributes.locale === currentLocale
          );

          if (localization) {
            // Fetch the specific localization
            console.log('##Rohit_Rocks## Found localization for', currentLocale, ', fetching full data...');
            try {
              const localeResponse = await axios.get<{ data: ContributePageData; meta: Record<string, unknown> }>(
                `${API_BASE_URL}/v1/api/pages/${localization.id}?populate=deep,3`
              );
              console.log('##Rohit_Rocks## Localized content:', {
                Title: localeResponse.data.data.attributes.Title,
                Strap: localeResponse.data.data.attributes.Strap,
                locale: localeResponse.data.data.attributes.locale
              });
              setPageData(localeResponse.data.data);
            } catch (localeError) {
              console.error('##Rohit_Rocks## Error fetching localized content:', localeError);
              // Fallback to English
              setPageData(mainData);
            }
          } else {
            // Fallback to English if locale not found
            console.log('##Rohit_Rocks## No localization found for', currentLocale, ', using English');
            setPageData(mainData);
          }
        } else {
          // No localizations available, use English
          console.log('##Rohit_Rocks## No localizations available, using English');
          setPageData(mainData);
        }
      } catch (error) {
        console.error('##Rohit_Rocks## Error fetching contribute page:', error);
        // Use fallback content even on error
        const fallbackData: ContributePageData = {
          id: 3,
          attributes: {
            Title: 'Contribute to PARI',
            Strap: 'Share your stories, photographs, and films with us',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            locale: currentLocale,
            Author: null,
            Modular_Content: [
              {
                id: 1,
                __component: 'modular-content.paragraph',
                Paragraph: '<p>PARI welcomes contributions from writers, photographers, filmmakers, and creators who want to document rural India.</p>',
                Align_content: null
              }
            ],
            localizations: {
              data: []
            }
          }
        };
        setPageData(fallbackData);
      } finally {
        setIsLoadingPageData(false);
      }
    };

    fetchContributePageData();
  }, [currentLocale]); // Re-fetch when locale changes

  // Form configuration fetch removed - not needed

  // Set font based on language
  useEffect(() => {
    switch (currentLocale) {
      case 'hi':
      case 'mr':
        setFontClass('font-noto-devanagari');
        break;
      case 'te':
        setFontClass('font-noto-telugu');
        break;
      case 'ta':
        setFontClass('font-noto-tamil');
        break;
      case 'ur':
        setFontClass('font-noto-urdu');
        break;
      case 'bn':
        setFontClass('font-noto-bengali');
        break;
      case 'gu':
        setFontClass('font-noto-gujarati');
        break;
      case 'or':
        setFontClass('font-noto-odia');
        break;
      case 'kn':
        setFontClass('font-noto-kannada');
        break;
      case 'pa':
        setFontClass('font-noto-punjabi');
        break;
      case 'as':
        setFontClass('font-noto-assamese');
        break;
      case 'ml':
        setFontClass('font-noto-malayalam');
        break;
      default:
        setFontClass('font-noto');
        break;
    }
  }, [currentLocale]);

  useEffect(() => {
    setMounted(true);
    fetchCountries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }

    // Handle location changes
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.iso2 === value);
      const countryName = selectedCountry?.name || '';

      setFormData(prev => ({
        ...prev,
        country: value,
        state: '', // Reset state when country changes
        district: '' // Reset district when country changes
      }));

      setStates([]);
      setDistricts([]);

      // Only fetch states if India is selected
      if (value && (countryName.toLowerCase() === 'india' || value === 'IN')) {
        fetchStates(value);
      }
    } else if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        district: '' // Reset district when state changes
      }));

      setDistricts([]);

      // Only fetch districts if India is selected and state is selected
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
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      uploadFile: file
    }));
  };

  // Upload file to Strapi upload endpoint
  const uploadFile = async (file: File): Promise<number> => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      console.log('##Rohit_Rocks## Uploading file:', file.name);

      const response = await fetch(`${API_BASE_URL}/v1/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('##Rohit_Rocks## File upload successful:', result);

      // API returns an array of uploaded files, get the first one's ID
      return result[0]?.id;
    } catch (error) {
      console.error('##Rohit_Rocks## File upload failed:', error);
      throw error;
    }
  };

  const handleSubmitApplication = async (submitForm: (formData: EZFormData, captchaToken?: string) => Promise<void>) => {
    console.log('##Rohit_Rocks## Submit button clicked!');
    console.log('##Rohit_Rocks## Current form data:', formData);

    try {
      console.log('##Rohit_Rocks## Starting form submission');
      console.log('##Rohit_Rocks## File selected:', formData.uploadFile?.name);

      // Step 1: Upload file first if selected
      let fileUploadId = null;
      if (formData.uploadFile) {
        console.log('##Rohit_Rocks## Uploading file first...');
        fileUploadId = await uploadFile(formData.uploadFile);
        console.log('##Rohit_Rocks## File uploaded with ID:', fileUploadId);
      }

      // Step 2: Prepare form data for submission
      // Get actual names instead of codes
      const selectedCountry = countries.find(c => c.iso2 === formData.country);
      const selectedState = states.find(s => s.iso2 === formData.state);
      const selectedDistrict = districts.find(d => d.name === formData.district);

      const submissionData: EZFormData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        country: selectedCountry?.name || '',
        state: selectedState?.name || '',
        district: selectedDistrict?.name || '',
        organization: formData.organization || '',
        fileLink: formData.fileLink || '',
        agreeToTerms: formData.agreeToTerms,
        // Add the uploaded file ID if file was uploaded
        ...(fileUploadId && { fileUpload: fileUploadId })
      };

      console.log('##Rohit_Rocks## Submission data:', submissionData);

      // Step 3: Submit via EZForm
      await submitForm(submissionData);

      // Also submit to Brevo for email automation
      try {
        console.log('##Rohit_Rocks## Submitting to Brevo for contribute tracking');
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        await submitToBrevo(
          formData.email,
          fullName,
          formData.phone || undefined,
          formData.organization || undefined
        );
        console.log('##Rohit_Rocks## Brevo contribute submission successful');
      } catch (brevoError) {
        console.error('##Rohit_Rocks## Brevo contribute submission error:', brevoError);
        // Don't fail the whole process if Brevo fails
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Submission error:', error);
      throw error; // Re-throw to let EZForm handle the error display
    }
  };

  if (!mounted) {
    return null;
  }

  // Text direction helper function
  const getTextDirection = (locale: string) => {
    return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
  };

  return (
    <div
      className={`min-h-screen bg-background py-10 md:py-20 md:px-20 px-8 ${fontClass}`}
      dir={getTextDirection(currentLocale)}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-40 items-start">
          {/* Left Content Section */}
          <div className="md:px-8">
            {isLoadingPageData ? (
              <div className="animate-pulse space-y-8">
                <div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-3/4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : pageError ? (
              <div className="text-red-600">
                <p className="text-muted-foreground">{pageError}</p>
              </div>
            ) : pageData ? (
              <div className="space-y-8">
                {/* Main Heading - Extract from API Content */}
                <div className=' mb-16'>
                  {(() => {
                    const heroContent = getHeroContent();
                    return (
                      <>
                        <h1 className="text-foreground mb-2">
                          {heroContent.title}
                        </h1>
                        <h2 className=" text-muted-foreground mb-4">
                          {heroContent.description}
                        </h2>
                      </>
                    );
                  })()}
                  <Link href="/contribute/guidelines">
                    <button className="px-5 py-2 border-1 border-primary-PARI-Red text-primary-PARI-Red rounded-full hover:bg-primary-PARI-Red hover:text-white transition-colors duration-200 font-medium">
                      See Content Guidelines
                    </button>
                  </Link>
                
                </div>

                {/* Dynamic Content from API - Styled with same design */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PencilRuler className="text-2xl text-foreground" />
                    <h3 className="text-xl  text-foreground">
                      Write / Photograph / Film / Create
                    </h3>
                  </div>

                  {/* API Content with Custom Styling */}
                  <div className="space-y-4 text-muted-foreground prose prose-gray max-w-none [&_a]:text-primary-PARI-Red [&_a]:underline [&_a:hover]:text-red-700">
                    {renderModularContent(pageData.attributes.Modular_Content)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <p>Loading content...</p>
              </div>
            )}
          </div>

          {/* Right Form Section */}
          <div className="bg-popover dark:bg-popover p-4 sm:p-6 md:p-8 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl text-card-foreground">
                { 'Contribute content form'}
              </h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Help us build India&apos;s biggest archive by contributing your content
            </p>

            <EZFormWrapper
              formName="Content Upload Form"
              requiredFields={[]}
              onSuccess={async () => {
                console.log('##Rohit_Rocks## Content Upload Form - Form Success');
                // Reset form on success
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  country: '',
                  state: '',
                  district: '',
                  organization: '',
                  uploadFile: null,
                  fileLink: '',
                  agreeToTerms: true
                });
                // Clear location data to force fresh fetch
                setCountries([]);
                setStates([]);
                setDistricts([]);
              }}
            >
              {({ isSubmitting, isSuccess, error, submitForm }) => (
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmitApplication(submitForm);
            }} className="space-y-6">
              {/* Personal Info Section */}
              <div>
                <h6 className="text-grey-300 dark:text-discreet-text mb-4">
                  PERSONAL INFO
                </h6>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name *"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                      />
                    </div>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Country dropdown - always visible and enabled */}
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={loadingCountries}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 text-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <option value="">
                        {loadingCountries ? 'Loading countries...' : 'Country'}
                      </option>
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
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 disabled:cursor-not-allowed text-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <option value="">
                        {loadingStates ? 'Loading states...' : 'State'}
                      </option>
                      {states.map((state) => (
                        <option key={state.id} value={state.iso2}>
                          {state.name}
                        </option>
                      ))}
                    </select>

                    {/* District dropdown - always visible but disabled unless India is selected and state is chosen */}
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      disabled={loadingDistricts || !isIndiaSelected() || !formData.state.trim()}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 disabled:cursor-not-allowed text-sm appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <option value="">
                        {loadingDistricts ? 'Loading districts...' : 'District'}
                      </option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="organization"
                      placeholder="Organisation / University / School name"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Content Section */}
              <div>
                <h6 className="text-grey-300 dark:text-discreet-text mb-4">
                  UPLOAD CONTENT
                </h6>

                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      name="uploadFile"
                      onChange={handleFileChange}
                      accept=".tiff,.png,.jpg,.pdf,.docx,.txt,.mp3,.mp4,.wav"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-PARI-Red file:text-white hover:file:bg-primary-PARI-Red/90 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: tiff, png, jpg, pdf, docx, txt, mp3, mp4, wav
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      File will be uploaded directly to the server when you submit the form.
                    </p>
                  </div>

                  <div className="text-center text-muted-foreground text-sm">
                    <span>Or</span>
                  </div>

                  <div>
                    <input
                      type="url"
                      name="fileLink"
                      placeholder="Submit a link with your file"
                      value={formData.fileLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <FormSuccessMessage message="Thank you! Your content has been submitted successfully." />
              )}

              {/* Error Message */}
              {error && (
                <FormErrorMessage error={error} />
              )}

              {/* Terms of Service Agreement */}
              <div className="mt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    className="h-4 w-4 text-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                    I agree to PARI&apos;s{' '}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-primary-PARI-Red hover:underline">
                      terms of service
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                className={`w-full py-3 px-6 rounded-full font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !formData.agreeToTerms
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/90'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <FormLoadingSpinner />
                    Submitting...
                  </div>
                ) : (
                  'Submit Content'
                )}
              </button>
            </form>
              )}
            </EZFormWrapper>
          </div>
        </div>
      </div>

      {/* Floating Language Toggle */}
      <LanguageToggle />
    </div>
  );
};

const ContributePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ContributeContent />
    </Suspense>
  );
};

export default ContributePage;