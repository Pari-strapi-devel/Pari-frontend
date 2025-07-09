'use client'

import { useState } from 'react'

// Types
interface Award {
  id: string
  title: string
  description: string
  recipient?: string
  month?: string
  image?: string
}

interface YearData {
  year: number
  awards: Award[]
}

// Props interfaces
interface YearBadgeProps {
  year: number
  isSelected: boolean
  onClick: (year: number) => void
}

interface TimelineProps {
  years: number[]
  selectedYear: number
  onYearSelect: (year: number) => void
}

interface AwardContentProps {
  yearData: YearData | undefined
}

interface AwardEntryProps {
  award: Award
  isLast?: boolean
}

// Styled Components
const YearBadge = ({ year, isSelected, onClick }: YearBadgeProps) => (
  <button
    onClick={() => onClick(year)}
    className={`w-12 h-7 sm:w-14 sm:h-8 md:w-16 md:h-8 bg-background  rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
      isSelected
        ? 'text-white shadow-lg hover:shadow-xl ring-2 ring-primary-PARI-Red/20'
        : 'text-[#606060] bg-propover  hover:shadow-lg  hover:border-primary-PARI-Red/30'
    }`}
    style={{
      backgroundColor: isSelected ? '#B82929' : undefined,
     
    }}
   
  >
    {year}
  </button>
)

const AwardEntry = ({ award, isLast = false }: AwardEntryProps) => (
  <div className={isLast ? "" : "mb-8 md:mb-12"}>
    <div className="flex flex-col md:flex-row md:items-start">
      <div className="w-full md:w-72 h-48 md:h-48 mb-4 md:mb-0 md:mr-8 flex-shrink-0">
        <div className="w-full h-full bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
          {/* Award ceremony image placeholder matching design */}
          <div className="w-full h-full bg-gradient-to-br from-primary-PARI-Red via-primary-PARI-Red/80 to-primary-PARI-Red/30 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="text-center relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-2 flex items-center justify-center border border-white/30">
                <span className="text-white text-lg md:text-2xl drop-shadow-sm">🏆</span>
              </div>
              <span className="text-white text-xs md:text-sm font-semibold drop-shadow-sm">Award Ceremony</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-tight text-primary-PARI-Red transition-colors duration-200" style={{
         
        }}>
          {award.title}
        </h3>
        <p className=" text-discreet-text   text-sm sm:text-base leading-relaxed" style={{
          
        }}>
          {award.description}
        </p>
      </div>
    </div>
    {!isLast && <div className="mt-6 md:mt-8 border-b border-border dark:border-[#444444]"></div>}
  </div>
)

const Timeline = ({ years, selectedYear, onYearSelect }: TimelineProps) => (
  <div className="w-full md:w-36 flex md:flex-col">
    <div className="flex md:flex-col space-x-2 mr-2 md:space-x-0 md:space-y-4 lg:space-y-6 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
      {years.map((year) => (
        <div key={year} className="flex justify-start flex-shrink-0">
          <YearBadge
            year={year}
            isSelected={selectedYear === year}
            onClick={onYearSelect}
          />
        </div>
      ))}
    </div>
  </div>
)

const AwardContent = ({ yearData }: AwardContentProps) => {
  if (!yearData || yearData.awards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="text-center p-8 rounded-xl  ">
          <div className="w-16 h-16  rounded-full mx-auto mb-4 flex items-center justify-center">
           
          </div>
          <p className="text-grey-400 text-lg mb-2 font-medium">No awards data available</p>
          <p className="text-grey-400 text-sm">for {yearData?.year || 'this year'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 md:border-l border-border pt-8 md:pt-0 dark:border-[#444444]  md:pl-8">
      <div className="space-y-0 max-w-[900px] mx-auto">
        {yearData.awards.map((award, index) => (
          <AwardEntry
            key={award.id}
            award={award}
            isLast={index === yearData.awards.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

export default function AwardPage() {
  // Award data matching the exact design
  const awardData: YearData[] = [
    {
      year: 2025,
      awards: [
        {
          id: '2025-1',
          title: 'Yashwantrao Chavan State Level Youth Award for Journalism 2025',
          description: 'In May 2025, PARI Senior Reporter Jyoti was awarded the 2025 Yashwantrao Chavan State Level Youth Award for Journalism in Aurangabad, Maharashtra. The awards are presented every year to talented youths with achievements in areas of social, sports, entrepreneurship, theatre arts, literature, journalism and innovation.',
          recipient: 'Jyoti',
          month: 'May',
          image: '/api/placeholder/400/300'
        },
        {
          id: '2025-2',
          title: '2025 Ashish Yechury Award for Photo journalism',
          description: 'In May 2025, PARI\'s Palani Kumar was awarded the Asian College of Journalism Ashish Yechury Award for Photojournalism. The award seeks to recognise and reward the best news storytelling efforts through photography. Palani received this award for his story \'There is no such thing as professional grief\', which looks at the lives of individuals engaged in manual scavenging.',
          recipient: 'Palani Kumar',
          month: 'May',
          image: '/api/placeholder/400/300'
        },
        {
          id: '2025-3',
          title: 'Marico Innovation Foundation\'s Indian Innovation Icons 2025',
          description: 'In March 2025, PARI was awarded Marico Innovation Foundation\'s Indian Innovation Icons award for 2025 in the \'social\' category. The award recognises PARI as a unique digital platform preserving and amplifying rural India\'s diverse voices.',
          month: 'March',
          image: '/api/placeholder/400/300'
        }
      ]
    },
    {
      year: 2024,
      awards: []
    },
    {
      year: 2023,
      awards: []
    },
    {
      year: 2022,
      awards: []
    },
    {
      year: 2021,
      awards: []
    },
    {
      year: 2020,
      awards: []
    },
    {
      year: 2019,
      awards: []
    },
    {
      year: 2018,
      awards: []
    },
    {
      year: 2017,
      awards: []
    },
    {
      year: 2016,
      awards: []
    },
    {
      year: 2015,
      awards: []
    },
    {
      year: 2014,
      awards: []
    }
  ]

  const years = awardData.map(data => data.year)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const selectedYearData = awardData.find(data => data.year === selectedYear)

  return (
    <div className="dark:bg-propover  bg-popover min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Main Title and Subtitle - Enhanced Styling */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-bold text- mb-4 sm:mb-4 leading-[112%]" style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.03em'
          }}>
            <span className="bg-gradient-to-r from-primary-PARI-Red to-primary-PARI-Red/80 bg-clip-text text-transparent">
              PARI&apos;s
            </span>{' '}
            journalism prizes,<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>awards and honours
          </h1>
          <p className="text-base sm:text-lg md:text-2xl dark:text-discreet-text font-normal leading-[150%] max-w-3xl" style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontWeight: 400,
           
            letterSpacing: '-0.01em'
          }}>
            PARI&apos;s won{' '}
            <span className="font-semibold text-primary-PARI-Red">82 journalism awards</span>{' '}
            since we<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>began publishing in 2014.
          </p>
        </div>

        {/* Timeline Layout - Responsive */}
        <div className="flex flex-col md:flex-row md:items-start">
          <Timeline
            years={years}
            selectedYear={selectedYear}
            onYearSelect={setSelectedYear}
          />
          <AwardContent yearData={selectedYearData} />
        </div>
      </div>
    </div>
  )
}
