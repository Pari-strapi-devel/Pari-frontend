import { Button } from '@/components/ui/button'
import { BASE_URL } from '@/config'
import { ChevronRight} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

interface WeekOnHeaderProps {
  header?: string;
}

const WeekOnHeader: React.FC<WeekOnHeaderProps> = ({ header }) => {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div className='flex flex-row items-center gap-2'>
              {header && (
                <Image 
                  src={`${BASE_URL}${header}`} 
                  alt="This Week on PARI" 
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
                <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">This week on PARI</h2>
            </div>
          
          <Link href="/showcase">
            <Button variant="secondary" className="text-sm h-[32px] rounded-[48px] text-red-700">
              See all stories
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
    </div>
  )
}

export default WeekOnHeader
