'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import axios from 'axios';
import { useNewsletterSubscription } from '@/hooks/useBrevo';
import { BASE_URL } from '@/config';
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

interface NewsletterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  district: string;
  language: string;
  agreeToTerms: boolean;
}

interface NewsletterApiData {
  attributes: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    state?: string;
    district?: string;
    language?: string;
    title?: string;
    description?: string;
    buttonText?: string;
  };
}

interface NewsletterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const NewsletterBottomSheet: React.FC<NewsletterBottomSheetProps> = ({
  isOpen,
  onClose,
  title = "Sign up for our newsletter"
}) => {
  const { subscribe, isLoading: isSubscribing, isSuccess, error: subscribeError, reset } = useNewsletterSubscription();
  const [mounted, setMounted] = useState(false);

  // Location data state
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Newsletter API data state
  const [newsletterData, setNewsletterData] = useState<NewsletterApiData | null>(null);

  // Form data state
  const [formData, setFormData] = useState<NewsletterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    district: '',
    language: '',
    agreeToTerms: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      const response = await axios.get('https://api.countrystatecity.in/v1/countries', {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      });

      // Filter to only India
      const indiaOnly = response.data.filter((country: Country) =>
        country.name.toLowerCase() === 'india'
      );

      setCountries(indiaOnly);
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching countries:', error);
    }
  }, []);

  // Fetch states based on selected country
  const fetchStates = async (countryCode: string) => {
    try {
      const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      });
      setStates(response.data);
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching states:', error);
    }
  };

  // Fetch districts based on selected state
  const fetchDistricts = async (countryCode: string, stateCode: string) => {
    try {
      const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      });
      setDistricts(response.data);
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching districts:', error);
    }
  };



  // Fetch newsletter data for placeholders
  const fetchNewsletterData = useCallback(async () => {
    try {
      console.log('##Rohit_Rocks## Fetching newsletter data from API');

      // Try fetch first (like other successful API calls in the codebase)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://production.ruralindiaonline.org'}/v1/api/newsletter?populate=*`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('##Rohit_Rocks## Newsletter API Response (fetch):', data);

        if (data?.data) {
          setNewsletterData(data.data);
          console.log('##Rohit_Rocks## Newsletter Data Set:', data.data);
          return;
        } else if (data) {
          // Handle different API response structure
          setNewsletterData(data);
          console.log('##Rohit_Rocks## Newsletter Data Set (direct):', data);
          return;
        }
      } else {
        console.log('##Rohit_Rocks## Newsletter API returned status:', response.status, '- Using fallback data');
      }
    } catch {
      console.log('##Rohit_Rocks## Newsletter API not available - Using fallback placeholder values');
    }

    // Set fallback data structure (used when API is not available)
    setNewsletterData({
      attributes: {
        title: 'Sign up for our newsletter',
        description: 'Stay updated with our latest stories and insights',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        country: 'Select Country',
        state: 'Select State',
        district: 'Select District',
        language: 'Select Language',
        buttonText: 'Confirm Sign up'
      }
    });
  }, []);



  // Load initial data when sheet opens
  useEffect(() => {
    if (isOpen) {
      // Load newsletter data
      fetchNewsletterData();

      // Only load countries if not already loaded
      if (countries.length === 0) {
        fetchCountries();
      }
    }
  }, [isOpen, countries.length, fetchCountries, fetchNewsletterData]);

  // Handle country change
  useEffect(() => {
    if (formData.country) {
      // Find country code from country name
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry) {
        fetchStates(selectedCountry.iso2);
        setFormData(prev => ({ ...prev, state: '', district: '' }));
        setDistricts([]);
      }
    }
  }, [formData.country, countries]);

  // Handle state change
  useEffect(() => {
    if (formData.country && formData.state) {
      // Find country and state codes from names
      const selectedCountry = countries.find(c => c.name === formData.country);
      const selectedState = states.find(s => s.name === formData.state);
      if (selectedCountry && selectedState) {
        fetchDistricts(selectedCountry.iso2, selectedState.iso2);
        setFormData(prev => ({ ...prev, district: '' }));
      }
    }
  }, [formData.country, formData.state, countries, states]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }

    // Handle other inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.agreeToTerms) {
      return;
    }

    console.log('##Rohit_Rocks## Newsletter Bottom Sheet Form Submit:', {
      ...formData,
      timestamp: new Date().toISOString()
    });

    try {
      // First, submit to PARI newsletter API
      const newsletterPayload = {
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          country: formData.country,
          state: formData.state,
          district: formData.district,
          language: formData.language,
          subscribedAt: new Date().toISOString()
        }
      };

      console.log('##Rohit_Rocks## Submitting to PARI newsletter API:', newsletterPayload);

      // Submit to PARI newsletter API
      try {
        const apiResponse = await axios.post(`${BASE_URL}api/newsletter-submits`, newsletterPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000
        });

        console.log('##Rohit_Rocks## PARI newsletter API success:', {
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          data: apiResponse.data
        });
      } catch (apiError) {
        if (axios.isAxiosError(apiError)) {
          console.error('##Rohit_Rocks## PARI newsletter API error:', {
            message: apiError.message,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            data: apiError.response?.data,
            url: apiError.config?.url
          });
        } else {
          console.error('##Rohit_Rocks## PARI newsletter API error:', apiError);
        }
        // Continue with Brevo submission even if PARI API fails
        // Newsletter submission will still work via Brevo
      }

      // Also submit to Brevo for email automation
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const result = await subscribe(
        formData.email.trim(),
        fullName,
        formData.phone?.trim() || undefined,
        formData.country || undefined,
        formData.state || undefined,
        formData.district || undefined,
        formData.language || undefined
      );

      console.log('##Rohit_Rocks## Newsletter Bottom Sheet Result:', result);

      if (result.success) {
        // Reset form on success
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: '',
          state: '',
          district: '',
          language: '',
          agreeToTerms: true
        });

        // Close sheet after 2 seconds to show success message
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Newsletter submission error:', error);
    }
  };

  // Reset form and errors when sheet closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        district: '',
        language: '',
        agreeToTerms: true
      });
    }
  }, [isOpen, reset]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9999] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[10000] transform transition-transform duration-300 ease-out"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-popover py-3 rounded-t-3xl md:rounded-[16px] shadow-2xl md:max-w-lg w-full max-h-[95vh] overflow-hidden border border-border dark:border-borderline"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <div className="flex justify-center py-4 md:hidden">
            <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-[8px]"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-8 pb-6 pt-4">
            <div className="flex-1">
              <h1 className="font-noto-sans text-[32px] font-bold leading-[120%] tracking-[-0.02em] text-foreground text-center">
                {newsletterData?.attributes?.title || title}
              </h1>
              {newsletterData?.attributes?.description && (
                <p className="font-noto-sans text-[14px] text-muted-foreground mt-2 text-center">
                  {newsletterData.attributes.description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[8px] transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-2 max-h-[calc(90vh-120px)] overflow-y-auto">
            {isSuccess && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200 text-center">
                Successfully subscribed to newsletter! Thank you for joining us.
              </div>
            )}

            {subscribeError && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200 text-center">
                {subscribeError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder={newsletterData?.attributes?.firstName || "First*"}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    placeholder={newsletterData?.attributes?.lastName || "Last*"}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                <input
                  type="email"
                  name="email"
                  placeholder={newsletterData?.attributes?.email || "Email*"}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                <input
                  type="tel"
                  name="phone"
                  placeholder={newsletterData?.attributes?.phone || "Phone (optional)"}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px'
                    }}
                  >
                    <option value="" className="text-gray-400">{newsletterData?.attributes?.country || "Country"}</option>
                    {countries.map((country) => (
                      <option key={country.iso2} value={country.name} className="text-gray-700 dark:text-gray-200">
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    disabled={!formData.country}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px'
                    }}
                  >
                    <option value="" className="text-gray-400">{newsletterData?.attributes?.state || "State"}</option>
                    {states.map((state) => (
                      <option key={state.iso2} value={state.name} className="text-gray-700 dark:text-gray-200">
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="relative">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    disabled={!formData.state}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px'
                    }}
                  >
                    <option value="" className="text-gray-400">{newsletterData?.attributes?.district || "District"}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name} className="text-gray-700 dark:text-gray-200">
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Language Selection */}
              <div className="relative">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-10 py-3 border border-border dark:border-borderline rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm appearance-none"
                  style={{
                    fontFamily: 'Noto Sans, Noto Sans Devanagari, Noto Sans Telugu UI, Noto Sans Tamil UI, Noto Sans Bengali UI, Noto Sans Gujarati UI, Noto Sans Kannada UI, Noto Sans Malayalam UI, Noto Sans Oriya UI, Noto Sans Gurmukhi UI, sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px'
                  }}
                >
                  <option value="" className="text-gray-400">{newsletterData?.attributes?.language || "Select language"}</option>
                  <option value="English" className="text-gray-700 dark:text-gray-200">English</option>
                  <option value="Malayalam" className="text-gray-700 dark:text-gray-200" style={{ fontFamily: 'Noto Sans Malayalam UI, sans-serif' }}>Malayalam/മലയാളം</option>
                  <option value="Punjabi" className="text-gray-700 dark:text-gray-200" style={{ fontFamily: 'Noto Sans Gurmukhi UI, sans-serif' }}>Punjabi/ਪੰਜਾਬੀ</option>

                </select>
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
                    className="h-4 w-4 text-primary-PARI-Red dark:text-primary focus:ring-primary-PARI-Red dark:focus:ring-primary border-border dark:border-borderline rounded dark:bg-background"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-discreet-text dark:text-muted-foreground">
                    I agree to PARI&apos;s{' '}
                    <a href="https://ruralindiaonline.org/termsofservices" target="_blank" rel="noopener noreferrer" className="text-primary-PARI-Red hover:underline">
                      terms of service
                    </a>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 relative bottom-4">
                <button
                  type="submit"
               
                  className="w-full bg-primary-PARI-Red dark:bg-primary-PARI-Red cursor-pointer text-white py-4 px-6 rounded-full font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors duration-200 text-base  disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubscribing ? 'Subscribing...' : (newsletterData?.attributes?.buttonText || 'Confirm Sign up')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
