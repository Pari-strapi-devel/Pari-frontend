'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useEZForm } from '@/hooks/useEZForm';
import { FormErrorMessage, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { PencilRuler } from 'lucide-react';
import { useContributeBrevo } from '@/hooks/useBrevo';

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

interface FormConfigData {
  id: number;
  attributes: {
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    Country: string;
    State: string;
    District: string;
    organisation: string;
    fileLink: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
  };
}

interface FormConfigResponse {
  data: FormConfigData;
  meta: Record<string, unknown>;
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
        attributes?: {
          locale: string;
          title?: string;
          strap?: string;
          slug?: string;
        };
      }>;
    };
  };
}

interface ContributePageResponse {
  data: ContributePageData;
  meta: Record<string, unknown>;
}

const ContributePage = () => {
  const [mounted, setMounted] = useState(false);

  // Page content data states
  const [pageData, setPageData] = useState<ContributePageData | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Form configuration data states
  const [formConfig, setFormConfig] = useState<FormConfigData | null>(null);
  const [formConfigError, setFormConfigError] = useState<string | null>(null);

  // Location data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // EZForms hook for handling form submission
  const { isSubmitting, isSuccess, error } = useEZForm({
    formName: 'Content Upload Form',
    requiredFields: ['firstName', 'lastName', 'email', 'agreeToTerms'],
    onSuccess: async () => {
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
    }
  });

  // Brevo integration for contribute form
  const { submitForm: submitToBrevo } = useContributeBrevo();

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
    if (!pageData?.attributes?.Modular_Content) {
      return {
        title: 'Cover your country',
        description: "India's biggest archive of itself needs everyone to participate. Join us."
      };
    }

    const modularContent = pageData.attributes.Modular_Content;
    let title = 'Cover your country';
    let description = "India's biggest archive of itself needs everyone to participate. Join us.";

    // Find the paragraph that contains the main content
    const mainContent = modularContent.find(item =>
      item.__component === 'modular-content.paragraph' &&
      item.Paragraph &&
      item.Paragraph.includes('COVER YOUR COUNTRY')
    );

    if (mainContent?.Paragraph) {
      // Parse the HTML to extract title and description
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = mainContent.Paragraph;

      const h2Elements = tempDiv.querySelectorAll('h2');
      const pElements = tempDiv.querySelectorAll('p');

      // Get the first h2 for title
      if (h2Elements[0]) {
        title = h2Elements[0].textContent || title;
      }

      // Get the first p for description
      if (pElements[0]) {
        description = pElements[0].textContent || description;
      }
    }

    return { title, description };
  };

  // Helper function to extract section title from API
  const getSectionTitle = () => {
    if (!pageData?.attributes?.Modular_Content) {
      return 'Write / Photograph / Film / Create';
    }

    const modularContent = pageData.attributes.Modular_Content;

    // Find the paragraph that contains the section title
    const mainContent = modularContent.find(item =>
      item.__component === 'modular-content.paragraph' &&
      item.Paragraph &&
      item.Paragraph.includes('Write / Photograph')
    );

    if (mainContent?.Paragraph) {
      // Parse the HTML to extract the section title
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = mainContent.Paragraph;

      const h2Elements = tempDiv.querySelectorAll('h2');

      // Find the h2 that contains "Write"
      for (const h2 of h2Elements) {
        if (h2.textContent && h2.textContent.includes('Write')) {
          return h2.textContent;
        }
      }
    }

    return 'Write / Photograph / Film / Create';
  };

  // Helper function to render modular content with custom styling
  const renderModularContent = (modularContent: ModularContentItem[]) => {
    return modularContent.map((item, index) => {
      if (item.__component === 'modular-content.paragraph' && item.Paragraph) {
        const content = item.Paragraph;

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
                    <div
                      className="leading-relaxed prose-links:text-foreground prose-links:underline"
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
    const fetchContributePageData = async () => {
      try {
        setIsLoadingPageData(true);
        setPageError(null);

        // Fetch contribute page content from pages API (ID 3 is the contribute page)
        const response = await axios.get<ContributePageResponse>('https://dev.ruralindiaonline.org/v1/api/pages/3?populate=*');
        setPageData(response.data.data);
      } catch {
        setPageError('Failed to load page content');
      } finally {
        setIsLoadingPageData(false);
      }
    };

    fetchContributePageData();
  }, []);

  // Fetch form configuration data
  useEffect(() => {
    const fetchFormConfigData = async () => {
      try {
        setFormConfigError(null);

        const response = await axios.get<FormConfigResponse>('https://dev.ruralindiaonline.org/v1/api/form-contribute', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        setFormConfig(response.data.data);
      } catch {
        setFormConfigError('Failed to load form configuration');
      }
    };

    fetchFormConfigData();
  }, []);

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

      const response = await fetch('https://dev.ruralindiaonline.org/v1/api/upload', {
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

  const handleSubmitApplication = async () => {
    console.log('##Rohit_Rocks## Submit button clicked!');
    console.log('##Rohit_Rocks## Current form data:', formData);

    // Validate terms of service agreement
    if (!formData.agreeToTerms) {
      alert('You must agree to PARI\'s terms of service to submit your content');
      return;
    }

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

      const submissionData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        country: selectedCountry?.name || '',
        state: selectedState?.name || '',
        district: selectedDistrict?.name || '',
        organisation: formData.organization || '',
        fileLink: formData.fileLink || '',
        agreeToTerms: formData.agreeToTerms,
        // Add the uploaded file ID if file was uploaded
        ...(fileUploadId && { fileUpload: fileUploadId })
      };

      console.log('##Rohit_Rocks## Submission data:', submissionData);

      // Step 3: Submit form data with file ID
      const response = await fetch('https://dev.ruralindiaonline.org/v1/api/contribution-submits', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: submissionData })
      });

      console.log('##Rohit_Rocks## Submission response status:', response.status);
      const result = await response.json();
      console.log('##Rohit_Rocks## Submission response data:', result);

      if (response.ok) {
        alert('Success! Data and file uploaded to API successfully!');

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
      } else {
        alert('Error: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Submission error:', error);
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Content Section */}
          <div className="md:px-8">
            {isLoadingPageData ? (
              <div className="animate-pulse space-y-8">
                <div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-8 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
                <div>
                  {(() => {
                    const heroContent = getHeroContent();
                    return (
                      <>
                        <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
                          {heroContent.title}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                          {heroContent.description}
                        </p>
                      </>
                    );
                  })()}
                  <button className="px-6 py-3 border-2 border-primary-PARI-Red text-primary-PARI-Red rounded-full hover:bg-primary-PARI-Red hover:text-white transition-colors duration-200 font-medium">
                    See Content Guidelines
                  </button>
                </div>

                {/* Dynamic Content from API - Styled with same design */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    
                    <div className="flex items-center gap-3 mb-4">
                      <PencilRuler  className="text-2xl text-foreground" />
                      <h2 className="text-2xl  font-bold text-foreground">
                        {getSectionTitle()}
                      </h2>
                    </div>
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
          <div className="bg-popover dark:bg-popover p-8 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">
                {pageData?.attributes?.Title || 'Contribute content form'}
              </h2>
            </div>

            <p className="text-muted-foreground mb-8">
              Help us build India&apos;s biggest archive by contributing your content
            </p>

            {/* Form Configuration Error State */}
            {formConfigError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                <p className="text-red-600 dark:text-red-400">{formConfigError}</p>
              </div>
            )}

            {/* Form configuration status - only show errors */}
            {formConfigError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                <p className="text-red-600 dark:text-red-400">{formConfigError}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Personal Info Section */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                  PERSONAL INFO
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder={formConfig?.attributes?.firstName || "First Name"}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder={formConfig?.attributes?.lastName || "Last Name"}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder={formConfig?.attributes?.email || "Email"}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={formConfig?.attributes?.phone?.toString() || "Phone"}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country dropdown - always visible and enabled */}
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={loadingCountries}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50"
                    >
                      <option value="">
                        {loadingCountries ? 'Loading countries...' : (formConfig?.attributes?.Country || 'Country')}
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
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingStates ? 'Loading states...' : (formConfig?.attributes?.State || 'State')}
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
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingDistricts ? 'Loading districts...' : (formConfig?.attributes?.District || 'District')}
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
                      placeholder={formConfig?.attributes?.organisation || "Organisation / University / School name"}
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Content Section */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                  UPLOAD CONTENT
                </h3>

                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      name="uploadFile"
                      onChange={handleFileChange}
                      accept=".tiff,.png,.jpg,.pdf,.docx,.txt,.mp3,.mp4,.wav"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-PARI-Red file:text-white hover:file:bg-primary-PARI-Red/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: tiff, png, jpg, pdf, docx, txt, mp3, mp4, wav
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      File will be uploaded directly to the server when you submit the form.
                    </p>
                  </div>

                  <div className="text-center text-muted-foreground">
                    <span>Or</span>
                  </div>

                  <div>
                    <input
                      type="url"
                      name="fileLink"
                      placeholder={formConfig?.attributes?.fileLink || "Submit a link with your file"}
                      value={formData.fileLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Thank you! Your content has been submitted successfully.
                  </p>
                </div>
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
                    <a href="https://ruralindiaonline.org/termsofservices" target="_blank" rel="noopener noreferrer" className="text-primary-PARI-Red hover:underline">
                      terms of service
                    </a>
                  </label>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmitApplication();
                }}
                disabled={isSubmitting || !formData.agreeToTerms}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributePage;