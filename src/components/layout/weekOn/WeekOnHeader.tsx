// import { Button } from '@/components/ui/button'
import { CalendarDays, } from 'lucide-react'
import Link from 'next/link'
// import Image from 'next/image'
import React from 'react'

interface WeekOnHeaderProps {
  header?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
}

const WeekOnHeader: React.FC<WeekOnHeaderProps> = ({ 
  // header,
  title = "This Week on PARI",
  // buttonText = "See all stories",
  buttonLink = "/showcase"
}) => {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div className='flex flex-row items-center gap-2'>
              {/* {header && (
                <Image 
                  src={ header || "https://beta.ruralindiaonline.org/v1/uploads/stand_2aa0fa18b2.svg"} // Removed extra quotes
                  alt={title} 
                  width={24}
                  height={24}
                  className="object-contain"
                />
              )} */}
              <CalendarDays className="h-6 w-7 text-primary-PARI-Red" />
                <h2 className="text-[13px] font-noto-sans uppercase text-grey-300 leading-[100%] letter-spacing-[-2%] font-semibold">
                  {title}
                </h2>
            </div>
          
          <Link href={buttonLink}>
            {/* <Button variant="secondary" className="text-sm h-[32px] rounded-[48px] text-red-700">
              {buttonText}
              <ChevronRight className="h-4 w-4" />
            </Button> */}
          </Link>
        </div>
    </div>
  )
}

export default WeekOnHeader
