'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useVolunteerBrevo } from '@/hooks/useBrevo';
import { languages } from '@/data/languages';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
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

// Nominatim API response interfaces
interface NominatimAddress {
  state?: string;
  province?: string;
  region?: string;
}

interface NominatimItem {
  address?: NominatimAddress;
}

// GeoNames API response interfaces
interface GeoNamesItem {
  geonameId?: number;
  name: string;
  fclName?: string;
  adminCode1?: string;
}

// Types for API response from pages API
interface ModularContentItem {
  id: number;
  __component: string;
  Paragraph?: string;
  Align_content?: string | null;
}

interface VolunteerPageData {
  id: number;
  attributes: {
    Title: string;
    Strap: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    Author: {
      data?: {
        id: number;
        attributes: {
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
          Title?: string;
          Strap?: string;
          slug?: string;
          createdAt?: string;
          updatedAt?: string;
          publishedAt?: string;
        };
      }>;
    };
  };
}

// Types for volunteer API data
interface VolunteerData {
  id: number;
  attributes: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    district: string;
    organisation_name: string;
    about_yourself: string;
    why_volunteer: string;
    contributions: string[];
    time_available: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    languages: string | null;
  };
}

interface VolunteerApiResponse {
  data: VolunteerData;
  meta: Record<string, unknown>;
}





