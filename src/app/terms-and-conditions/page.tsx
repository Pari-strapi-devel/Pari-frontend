'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useLocale } from '@/lib/locale';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
import axios from 'axios';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface TermsPoint {
  id: number;
  text: string;
  serial_no: number;
}

interface PrivacyPoint {
  id: number;
  text: string;
  serial_no: number;
}

interface BannerSection {
  id: number;
  Banner_Title: string;
  Banner_Quote: string | null;
}

interface TermsData {
  id: number;
  attributes: {
    TermsandConditions_Title: string;
    PrivacyPolicy_Title: string;
    DonatePari_Title: string;
    DonateToPariContentWithLink: string;
    TOS_Banner_Section: BannerSection;
    TermsAndConditionsPoints: TermsPoint[];
    PrivacyPolicyPoints: PrivacyPoint[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
  };
}

interface TermsResponse {
  data: TermsData;
  meta: Record<string, unknown>;
}

const TermsConditionsContent = () => {
  const { language: currentLocale } = useLocale();
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // Simple test to see if component renders
  console.log('##Rohit_Rocks## Terms page component is rendering with locale:', currentLocale);

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

  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect is running with locale:', currentLocale);
    const fetchTermsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('##Rohit_Rocks## Fetching terms data for locale:', currentLocale);
        const apiUrl = `https://merge.ruralindiaonline.org/v1/api/terms-of-service?populate=*&locale=${currentLocale}`;
        const response = await axios.get<TermsResponse>(apiUrl);
        console.log('##Rohit_Rocks## Terms API response:', response.data);

        if (response.data.data) {
          setTermsData(response.data.data);
        } else {
          setError('Terms data not found');
        }
      } catch (err) {
        console.error('##Rohit_Rocks## Error fetching terms data:', err);

        // Fallback to English if locale not found
        if (axios.isAxiosError(err) && err.response?.status === 404 && currentLocale !== 'en') {
          try {
            const fallbackUrl = 'https://merge.ruralindiaonline.org/v1/api/terms-of-service?populate=*&locale=en';
            const fallbackResponse = await axios.get<TermsResponse>(fallbackUrl);

            if (fallbackResponse.data.data) {
              setTermsData(fallbackResponse.data.data);
            } else {
              setError('Terms data not available');
            }
          } catch (fallbackErr) {
            console.error('##Rohit_Rocks## Error fetching fallback terms data:', fallbackErr);
            setError('Failed to load terms information');
          }
        } else {
          setError('Failed to load terms information');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermsData();
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
          fontSize: '15px',
          fontWeight: '400',
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
    console.log('##Rohit_Rocks## Rendering loading state...');
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
    console.log('##Rohit_Rocks## Rendering error state:', error);
    return (
      <div className="min-h-screen bg-background py-10 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('##Rohit_Rocks## Rendering main content, termsData:', termsData);

  const textDirection = ['ar', 'ur'].includes(currentLocale) ? 'rtl' : 'ltr';

  return (
    <>
      <div
        className="min-h-screen bg-background py-6 md:py-12 px-4"
        style={{
          fontFamily,
          direction: textDirection
        }}
      >
        <div className="max-w-2xl mx-auto">


        {/* Main Title */}
        {termsData && termsData.attributes.TOS_Banner_Section && (
          <h1 className="font-noto font-bold text-[49px] leading-[112%] tracking-[-4%] text-foreground mb-8">
            {termsData.attributes.TOS_Banner_Section.Banner_Title}
          </h1>
        )}

        {/* Terms & Conditions Section */}
        {termsData && (
          <div className="mb-8">
            <h4 className="font-noto font-bold text-[16px] leading-[130%] tracking-[-4%] text-foreground mb-4">
              {termsData.attributes.TermsandConditions_Title}
            </h4>

            <div className="space-y-6">
              <div className="font-noto font-normal text-[15px] leading-[170%] tracking-[-3%] text-foreground">
                {termsData.attributes.TermsAndConditionsPoints && termsData.attributes.TermsAndConditionsPoints.length > 0 ? (
                  <ol className="space-y-4">
                    {termsData.attributes.TermsAndConditionsPoints
                      .sort((a, b) => a.serial_no - b.serial_no)
                      .map((point) => (
                        <li key={point.id} className="mb-4">
                          <span className="font-medium">{point.serial_no}. </span>
                          {point.text}
                        </li>
                      ))}
                  </ol>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Section */}
        {termsData && (
          <div className="mb-8">
            <h4 className="font-noto font-bold text-[16px] leading-[130%] tracking-[-4%] text-foreground mb-4">
              {termsData.attributes.PrivacyPolicy_Title}
            </h4>

            <div className="space-y-6">
              <div className="font-noto font-normal text-[15px] leading-[170%] tracking-[-3%] text-foreground">
                {termsData.attributes.PrivacyPolicyPoints && termsData.attributes.PrivacyPolicyPoints.length > 0 ? (
                  <ol className="space-y-4">
                    {termsData.attributes.PrivacyPolicyPoints
                      .sort((a, b) => a.serial_no - b.serial_no)
                      .map((point) => (
                        <li key={point.id} className="mb-4">
                          <span className="font-medium">{point.serial_no}. </span>
                          {point.text}
                        </li>
                      ))}
                  </ol>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Donations Section */}
        {termsData && termsData.attributes.DonateToPariContentWithLink && (
          <div className="mb-8">
            <h4 className="font-noto font-bold text-[16px] leading-[130%] tracking-[-4%] text-foreground mb-4">
              {termsData.attributes.DonatePari_Title}
            </h4>
            {renderHTMLContent(termsData.attributes.DonateToPariContentWithLink)}
          </div>
        )}
        </div>
      </div>
      <LanguageToggle />
    </>
  );
};

const TermsConditionsPage = () => {
  return (
    <Suspense fallback={
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
    }>
      <TermsConditionsContent />
    </Suspense>
  );
};

export default TermsConditionsPage;
