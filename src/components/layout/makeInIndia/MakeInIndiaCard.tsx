import Image from 'next/image';
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";


const features = [
  {
    category: ["Social Justice", 'rohit' ],
    name: "Dalits",
    description: "In Kolhapur district, people of different faiths are reaching out across religions and caste, urging all to embrace humanity",
    href: "/stories/dalits",
    cta: "Read more",
    background: <Image src="/images/placeholder.png" alt="" width={300} height={400}  className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    category: ["Agriculture", "empty"],
    name: "Farming",
    description: "In Totana: 'We must fill our stomach somehow'",
    href: "/stories/farming",
    cta: "Read more",
    background: <Image src="/images/placeholder.png" alt="" width={300} height={400}  className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    category: ["Languages"],
    name: "Available in 6 languages",
    description: "Banaskantha • Dec 8, 2022",
    href: "/languages",
    cta: "Translate",
    background: <Image src="/images/placeholder.png" alt="" width={300} height={400}  className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    category: ["Contributors"],
    name: "Author",
    description: "Umesh Solanki",
    href: "/authors/umesh-solanki",
    cta: "View profile",
    background: <Image src="/images/categories/pari-re1.png" alt="" width={300} height={400}  className="absolute  opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    category: ["Related"],
    name: "+2 Related Stories",
    description: "Explore more stories related to this topic",
    href: "/related-stories",
    cta: "View all",
    background: <Image src="/images/categories/pari-re1.png" alt="" width={300} height={400} className=" w-full h-full absolute right-0 top-0 opacity-60 bg-cover" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function MakeInIndiaCard() {
  return (
    <BentoGrid className="lg:grid-rows-3 max-w-[1232px] mx-auto">
      {features.map((feature) => (
        <BentoCard 
          key={feature.name} 
          features={[{ title: feature.category[0] }]}
          {...feature} 
        />
      ))}
    </BentoGrid>
  );
}
