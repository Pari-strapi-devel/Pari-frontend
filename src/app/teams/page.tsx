'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Mail, } from 'lucide-react'
import { FaInstagram, FaXTwitter } from 'react-icons/fa6'


interface TeamMember {
  id: number
  name: string
  role: string
  image?: string
  bio?: string
  email?: string
  instagram?: string
  twitter?: string
}

// Team members data based on the design
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "P. Sainath",
    role: "Trustee & Founder Editor",
    image: "/images/P-Sainath.png",
    bio: "P. Sainath is Founding Trustee, CounterMedia Trust and Founder Editor, People's Archive of Rural India. He has been a rural reporter for decades and is the author of Everybody Loves a Good Drought and The Last Heroes - Foot Soldiers of Indian Freedom.",
    email: "sainath@ruralindiaonline.org",
    instagram: "@psainath_pari",
    twitter: "@PSainath_org"
  },
  {
    id: 2,
    name: "Aayna",
    role: "Reporter",
    image: "",
    bio: "Aayna is a dedicated reporter covering rural stories and social issues across India.",
    email: "aayna@ruralindiaonline.org",
    instagram: "@aayna_pari",
    twitter: "@aayna_pari"
  },
  {
    id: 3,
    name: "Arya Jayan",
    role: "Asst. Editor, Social Media",
    image: "",
    bio: "Arya Jayan manages social media content and assists in editorial work at PARI.",
    email: "arya@ruralindiaonline.org",
    instagram: "@arya_pari",
    twitter: "@arya_pari"
  },
  {
    id: 4,
    name: "Aunshuparna Mustafi",
    role: "Social Media Coordinator, Bangla",
    image: "",
    bio: "Aunshuparna coordinates social media content in Bengali language for PARI.",
    email: "aunshuparna@ruralindiaonline.org",
    instagram: "@aunshuparna_pari",
    twitter: "@aunshuparna_pari"
  },
  {
    id: 5,
    name: "Binaifer Bharucha",
    role: "Photo Editor",
    image: "",
    bio: "Binaifer is responsible for photo editing and visual content curation at PARI.",
    email: "binaifer@ruralindiaonline.org",
    instagram: "@binaifer_pari",
    twitter: "@binaifer_pari"
  },
  {
    id: 6,
    name: "Devesh",
    role: "Language Editor, Hindi",
    image: "",
    bio: "Devesh handles Hindi language content editing and translation work.",
    email: "devesh@ruralindiaonline.org",
    instagram: "@devesh_pari",
    twitter: "@devesh_pari"
  },
  {
    id: 7,
    name: "Dipanjali Singh",
    role: "Senior Assistant Editor",
    image: "",
    bio: "Dipanjali Singh works as a senior assistant editor, overseeing content quality and editorial processes.",
    email: "dipanjali@ruralindiaonline.org",
    instagram: "@dipanjali_pari",
    twitter: "@dipanjali_pari"
  },
  {
    id: 8,
    name: "Jaideep Hardikar",
    role: "Roving Special Correspondent",
    image: "",
    bio: "Jaideep is a roving special correspondent covering environmental and rural issues across India.",
    email: "jaideep@ruralindiaonline.org",
    instagram: "@jaideep_pari",
    twitter: "@jaideep_pari"
  },
  {
    id: 9,
    name: "Joshua Bodhinetra",
    role: "Senior Content Editor",
    image: "",
    bio: "Joshua works as a senior content editor, ensuring high-quality editorial standards.",
    email: "joshua@ruralindiaonline.org",
    instagram: "@joshua_pari",
    twitter: "@joshua_pari"
  },
  {
    id: 10,
    name: "Jyoti Shinoli",
    role: "Senior Reporter",
    image: "",
    bio: "Jyoti is a senior reporter specializing in rural and social issues reporting.",
    email: "jyoti@ruralindiaonline.org",
    instagram: "@jyoti_pari",
    twitter: "@jyoti_pari"
  },
  {
    id: 11,
    name: "Kamaljit Kaur",
    role: "Language Editor, Punjabi",
    image: "",
    bio: "Kamaljit handles Punjabi language content editing and translation work.",
    email: "kamaljit@ruralindiaonline.org",
    instagram: "@kamaljit_pari",
    twitter: "@kamaljit_pari"
  },
  {
    id: 12,
    name: "Kanika Gupta",
    role: "Special Projects Manager",
    image: "",
    bio: "Kanika manages special projects and initiatives at PARI.",
    email: "kanika@ruralindiaonline.org",
    instagram: "@kanika_pari",
    twitter: "@kanika_pari"
  },
  {
    id: 13,
    name: "Keerthivasan",
    role: "Social Media Coordinator, Tamil",
    image: "",
    bio: "Keerthivasan coordinates social media content in Tamil language for PARI.",
    email: "keerthivasan@ruralindiaonline.org",
    instagram: "@keerthivasan_pari",
    twitter: "@keerthivasan_pari"
  },
  {
    id: 14,
    name: "M. Palani Kumar",
    role: "Photo Journalist",
    image: "",
    bio: "M. Palani Kumar is a photo journalist documenting rural life and stories.",
    email: "palani@ruralindiaonline.org",
    instagram: "@palani_pari",
    twitter: "@palani_pari"
  },
  {
    id: 15,
    name: "Medha Kale",
    role: "Language Editor, Marathi",
    image: "",
    bio: "Medha handles Marathi language content editing and translation work.",
    email: "medha@ruralindiaonline.org",
    instagram: "@medha_pari",
    twitter: "@medha_pari"
  },
  {
    id: 16,
    name: "Mohd. Qamar Tabrez",
    role: "Language Editor, Urdu",
    image: "",
    bio: "Mohd. Qamar Tabrez handles Urdu language content editing and translation work.",
    email: "qamar@ruralindiaonline.org",
    instagram: "@qamar_pari",
    twitter: "@qamar_pari"
  }
]

