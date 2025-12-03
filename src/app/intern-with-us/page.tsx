'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useEZForm } from '@/hooks/useEZForm';
import { FormErrorMessage, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { useInternBrevo } from '@/hooks/useBrevo';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
import { useLocale } from '@/lib/locale';

// API response interface for internship page data
interface InternshipPageData {
  id: number;
  attributes: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    college_name: string;
    course: string;
    degree: string | null;
    degree_options: string[] | null;
    start_date: string | null;
    end_date: string | null;
    country: string;
    states: string;
    district: string;
    contributions: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
  };
}

// Interface for internship application submission
interface InternshipApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  collegeName: string | null;
  course: string | null;
  degreeType?: string | null;
  startDate: string | null;
  endDate: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  contributionType: string | null;
  statementOfPurpose: number | null;
  cvResume: number | null;
  writingSamples: number | null;
}

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

// Types for pages API response
interface ModularContentItem {
  id: number;
  __component: string;
  Paragraph?: string;
  Align_content?: string | null;
}

interface InternPageData {
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

interface InternPageResponse {
  data: InternPageData;
  meta: Record<string, unknown>;
}

const InternContent = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Locale hook for language functionality
  const { language: currentLocale } = useLocale();

  console.log('##Rohit_Rocks## InternPage component rendered with locale:', currentLocale);
  console.log('##Rohit_Rocks## Component is rendering, about to set up effects...');

  // Simple test useEffect
  useEffect(() => {
    console.log('##Rohit_Rocks## SIMPLE useEffect fired!');
  });

  // Page content data states
  const [pageData, setPageData] = useState<InternPageData | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // API data states
  const [internshipPageData, setInternshipPageData] = useState<InternshipPageData | null>(null);
  const [contributionOptions, setContributionOptions] = useState<string[]>([]);
  const [degreeOptions, setDegreeOptions] = useState<string[]>([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [contributionValidationError, setContributionValidationError] = useState<boolean>(false);

  // Validation errors state for each field
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    collegeName: '',
    course: '',
    startDate: '',
    endDate: ''
  });

  // Helper function to convert API contribution labels to internal values
  const getContributionValue = (label: string): string => {
    const mapping: { [key: string]: string } = {
      'Report and write a story': 'report-story',
      'Write and research with Library': 'library-research',
      'Contribute to FACES': 'faces',
      'Social media': 'social-media',
      'Make a film/video': 'film-video',
      'Translations': 'translations'
    };
    return mapping[label] || label.toLowerCase().replace(/\s+/g, '-');
  };

  // Text direction helper function for RTL languages
  const getTextDirection = (locale: string) => {
    return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
  };

  const textDirection = getTextDirection(currentLocale);

  // Location data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Brevo integration for intern applications
  const { submitApplication: submitToBrevo } = useInternBrevo();

