'use client';

import React, { Suspense } from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { LanguageToggle } from '@/components/layout/header/LanguageToggle';
import { useLocale } from '@/lib/locale';

// Types for API response
interface GuidelineSubsection {
  id: number;
  Title: string;
  TabTitle: string | null;
  Anchor: string | null;
  Content: string;
}

interface GuidelineSection {
  id: number;
  Title: string;
  TabTitle: string;
  Content: string;
  Anchor: string | null;
  GuidelineSubsection: GuidelineSubsection[];
}

interface GuidelineData {
  id: number;
  attributes: {
    Title: string;
    Strap: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    GuidelineSection: GuidelineSection[];
    localizations: {
      data: Array<{
        id: number;
        attributes: {
          Title: string;
          Strap: string;
          locale: string;
        };
      }>;
    };
  };
}

interface ApiResponse {
  data: GuidelineData;
  meta: Record<string, unknown>;
}

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background">
    <div className="text-center">
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
        style={{ borderColor: 'var(--primary-PARI-Red)' }}
      ></div>
      <p className="text-discreet-text dark:text-gray-300">Loading guidelines...</p>
    </div>
  </div>
);

// Main content component that uses useLocale
const ContributeGuidelinesContent = () => {
  const [fontClass, setFontClass] = useState('font-noto');
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [guidelineData, setGuidelineData] = useState<GuidelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the locale hook for language management
  const { language: currentLocale } = useLocale();

  // Function to remove numbering from titles (e.g., "1.1 Full-length feature" -> "Full-length feature")
  const removeNumbering = (title: string) => {
    return title.replace(/^\d+\.\d+\s*/, '').trim();
  };

  // Fetch data from API
  useEffect(() => {
    const fetchGuidelineData = async () => {
      try {
        setLoading(true);
        const apiUrl = `https://dev.ruralindiaonline.org/v1/api/page-contributor-guideline?populate=deep&locale=${currentLocale}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setGuidelineData(data.data);
      } catch (err) {
        // Fallback to English if the requested locale fails
        if (currentLocale !== 'en') {
          try {
            const fallbackResponse = await fetch('https://dev.ruralindiaonline.org/v1/api/page-contributor-guideline?populate=deep&locale=en');
            if (fallbackResponse.ok) {
              const fallbackData: ApiResponse = await fallbackResponse.json();
              setGuidelineData(fallbackData.data);
            } else {
              setError('Failed to fetch data in any language');
            }
          } catch {
            setError('Failed to fetch data');
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelineData();
  }, [currentLocale]); // Re-fetch when locale changes

  // Generate sections dynamically from API data
  const sections = useMemo(() => {
    if (!guidelineData) return [];

    const allSections: Array<{id: string, title: string, parentId?: string}> = [];

    // Process each main section
    guidelineData.attributes.GuidelineSection.forEach((section) => {
      // Add main section
      allSections.push({
        id: `section-${section.id}`,
        title: section.Title
      });

      // Add subsections if they exist
      if (section.GuidelineSubsection && section.GuidelineSubsection.length > 0) {
        section.GuidelineSubsection.forEach(subsection => {
          allSections.push({
            id: `subsection-${subsection.id}`,
            title: removeNumbering(subsection.Title),
            parentId: `section-${section.id}`
          });
        });
      }
    });
    return allSections;
  }, [guidelineData]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  }, []);

  // Set font based on language - use Devanagari for Hindi/Marathi, Noto Sans for others
  useEffect(() => {
    switch (currentLocale) {
      case 'hi':
      case 'mr':
        setFontClass('font-noto-devanagari');
        break;
      default:
        setFontClass('font-noto');
        break;
    }
  }, [currentLocale]);



  // Function to render HTML content safely with proper styling
  const renderHtmlContent = (htmlContent: string) => {
    return (
      <div
        className={`rendered-content prose prose-lg max-w-none dark:prose-invert ${fontClass}
          prose-p:text-discreet-text dark:prose-p:text-gray-300 prose-p:mb-6 prose-p:leading-relaxed
          prose-strong:text-foreground dark:prose-strong:text-white prose-strong:font-semibold
          prose-a:text-foreground dark:prose-a:text-white prose-a:underline prose-a:font-medium
          prose-ul:text-discreet-text dark:prose-ul:text-gray-300 prose-ul:mb-6 prose-ul:space-y-3
          prose-ol:text-discreet-text dark:prose-ol:text-gray-300 prose-ol:mb-6 prose-ol:space-y-3
          prose-li:text-discreet-text dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-2
          prose-h4:text-foreground dark:prose-h4:text-white prose-h4:font-bold prose-h4:text-xl prose-h4:mb-4 prose-h4:mt-8
          prose-h5:text-foreground dark:prose-h5:text-white prose-h5:font-semibold prose-h5:text-lg prose-h5:mb-3 prose-h5:mt-6
          prose-blockquote:border-l-2 prose-blockquote:border-border dark:prose-blockquote:border-borderline prose-blockquote:pl-4 prose-blockquote:italic`}
        style={{
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '175%',
          letterSpacing: '-1%'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      let currentSection = '';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);



  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--primary-PARI-Red)' }}
          ></div>
          <p className="text-discreet-text dark:text-gray-300">Loading guidelines...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading guidelines: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white rounded hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--primary-PARI-Red)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!guidelineData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background">
        <p className="text-discreet-text dark:text-gray-300">No guideline data available.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen bg-white dark:bg-background md:py-20 py-10 ${fontClass}`}
      style={{
        direction: currentLocale === 'ur' ? 'rtl' : 'ltr'
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row min-h-screen max-w-[1232px] mx-auto w-full">
        {/* Sidebar */}
        <div className={`hidden md:block flex-shrink-0 sticky top-4 self-start transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`}>
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            sections={sections}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            sidebarTitle={guidelineData.attributes.Title}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:px-8">
          <div className="max-w-[45.75rem] mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1
                className={`text-foreground dark:text-white mb-6 ${fontClass}`}
                style={{
                  fontWeight: 700,
                  fontSize: '49px',
                  lineHeight: '112%',
                  letterSpacing: '-4%'
                }}
              >
                {guidelineData.attributes.Title}
              </h1>
              <p
                className={`text-discreet-text dark:text-gray-300 ${fontClass}`}
                style={{
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '150%',
                  letterSpacing: '-1%'
                }}
              >
                {guidelineData.attributes.Strap}
              </p>
            </div>



            {/* Dynamic Content Sections */}
            {guidelineData.attributes.GuidelineSection.map((section) => (
              <div key={section.id} className="mb-16">
                {/* Main Section */}
                <section id={`section-${section.id}`} className="mb-12 scroll-mt-20">
                  <h2
                    className={`text-foreground dark:text-white mb-6 ${fontClass}`}
                    style={{
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '125%',
                      letterSpacing: '-3%'
                    }}
                  >
                    {section.Title}
                  </h2>
                  {section.Content && (
                    <div
                      className={`text-discreet-text dark:text-gray-300 mb-8 ${fontClass}`}
                      style={{
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '175%',
                        letterSpacing: '-1%'
                      }}
                    >
                      {renderHtmlContent(section.Content)}
                    </div>
                  )}
                </section>

                {/* Subsections */}
                {section.GuidelineSubsection.map((subsection) => (
                  <section key={subsection.id} id={`subsection-${subsection.id}`} className="mb-10 scroll-mt-20 pl-6 border-l-2 border-border dark:border-borderline">
                    <h3
                      className={`text-foreground dark:text-white mb-5 ${fontClass}`}
                      style={{
                        fontWeight: 700,
                        fontSize: '24px',
                        lineHeight: '130%',
                        letterSpacing: '-2%'
                      }}
                    >
                      {removeNumbering(subsection.Title)}
                    </h3>
                    {subsection.Content && (
                      <div
                        className={`text-discreet-text dark:text-gray-300 ${fontClass}`}
                        style={{
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '175%',
                          letterSpacing: '-1%'
                        }}
                      >
                        {renderHtmlContent(subsection.Content)}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Language Toggle */}
      <LanguageToggle />
    </div>
  );
};

// Main page component with Suspense boundary
const ContributeGuidelines = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ContributeGuidelinesContent />
    </Suspense>
  );
};

export default ContributeGuidelines;