export default function TeamsPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setIsSliderOpen(true)
  }

  const closeSlider = () => {
    setIsSliderOpen(false)
    setTimeout(() => setSelectedMember(null), 300) // Wait for animation to complete
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Our Team
          </h1>
          <p className="text-xl text-muted-foreground">
            PARI: A living journal, a breathing archive
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className=" cursor-pointer  hover:opacity-80 transition-opacity duration-300"
              onClick={() => handleMemberClick(member)}
            >
              {/* Profile Image */}
              <div className="flex flex-col  justify-center max-w-7xl h-64">
              <div className=" w-full h-72 flex mx-auto mb-4 bg-gray-200 rounded-lg overflow-hidden">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={276}
                    height={276}
                    className="w-full h-full object-cover top-0"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Member Info */}
              <h3 className="text-lg px-1 font-semibold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm px-1 text-muted-foreground">
                {member.role}
              </p>
            </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Extended • click here
          </p>
        </div>
      </div>

      {/* Right Side Slider */}
      {selectedMember && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0  bg-opacity-10 z-40 transition-opacity duration-300 ${
              isSliderOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeSlider}
          />

          {/* Slider Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 transform transition-transform duration-300 ease-in-out ${
              isSliderOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={closeSlider}
              className="px-7 py-4 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-primary-PARI-Red" />
            </button>

            {/* Content */}
            <div className="p-8 pt-20 h-full overflow-y-auto">
              {/* Profile Image */}


              <div className="w-full h-76 bg-black rounded-lg overflow-hidden mb-6">
                {selectedMember.image ? (
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-600 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Name and Role */}
              <h2 className="text-2xl font-bold text-primary-PARI-Red mb-2">
                {selectedMember.name}
              </h2>
              <p className="text-foreground text-sm font-semibold mb-4">
                {selectedMember.role}
              </p>

              {/* Bio */}
              {selectedMember.bio && (
                <p className="text-discreet-text text-sm mb-8 leading-relaxed">
                  {selectedMember.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex space-x-4 mb-8">
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Mail className="w-6 h-6 text-white" />
                  </a>
                )}
                {selectedMember.instagram && (
                  <a
                    href={`https://instagram.com/${selectedMember.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <FaInstagram className="w-6 h-6 text-white" />
                  </a>
                )}
                {selectedMember.twitter && (
                  <a
                    href={`https://twitter.com/${selectedMember.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <FaXTwitter className="w-6 h-6" />
                  </a>
                )}
              </div>

              {/* See Stories Button */}
              <button className="w-full bg-primary-PARI-Red text-white py-4 rounded-full font-semibold hover:bg-red-700 transition-colors">
                See Stories
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
