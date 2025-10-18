'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
import { useLocale } from '@/lib/locale';


interface CopyrightData {
  id: number;
  attributes: {
    CopyRights_Title: string;
    CopyRights_Content: string;
    CreativeCommens_Content: string;
    Third_Party_Quote: string;
    Third_Party_Content: string;
    Notification_Title: string;
    Notification_Content: string;
    EmailAddressLabel: string;
    EmailAddressValue: string;
    Contact_Image?: {
      data?: {
        id: number;
        attributes: {
          name: string;
          alternativeText?: string | null;
          caption?: string | null;
          width: number;
          height: number;
          url: string;
          ext: string;
          mime: string;
          size: number;
        };
      } | null;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
  };
}

interface CopyrightResponse {
  data: CopyrightData;
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
const CopyrightContent = () => {
  const [copyrightData, setCopyrightData] = useState<CopyrightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language: currentLocale } = useLocale();



  useEffect(() => {
    const fetchCopyrightData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch copyright data with locale support
        const response = await axios.get<CopyrightResponse>(
          `${BASE_URL}api/copyright?populate=*&locale=${currentLocale}`
        );
        setCopyrightData(response.data.data);
      } catch {
        // If locale-specific data fails, try fallback to English
        try {
          const fallbackResponse = await axios.get<CopyrightResponse>(`${BASE_URL}api/copyright?populate=*&locale=en`);
          setCopyrightData(fallbackResponse.data.data);
        } catch (fallbackErr) {
          setError('Failed to load copyright information');
          console.error('Error fetching copyright data:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCopyrightData();
  }, [currentLocale]);

  // Helper function to clean and render HTML content
  const cleanHTMLContent = (htmlContent: string) => {
    // Remove all inline styles that might cause rendering issues
    return htmlContent
      .replace(/style="[^"]*"/gi, '') // Remove all style attributes
      .replace(/background-color:[^;]*;?/gi, '') // Remove background-color
      .replace(/font-size:[^;]*;?/gi, '') // Remove font-size
      .replace(/color:[^;]*;?/gi, '') // Remove color
      .replace(/font-family:[^;]*;?/gi, '') // Remove font-family
      .replace(/\s+/g, ' ') // Clean up extra whitespace
      .trim();
  };

  // Helper function to render HTML content with proper styling
  const renderHTMLContent = (htmlContent: string) => {
    const cleanedContent = cleanHTMLContent(htmlContent);
    return (
      <div
        className="text-foreground font-noto"
        style={{
          fontFamily: 'Noto Sans, sans-serif',
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '170%',
          letterSpacing: '-3%',
          color: 'var(--foreground)',
          backgroundColor: 'transparent'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />
      </div>
    );
  };

  if (isLoading) {
    return (
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
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-10 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!copyrightData) {
    return (
      <div className="min-h-screen bg-background py-10 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">No copyright information available</p>
          </div>
        </div>
      </div>
    );
  }

  const rawContactImageUrl = copyrightData?.attributes?.Contact_Image?.data?.attributes?.url;
  const contactImageUrl = rawContactImageUrl
    ? (rawContactImageUrl.startsWith('http') ? rawContactImageUrl : `${BASE_URL}${rawContactImageUrl}`)
    : null;
  const contactImageAlt = copyrightData?.attributes?.Contact_Image?.data?.attributes?.alternativeText || 'Contact image';

  return (
    <div className="min-h-screen bg-background py-6 md:py-12 px-4">
      {/* Floating Language Toggle */}
      <LanguageToggle />

      <div className="max-w-2xl mx-auto">
        {/* Main Title */}
        <h1
          className="font-noto font-bold text-[49px] pb-10 border-b border-border dark:border-borderline leading-[112%] tracking-[-4%] text-foreground mb-6"
          style={{
            fontFamily: 'Noto Sans, sans-serif',
            fontWeight: 700,
            fontSize: '49px',
            lineHeight: '112%',
            letterSpacing: '-4%'
          }}
        >
          {copyrightData.attributes.CopyRights_Title}
        </h1>

        {/* Main Copyright Content */}
        <div className="mb-6">
          {renderHTMLContent(copyrightData.attributes.CopyRights_Content)}
        </div>

        {/* Creative Commons Content */}
        <div className="mb-6">
          {renderHTMLContent(copyrightData.attributes.CreativeCommens_Content)}
        </div>

        {/* Third Party Content Section */}
        <div className="mb-6">
          <h4
            className="font-noto font-bold text-[24px] leading-[130%] tracking-[-5%] text-foreground mb-3"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '130%',
              letterSpacing: '-5%'
            }}
          >
            {copyrightData.attributes.Third_Party_Quote}
          </h4>
          {renderHTMLContent(copyrightData.attributes.Third_Party_Content)}
        </div>

        {/* Notification Section */}
        <div className="mb-6">
          <h4
            className="font-noto font-bold text-[24px] leading-[130%] tracking-[-5%] text-foreground mb-3"
            style={{
              fontFamily: 'Noto Sans, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '130%',
              letterSpacing: '-5%'
            }}
          >
            {copyrightData.attributes.Notification_Title}
          </h4>
          {renderHTMLContent(copyrightData.attributes.Notification_Content)}
        </div>

        <div className="mt-8">
          {contactImageUrl && (
            <Image
              src={contactImageUrl}
              alt={contactImageAlt}
              width={128}
              height={128}
              className="mb-4 h-32 w-32 rounded-md object-cover"
            />
          )}

          <div className="mt-4">
            <h4
              className="font-noto font-bold text-[24px] leading-[130%] tracking-[-5%] text-foreground mb-2"
              style={{
                fontFamily: 'Noto Sans, sans-serif',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '130%',
                letterSpacing: '-5%'
              }}
            >
              {copyrightData.attributes.EmailAddressLabel}
            </h4>
            <a
              href={`mailto:${copyrightData.attributes.EmailAddressValue}`}
              className="font-noto font-normal text-[15px] leading-[170%] tracking-[-3%] text-primary-PARI-Red hover:text-red-700 underline"
              style={{
                fontFamily: 'Noto Sans, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '170%',
                letterSpacing: '-3%',
                textDecoration: 'underline',
                textDecorationStyle: 'solid'
              }}
            >
              {copyrightData.attributes.EmailAddressValue}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main page component with Suspense boundary
const CopyrightPage = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <CopyrightContent />
    </Suspense>
  );
};

export default CopyrightPage;
