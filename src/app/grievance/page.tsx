'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useLocale } from '@/lib/locale';
import axios from 'axios';

// Define interfaces for the grievance API
interface GrievanceBannerCard {
  id: number;
  Title: string;
  Quote: string | null;
}

interface GrievanceContent {
  id: number;
  Grievance_Title: string | null;
  Grievance_Description: string;
  Grievance_Content: string;
}

interface GrievanceAddress {
  id: number;
  name: string;
  Designation: string;
  Address_field_1: string;
  email: string;
  phone: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
}

interface GrievanceAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  GrievancesRelatingtoSexualMisconductLabel: string;
  GrievancesRelatingtoSexualMisconductValue: string;
  Grievance_Banner_Card: GrievanceBannerCard;
  Grievance_Content: GrievanceContent;
  Grievance_Address: GrievanceAddress;
}

interface GrievanceData {
  id: number;
  attributes: GrievanceAttributes;
}

interface ApiResponse {
  data: GrievanceData;
  meta: Record<string, unknown>;
}

// Loading component
const LoadingComponent = () => (
  <div className="min-h-screen bg-background py-10 md:py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main content component that uses useLocale
const GrievanceContent = () => {
  const { language: currentLocale } = useLocale();
  const [grievanceData, setGrievanceData] = useState<GrievanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // Set font family based on locale
  useEffect(() => {
    switch (currentLocale) {
      case 'hi':
      case 'mr':
        setFontFamily('Noto Sans Devanagari');
        break;
      case 'te':
        setFontFamily('Noto Sans Telugu UI');
        break;
      case 'ta':
        setFontFamily('Noto Sans Tamil UI');
        break;
      case 'ur':
        setFontFamily('Noto Sans');
        break;
      default:
        setFontFamily('Noto Sans');
    }
  }, [currentLocale]);

  // Fetch grievance data
  useEffect(() => {
    const fetchGrievanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiUrl = `https://dev.ruralindiaonline.org/v1/api/grievance?populate=*&locale=${currentLocale}`;
        const response = await axios.get<ApiResponse>(apiUrl);

        if (response.data.data) {
          setGrievanceData(response.data.data);
        } else {
          setError('Grievance data not found');
        }
      } catch (err) {
        console.error('Error fetching grievance data:', err);
        
        // Fallback to English if locale not found
        if (axios.isAxiosError(err) && err.response?.status === 404 && currentLocale !== 'en') {
          try {
            const fallbackUrl = 'https://dev.ruralindiaonline.org/v1/api/grievance?populate=*&locale=en';
            const fallbackResponse = await axios.get<ApiResponse>(fallbackUrl);
            
            if (fallbackResponse.data.data) {
              setGrievanceData(fallbackResponse.data.data);
            } else {
              setError('Grievance data not available');
            }
          } catch (fallbackErr) {
            console.error('Error fetching fallback grievance data:', fallbackErr);
            setError('Failed to load grievance information');
          }
        } else {
          setError('Failed to load grievance information');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrievanceData();
  }, [currentLocale]);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-white dark:bg-background flex items-center justify-center"
        style={{ fontFamily }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p className="text-foreground dark:text-white">Loading grievance information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-white dark:bg-background flex items-center justify-center"
        style={{ fontFamily }}
      >
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-PARI-Red text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!grievanceData) {
    return (
      <div 
        className="min-h-screen bg-white dark:bg-background flex items-center justify-center"
        style={{ fontFamily }}
      >
        <p className="text-foreground dark:text-white">No grievance information available</p>
      </div>
    );
  }

  const { attributes } = grievanceData;
  const textDirection = ['ar', 'ur'].includes(currentLocale) ? 'rtl' : 'ltr';

  return (
    <div 
      className="min-h-screen bg-white dark:bg-background py-20"
      style={{ 
        fontFamily,
        direction: textDirection
      }}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Main Header */}
        <div className="mb-12">
          <h1
            className="text-foreground dark:text-white mb-6"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 700,
              fontSize: '49px',
              lineHeight: '112%',
              letterSpacing: '-4%'
            }}
          >
            {attributes.Grievance_Banner_Card?.Title || 'Grievance Redressal'}
          </h1>
          <p
            className="text-discreet-text dark:text-gray-300"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '150%'
            }}
          >
            {attributes.Grievance_Content?.Grievance_Description || 'Residents of India can file a complaint about website content within a reasonable time after publication.'}
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700 mb-12"></div>

        {/* For general grievances */}
        <section className="mb-16">
          <h2 
            className="text-foreground dark:text-white mb-4"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '130%',
              letterSpacing: '-5%'
            }}
          >
            For general grievances
          </h2>
          <p
            className="text-discreet-text dark:text-gray-300 mb-8"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '150%'
            }}
          >
            {attributes.Grievance_Content?.Grievance_Content || 'Grievances can be addressed to our grievance officer'}
          </p>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="flex">
              <span
                className="text-discreet-text dark:text-gray-400 w-32"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.nameLabel || 'Name'}
              </span>
              <span
                className="text-foreground dark:text-white"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.name || 'Zahra Latif'}
              </span>
            </div>
            <div className="flex">
              <span
                className="text-discreet-text dark:text-gray-400 w-32"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                Position
              </span>
              <span
                className="text-foreground dark:text-white"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.Designation }
              </span>
            </div>
            <div className="flex">
              <span
                className="text-discreet-text dark:text-gray-400 w-32"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                Organization
              </span>
              <span
                className="text-foreground dark:text-white"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.Address_field_1 }
              </span>
            </div>
            <div className="flex">
              <span
                className="text-discreet-text dark:text-gray-400 w-32"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.emailLabel }
              </span>
              <span
                className="text-foreground dark:text-white"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.email }
              </span>
            </div>
            <div className="flex">
              <span
                className="text-discreet-text dark:text-gray-400 w-32"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.phoneLabel }
              </span>
              <span
                className="text-foreground dark:text-white"
                style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '150%'
                }}
              >
                {attributes.Grievance_Address?.phone }
              </span>
            </div>
          </div>
        </section>

        {/* For grievances relating to sexual misconduct */}
        <section>
          <h2 
            className="text-foreground dark:text-white mb-4"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '130%',
              letterSpacing: '-5%'
            }}
          >
            {attributes.GrievancesRelatingtoSexualMisconductLabel || 'For grievances relating to sexual misconduct'}
          </h2>
          <p 
            className="text-discreet-text dark:text-gray-300"
            style={{
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '150%'
            }}
          >
            {attributes.GrievancesRelatingtoSexualMisconductValue || 'Our Internal Complaints Committee can be contacted at: icc_pari@ruralindiaonline.org'}
          </p>
        </section>
      </div>
    </div>
  );
};

// Main page component with Suspense boundary
const GrievancePage = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <GrievanceContent />
    </Suspense>
  );
};

export default GrievancePage;
