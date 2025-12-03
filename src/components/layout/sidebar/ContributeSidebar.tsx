'use client';

import {
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface ContributeSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  sections?: Array<{id: string, title: string, parentId?: string}>;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
  sidebarTitle?: string;
}

export function ContributeSidebar({
  isOpen = true,
  onToggle,
  sections = [],
  activeSection = '',
  scrollToSection,
  sidebarTitle = "Guidelines"
}: ContributeSidebarProps) {
  // State to track which parent sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // State to track scroll behavior
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get parent sections (sections without parentId) - memoized to prevent infinite loops
  const parentSections = useMemo(() => {
    return sections.filter(section => !section.parentId);
  }, [sections]);

  // Get children for a specific parent
  const getChildSections = (parentId: string) => {
    return sections.filter(section => section.parentId === parentId);
  };

  // Toggle expansion of a parent section (accordion style - only one open at a time)
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set<string>();
      
      // If the clicked section is currently expanded, close it (empty set)
      // If it's not expanded, open only this section (close all others)
      if (!prev.has(sectionId)) {
        newExpanded.add(sectionId);
      }
      // If it was expanded, newExpanded remains empty (closes all)
      
      return newExpanded;
    });
  };

  // Auto-expand parent sections when their children are active (accordion style)
  useEffect(() => {
    if (activeSection) {
      // Find if the active section is a child section
      const activeChild = sections.find(section => section.id === activeSection && section.parentId);
      
      if (activeChild && activeChild.parentId) {
        // Auto-expand only the parent section of the active child (close all others)
        const parentId = activeChild.parentId;
        setExpandedSections(prev => {
          // Only update if the current expanded sections don't match what we want
          const targetExpanded = new Set([parentId]);
          if (prev.size !== 1 || !prev.has(parentId)) {
            return targetExpanded;
          }
          return prev; // No change needed
        });
      } else {
        // If active section is a parent or has no parent, check if we should keep any expanded
        const isActiveParent = parentSections.some(parent => parent.id === activeSection);
        if (!isActiveParent) {
          // If active section is not a parent, close all sections
          setExpandedSections(prev => {
            if (prev.size > 0) {
              return new Set();
            }
            return prev; // No change needed
          });
        }
      }
    }
  }, [activeSection, sections, parentSections]);

  // Handle scroll detection
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
      setIsScrolling(true);

      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Content or Toggle Button */}
      {isOpen && sections.length > 0 ? (
        <div
          className={`h-full w-full md:w-[280px] bg-popover dark:bg-background border border-border dark:border-borderline rounded-xl z-40 hidden md:block relative transition-all duration-300 ease-in-out ${
            isScrolling && scrollDirection === 'down'
              ? 'transform translate-y-4 opacity-80 scale-95'
              : 'transform translate-y-0 opacity-100 scale-100'
          }`}
          style={{
            position: 'sticky',
            top: isScrolling && scrollDirection === 'down' ? '10rem' : '3rem',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <div className="h-full overflow-y-auto py-6 px-5">
            {/* Sidebar Header with close button */}
            <div className="mb-6 px-1 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {sidebarTitle}
              </h3>
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="p-1.5 transition-all duration-200"
                >
                  <PanelRightClose className="w-5 h-5" />
                </button>
              )}
            </div>

            <nav>
              <ul className="space-y-2">
                {/* Article Sections - Show parent sections and their children when expanded */}
                {parentSections.map((parentSection) => {
                  const isParentActive = activeSection === parentSection.id;
                  const isExpanded = expandedSections.has(parentSection.id);
                  const childSections = getChildSections(parentSection.id);
                  const hasChildren = childSections.length > 0;

                  return (
                    <li key={parentSection.id}>
                      {/* Parent Section */}
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              toggleSection(parentSection.id);
                            }
                            scrollToSection?.(parentSection.id);
                          }}
                          className={`flex items-center w-full h-10 text-left px-2 p-1 transition-all duration-200 ${
                            isParentActive
                              ? 'font-semibold border-l-4 border-primary-PARI-Red'
                              : 'cursor-pointer'
                          }`}
                        >
                          {hasChildren && (
                            <div className={`flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0 ${
                              isParentActive ? 'text-primary-PARI-Red dark:text-white' : 'text-foreground dark:text-gray-300'
                            }`}>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          )}
                          <span
                            className={`line-clamp-1 flex-1 ${
                              isParentActive ? 'text-primary-PARI-Red dark:text-white' : 'text-foreground dark:text-gray-300'
                            }`}
                            style={{
                              fontFamily: 'Noto Sans',
                              fontWeight: 500,
                              fontSize: '14px',
                              lineHeight: '140%',
                              letterSpacing: '-2%'
                            }}
                          >
                            {parentSection.title}
                          </span>
                        </button>
                      </div>

                      {/* Child Sections - Only show when parent is expanded */}
                      {hasChildren && isExpanded && (
                        <ul className="ml-6 mt-2 space-y-1 border-l border-border dark:border-borderline pl-4">
                          {childSections.map((childSection) => {
                            const isChildActive = activeSection === childSection.id;

                            return (
                              <li key={childSection.id}>
                                <button
                                  onClick={() => scrollToSection?.(childSection.id)}
                                  className={`flex items-center w-full h-9 text-left px-2 p-1 transition-all duration-200 ${
                                    isChildActive
                                      ? 'font-semibold border-l-4 border-primary-PARI-Red'
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  <span
                                    className={`line-clamp-1 flex-1 ${
                                      isChildActive ? 'text-primary-PARI-Red dark:text-white' : 'text-foreground dark:text-gray-300'
                                    }`}
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: '13px',
                                      lineHeight: '140%',
                                      letterSpacing: '-2%'
                                    }}
                                  >
                                    {childSection.title}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        /* Toggle Button in sidebar position when closed or no sections */
        onToggle && (
          <div 
            className={`h-full w-full md:w-[280px] hidden md:flex items-start justify-start transition-all duration-300 ease-in-out ${
              isScrolling && scrollDirection === 'down' 
                ? 'transform translate-y-4 opacity-80' 
                : 'transform translate-y-0 opacity-100'
            }`}
            style={{
              position: 'sticky',
              top: '3rem',
              transition: 'all 0.3s ease-in-out',
              paddingTop: '1.5rem',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem'
            }}
          >
            <button
              onClick={onToggle}
              className="p-2 rounded-lg bg-popover dark:bg-background border border-border dark:border-borderline text-discreet-text dark:text-discreet-text hover:bg-popover dark:hover:bg-popover transition-all duration-200"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          </div>
        )
      )}
    </>
  )
}
