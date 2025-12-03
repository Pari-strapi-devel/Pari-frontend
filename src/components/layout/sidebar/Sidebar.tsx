
import {
  Sun,
  BookMarked,
  Tractor,
  Smile,
  Lock,
  Amphora,
  AudioLines,
  Brush,
  Lightbulb,
  EyeOff,
  Flag,
  Building2,
  Heart,
  PanelRightClose,
  PanelRightOpen,
  FileText
} from 'lucide-react'




interface SidebarProps {
  activePage?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  sections?: Array<{id: string, title: string, iconType?: string}>;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
  sidebarTitle?: string;
}

// Helper function to get icon component - matching design mockup exactly
function getIconComponent(iconType: string) {
  switch (iconType) {
    // Exact icons from design mockup
    case 'Sun': return Sun; // Climate Change ☀️
    case 'BookMarked': return BookMarked; // Library 📖
    case 'Tractor': return Tractor; // Farmer's Protests 👥
    case 'Smile': return Smile; // Faces of India 😊
    case 'Lock': return Lock; // Livelihoods under lockdown 🔒
    case 'Amphora': return Amphora; // Stories on art, artists, artisans & crafts 🎨
    case 'AudioLines': return AudioLines; // Grindmill songs project and Kutchi songs archive �
    case 'Brush': return Brush; // Adivasi children's art �
    case 'Lightbulb': return Lightbulb; // PARI series on women's health 💡
    case 'EyeOff': return EyeOff; // Visible work, invisible women 👁️
    case 'Flag': return Flag; // Freedom fighters' gallery 🏳️
    case 'Building2': return Building2; // PARI in classrooms
    case 'Heart': return Heart; // Donate to PARI ❤️
    case 'FileText': return FileText; // General list/content
    default: return FileText;
  }
}

export function Sidebar({
  activePage,
  isOpen = true,
  onToggle,
  sections = [],
  activeSection = '',
  scrollToSection,
  sidebarTitle = "Article Contents"
}: SidebarProps) {
  // activePage and sidebarTitle are intentionally unused but kept for interface compatibility
  void activePage;
  void sidebarTitle;




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
        <div className="h-full w-full md:w-[280px] bg-popover dark:bg-background border border-border dark:border-borderline rounded-xl g z-40 hidden md:block relative">
          <div className="h-full overflow-y-auto py-6 px-5">
            {/* Sidebar Header with close button */}
            <div className="mb-2 px-1 flex items-center justify-between">
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-lg text-discreet-text dark:text-discreet-text   hover:bg-popover  transition-all duration-200"
                >
                  <PanelRightClose className="w-5 h-5" />
                </button>
              )}
            </div>

          <nav>
            <ul className="space-y-2">
              {/* Article Sections - Show when sections exist */}
              {sections.length > 0 && sections.map((section, index) => {
                const IconComponent = getIconComponent(section.iconType || 'FileText');
                const isActive = activeSection === section.id;
                const showIcon = index >= 3; // Only show icons for sections after the first 3
                const isSubsection = showIcon && index < sections.length - 1; // Subsections have icons but are not the last item (Donate)

                return (
                  <li key={section.id} className={isSubsection ? 'ml-4 pl-2 ' : ''}>
                    <button
                      onClick={() => scrollToSection?.(section.id)}
                      className={`flex items-center w-full h-10 text-left px-2 p-1 rounded- transition-all duration-200 group relative ${
                        isActive
                          ? 'text-primary-PARI-Red dark:text-white font-semibold border-l-4 border-primary-PARI-Red'
                          : 'text-primary-PARI-Red dark:t  hover:bg-popover hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer'
                      }`}
                    >
                      {showIcon && (
                        <div className="flex items-center w-8 h-8 mr-3 flex-shrink-0">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isActive
                              ? '  text-primary-PARI-Red dark:text-white'
                              : ''
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <span
                        className={`line-clamp-1 flex-1 ${
                          isActive ? 'text-primary-PARI-Red dark:text-white' : 'text-grey-300 dark:text-grey-300'
                        }`}
                        style={{
                          fontFamily: 'Noto Sans',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '140%',
                          letterSpacing: '-4%'
                        }}
                      >
                        {section.title}
                      </span>
                    </button>
                  </li>
                );
              })}



              {/* Donate to PARI */}
             
            </ul>
          </nav>
        </div>
      </div>
      ) : (
        /* Toggle Button in sidebar position when closed */
        onToggle && (
          <div className="h-full w-full md:w-[280px] hidden md:flex items-start justify-start pt-6 px-5">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg bg-popover  dark:bg-background border border-border dark:border-borderline text-discreet-text dark:text-discreet-text  hover:bg-popover dark:hover:bg-popover transition-all duration-200"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          </div>
        )
      )}
    </>
  )
}
