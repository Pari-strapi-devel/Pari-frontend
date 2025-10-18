'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

const TermsConditionsPage = () => {
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple test to see if component renders
  console.log('##Rohit_Rocks## Terms page component is rendering!');

  useEffect(() => {
    console.log('##Rohit_Rocks## useEffect is running!');
    const fetchTermsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('##Rohit_Rocks## Fetching terms data...');
        const response = await axios.get<TermsResponse>('https://dev.ruralindiaonline.org/v1/api/terms-of-service?populate=*');
        console.log('##Rohit_Rocks## Terms API response:', response.data);
        console.log('##Rohit_Rocks## Terms data:', response.data.data);
        console.log('##Rohit_Rocks## Terms points:', response.data.data.attributes.TermsAndConditionsPoints);
        console.log('##Rohit_Rocks## Privacy points:', response.data.data.attributes.PrivacyPolicyPoints);
        setTermsData(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'API Error');
        console.error('##Rohit_Rocks## Error fetching terms data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermsData();
  }, []);

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

  return (
    <div className="min-h-screen bg-background py-6 md:py-12 px-4">
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
  );
};

export default TermsConditionsPage;
