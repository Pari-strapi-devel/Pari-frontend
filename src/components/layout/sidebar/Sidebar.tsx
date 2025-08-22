import Link from 'next/link'
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
        <div className="h-full w-full md:w-[280px] bg-popover dark:bg-background border border-border dark:border-border rounded-xl g z-40 hidden md:block relative">
          <div className="h-full overflow-y-auto py-6 px-5">
            {/* Sidebar Header with close button */}
            <div className="mb-2 px-1 flex items-center justify-between">
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
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

                return (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection?.(section.id)}
                      className={`flex items-center w-full h-10 text-left px-2 p-1 rounded- transition-all duration-200 group relative ${
                        isActive
                          ? 'text-primary-PARI-Red font-semibold border-l-4 border-primary-PARI-Red'
                          : 'text-primary-PARI-Red dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-propover hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer'
                      }`}
                    >
                      {showIcon && (
                        <div className="flex items-center w-8 h-8 mr-3 flex-shrink-0">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isActive
                              ? 'bg-red-100 dark:bg-red-900/30 text-primary-PARI-Red dark:text-primary-PARI-Red'
                              : 'bg-background dark:bg-propover text-grey-300 dark:text- group-hover:bg-gray-200 dark:group-hover:bg-black/10'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <span className={`text-sm font-medium leading-tight line-clamp-1 flex-1 ${
                        isActive ? 'text-primary-PARI-Red' : 'text-grey-300'
                      }`}>{section.title}</span>
                    </button>
                  </li>
                );
              })}



              {/* Donate to PARI */}
              <li className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/donate"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 border border-red-100 dark:border-red-800 hover:shadow-md"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Donate to PARI</span>
                </Link>
              </li>
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
              className="p-2 rounded-lg bg-popover dark:bg-background border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          </div>
        )
      )}
    </>
  )
}
