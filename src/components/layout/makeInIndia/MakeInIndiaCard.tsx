import Image from 'next/image';
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Lightbulb } from 'lucide-react';



const features = [
  {
    category: ["Social Justice"] ,
    name: "Dalits",
    title: "Breaking Barriers in Rural Communities",
    description: "In Kolhapur district, people of different faiths are reaching out across religions and caste, urging all to embrace humanity",
    href: "/stories/dalits",
    cta: "Read more",
    languages: ["Available in 6 languages"],
    location: "Kolhapur",
    date: "Feb 15, 2024",
    background: <Image src="/images/categories/pari-re4.png" alt="Dalits story" width={300} height={400} className="w-full bg-gradient-to-t from-black/100 to-transparent  h-full absolute right-0 top-0 opacity-60 bg-cover" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    category: ["Agriculture","Agriculture"],
    name: "Farming",
    title: "Sustainable Farming Practices",
    description: "In Totana: 'We must fill our stomach somehow'",
    href: "/stories/farming",
    cta: "Read more",
    languages: ["Available in 6 languages"],
    location: "Totana",
    date: "Feb 18, 2024",
    background: <Image src="/images/categories/pari-re4.png" alt="Farming story" width={300} height={400} className="w-full bg-gradient-to-t from-black/80 to-transparent  h-full absolute right-0 top-0  bg-cover"/>,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    category: ["Education"],
    name: "Rural Education",
    title: "Education in Rural Areas",
    description: "Transforming rural education through innovative approaches",
    href: "/stories/rural-education",
    cta: "Read more",
    languages: ["Available in 6 languages"],
    location: "Kerala",
    date: "Feb 20, 2023",
    background: <Image src="/images/categories/pari-re3.png" alt="Education story" width={300} height={400} className="w-full bg-gradient-to-t from-black/80 to-transparent  h-full absolute right-0 top-0 opacity-60 bg-cover" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    category: ["Contributors" ,"Contributors"],
    name: "Author Profile",
    title: "Umesh Solanki",
    description: "Award-winning journalist covering rural India",
    href: "/authors/umesh-solanki",
    cta: "View profile",
    languages: ["Available in 6 languages"],
    location: "Mumbai",
    date: "Feb 22, 2024",
    background: <Image src="/images/categories/pari-re2.png" alt="Author profile" width={300} height={400} className="w-full bg-gradient-to-t from-black/80 to-transparent  h-full absolute right-0 top-0 opacity-60 bg-cover" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    category: ["Related"],
    name: "Related Stories",
    title: " Related Stories",
    description: "Explore more stories related to this topic",
    href: "/related-stories",
    cta: "View all",
    languages: ["Available in 6 languages"],
    location: "Pan India",
    date: "Feb 23, 2024",
    background: <Image src="/images/categories/pari-re1.png" alt="Related stories" width={300} height={10} className="w-full bg-gradient-to-t from-black/80 to-transparent  h-full absolute right-0 top-0 opacity-60 bg-cover" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function MakeInIndiaCard0() {
  return (
    <div className="sm:pb-20  px-4  max-w-[1232px] mx-auto border-b-1 border-[#D9D9D9] dark:border-gray-800">
       <div className=' '>
        <div className="flex  flex-col gap-2 py-4 mb-4">
            <div className='flex flex- items-center gap-2'>
                 <Lightbulb className="h-4 w-4 text-red-600" />
                <h2 className="text-13px font-noto-sans uppercase text-gray-400 leading-[100%] letter-spacing-[-2%] font-semibold">This week on PARI</h2>
            </div>
          <h4 className="font-noto-sans text-[56px] font-bold leading-[122%] tracking-[-0.04em]">
            Make in India
          </h4>
          
        </div>
    </div>
    <BentoGrid className="lg:grid-rows-3 max-w-[1232px] p mx-auto">
      {features.map((feature) => (
        <BentoCard 
          key={feature.name} 
          features={[{ title: feature.category[0] }]}
          {...feature}
        />
      ))}
    </BentoGrid>
    </div>
  );
}
