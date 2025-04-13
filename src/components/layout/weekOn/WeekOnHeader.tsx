import { Button } from '@/components/ui/button'
import { ChevronRight, Presentation } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const WeekOnHeader = () => {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div className='flex flex-row items-center gap-2'>
                 <Presentation className="h-7 w-7 text-red-700" />
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