  // EZForms hook for handling form submission
  const { isSubmitting, isSuccess, error, submitForm } = useEZForm({
    formName: 'Internship Application',
    requiredFields: ['firstName', 'lastName', 'email', 'phone', 'collegeName', 'course', 'startDate', 'endDate', 'agreeToTerms'],
    onSuccess: async () => {
      console.log('##Rohit_Rocks## Form submission successful! Processing success actions...');

      // Submit to Brevo for email automation
      try {
        const phoneValue = formData.phone?.trim() || undefined;
        console.log('##Rohit_Rocks## Brevo submission data:', {
          email: formData.email,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: phoneValue,
          phoneType: typeof phoneValue,
          originalPhone: formData.phone,
          collegeName: formData.collegeName?.trim() || undefined,
          course: formData.course?.trim() || undefined
        });

        await submitToBrevo(
          formData.email,
          `${formData.firstName} ${formData.lastName}`.trim(),
          phoneValue,
          formData.collegeName?.trim() || undefined,
          formData.course?.trim() || undefined
        );
        console.log('##Rohit_Rocks## Brevo email automation successful');
      } catch (error) {
        console.error('##Rohit_Rocks## Brevo submission error:', error);
      }

      // Reset form and go back to step 1 on success
      console.log('##Rohit_Rocks## Resetting form and returning to step 1');
      setCurrentStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        collegeName: '',
        course: '',
        degree: '',
        startDate: '',
        endDate: '',
        country: '',
        state: '',
        district: '',
        contributions: [],
        statementOfPurpose: null,
        cvResume: null,
        writingSamples: null,
        agreeToTerms: true
      });

      // Clear location data to force fresh fetch
      setCountries([]);
      setStates([]);
      setDistricts([]);

      // Reset submission message state
      setShowSubmissionMessage(false);

      // Reset date validation error
      setDateValidationError('');

      // Reset auto-calculation flag
      setIsEndDateAutoCalculated(false);

      console.log('##Rohit_Rocks## Form reset completed successfully!');
    }
  });

  // State for showing submission message
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(false);

  // State for date validation errors
  const [dateValidationError, setDateValidationError] = useState<string>('');

  // State to track if end date was auto-calculated
  const [isEndDateAutoCalculated, setIsEndDateAutoCalculated] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    collegeName: '',
    course: '',
    degree: '',

    // Step 2 - Internship Details
    startDate: '',
    endDate: '',
    country: '',
    state: '',
    district: '',
    contributions: [] as string[],

    // Step 3 - Upload Documents
    statementOfPurpose: null as File | null,
    cvResume: null as File | null,
    writingSamples: null as File | null,

    // Terms of Service Agreement
    agreeToTerms: true
  });

  // Fetch countries from multiple APIs
  const fetchCountries = useCallback(async () => {
    // Helper function to sort countries with India at the top
    const sortCountriesWithIndiaFirst = (countries: Country[]): Country[] => {
      return countries.sort((a: Country, b: Country) => {
        // Put India at the top
        if (a.name.toLowerCase() === 'india') return -1;
        if (b.name.toLowerCase() === 'india') return 1;
        // Sort the rest alphabetically
        return a.name.localeCompare(b.name);
      });
    };
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
            }));

          setCountries(sortCountriesWithIndiaFirst(countryData));
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
            }));

          setCountries(sortCountriesWithIndiaFirst(countryData));
          return;
        }
      } catch (error) {
        console.error('CountryStateCity API failed:', error);
      }

      // Tertiary API: GeoDB API
      try {
        const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/countries', {
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'your-rapidapi-key-here',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
          },
          params: {
            limit: 250
          }
        });

        if (response.data?.data && response.data.data.length > 0) {
          const countryData = response.data.data
            .map((country: { code: string, name: string }) => ({
              id: country.code,
              name: country.name,
              iso2: country.code
            }));

          setCountries(sortCountriesWithIndiaFirst(countryData));
          return;
        }
      } catch (error) {
        console.error('GeoDB API failed:', error);
      }

      setCountries([]);
    } catch (error) {
      console.error('Error in fetchCountries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

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

      // Secondary API: GeoDB API (RapidAPI)
      try {
        const response = await axios.get(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode}/regions`, {
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'your-rapidapi-key-here',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
          }
        });

        if (response.data?.data && response.data.data.length > 0) {
          const regionData = response.data.data.map((region: { id: number, name: string, isoCode: string }, index: number) => ({
            id: region.id || index + 1,
            name: region.name,
            iso2: region.isoCode || region.name.substring(0, 2).toUpperCase()
          })).sort((a: State, b: State) => a.name.localeCompare(b.name));

          setStates(regionData);
          return;
        }
      } catch (error) {
        console.error('GeoDB API failed:', error);
      }

      // Tertiary API: REST Countries subdivisions
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,subdivisions`);

        if (response.data?.subdivisions) {
          const subdivisions = Object.entries(response.data.subdivisions).map(([code, name], index) => ({
            id: index + 1,
            name: name as string,
            iso2: code
          })).sort((a: State, b: State) => a.name.localeCompare(b.name));

          setStates(subdivisions);
          return;
        }
      } catch (error) {
        console.error('REST Countries API failed:', error);
      }

      // Quaternary API: OpenStreetMap Nominatim API
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
      } catch (error) {
        console.error('Nominatim API failed:', error);
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
      } catch (error) {
        console.error('GeoNames API failed:', error);
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

      // Secondary API: GeoDB API for cities
      if (countryCode && stateCode) {
        try {
          const response = await axios.get(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode}/regions/${stateCode}/cities`, {
            headers: {
              'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'your-rapidapi-key-here',
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            },
            params: {
              limit: 50
            }
          });

          if (response.data?.data && response.data.data.length > 0) {
            const cityData = response.data.data.map((city: { id: number, name: string }, index: number) => ({
              id: city.id || index + 1,
              name: city.name
            })).sort((a: District, b: District) => a.name.localeCompare(b.name));

            setDistricts(cityData);
            return;
          }
        } catch (error) {
          console.error('GeoDB API failed for cities:', error);
        }
      }

      // Tertiary API: Nominatim API for cities in the state
      try {

        const selectedState = states.find(state => state.iso2 === stateCode);
        const stateName = selectedState?.name;

        if (stateName) {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
              state: stateName,
              country: countryCode,
              format: 'json',
              addressdetails: 1,
              limit: 50,
              'accept-language': 'en'
            }
          });

          if (response.data && response.data.length > 0) {
            // Extract unique cities from the results
            const citySet = new Set<string>();
            response.data.forEach((item: { address?: { city?: string, town?: string, village?: string } }) => {
              if (item.address?.city) {
                citySet.add(item.address.city);
              } else if (item.address?.town) {
                citySet.add(item.address.town);
              } else if (item.address?.village) {
                citySet.add(item.address.village);
              }
            });

            if (citySet.size > 0) {
              const nominatimCities = Array.from(citySet).map((name, index) => ({
                id: index + 1,
                name: name
              })).sort((a: District, b: District) => a.name.localeCompare(b.name));


              setDistricts(nominatimCities);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Nominatim API failed for cities:', error);
      }

      // Quaternary API: GeoNames API for cities
      try {

        const selectedState = states.find(state => state.iso2 === stateCode);

        if (selectedState && selectedState.id) {
          const response = await axios.get(`http://api.geonames.org/childrenJSON`, {
            params: {
              geonameId: selectedState.id,
              username: 'demo',
              maxRows: 50
            }
          });

          if (response.data?.geonames && response.data.geonames.length > 0) {
            const geonamesCities = response.data.geonames
              .filter((item: { fclName?: string }) => item.fclName?.includes('city') || item.fclName?.includes('populated place'))
              .map((item: { geonameId?: number, name: string }, index: number) => ({
                id: item.geonameId || index + 1,
                name: item.name
              }))
              .sort((a: District, b: District) => a.name.localeCompare(b.name));

            if (geonamesCities.length > 0) {

              setDistricts(geonamesCities);
              return;
            }
          }
        }
      } catch (error) {
        console.error('GeoNames API failed for cities:', error);
      }

      setDistricts([]);
    } catch (error) {
      console.error('Error in fetchDistricts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch degree enumeration data from content-type schema
  const fetchDegreeEnumeration = useCallback(async () => {
    try {
      const response = await fetch('https://merge.ruralindiaonline.org/v1/api/content-type-builder/content-types', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Find the internship content type and extract degree enumeration
      const internshipContentType = data.data?.find((contentType: { uid: string; schema?: { attributes?: { degreeType?: { enum?: string[] } } } }) =>
        contentType.uid === 'api::internship.internship'
      );

      if (internshipContentType?.schema?.attributes?.degreeType?.enum) {
        const degreeEnums = internshipContentType.schema.attributes.degreeType.enum;
        setDegreeOptions(degreeEnums);
        console.log('##Rohit_Rocks## Degree enumeration loaded from schema:', degreeEnums);
        return degreeEnums;
      } else {
        console.log('##Rohit_Rocks## No degree enumeration found in schema');
        setDegreeOptions([]);
        return null;
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching degree enumeration:', error);
      setDegreeOptions([]);
      return null;
    }
  }, []);

  // Fetch internship page data from API
  const fetchInternshipPageData = useCallback(async () => {
    try {
      setIsLoadingContributions(true);
      setContributionError(null);

      const response = await fetch('https://merge.ruralindiaonline.org/v1/api/internship-page?populate=*', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // If 404, the content type doesn't exist - use fallback data gracefully
      if (response.status === 404) {
        console.log('##Rohit_Rocks## internship-page content type not found (404), using fallback data');
        setContributionError(null);
        setIsLoadingContributions(false);
        // Try to fetch degree enumeration from content-type schema
        await fetchDegreeEnumeration();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        setInternshipPageData(data.data);

        // Extract contributions options from API
        if (data.data.attributes && data.data.attributes.contributions) {
          setContributionOptions(data.data.attributes.contributions);
          setIsLoadingContributions(false);
          console.log('##Rohit_Rocks## Contribution options loaded from Strapi:', data.data.attributes.contributions);
        } else {
          setContributionError('No contribution options found in Strapi response');
          setIsLoadingContributions(false);
          console.log('##Rohit_Rocks## No contributions found in Strapi API response:', data.data.attributes);
        }

        // Extract degree options from API
        if (data.data.attributes && data.data.attributes.degree_options) {
          setDegreeOptions(data.data.attributes.degree_options);
          console.log('##Rohit_Rocks## Degree options loaded from Strapi:', data.data.attributes.degree_options);
        } else {
          // Try to fetch degree enumeration from content-type schema
          await fetchDegreeEnumeration();
        }

        console.log('##Rohit_Rocks## Internship page data loaded successfully from Strapi');
      } else {
        throw new Error('Invalid response structure from Strapi API');
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching internship page data from Strapi:', error);
      setContributionError('Failed to load contribution options from Strapi');

      // Fallback: try with axios
      try {
        const axiosResponse = await axios.get('https://merge.ruralindiaonline.org/v1/api/internship-page?populate=*');

        if (axiosResponse.data && axiosResponse.data.data) {
          setInternshipPageData(axiosResponse.data.data);

          // Extract contributions options from API (axios fallback)
          if (axiosResponse.data.data.attributes && axiosResponse.data.data.attributes.contributions) {
            setContributionOptions(axiosResponse.data.data.attributes.contributions);
            setIsLoadingContributions(false);
            setContributionError(null);
            console.log('##Rohit_Rocks## Contribution options loaded from Strapi via axios:', axiosResponse.data.data.attributes.contributions);
          } else {
            setContributionError('No contribution options found in Strapi response (axios fallback)');
            setIsLoadingContributions(false);
          }

          // Extract degree options from API (axios fallback)
          if (axiosResponse.data.data.attributes && axiosResponse.data.data.attributes.degree_options) {
            setDegreeOptions(axiosResponse.data.data.attributes.degree_options);
            console.log('##Rohit_Rocks## Degree options loaded from Strapi via axios:', axiosResponse.data.data.attributes.degree_options);
          } else {
            // Try to fetch degree enumeration from content-type schema
            await fetchDegreeEnumeration();
          }

          console.log('##Rohit_Rocks## Internship page data loaded from Strapi via axios fallback');
        } else {
          throw new Error('Invalid response structure from Strapi API (axios fallback)');
        }
      } catch (axiosError) {
        console.error('##Rohit_Rocks## Both Strapi fetch methods failed:', axiosError);

        // Check if axios error is also 404
        if (axios.isAxiosError(axiosError) && axiosError.response?.status === 404) {
          console.log('##Rohit_Rocks## Axios also returned 404, using fallback data');
          setContributionError(null);
          setIsLoadingContributions(false);
          // Try to fetch degree enumeration from content-type schema
          await fetchDegreeEnumeration();
        } else {
          setContributionError('Failed to load contribution options from Strapi API');
          setIsLoadingContributions(false);
        }
      }
    }
  }, [fetchDegreeEnumeration]);

  // Fetch intern page data from pages API with locale support
  const fetchInternPageData = useCallback(async () => {
    console.log('##Rohit_Rocks## fetchInternPageData function called!');
    console.log('##Rohit_Rocks## Current locale in fetchInternPageData:', currentLocale);
    try {
      setIsLoadingPageData(true);
      setPageError(null);

      console.log('##Rohit_Rocks## Fetching intern page data for locale:', currentLocale);

      // First, fetch all pages and find "Intern" by title
      const listResponse = await axios.get<{ data: InternPageData[]; meta: Record<string, unknown> }>(
        `https://merge.ruralindiaonline.org/v1/api/pages?filters[Title][$eq]=Intern&populate=deep,3&locale=en`
      );

      if (!listResponse.data.data || listResponse.data.data.length === 0) {
        throw new Error('Intern page not found');
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
            const localeResponse = await axios.get<InternPageResponse>(
              `https://merge.ruralindiaonline.org/v1/api/pages/${localization.id}?populate=deep,3`
            );
            console.log('##Rohit_Rocks## Localized content:', {
              Title: localeResponse.data.data.attributes.Title,
              Strap: localeResponse.data.data.attributes.Strap,
              locale: localeResponse.data.data.attributes.locale
            });
            setPageData(localeResponse.data.data);
          } catch (localeError) {
            console.error('##Rohit_Rocks## Error fetching localized content:', localeError);
            // Fallback to English if localized content fails to load
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
      console.error('##Rohit_Rocks## Error fetching intern page data:', error);
      setPageError('Failed to load page content');
    } finally {
      setIsLoadingPageData(false);
    }
  }, [currentLocale]);

  // Load intern page data when locale changes
  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect for fetchInternPageData triggered with locale:', currentLocale);
    fetchInternPageData();
  }, [fetchInternPageData, currentLocale]);

  // Test useEffect to see if it fires
  console.log('##Rohit_Rocks## About to set up test useEffect...');
  useEffect(() => {
    console.log('##Rohit_Rocks## TEST useEffect fired!');
  }, []);

  // Load countries and internship page data on component mount
  console.log('##Rohit_Rocks## About to set up mount useEffect...');
  useEffect(() => {
    console.log('##Rohit_Rocks## Component mounted, fetching data...');
    console.log('##Rohit_Rocks## About to call fetchCountries...');
    fetchCountries();
    console.log('##Rohit_Rocks## About to call fetchInternshipPageData...');
    fetchInternshipPageData();
    console.log('##Rohit_Rocks## About to call fetchInternPageData...');
    fetchInternPageData();
    console.log('##Rohit_Rocks## All fetch functions called in mount useEffect');
  }, [fetchCountries, fetchInternshipPageData, fetchInternPageData]);

  // Debug log for contribution options
  useEffect(() => {
    console.log('##Rohit_Rocks## Contribution options updated:', contributionOptions);
  }, [contributionOptions]);

  // Debug log for degree options
  useEffect(() => {
    console.log('##Rohit_Rocks## Degree options updated:', degreeOptions);
  }, [degreeOptions]);

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

  // Helper function to check if India is selected
  const isIndiaSelected = () => {
    const selectedCountry = countries.find(c => c.iso2 === formData.country);
    return selectedCountry?.name.toLowerCase() === 'india' || formData.country === 'IN';
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to calculate date 60 days from start date
  const calculateEndDate = (startDate: string): string => {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 60); // Add 60 days

    // Format as YYYY-MM-DD for input[type="date"]
    return end.toISOString().split('T')[0];
  };

  // Helper function to validate date range (minimum 60 days, no past dates)
  const validateDateRange = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) {
      return '';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Check if start date is in the past
    if (start < today) {
      return 'Start date cannot be in the past. Please select today or a future date.';
    }

    // Check if end date is in the past
    if (end < today) {
      return 'End date cannot be in the past. Please select today or a future date.';
    }

    // Check if end date is after start date
    if (end <= start) {
      return 'End date must be after start date';
    }

    // Calculate the difference in days
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 60) {
      return 'Internship minimum period is 60 days (2 months). Please select dates with at least 60 days duration.';
    }

    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

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
    } else if (name === 'startDate' || name === 'endDate') {
      // Handle date changes with validation
      if (name === 'startDate') {
        // Check if start date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);

        if (selectedDate < today) {
          setDateValidationError('Start date cannot be in the past. Please select today or a future date.');
          setFormData(prev => ({
            ...prev,
            startDate: value,
            endDate: '' // Clear end date if start date is invalid
          }));
          setIsEndDateAutoCalculated(false);
          return;
        }

        // Automatically calculate end date (60 days from start date)
        const autoEndDate = calculateEndDate(value);

        setFormData(prev => ({
          ...prev,
          startDate: value,
          endDate: autoEndDate // Automatically set end date
        }));

        // Mark end date as auto-calculated
        setIsEndDateAutoCalculated(true);

        // Validate with the auto-calculated end date
        const validationError = validateDateRange(value, autoEndDate);
        setDateValidationError(validationError);
      } else if (name === 'endDate') {
        // User manually changed end date
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));

        // Mark end date as manually set
        setIsEndDateAutoCalculated(false);

        // Validate with user-selected end date
        const validationError = validateDateRange(formData.startDate, value);
        setDateValidationError(validationError);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (value: string) => {
    // Clear validation error when user interacts with checkboxes
    setContributionValidationError(false);

    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.includes(value)
        ? prev.contributions.filter(item => item !== value)
        : [...prev.contributions, value]
    }));
  };



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleNextSection = () => {
    // Clear previous validation errors
    setValidationErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      collegeName: '',
      course: '',
      startDate: '',
      endDate: ''
    });

    // Step 1 validation - Personal Info (only name, email, phone are mandatory)
    if (currentStep === 1) {
      const errors = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        collegeName: '',
        course: '',
        startDate: '',
        endDate: ''
      };

      // Validate required fields - show only ONE error at a time
      if (!formData.firstName || formData.firstName.trim() === '') {
        errors.firstName = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }
      if (!formData.lastName || formData.lastName.trim() === '') {
        errors.lastName = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }
      if (!formData.email || formData.email.trim() === '') {
        errors.email = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
        setValidationErrors(errors);
        return;
      }
      if (!formData.phone || formData.phone.trim() === '') {
        errors.phone = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }
    }

    // Step 2 validation - Internship Details
    if (currentStep === 2) {
      const errors = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        collegeName: '',
        course: '',
        startDate: '',
        endDate: ''
      };

      // Check for date validation errors before proceeding to next step
      if (dateValidationError) {
        // Don't proceed if there's a date validation error
        return;
      }

      // Validate required date fields - show only ONE error at a time
      if (!formData.startDate || formData.startDate.trim() === '') {
        errors.startDate = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }
      if (!formData.endDate || formData.endDate.trim() === '') {
        errors.endDate = 'Please fill in this field.';
        setValidationErrors(errors);
        return;
      }

      // Validate contributions
      if (!formData.contributions || formData.contributions.length === 0) {
        setContributionValidationError(true);
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Upload file to API
  const uploadFile = async (file: File): Promise<number> => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      console.log('##Rohit_Rocks## Uploading file:', file.name);

      const response = await fetch('https://merge.ruralindiaonline.org/v1/api/upload', {
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

  // Submit internship application to API
  const submitToInternshipAPI = async (applicationData: InternshipApplicationData) => {
    try {
      console.log('##Rohit_Rocks## Submitting to internship API:', applicationData);

      const response = await fetch('https://merge.ruralindiaonline.org/v1/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: applicationData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to submit application'}`);
      }

      const result = await response.json();
      console.log('##Rohit_Rocks## Internship API submission successful:', result);
      return result;
    } catch (error) {
      console.error('##Rohit_Rocks## Internship API submission failed:', error);
      throw error;
    }
  };

  const handleSubmitApplication = async () => {
    try {
      // Show submission message immediately
      setShowSubmissionMessage(true);

      // Validate required fields before submission
      if (!formData.email || formData.email.trim() === '') {
        setShowSubmissionMessage(false);
        throw new Error('Email is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setShowSubmissionMessage(false);
        throw new Error('Please enter a valid email address');
      }

      if (!formData.firstName || formData.firstName.trim() === '') {
        setShowSubmissionMessage(false);
        throw new Error('First name is required');
      }
      if (!formData.lastName || formData.lastName.trim() === '') {
        setShowSubmissionMessage(false);
        throw new Error('Last name is required');
      }

      // Validate contributions field
      if (!formData.contributions || formData.contributions.length === 0) {
        setShowSubmissionMessage(false);
        setContributionValidationError(true);
        throw new Error('Please select at least one contribution area');
      }

      // Clear contribution validation error if validation passes
      setContributionValidationError(false);

      // Validate date range before submission
      if (dateValidationError) {
        setShowSubmissionMessage(false);
        throw new Error(dateValidationError);
      }

      // Validate terms of service agreement
      if (!formData.agreeToTerms) {
        setShowSubmissionMessage(false);
        throw new Error('You must agree to PARI\'s terms of service to submit the application');
      }

      console.log('##Rohit_Rocks## Form validation passed, proceeding with submission');
      console.log('##Rohit_Rocks## Form data before submission:', {
        email: formData.email,
        emailLength: formData.email.length,
        emailTrimmed: formData.email.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Upload files first and get their IDs
      let statementOfPurposeId = null;
      let cvResumeId = null;
      let writingSamplesId = null;

      if (formData.statementOfPurpose) {
        statementOfPurposeId = await uploadFile(formData.statementOfPurpose);
      }

      if (formData.cvResume) {
        cvResumeId = await uploadFile(formData.cvResume);
      }

      if (formData.writingSamples) {
        writingSamplesId = await uploadFile(formData.writingSamples);
      }

      // Get actual names for country, state, district instead of codes
      const selectedCountry = countries.find(country => country.iso2 === formData.country);
      const selectedState = states.find(state => state.iso2 === formData.state);
      const selectedDistrict = districts.find(district => district.name === formData.district);

      // Prepare data for internship API
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        collegeName: formData.collegeName?.trim() || null,
        course: formData.course?.trim() || null,
        // degreeType: removed to avoid API validation error
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        country: selectedCountry?.name || null,
        state: selectedState?.name || null,
        district: selectedDistrict?.name || null,
        contributionType: formData.contributions.length > 0 ? formData.contributions.join(', ') : null,
        // Add file IDs
        statementOfPurpose: statementOfPurposeId,
        cvResume: cvResumeId,
        writingSamples: writingSamplesId
      };

      // Submit to internship API first
      await submitToInternshipAPI(apiData);

      // Prepare form data for EZForms submission (for compatibility)
      const submissionData = {
        ...formData,
        // Add full name for compatibility
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        // Convert file objects to file names for now
        // In a real implementation, you'd upload files separately
        statementOfPurpose: formData.statementOfPurpose?.name || null,
        cvResume: formData.cvResume?.name || null,
        writingSamples: formData.writingSamples?.name || null,
        contributions: formData.contributions.join(', '),
        // Include terms agreement
        agreeToTerms: formData.agreeToTerms
      };

      // Submit to EZForms for additional processing
      await submitForm(submissionData);

      // Log successful submission
      console.log('##Rohit_Rocks## Application submitted successfully!');
      console.log('##Rohit_Rocks## Submitted data:', apiData);

      // Hide submission message on success (success message will show instead)
      setShowSubmissionMessage(false);

    } catch (error) {
      console.error('##Rohit_Rocks## Application submission failed:', error);
      // Hide submission message on error
      setShowSubmissionMessage(false);
      // The error will be handled by the EZForm error state
      throw error;
    }
  };



  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4" dir={textDirection}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-40 gap-8 items-start">
          {/* Left Content Section */}
          <div className="md:px-8">
            {isLoadingPageData ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-6"></div>
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : pageError ? (
              <div className="text-red-600">
                <p className="text-muted-foreground">{pageError}</p>
              </div>
            ) : pageData ? (
              <>
                {/* Language Indicator */}
                

                <h1 className="text-4xl font-bold text-foreground mb-6">
                  {pageData.attributes.Title}
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  {pageData.attributes.Strap}
                </p>

                <div className="space-y-6 text-muted-foreground">
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
          <div className="bg-popover dark:bg-popover p-8 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">
                {currentStep === 1 && 'Internship form'}
                {currentStep === 2 && 'Internship form'}
                {currentStep === 3 && 'Profile form'}
              </h2>
              <div className="flex items-center space-x-3">
               
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform " viewBox="0 0 36 36">
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
                    <span className="text-xs font-medium text-muted-foreground">{currentStep}/3</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">
              Help us best assess your skills for PARI
            </p>

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    PERSONAL INFO
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          placeholder={internshipPageData?.attributes?.first_name || "First Name"}
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                            validationErrors.firstName ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                          }`}
                        />
                        {validationErrors.firstName && (
                          <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                            <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                              <span className="text-white text-sm font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.firstName}</span>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          placeholder={internshipPageData?.attributes?.last_name || "Last Name"}
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                            validationErrors.lastName ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                          }`}
                        />
                        {validationErrors.lastName && (
                          <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                            <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                              <span className="text-white text-sm font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.lastName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder={internshipPageData?.attributes?.email || "Email"}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                            validationErrors.email ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                          }`}
                        />
                        {validationErrors.email && (
                          <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                            <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                              <span className="text-white text-sm font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          placeholder={internshipPageData?.attributes?.phone || "Phone"}
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                            validationErrors.phone ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                          }`}
                        />
                        {validationErrors.phone && (
                          <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                            <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                              <span className="text-white text-sm font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="collegeName"
                        placeholder={internshipPageData?.attributes?.college_name || "College/University Name"}
                        value={formData.collegeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="course"
                        placeholder={internshipPageData?.attributes?.course || "Course"}
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                      <input
                        type="text"
                        name="degree"
                        placeholder="Degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextSection}
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-full font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Next Section
                </button>
              </div>
            )}

            {/* Step 2: Internship Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    INTERNSHIP DETAILS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Proposed Dates of internship (minimum period is 60 days)*
                        <br />
                        <span className="text-xs text-muted-foreground/80">
                          End date will be automatically set to 60 days from start date, but you can change it if needed. Past dates are not allowed.
                        </span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="date"
                            name="startDate"
                            placeholder={internshipPageData?.attributes?.start_date || "Start date"}
                            value={formData.startDate}
                            onChange={handleInputChange}
                            min={getTodayDate()}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                              dateValidationError || validationErrors.startDate ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                            }`}
                          />
                          {validationErrors.startDate && (
                            <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                              <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                                <span className="text-white text-sm font-bold">!</span>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.startDate}</span>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            name="endDate"
                            placeholder={internshipPageData?.attributes?.end_date || "End date"}
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.startDate || getTodayDate()}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red outline-none bg-background ${
                              dateValidationError || validationErrors.endDate ? 'border-primary-PARI-Red border-2' : 'border-input focus:border-primary-PARI-Red'
                            }`}
                          />
                          {validationErrors.endDate && (
                            <div className="absolute left-0 top-full mt-1 flex items-center gap-2 bg-white dark:bg-popover px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-border z-10">
                              <div className="flex items-center justify-center w-5 h-5 bg-orange-500 rounded-sm flex-shrink-0">
                                <span className="text-white text-sm font-bold">!</span>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-foreground">{validationErrors.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {dateValidationError && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800">
                          {dateValidationError}
                        </div>
                      )}
                      {isEndDateAutoCalculated && formData.endDate && !dateValidationError && (
                        <div className="mt-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-2 rounded-lg border border-green-200 dark:border-green-800 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          End date automatically set to 60 days from start date. You can change it if needed.
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Where will you be located during the internship?
                      </p>
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
                            {loadingCountries ? 'Loading countries...' : 'Country'}
                          </option>
                          {countries.map((country) => (
                            <option key={country.id} value={country.iso2}>
                              {country.name}
                            </option>
                          ))}
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
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </div>

                    <div>
                      <p className={`text-sm font-medium mb-3 ${contributionValidationError ? 'text-primary-PARI-Red' : 'text-gray-600 dark:text-muted-foreground'}`}>
                        {internshipPageData?.attributes?.contributions || "How would you like to contribute to PARI?"} <span className="text-primary-PARI-Red">*</span>
                      </p>
                      {contributionValidationError && (
                        <p className="text-sm text-primary-PARI-Red mb-2">Please select at least one contribution area</p>
                      )}

                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${contributionValidationError ? 'p-3 border-2 border-primary-PARI-Red rounded-lg bg-red-50 dark:bg-red-900/10' : ''}`}>
                        {isLoadingContributions ? (
                          // Loading state while fetching contribution options from Strapi
                          <div className="col-span-2 flex items-center justify-center py-8">
                            <div className="animate-pulse flex items-center space-x-2">
                              <div className="w-4 h-4 bg-primary-PARI-Red/20 rounded animate-pulse"></div>
                              <span className="text-sm text-muted-foreground">Loading contribution options from Strapi...</span>
                            </div>
                          </div>
                        ) : contributionError ? (
                          // Error state when Strapi API fails
                          <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                            <div className="text-red-500 mb-2">
                              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-sm text-red-600 mb-2">{contributionError}</p>
                            <button
                              onClick={() => {
                                setContributionError(null);
                                fetchInternshipPageData();
                              }}
                              className="text-xs text-primary-PARI-Red hover:underline"
                            >
                              Retry loading from Strapi
                            </button>
                          </div>
                        ) : (
                          // Render contribution options from Strapi or use fallback defaults
                          (() => {
                            const options = contributionOptions.length > 0
                              ? contributionOptions
                              : [
                                  'Report and write a story',
                                  'Social media',
                                  'Write and research with Library',
                                  'Make a film/video',
                                  'Contribute to FACES',
                                  'Translations'
                                ];

                            return (
                              <>
                                <div className="space-y-3">
                                  {options.slice(0, Math.ceil(options.length / 2)).map((contribution) => {
                                    const value = getContributionValue(contribution);
                                    return (
                                      <label key={value} className="flex items-center space-x-3">
                                        <input
                                          type="checkbox"
                                          checked={formData.contributions.includes(value)}
                                          onChange={() => handleCheckboxChange(value)}
                                          className="w-4 h-4 accent-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-muted-foreground">{contribution}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                <div className="space-y-3">
                                  {options.slice(Math.ceil(options.length / 2)).map((contribution) => {
                                    const value = getContributionValue(contribution);
                                    return (
                                      <label key={value} className="flex items-center space-x-3">
                                        <input
                                          type="checkbox"
                                          checked={formData.contributions.includes(value)}
                                          onChange={() => handleCheckboxChange(value)}
                                          className="w-4 h-4 accent-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-muted-foreground">{contribution}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextSection}
                  disabled={dateValidationError !== ''}
                  className={`w-full py-3 px-6 rounded-full font-medium transition-colors duration-200 ${
                    dateValidationError
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/90'
                  }`}
                >
                  Next section
                </button>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    UPLOAD DOCUMENTS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload a statement of purpose indicating why you wish to intern with PARI, and how you would like to contribute. (300-500 words)
                      </p>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="statement"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'statementOfPurpose')}
                          className="hidden"
                        />
                        <label htmlFor="statement" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload a statement of purpose (300-500 words)</span>
                          </div>
                        </label>
                        {formData.statementOfPurpose && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.statementOfPurpose.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="cv"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'cvResume')}
                          className="hidden"
                        />
                        <label htmlFor="cv" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload your CV / Resume here*</span>
                          </div>
                        </label>
                        {formData.cvResume && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.cvResume.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="writing"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'writingSamples')}
                          className="hidden"
                        />
                        <label htmlFor="writing" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload writing samples (published or unpublished)*</span>
                          </div>
                        </label>
                        {formData.writingSamples && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.writingSamples.name}
                          </p>
                        )}
                      </div>
                    </div>
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

                {/* Submission Message */}
                {showSubmissionMessage && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-blue-800">
                          Submitting Your Application...
                        </h3>
                        <p className="text-blue-700 mt-1">
                          Please wait while we process your internship application. This may take a few moments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {isSuccess && !showSubmissionMessage && (
                  <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-green-800">
                          Application Submitted Successfully!
                        </h3>
                      </div>
                    </div>
                    <div className="text-green-700">
                      <p className="mb-2">
                        <strong>Thank you for applying for an internship with PARI!</strong>
                      </p>
                      <p className="mb-2">
                        Your application has been successfully submitted and received. Here&apos;s what happens next:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Our team will review your application within 5-7 business days</li>
                        <li>You&apos;ll receive a confirmation email shortly</li>
                        <li>We&apos;ll contact you if we need any additional information</li>
                        <li>Selected candidates will be notified via email for the next steps</li>
                      </ul>
                      <p className="mt-3 text-sm">
                        If you have any questions, please contact us at <strong>internships@ruralindiaonline.org</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <FormErrorMessage
                    error={error}
                    className="mb-4"
                  />
                )}

                <button
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || !formData.agreeToTerms}
                  className={`w-full py-3 px-6 rounded-full font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                    !formData.agreeToTerms
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/90'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FormLoadingSpinner className="mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Language Toggle */}
      <LanguageToggle />
    </div>
  );
};

const InternPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <InternContent />
    </Suspense>
  );
};

export default InternPage;