const VolunteerPageContent = () => {
  const { language: currentLocale } = useLocale();
  const [currentStep, setCurrentStep] = useState(1);
  const [pageData, setPageData] = useState<VolunteerPageData | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  // Volunteer API data state
  const [volunteerApiData, setVolunteerApiData] = useState<VolunteerData | null>(null);
  const [isLoadingVolunteerData, setIsLoadingVolunteerData] = useState(true);
  const [volunteerDataError, setVolunteerDataError] = useState<string | null>(null);

  // Location data state
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);



  // Fetch volunteer page data from pages API
  useEffect(() => {
    const fetchVolunteerPageData = async () => {
      try {
        setIsLoadingPageData(true);
        setPageError(null);

        console.log('##Rohit_Rocks## Fetching volunteer page with locale:', currentLocale);

        // First, fetch the English version with all localizations populated
        const response = await axios.get<{ data: VolunteerPageData; meta: Record<string, unknown> }>(
          `https://dev.ruralindiaonline.org/v1/api/pages/2?populate=deep,3&locale=en`
        );

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
              const localeResponse = await axios.get<{ data: VolunteerPageData; meta: Record<string, unknown> }>(
                `https://dev.ruralindiaonline.org/v1/api/pages/${localization.id}?populate=deep,3`
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
        console.error('##Rohit_Rocks## Error fetching volunteer page:', error);
        setPageError('Failed to load page content');
      } finally {
        setIsLoadingPageData(false);
      }
    };

    const fetchVolunteerApiData = async () => {
      try {
        setIsLoadingVolunteerData(true);
        setVolunteerDataError(null);

        console.log('##Rohit_Rocks## Fetching volunteer API data with locale:', currentLocale);

        try {
          // Try to fetch with the selected locale
          const response = await axios.get<VolunteerApiResponse>(`https://dev.ruralindiaonline.org/v1/api/volunteer?locale=${currentLocale}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          });
          console.log('##Rohit_Rocks## Volunteer API response for locale', currentLocale, ':', response.data);
          console.log('##Rohit_Rocks## Volunteer API field labels:', {
            first_name: response.data.data.attributes.first_name,
            last_name: response.data.data.attributes.last_name,
            email: response.data.data.attributes.email,
            phone: response.data.data.attributes.phone
          });
          setVolunteerApiData(response.data.data);
        } catch (error) {
          // If locale-specific content not found, fallback to English
          console.log('##Rohit_Rocks## Volunteer API locale not found, falling back to English. Error:', error);
          const response = await axios.get<VolunteerApiResponse>('https://dev.ruralindiaonline.org/v1/api/volunteer?locale=en', {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          });
          console.log('##Rohit_Rocks## Volunteer API response (fallback):', response.data);
          setVolunteerApiData(response.data.data);
        }
      } catch (error) {
        console.error('##Rohit_Rocks## Error fetching volunteer API:', error);
        setVolunteerDataError('Unable to load form configuration from server');
      } finally {
        setIsLoadingVolunteerData(false);
      }
    };

    fetchVolunteerPageData();
    fetchVolunteerApiData();
  }, [currentLocale]);

  // Fetch countries using multiple APIs
  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      setCountries([]);

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
      } catch {
        // REST Countries API failed, try next API
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
      } catch {
        // CountryStateCity API failed
      }

      setCountries([]);
    } catch {
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
          const stateData = response.data
            .map((state: { id: number, name: string, iso2: string }) => ({
              id: state.id,
              name: state.name,
              iso2: state.iso2
            }))
            .sort((a: State, b: State) => a.name.localeCompare(b.name));

          setStates(stateData);
          return;
        }
      } catch {
        // CountryStateCity API failed, try next API
      }

      // Secondary API: Nominatim API
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            country: countryCode,
            format: 'json',
            addressdetails: 1,
            limit: 50,
            'accept-language': 'en'
          }
        });

        if (response.data && response.data.length > 0) {
          // Extract unique states/provinces from the results
          const stateSet = new Set<string>();
          response.data.forEach((item: NominatimItem) => {
            if (item.address?.state) {
              stateSet.add(item.address.state);
            } else if (item.address?.province) {
              stateSet.add(item.address.province);
            } else if (item.address?.region) {
              stateSet.add(item.address.region);
            }
          });

          if (stateSet.size > 0) {
            const nominatimStates = Array.from(stateSet).map((name, index) => ({
              id: index + 1,
              name: name,
              iso2: name.substring(0, 2).toUpperCase()
            })).sort((a: State, b: State) => a.name.localeCompare(b.name));

            setStates(nominatimStates);
            return;
          }
        }
      } catch {
        // Nominatim API failed, try next API
      }

      // Final API: GeoNames API
      try {
        const response = await axios.get(`http://api.geonames.org/childrenJSON`, {
          params: {
            geonameId: countryCode, // This might need country name to geonameId mapping
            username: 'demo', // You'll need to register for a free username
            maxRows: 50
          }
        });

        if (response.data?.geonames && response.data.geonames.length > 0) {
          const geonamesStates = response.data.geonames
            .filter((item: GeoNamesItem) => item.fclName === 'country, state, region,...')
            .map((item: GeoNamesItem, index: number) => ({
              id: item.geonameId || index + 1,
              name: item.name,
              iso2: item.adminCode1 || item.name.substring(0, 2).toUpperCase()
            }))
            .sort((a: State, b: State) => a.name.localeCompare(b.name));

          if (geonamesStates.length > 0) {
            setStates(geonamesStates);
            return;
          }
        }
      } catch {
        // GeoNames API failed
      }

      setStates([]);
    } catch {
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch districts for a selected state using multiple APIs
  const fetchDistricts = async (countryCode: string, stateCode: string) => {
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
            const cityData = response.data
              .map((city: { id: number, name: string }, index: number) => ({
                id: city.id || index + 1,
                name: city.name
              }))
              .sort((a: District, b: District) => a.name.localeCompare(b.name));

            setDistricts(cityData);
            return;
          }
        } catch {
          // CountryStateCity API failed for cities
        }
      }

      setDistricts([]);
    } catch {
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Brevo integration for volunteer applications
  const { submitApplication: submitToBrevo, isLoading: isSubmittingToBrevo, isSuccess, error } = useVolunteerBrevo();
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '', // Keep empty by default
    state: '',   // Keep empty by default
    district: '', // Keep empty by default
    organisation: '',

    // Step 2 - Why Volunteer
    aboutYourself: '',
    whyVolunteer: '',

    // Step 3 - Volunteering Details
    contributions: [] as string[],
    translatorLink1: '',
    translatorLink2: '',
    translateLanguage: '',
    timeCommitment: '',

    // Terms of Service Agreement
    agreeToTerms: true
  });



  // Helper function to get input class with error styling
  const getInputClassName = (fieldName: string, baseClassName: string) => {
    const hasError = validationErrors[fieldName];
    return hasError
      ? baseClassName.replace('border-gray-300 dark:border-border', 'border-primary-PARI-Red dark:border-primary-PARI-Red')
      : baseClassName;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }

    // Clear validation messages when user starts typing
    if (validationMessages.length > 0) {
      setValidationMessages([]);
    }

    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  // Handle country selection
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const selectedCountry = countries.find(c => c.iso2 === countryCode);
    const countryName = selectedCountry?.name || '';

    setFormData(prev => ({
      ...prev,
      country: countryName,
      state: '',
      district: ''
    }));
    setStates([]);
    setDistricts([]);

    // Only fetch states if India is selected
    if (countryCode && (countryName.toLowerCase() === 'india' || countryCode === 'IN')) {
      fetchStates(countryCode);
    }
  };

  // Handle state selection
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    const selectedCountry = countries.find(c => c.name === formData.country);
    setFormData(prev => ({
      ...prev,
      state: states.find(s => s.iso2 === stateCode)?.name || '',
      district: ''
    }));
    setDistricts([]);

    // Only fetch districts if India is selected and state is selected
    if (selectedCountry && stateCode && (formData.country.toLowerCase() === 'india' || selectedCountry.iso2 === 'IN')) {
      fetchDistricts(selectedCountry.iso2, stateCode);
    }
  };

  // Handle district selection
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setFormData(prev => ({
      ...prev,
      district: districts.find(d => d.id.toString() === districtId)?.name || ''
    }));
  };

  const handleCheckboxChange = (value: string) => {
    // Clear validation messages when user interacts with checkboxes
    if (validationMessages.length > 0) {
      setValidationMessages([]);
    }

    // Clear contributions validation error
    if (validationErrors.contributions) {
      setValidationErrors(prev => ({
        ...prev,
        contributions: false
      }));
    }

    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.includes(value)
        ? prev.contributions.filter(item => item !== value)
        : [...prev.contributions, value]
    }));
  };

  const handleNextSection = () => {
    const errors: {[key: string]: boolean} = {};
    const messages: string[] = [];

    // Validate required fields based on current step
    if (currentStep === 1) {
      // Step 1: Personal Info - validate name and email
      if (!formData.fullName.trim()) {
        errors.fullName = true;
        messages.push('First name is required');
      }
      if (!formData.lastName.trim()) {
        errors.lastName = true;
        messages.push('Last name is required');
      }
      if (!formData.email.trim()) {
        errors.email = true;
        messages.push('Email is required');
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = true;
          messages.push('Please enter a valid email address');
        }
      }
    } else if (currentStep === 2) {
      // Step 2: Why Volunteer - validate aboutYourself and whyVolunteer
      if (!formData.aboutYourself.trim()) {
        errors.aboutYourself = true;
        messages.push('Please tell us about yourself briefly');
      }
      if (!formData.whyVolunteer.trim()) {
        errors.whyVolunteer = true;
        messages.push('Please tell us why you would like to volunteer with PARI');
      }
    }

    // Set validation errors for visual feedback
    setValidationErrors(errors);
    setValidationMessages(messages);

    // Only proceed if no errors
    if (Object.keys(errors).length === 0 && currentStep < 3) {
      setValidationMessages([]); // Clear messages on success
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitProfile = async () => {
    // Validate required fields before submission
    const requiredFieldErrors: {[key: string]: boolean} = {};
    const messages: string[] = [];

    if (!formData.fullName.trim()) {
      requiredFieldErrors.fullName = true;
      messages.push('First name is required');
    }
    if (!formData.lastName.trim()) {
      requiredFieldErrors.lastName = true;
      messages.push('Last name is required');
    }
    if (!formData.email.trim()) {
      requiredFieldErrors.email = true;
      messages.push('Email is required');
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        requiredFieldErrors.email = true;
        messages.push('Please enter a valid email address');
      }
    }
    if (!formData.aboutYourself.trim()) {
      requiredFieldErrors.aboutYourself = true;
      messages.push('Please tell us about yourself briefly');
    }
    if (!formData.whyVolunteer.trim()) {
      requiredFieldErrors.whyVolunteer = true;
      messages.push('Please tell us why you would like to volunteer with PARI');
    }
    if (formData.contributions.length === 0) {
      requiredFieldErrors.contributions = true;
      messages.push('Please select at least one contribution area');
    }

    // Check if translations is selected and language is mandatory
    const hasTranslations = formData.contributions.some(contribution =>
      contribution.toLowerCase().includes('translation')
    );
    if (hasTranslations && !formData.translateLanguage.trim()) {
      requiredFieldErrors.translateLanguage = true;
      messages.push('Please select a language for translation when Translations is selected');
    }

    if (!formData.agreeToTerms) {
      requiredFieldErrors.agreeToTerms = true;
      messages.push('You must agree to PARI\'s terms of service to submit your application');
    }

    if (Object.keys(requiredFieldErrors).length > 0) {
      setValidationErrors(requiredFieldErrors);
      setValidationMessages(messages);
      return;
    }

    // Clear validation messages on successful validation
    setValidationMessages([]);

    // Prepare the data for API submission - match exact field names expected by API
    const volunteerData = {
      data: {
        // Step 1 - Personal Information (matching API field names)
        firstName: formData.fullName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || null,
        country: formData.country?.trim() || null,
        state: formData.state?.trim() || null,
        district: formData.district?.trim() || null,
        organisation: formData.organisation?.trim() || null,

        // Step 2 - Why Volunteer (simple string format for API)
        about_yourself: formData.aboutYourself.trim() || null,
        why_volunteer: formData.whyVolunteer.trim() || null,

        // Step 3 - Volunteering Details (matching exact API field names)
        contribute_areas: formData.contributions, // Array of selected contributions
        translator_experience_links: formData.translatorLink1.trim() || null,
        translator_experience_links1: formData.translatorLink2.trim() || null,
        translation_language: formData.translateLanguage || null, // Already stores full language name
        time_available: formData.timeCommitment || null,

        // Terms of Service Agreement
        agreeToTerms: formData.agreeToTerms,

        // Additional metadata
        submitted_at: new Date().toISOString(),
        form_version: '1.0'
      }
    };

    // Log the data being sent for debugging
    console.log('##Rohit_Rocks## Volunteer Data being sent:', JSON.stringify(volunteerData, null, 2));

    try {
      // Submit to volunteer API
      console.log('##Rohit_Rocks## Submitting to volunteer API...');
      await axios.post('https://dev.ruralindiaonline.org/v1/api/volunteer-submits', volunteerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Also submit to Brevo for email automation
      const skills = formData.contributions.join(', ') +
        (formData.aboutYourself ? ` | About: ${formData.aboutYourself}` : '') +
        (formData.whyVolunteer ? ` | Why: ${formData.whyVolunteer}` : '');

      const fullName = `${formData.fullName} ${formData.lastName}`.trim();

      await submitToBrevo(
        formData.email,
        fullName,
        formData.phone || undefined,
        skills || undefined
      );

    } catch (error) {
      console.error('##Rohit_Rocks## Volunteer form submission error:', error);

      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Submission failed: ${error.message}`);
      } else {
        alert('Submission failed. Please try again.');
      }

      // Re-throw error so it can be handled by calling function
      throw error;
    }
  };

  // Helper function to render modular content
  const renderModularContent = (modularContent: ModularContentItem[]) => {
    return modularContent.map((item, index) => {
      if (item.__component === 'modular-content.paragraph' && item.Paragraph) {
        return (
          <div
            key={index}
            className="text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: item.Paragraph }}
          />
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4">
      {/* Add floating language button */}
      <LanguageToggle />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Content Section */}
          <div className="md:px-8">
            {isLoadingPageData ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : pageError ? (
              <div className="text-red-600 dark:text-red-400">
                <p className="text-muted-foreground">{pageError}</p>
              </div>
            ) : pageData ? (
              <>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-6">
                  {pageData.attributes.Title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-muted-foreground mb-6">
                  {pageData.attributes.Strap}
                </p>

                <div className="space-y-6 text-gray-600 dark:text-muted-foreground">
                  {renderModularContent(pageData.attributes.Modular_Content)}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                <p>Loading content...</p>
              </div>
            )}
          </div>

          {/* Right Form Section */}
          <div className="bg-white dark:bg-popover p-8 rounded-2xl shadow-xl border border-gray-300 dark:border-border" style={{ boxShadow: '0px 4px 20px 0px rgba(0,0,0,0.1)' }}>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                  Profile form
                </h2>
                {isLoadingVolunteerData && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-PARI-Red"></div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform font-extrabold " viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#B82929"
                      strokeWidth="4"
                      strokeDasharray={`${(currentStep / 3) * 100}, 100`}
                      className="transition-all duration-300 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-900 dark:text-muted-foreground">{currentStep}/3</span>
                  </div>
                </div>
              </div>
            </div>



            {/* API Status Indicator */}
            {volunteerDataError && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {volunteerDataError}
                </p>
              </div>
            )}

            {/* Validation Errors */}
            {validationMessages.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200">
                <p className="text-sm font-medium mb-2">Please fix the following errors:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {validationMessages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleNextSection();
              }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-4 uppercase tracking-wide">
                    PERSONAL INFO
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="fullName"
                        placeholder={volunteerApiData?.attributes.first_name || "First name *"}
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className={getInputClassName('fullName', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm")}
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder={volunteerApiData?.attributes.last_name || "Last name *"}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className={getInputClassName('lastName', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm")}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        name="email"
                        placeholder={volunteerApiData?.attributes.email || "Email *"}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={getInputClassName('email', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm")}
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder={volunteerApiData?.attributes.phone || "Phone"}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Country dropdown - always visible */}
                      <div className="relative">
                        <select
                          name="country"
                          value={countries.find(c => c.name === formData.country)?.iso2 || ''}
                          onChange={handleCountryChange}
                          disabled={loadingCountries}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
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
                              <option key={country.iso2} value={country.iso2}>
                                {country.name}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>

                      {/* State dropdown - always visible but disabled unless India is selected */}
                      <div className="relative">
                        <select
                          name="state"
                          value={states.find(s => s.name === formData.state)?.iso2 || ''}
                          onChange={handleStateChange}
                          disabled={loadingStates || formData.country.toLowerCase() !== 'india'}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '20px 20px'
                          }}
                        >
                          <option value="">
                            {loadingStates ? 'Loading states...' :
                             formData.country.toLowerCase() !== 'india' ? 'State' : 'State'}
                          </option>
                          {states.map((state) => (
                            <option key={state.iso2} value={state.iso2}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* District dropdown - always visible but disabled unless India is selected and state is chosen */}
                      <div className="relative">
                        <select
                          name="district"
                          value={districts.find(d => d.name === formData.district)?.id || ''}
                          onChange={handleDistrictChange}
                          disabled={loadingDistricts || formData.country.toLowerCase() !== 'india' || !formData.state.trim()}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '20px 20px'
                          }}
                        >
                          <option value="">
                            {loadingDistricts ? 'Loading districts...' :
                             formData.country.toLowerCase() !== 'india' ? 'District' :
                             !formData.state.trim() ? 'District' : 'District'}
                          </option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="organisation"
                        placeholder={volunteerApiData?.attributes.organisation_name || "Organisation / University / School name"}
                        value={formData.organisation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Next section
                </button>
              </form>
            )}

            {/* Step 2: Why Volunteer */}
            {currentStep === 2 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleNextSection();
              }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-4 uppercase tracking-wide">
                    WHY VOLUNTEER
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <textarea
                        name="aboutYourself"
                        placeholder={volunteerApiData?.attributes.about_yourself || "Tell us about yourself briefly *"}
                        value={formData.aboutYourself}
                        onChange={handleInputChange}
                        rows={4}
                        required
                        className={getInputClassName('aboutYourself', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none resize-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm")}
                      />
                    </div>
                    <div>
                      <textarea
                        name="whyVolunteer"
                        placeholder={volunteerApiData?.attributes.why_volunteer || "Why you would like to volunteer with PARI *"}
                        value={formData.whyVolunteer}
                        onChange={handleInputChange}
                        rows={4}
                        required
                        className={getInputClassName('whyVolunteer', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none resize-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm")}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Next Section
                </button>
              </form>
            )}

            {/* Step 3: Volunteering Details */}
            {currentStep === 3 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitProfile();
              }} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-4 uppercase tracking-wide">
                    VOLUNTEERING DETAILS
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${validationErrors.contributions ? 'text-primary-PARI-Red' : 'text-gray-600 dark:text-muted-foreground'}`}>
                        How would you like to contribute to PARI? *
                      </label>
                      <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 p-3 rounded-lg ${validationErrors.contributions ? 'border-2 border-primary-PARI-Red bg-red-50 dark:bg-red-900/10' : ''}`}>
                        {volunteerApiData?.attributes.contributions?.map((contribution: string) => (
                          <label key={contribution} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes(contribution)}
                              onChange={() => handleCheckboxChange(contribution)}
                              className="mr-2 h-4 w-4 accent-primary-PARI-Red focus:ring-2 focus:ring-primary-PARI-Red border-gray-300 dark:border-border rounded"
                            />
                            <span className="text-sm text-gray-900 dark:text-muted-foreground">{contribution}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Show translator fields only when Translations is selected */}
                    {formData.contributions.some(contribution => contribution.toLowerCase().includes('translation')) && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-muted-foreground mb-3">
                            If you have prior experience as a translator, please list examples:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="url"
                              name="translatorLink1"
                              placeholder="Link 1"
                              value={formData.translatorLink1}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                            />
                            <input
                              type="url"
                              name="translatorLink2"
                              placeholder="Link 2"
                              value={formData.translatorLink2}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-3 ${validationErrors.translateLanguage ? 'text-primary-PARI-Red' : 'text-gray-600 dark:text-muted-foreground'}`}>
                            If you would like to translate for PARI, please choose the language: *
                          </label>
                          <select
                            name="translateLanguage"
                            value={formData.translateLanguage}
                            onChange={handleInputChange}
                            className={getInputClassName('translateLanguage', "w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm appearance-none")}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.75rem center',
                              backgroundSize: '20px 20px'
                            }}
                          >
                            <option value="">Select language</option>
                            {languages.map((language, index: number) => {
                              const languageName = language.names?.[1]?.replace('/ ', '') || language.name || 'Unknown';
                              return (
                                <option key={language.code || index} value={languageName}>
                                  {languageName}
                                </option>
                              );
                            })}

                          </select>
                        </div>
                      </>
                    )}

                    {volunteerApiData?.attributes.time_available && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-muted-foreground mb-3">
                          Time available to commit?
                        </label>
                        <div className="flex gap-6">
                          {volunteerApiData.attributes.time_available.map((option: string) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name="timeCommitment"
                                value={option}
                                checked={formData.timeCommitment === option}
                                onChange={handleInputChange}
                                className="mr-2 h-4 w-4 accent-primary-PARI-Red focus:ring-2 focus:ring-primary-PARI-Red border-gray-300 dark:border-border"
                              />
                              <span className="text-sm text-gray-900 dark:text-muted-foreground">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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

                {/* Success/Error Messages */}
                {isSuccess && (
                  <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200">
                    Thank you for volunteering! We&apos;ll get back to you soon.
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingToBrevo || !formData.agreeToTerms}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !formData.agreeToTerms
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/90'
                  }`}
                >
                  {isSubmittingToBrevo ? 'Submitting...' : 'Submit Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VolunteerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VolunteerPageContent />
    </Suspense>
  );
};

export default VolunteerPage;