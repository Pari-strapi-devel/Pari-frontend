'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { formatDate } from '@/lib/utils'
import { BASE_URL } from '@/config'
import { Button } from "@/components/ui/button"
import { languages as allLanguages } from '@/data/languages'
import { useLocale } from '@/lib/locale'
import { API_BASE_URL } from '@/utils/constants'
import axios from 'axios'
import qs from 'qs'
import { ArticleData } from '@/components/articles/ArticlesContent'
import { StoryCard } from '@/components/layout/stories/StoryCard'
import { FiShare2, FiMail } from 'react-icons/fi'
import { FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6'
import { Printer, Image as ImageIcon, ZoomIn } from 'lucide-react'

// Labels for credits and donation (English only)
const CREDIT_LABELS_EN: Record<string, string> = {
  author: 'AUTHOR',
  editor: 'EDITOR',
  photoEditor: 'PHOTO EDITOR',
  seeAllCredits: 'See all credits',
  seeMoreStories: 'See more stories',
  donateToPARI: 'Donate to PARI',
  donateDisclaimer: 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
  online: 'Online',
  cheque: 'Cheque',
  bankTransfer: 'Bank Transfer',
  monthly: 'Monthly',
  yearly: 'Yearly',
  oneTime: 'One-time',
  nameOnAadhar: 'Name as on Aadhar card',
  phoneNumber: 'Phone number',
  emailAddress: 'Email address',
  citizenConfirm: 'I confirm that I am a citizen of India',
  confirmAndPay: 'Confirm & Pay',
}


/*
// Translation map for credits section labels
const creditsTranslations: { [locale: string]: { [key: string]: string } } = {
  'en': {
    'author': 'AUTHOR',
    'editor': 'EDITOR',
    'photoEditor': 'PHOTO EDITOR',
    'seeAllCredits': 'See all credits',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'hi': {
    'author': 'लेखक',
    'editor': 'संपादक',
    'photoEditor': 'फोटो संपादक',
    'seeAllCredits': 'सभी क्रेडिट देखें',
    'seeMoreStories': 'और कहानियां देखें',
    'donateToPARI': 'पारी को दान करें',
    'donateDisclaimer': 'सभी दानकर्ता आयकर अधिनियम की धारा 80जी के तहत कर छूट के हकदार होंगे। कृपया सबमिट करने से पहले अपना ईमेल पता दोबारा जांच लें।',
    'online': 'ऑनलाइन',
    'cheque': 'चेक',
    'bankTransfer': 'बैंक ट्रांसफर',
    'monthly': 'मासिक',
    'yearly': 'वार्षिक',
    'oneTime': 'एक बार',
    'nameOnAadhar': 'आधार कार्ड पर नाम',
    'phoneNumber': 'फोन नंबर',
    'emailAddress': 'ईमेल पता',
    'citizenConfirm': 'मैं पुष्टि करता हूं कि मैं भारत का नागरिक हूं',
    'confirmAndPay': 'पुष्टि करें और भुगतान करें'
  },
  'mr': {
    'author': 'लेखक',
    'editor': 'संपादक',
    'photoEditor': 'फोटो संपादक',
    'seeAllCredits': 'सर्व क्रेडिट पहा',
    'seeMoreStories': 'अधिक कथा पहा',
    'donateToPARI': 'पारीला देणगी द्या',
    'donateDisclaimer': 'सर्व देणगीदार आयकर कायद्याच्या कलम 80जी अंतर्गत कर सवलतीसाठी पात्र असतील. कृपया सबमिट करण्यापूर्वी आपला ईमेल पत्ता तपासा.',
    'online': 'ऑनलाइन',
    'cheque': 'धनादेश',
    'bankTransfer': 'बँक हस्तांतरण',
    'monthly': 'मासिक',
    'yearly': 'वार्षिक',
    'oneTime': 'एकदा',
    'nameOnAadhar': 'आधार कार्डवरील नाव',
    'phoneNumber': 'फोन नंबर',
    'emailAddress': 'ईमेल पत्ता',
    'citizenConfirm': 'मी पुष्टी करतो की मी भारताचा नागरिक आहे',
    'confirmAndPay': 'पुष्टी करा आणि पैसे द्या'
  },
  'bn': {
    'author': 'লেখক',
    'editor': 'সম্পাদক',
    'photoEditor': 'ফটো সম্পাদক',
    'seeAllCredits': 'সমস্ত ক্রেডিট দেখুন',
    'seeMoreStories': 'আরও গল্প দেখুন',
    'donateToPARI': 'পারিকে দান করুন',
    'donateDisclaimer': 'সমস্ত দাতা আয়কর আইনের ধারা 80জি-এর অধীনে কর ছাড়ের অধিকারী হবেন। দয়া করে জমা দেওয়ার আগে আপনার ইমেল ঠিকানা দুবার পরীক্ষা করুন।',
    'online': 'অনলাইন',
    'cheque': 'চেক',
    'bankTransfer': 'ব্যাংক স্থানান্তর',
    'monthly': 'মাসিক',
    'yearly': 'বার্ষিক',
    'oneTime': 'একবার',
    'nameOnAadhar': 'আধার কার্ডে নাম',
    'phoneNumber': 'ফোন নম্বর',
    'emailAddress': 'ইমেল ঠিকানা',
    'citizenConfirm': 'আমি নিশ্চিত করছি যে আমি ভারতের নাগরিক',
    'confirmAndPay': 'নিশ্চিত করুন এবং পেমেন্ট করুন'
  },
  'ta': {
    'author': 'ஆசிரியர்',
    'editor': 'தொகுப்பாளர்',
    'photoEditor': 'புகைப்பட தொகுப்பாளர்',
    'seeAllCredits': 'அனைத்து வரவுகளையும் காண்க',
    'seeMoreStories': 'மேலும் கதைகளைக் காண்க',
    'donateToPARI': 'பாரிக்கு நன்கொடை அளிக்கவும்',
    'donateDisclaimer': 'அனைத்து நன்கொடையாளர்களும் வருமான வரிச் சட்டத்தின் பிரிவு 80ஜி-யின் கீழ் வரி விலக்குகளுக்கு தகுதியுடையவர்கள். சமர்ப்பிக்கும் முன் உங்கள் மின்னஞ்சல் முகவரியை இருமுறை சரிபார்க்கவும்.',
    'online': 'ஆன்லைன்',
    'cheque': 'காசோலை',
    'bankTransfer': 'வங்கி பரிமாற்றம்',
    'monthly': 'மாதாந்திர',
    'yearly': 'ஆண்டு',
    'oneTime': 'ஒரு முறை',
    'nameOnAadhar': 'ஆதார் அட்டையில் உள்ள பெயர்',
    'phoneNumber': 'தொலைபேசி எண்',
    'emailAddress': 'மின்னஞ்சல் முகவரி',
    'citizenConfirm': 'நான் இந்தியாவின் குடிமகன் என்பதை உறுதிப்படுத்துகிறேன்',
    'confirmAndPay': 'உறுதிப்படுத்தி பணம் செலுத்துங்கள்'
  },
  'te': {
    'author': 'రచయిత',
    'editor': 'సంపాదకుడు',
    'photoEditor': 'ఫోటో ఎడిటర్',
    'seeAllCredits': 'అన్ని క్రెడిట్‌లను చూడండి',
    'seeMoreStories': 'మరిన్ని కథలను చూడండి',
    'donateToPARI': 'పారికి విరాళం ఇవ్వండి',
    'donateDisclaimer': 'దాతలందరూ ఆదాయపు పన్ను చట్టంలోని సెక్షన్ 80జి కింద పన్ను మినహాయింపులకు అర్హులు. దయచేసి సమర్పించే ముందు మీ ఇమెయిల్ చిరునామాను రెండుసార్లు తనిఖీ చేయండి.',
    'online': 'ఆన్‌లైన్',
    'cheque': 'చెక్కు',
    'bankTransfer': 'బ్యాంక్ బదిలీ',
    'monthly': 'నెలవారీ',
    'yearly': 'వార్షిక',
    'oneTime': 'ఒకసారి',
    'nameOnAadhar': 'ఆధార్ కార్డులో పేరు',
    'phoneNumber': 'ఫోన్ నంబర్',
    'emailAddress': 'ఇమెయిల్ చిరునామా',
    'citizenConfirm': 'నేను భారతదేశ పౌరుడిని అని నిర్ధారిస్తున్నాను',
    'confirmAndPay': 'నిర్ధారించండి మరియు చెల్లించండి'
  },
  'kn': {
    'author': 'ಲೇಖಕ',
    'editor': 'ಸಂಪಾದಕ',
    'photoEditor': 'ಫೋಟೋ ಸಂಪಾದಕ',
    'seeAllCredits': 'ಎಲ್ಲಾ ಕ್ರೆಡಿಟ್‌ಗಳನ್ನು ನೋಡಿ',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'ml': {
    'author': 'രചയിതാവ്',
    'editor': 'എഡിറ്റർ',
    'photoEditor': 'ഫോട്ടോ എഡിറ്റർ',
    'seeAllCredits': 'എല്ലാ ക്രെഡിറ്റുകളും കാണുക',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'gu': {
    'author': 'લેખક',
    'editor': 'સંપાદક',
    'photoEditor': 'ફોટો સંપાદક',
    'seeAllCredits': 'બધા ક્રેડિટ જુઓ',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'pa': {
    'author': 'ਲੇਖਕ',
    'editor': 'ਸੰਪਾਦਕ',
    'photoEditor': 'ਫੋਟੋ ਸੰਪਾਦਕ',
    'seeAllCredits': 'ਸਾਰੇ ਕ੍ਰੈਡਿਟ ਦੇਖੋ',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'or': {
    'author': 'ଲେଖକ',
    'editor': 'ସମ୍ପାଦକ',
    'photoEditor': 'ଫଟୋ ସମ୍ପାଦକ',
    'seeAllCredits': 'ସମସ୍ତ କ୍ରେଡିଟ୍ ଦେଖନ୍ତୁ',
    'seeMoreStories': 'ଅଧିକ କାହାଣୀ ଦେଖନ୍ତୁ',
    'donateToPARI': 'ପାରିକୁ ଦାନ କରନ୍ତୁ',
    'donateDisclaimer': 'ସମସ୍ତ ଦାତା ଆୟକର ଆଇନର ଧାରା 80ଜି ଅଧୀନରେ କର ଛାଡ଼ ପାଇବାକୁ ହକଦାର ହେବେ। ଦୟାକରି ଦାଖଲ କରିବା ପୂର୍ବରୁ ଆପଣଙ୍କର ଇମେଲ ଠିକଣା ଦୁଇଥର ଯାଞ୍ଚ କରନ୍ତୁ।',
    'online': 'ଅନଲାଇନ୍',
    'cheque': 'ଚେକ୍',
    'bankTransfer': 'ବ୍ୟାଙ୍କ ସ୍ଥାନାନ୍ତର',
    'monthly': 'ମାସିକ',
    'yearly': 'ବାର୍ଷିକ',
    'oneTime': 'ଥରେ',
    'nameOnAadhar': 'ଆଧାର କାର୍ଡରେ ନାମ',
    'phoneNumber': 'ଫୋନ୍ ନମ୍ବର',
    'emailAddress': 'ଇମେଲ୍ ଠିକଣା',
    'citizenConfirm': 'ମୁଁ ନିଶ୍ଚିତ କରୁଛି ଯେ ମୁଁ ଭାରତର ନାଗରିକ',
    'confirmAndPay': 'ନିଶ୍ଚିତ କରନ୍ତୁ ଏବଂ ଦେୟ ଦିଅନ୍ତୁ'
  },
  'as': {
    'author': 'লেখক',
    'editor': 'সম্পাদক',
    'photoEditor': 'ফটো সম্পাদক',
    'seeAllCredits': 'সকলো ক্ৰেডিট চাওক',
    'seeMoreStories': 'See more stories',
    'donateToPARI': 'Donate to PARI',
    'donateDisclaimer': 'All donors will be entitled to tax exemptions under Section-80G of the Income Tax Act. Please double check your email address before submitting.',
    'online': 'Online',
    'cheque': 'Cheque',
    'bankTransfer': 'Bank Transfer',
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'oneTime': 'One-time',
    'nameOnAadhar': 'Name as on Aadhar card',
    'phoneNumber': 'Phone number',
    'emailAddress': 'Email address',
    'citizenConfirm': 'I confirm that I am a citizen of India',
    'confirmAndPay': 'Confirm & Pay'
  },
  'ur': {
    'author': 'مصنف',
    'editor': 'ایڈیٹر',
    'photoEditor': 'فوٹو ایڈیٹر',
    'seeAllCredits': 'تمام کریڈٹ دیکھیں',
    'seeMoreStories': 'مزید کہانیاں دیکھیں',
    'donateToPARI': 'پاری کو عطیہ دیں',
    'donateDisclaimer': 'تمام عطیہ دہندگان انکم ٹیکس ایکٹ کی دفعہ 80جی کے تحت ٹیکس میں چھوٹ کے حقدار ہوں گے۔ براہ کرم جمع کرانے سے پہلے اپنا ای میل پتہ دوبارہ چیک کریں۔',
    'online': 'آن لائن',
    'cheque': 'چیک',
    'bankTransfer': 'بینک ٹرانسفر',
    'monthly': 'ماہانہ',
    'yearly': 'سالانہ',
    'oneTime': 'ایک بار',
    'nameOnAadhar': 'آدھار کارڈ پر نام',
    'phoneNumber': 'فون نمبر',
    'emailAddress': 'ای میل پتہ',
    'citizenConfirm': 'میں تصدیق کرتا ہوں کہ میں ہندوستان کا شہری ہوں',
    'confirmAndPay': 'تصدیق کریں اور ادائیگی کریں'
  }
}
*/

// Helper function to get label
function getTranslatedLabel(key: string, _locale: string): string {
  void _locale
  return CREDIT_LABELS_EN[key] || key
}

// Define the order of author roles for sorting (original roles)
const AUTHOR_ROLE_ORDER = [
  // Author roles
  'Author',
  'Author and Photographer',
  'Author and Video Editor',
  'Reporter',
  'Reporters',
  'Reporting',
  'Student Reporter',
  'Reporting and Cover Illustration',
  'Text',
  'Text and Illustrations',

  // Documentary/Video/Photo roles
  'Documentary',
  'Video',
  'Photographer',
  'Photographs',
  'Photos and Illustration',
  'Photos and Text',
  'Photos and Video',

  // Poem roles
  'Poem',
  'Poem and Text',
  'Poems and Text',
  'Poems and Text in Hindi',

  // Illustration/Art roles
  'Illustration',
  'Illustrations',
  'Lead Illustration',
  'Painting',
  'Paintings',

  // Team roles
  'Pari Video Team',
  'PARI Education Team',

  // Editor roles
  'Editor',
  'Editors',
  'Editor and Series Editor',
  'Text Editor',

  // Series roles
  'Series Curator',
  'Series Editor',
  'Series Editors',

  // Translation roles
  'English Translation',

  // Photo Editor
  'Photo Editor',

  // Video roles
  'Video Producer',
  'Video Editor',

  // Translation roles
  'Translation',
  'Translator'
]

// Define the order of simplified roles for display
const SIMPLIFIED_ROLE_ORDER = [
  'AUTHOR',
  'PHOTOGRAPHER',
  'VIDEO',
  'POEM',
  'ILLUSTRATION',
  'TEAM',
  'EDITOR',
  'SERIES EDITOR',
  'PHOTO EDITOR',
  'TRANSLATION'
]

// Helper function to map specific roles to simplified categories
function getSimplifiedRole(role: string): string {
  const roleLower = role.toLowerCase()

  // Author-related roles
  if (roleLower.includes('author') || roleLower.includes('reporter') ||
      roleLower.includes('reporting') || roleLower === 'text' ||
      roleLower.includes('text and')) {
    return 'AUTHOR'
  }

  // Photographer-related roles
  if (roleLower.includes('photograph') || roleLower.includes('photos')) {
    return 'PHOTOGRAPHER'
  }

  // Video/Documentary roles
  if (roleLower.includes('video') || roleLower.includes('documentary')) {
    return 'VIDEO'
  }

  // Poem roles
  if (roleLower.includes('poem')) {
    return 'POEM'
  }

  // Illustration/Art roles
  if (roleLower.includes('illustration') || roleLower.includes('painting')) {
    return 'ILLUSTRATION'
  }

  // Editor roles
  if (roleLower.includes('editor') && !roleLower.includes('photo') && !roleLower.includes('video')) {
    return 'EDITOR'
  }

  // Series roles
  if (roleLower.includes('series')) {
    return 'SERIES EDITOR'
  }

  // Translation roles
  if (roleLower.includes('translation') || roleLower.includes('translator')) {
    return 'TRANSLATION'
  }

  // Photo Editor
  if (roleLower.includes('photo editor')) {
    return 'PHOTO EDITOR'
  }

  // Team roles
  if (roleLower.includes('team')) {
    return 'TEAM'
  }

  // Default: return the original role in uppercase
  return role.toUpperCase()
}

// Helper function to sort authors by role order
function sortAuthorsByRole(authors: Array<{
  name: string;
  title: string;
  bio?: string;
  email?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}>) {
  return [...authors].sort((a, b) => {
    const indexA = AUTHOR_ROLE_ORDER.indexOf(a.title)
    const indexB = AUTHOR_ROLE_ORDER.indexOf(b.title)

    // If both roles are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only A is in the list, it comes first
    if (indexA !== -1) return -1

    // If only B is in the list, it comes first
    if (indexB !== -1) return 1

    // If neither is in the list, maintain original order
    return 0
  })
}

// Helper function to group authors by role
function groupAuthorsByRole(authors: Array<{
  name: string;
  title: string;
  bio?: string;
  email?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}>) {
  // First sort the authors by original role
  const sortedAuthors = sortAuthorsByRole(authors)

  // Group authors by simplified role while maintaining order
  const groupedMap = new Map<string, Array<{
    name: string;
    title: string;
    bio?: string;
    email?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  }>>()

  sortedAuthors.forEach(author => {
    const originalRole = author.title || 'Author'
    const simplifiedRole = getSimplifiedRole(originalRole)

    if (!groupedMap.has(simplifiedRole)) {
      groupedMap.set(simplifiedRole, [])
    }
    groupedMap.get(simplifiedRole)!.push(author)
  })

  // Convert map to array of grouped authors
  const grouped: Array<{
    names: string[];
    title: string;
    bios: string[];
    emails: string[];
    twitters: string[];
    facebooks: string[];
    instagrams: string[];
    linkedins: string[];
  }> = []

  groupedMap.forEach((authorsInRole, role) => {
    grouped.push({
      names: authorsInRole.map(a => a.name),
      title: role,
      bios: authorsInRole.map(a => a.bio || ''),
      emails: authorsInRole.map(a => a.email || ''),
      twitters: authorsInRole.map(a => a.twitter || ''),
      facebooks: authorsInRole.map(a => a.facebook || ''),
      instagrams: authorsInRole.map(a => a.instagram || ''),
      linkedins: authorsInRole.map(a => a.linkedin || '')
    })
  })

  // Sort the grouped array by simplified role order
  return grouped.sort((a, b) => {
    const indexA = SIMPLIFIED_ROLE_ORDER.indexOf(a.title)
    const indexB = SIMPLIFIED_ROLE_ORDER.indexOf(b.title)

    // If both roles are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only A is in the list, it comes first
    if (indexA !== -1) return -1

    // If only B is in the list, it comes first
    if (indexB !== -1) return 1

    // If neither is in the list, maintain original order
    return 0
  })
}


// Utility function to clean HTML while preserving original structure and tags
function stripHtmlCssWithStyledStrong(text: string): string {
  if (typeof text !== 'string') return text;

  let result = text;

  // Only remove style and script tags (dangerous content)
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove inline style attributes only
  result = result.replace(/\s*style\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s*style\s*=\s*'[^']*'/gi, '');

  // Keep all original HTML tags: <p>, <strong>, <b>, <em>, <i>, <a>, <br>, etc.
  // Just clean up any unwanted attributes from tags (except href for links)

  // Clean p tags but keep them
  result = result.replace(/<p[^>]*>/gi, '<p>');

  // Clean strong/b/em/i tags but keep them
  result = result.replace(/<strong[^>]*>/gi, '<strong>');
  result = result.replace(/<b[^>]*>/gi, '<b>');
  result = result.replace(/<em[^>]*>/gi, '<em>');
  result = result.replace(/<i[^>]*>/gi, '<i>');

  // Keep <a> tags with href attribute
  result = result.replace(/<a\s+[^>]*href\s*=\s*"([^"]*)"[^>]*>/gi, '<a href="$1">');
  result = result.replace(/<a\s+[^>]*href\s*=\s*'([^']*)'[^>]*>/gi, '<a href="$1">');

  // Clean br tags
  result = result.replace(/<br\s*\/?>/gi, '<br>');

  // Handle nbsp
  result = result.replace(/&nbsp;/gi, ' ');

  // Remove div and span tags but keep their content
  result = result.replace(/<\/?div[^>]*>/gi, '');
  result = result.replace(/<\/?span[^>]*>/gi, '');

  return result;
}

// Utility function to strip HTML/CSS without wrapping in <p> tags (for blockquotes, captions, etc.)
function stripHtmlCssNoParagraphs(text: string): string {
  if (typeof text !== 'string') return text;

  let result = text;

  // Remove style and script tags
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove inline style attributes only
  result = result.replace(/\s*style\s*=\s*"[^"]*"/gi, '');
  result = result.replace(/\s*style\s*=\s*'[^']*'/gi, '');

  // Keep formatting tags: strong, b, em, i
  result = result.replace(/<strong[^>]*>/gi, '<strong>');
  result = result.replace(/<b[^>]*>/gi, '<b>');
  result = result.replace(/<em[^>]*>/gi, '<em>');
  result = result.replace(/<i[^>]*>/gi, '<i>');

  // Keep <a> tags with href attribute
  result = result.replace(/<a\s+[^>]*href\s*=\s*"([^"]*)"[^>]*>/gi, '<a href="$1">');
  result = result.replace(/<a\s+[^>]*href\s*=\s*'([^']*)'[^>]*>/gi, '<a href="$1">');

  // Clean br tags
  result = result.replace(/<br\s*\/?>/gi, '<br>');

  // Handle nbsp
  result = result.replace(/&nbsp;/gi, ' ');

  // Remove div, span, p tags but keep content
  result = result.replace(/<\/?div[^>]*>/gi, '');
  result = result.replace(/<\/?span[^>]*>/gi, '');
  result = result.replace(/<\/?p[^>]*>/gi, ' ');

  // Clean up extra whitespace
  result = result.replace(/\s+/g, ' ');

  return result.trim();
}

// Content interfaces
interface ContentParagraph {
  attributes?: {
    text?: string;
  };
  text?: string;
  content?: string;
  __component?: string;
}

interface ExtendedContentItem extends Record<string, unknown> {
  __component?: string;
  Text?: string;
  text?: string;
  content?: string;
  attributes?: {
    text?: string;
  } | string;
}

type FilterableContentItem = string | ContentParagraph | ExtendedContentItem

// Extended ArticleData interface that includes Modular_Content
interface ExtendedArticleData extends ArticleData {
  attributes: ArticleData['attributes'] & {
    Modular_Content?: (string | ContentParagraph | ExtendedContentItem)[];
    locale?: string;
    localizations?: {
      data?: Array<{
        attributes?: {
          locale: string;
          slug: string;
          title?: string;
        };
      }>;
    };
    Related_stories?: {
      data?: Array<ArticleData>;
    };
  };
}

interface StoryDetailProps {
  slug: string;
}

export default function StoryDetail({ slug }: StoryDetailProps) {
  const [story, setStory] = useState<{
    title: string;
    subtitle: string;
    publishedDate: string;
    authors: Array<{
      name: string;
      title: string;
      bio?: string;
      email?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    }>;
    content: (string | ContentParagraph | ExtendedContentItem)[];
    coverImage?: string;
    categories?: Array<{ title: string; slug: string }>;
    location?: string;
    availableLanguages?: Array<{ code: string; slug: string }>;
    relatedStoriesData?: ArticleData[];
    isStudent?: boolean;
    storyLocale?: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(18)
  const [showPhotos, setShowPhotos] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showHeaderBar, setShowHeaderBar] = useState(false)
  // const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<Array<{ code: string; slug: string }>>([])
  const [hasMultipleLanguages, setHasMultipleLanguages] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)
  const [showCard, setShowCard] = useState(true)
  const [relatedStories, setRelatedStories] = useState<Array<{
    title: string;
    description: string;
    authors: string;
    imageUrl: string;
    categories: Array<{ title: string; slug: string }>;
    slug: string;
    location: string;
    date: string;
    availableLanguages?: Array<{ code: string; name: string; slug: string }>;
  }>>([])
  const [groupedAuthors, setGroupedAuthors] = useState<Array<{
    names: string[];
    title: string;
    bios: string[];
    emails: string[];
    twitters: string[];
    facebooks: string[];
    instagrams: string[];
    linkedins: string[];
  }>>([])
  const [showAllCategories, setShowAllCategories] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { language: currentLocale, addLocaleToUrl } = useLocale()

  // Get locale from URL search params to trigger re-render on language change
  const urlLocale = searchParams?.get('locale') || 'en'

  // Extract locale from slug (same logic as fetchStoryBySlug)
  const getLocaleFromSlug = (slug: string): string => {
    const localeMatch = slug.match(/-(en|hi|mr|ta|te|kn|ml|bn|gu|guj|pa|or|as|ur|bho|hne|chh|tam|tel|kan|mal|ben|ori|asm)$/)
    const detectedLocale = localeMatch ? localeMatch[1] : 'en'

    // Normalize 3-letter codes to 2-letter codes
    const localeMap: { [key: string]: string } = {
      'guj': 'gu',
      'tam': 'ta',
      'tel': 'te',
      'kan': 'kn',
      'mal': 'ml',
      'ben': 'bn',
      'ori': 'or',
      'asm': 'as'
    }

    return localeMap[detectedLocale] || detectedLocale
  }

  // Get current article locale from slug
  const currentArticleLocale = getLocaleFromSlug(slug)

  // State for credits modal - Always open by default
  const [showCreditsModal, setShowCreditsModal] = useState(true)

  // State for image modal
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; caption?: string } | null>(null)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [allContentImages, setAllContentImages] = useState<Array<{ src: string; alt: string; caption?: string }>>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageAnimating, setImageAnimating] = useState(false)

  // Collect all images from content when story loads
  useEffect(() => {
    if (story?.content) {
      const images: Array<{ src: string; alt: string; caption?: string }> = []

      story.content.forEach((paragraph) => {
        if (!paragraph || typeof paragraph !== 'object') return

        const obj = paragraph as ExtendedContentItem

        // Extract images from different component types
        if (obj.__component === 'shared.media' || obj.__component === 'modular-content.media') {
          const mediaImages = extractMultipleImages(paragraph)
          mediaImages.forEach(img => {
            images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption })
          })
        } else if (obj.__component === 'modular-content.single-caption-mul-img') {
          const multiImages = extractMultipleImages(paragraph)
          multiImages.forEach(img => {
            images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption })
          })
        } else if (obj.__component === 'modular-content.multiple-caption-mul-img') {
          const multiCaptionImages = extractMultipleImages(paragraph)
          multiCaptionImages.forEach(img => {
            images.push({ src: img.url, alt: img.alt || img.caption || 'Article image', caption: img.caption })
          })
        } else if (obj.__component === 'shared.quote') {
          const quoteImageData = extractImageData(obj)
          if (quoteImageData) {
            images.push({ src: quoteImageData.url, alt: quoteImageData.alt || 'Quote image', caption: quoteImageData.caption })
          }
        } else if (obj.__component === 'shared.rich-text') {
          // Extract images from rich text content
          const content = obj.content || obj.text || obj.Text || ''
          const imgRegex = /<img[^>]+src="([^">]+)"[^>]*alt="([^"]*)"[^>]*>/g
          let match
          while ((match = imgRegex.exec(content)) !== null) {
            images.push({ src: match[1], alt: match[2] || 'Article image' })
          }
        }
      })

      console.log('##Rohit_Rocks## Total images collected for modal navigation:', images.length)
      console.log('##Rohit_Rocks## Images:', images)
      setAllContentImages(images)
    }
  }, [story?.content])

  // Stop animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Track scroll progress and header visibility
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - windowHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(progress)

      // Show header bar after scrolling 200px
      setShowHeaderBar(scrollTop > 200)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load story when slug or URL locale changes
  // urlLocale is from URL search params and triggers re-render when language changes
  useEffect(() => {
    async function loadStory() {
      try {
        setIsLoading(true)

        console.log('##Rohit_Rocks## Loading story with slug:', slug, 'URL locale:', urlLocale, 'currentLocale:', currentLocale)
        const fetchedStory = await fetchStoryBySlug(slug)
        console.log('##Rohit_Rocks## Fetched story:', fetchedStory.title)
        console.log('##Rohit_Rocks## Available languages:', fetchedStory.availableLanguages)
        setStory(fetchedStory)

        // Group authors by role
        if (fetchedStory.authors && fetchedStory.authors.length > 0) {
          const grouped = groupAuthorsByRole(fetchedStory.authors)
          console.log('##Rohit_Rocks## Grouped authors:', grouped)
          setGroupedAuthors(grouped)
        }

        // Set available languages - only show languages that exist for this article
        if (fetchedStory.availableLanguages && fetchedStory.availableLanguages.length > 0) {
          // Filter to only include languages that have valid data
          const validLanguages = fetchedStory.availableLanguages.filter(lang =>
            lang.code && lang.slug && allLanguages.find(l => l.code === lang.code)
          )

          console.log('##Rohit_Rocks## Valid languages:', validLanguages)
          setAvailableLanguages(validLanguages)
          // Show language button if there's at least 1 language available
          setHasMultipleLanguages(validLanguages.length >= 1)

        }

      } catch {
        setError('Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadStory()
    }
  }, [slug, urlLocale, currentLocale])

  // Fetch related stories dynamically based on author, title, and category
  useEffect(() => {
    const fetchRelatedStories = async () => {
      if (!story) {
        setRelatedStories([])
        return
      }

      try {
        // First, try to use manually curated related stories from API
        if (story.relatedStoriesData && story.relatedStoriesData.length > 0) {
          console.log('##Rohit_Rocks## Total related stories from API:', story.relatedStoriesData.length)

          // Create a map to track unique articles by their ID
          // This helps us avoid showing the same article in different languages
          const uniqueArticleIds = new Set<number>()
          const seenSlugs = new Set<string>()

          // Filter to show only English language stories and avoid duplicates
          const englishStories = story.relatedStoriesData.filter((article: ArticleData) => {
            const locale = article.attributes.locale || 'en'
            const articleId = article.id
            const slug = article.attributes.slug

            console.log('##Rohit_Rocks## Article:', article.attributes.Title, '| Locale:', locale, '| ID:', articleId, '| Slug:', slug)

            // Skip if not English
            if (locale !== 'en') {
              return false
            }

            // Skip if we've already seen this article ID or a very similar slug
            // (to avoid showing translations of the same article)
            const baseSlug = slug.replace(/-(en|hi|mr|ta|te|kn|ml|bn|gu|guj|pa|or|as|ur|bho|hne|chh)$/, '')
            if (uniqueArticleIds.has(articleId) || seenSlugs.has(baseSlug)) {
              return false
            }

            uniqueArticleIds.add(articleId)
            seenSlugs.add(baseSlug)
            return true
          })

          console.log('##Rohit_Rocks## English stories after filter:', englishStories.length)

          const formattedStories = englishStories.slice(0, 4).map((article: ArticleData) => {
            const attrs = article.attributes
            const coverImage = attrs.Cover_image?.data?.attributes?.url

            // Handle Authors - check if it's an array
            let authors = ''
            if (Array.isArray(attrs.Authors)) {
              authors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                author.author_name?.data?.attributes?.Name || ''
              ).filter(Boolean).join(', ') || ''
            }

            const categories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string; slug?: string } }) => ({
              title: cat.attributes?.Title || '',
              slug: cat.attributes?.slug || ''
            })).filter(cat => cat.title) || []

            const locationName = attrs.location?.data?.attributes?.name || ''
            const locationDistrict = attrs.location?.data?.attributes?.district || ''
            const locationState = attrs.location?.data?.attributes?.state || ''
            const location = [locationName, locationDistrict, locationState].filter(Boolean).join(', ')

            // Get available languages from localizations
            let availableLanguages: Array<{ code: string; name: string; slug: string }> = []

            if (attrs.localizations) {
              // Handle both possible structures of localizations
              const localizationsArray = Array.isArray(attrs.localizations)
                ? attrs.localizations
                : attrs.localizations.data || []

              const mappedLocalizations = localizationsArray
                .filter((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                  const locale = loc.attributes?.locale || loc.locale
                  const slug = loc.attributes?.slug || loc.slug
                  return locale && slug
                })
                .map((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                  const locale = loc.attributes?.locale || loc.locale || 'en'
                  const slug = loc.attributes?.slug || loc.slug || ''
                  return {
                    code: locale,
                    name: allLanguages.find(l => l.code === locale)?.names[0] || locale.toUpperCase(),
                    slug: slug
                  }
                })

              // Add current article as first language (assuming current locale)
              availableLanguages = [
                {
                  code: currentLocale,
                  name: allLanguages.find(l => l.code === currentLocale)?.names[0] || currentLocale.toUpperCase(),
                  slug: attrs.slug || ''
                },
                ...mappedLocalizations.filter(loc => loc.code !== currentLocale)
              ]
            }

            return {
              title: attrs.Title || '',
              description: attrs.Strap || '',
              authors,
              imageUrl: coverImage ? `${API_BASE_URL}${coverImage}` : '',
              categories,
              slug: attrs.slug || '',
              location,
              date: attrs.Original_published_date ? formatDate(attrs.Original_published_date) : '',
              availableLanguages: availableLanguages.length > 1 ? availableLanguages : undefined
            }
          })

          setRelatedStories(formattedStories)
          return
        }

        // If no curated stories, fetch dynamically based on similarity scoring
        // Fetch only English language articles
        const allArticles: ArticleData[] = []

        // Fetch only English articles
        try {
          const query = {
            locale: 'en', // Only fetch English articles
            populate: {
              Cover_image: {
                fields: ['url']
              },
              is_student: true,
              Authors: {
                populate: {
                  author_name: {
                    fields: ['Name']
                  }
                }
              },
              categories: {
                fields: ['Title', 'slug']
              },
              location: {
                fields: ['name', 'district', 'state']
              },
              localizations: {
                fields: ['locale', 'slug']
              }
            },
            filters: {
              Title: {
                $ne: story.title // Exclude current story
              }
            },
            pagination: {
              limit: 40 // Fetch more articles to have better selection
            },
            sort: ['Original_published_date:desc']
          }

          const queryString = qs.stringify(query, { encodeValuesOnly: true })
          const apiUrl = `${BASE_URL}api/articles?${queryString}`

          const response = await axios.get(apiUrl)

          if (response.data?.data && response.data.data.length > 0) {
            allArticles.push(...response.data.data)
          }
        } catch {
          // No articles found
        }

        if (allArticles.length > 0) {
          // Calculate similarity score for each article
          interface ScoredArticle {
            article: ArticleData;
            score: number;
            matchDetails: {
              authorMatch: boolean;
              categoryMatches: number;
              locationMatch: boolean;
              titleSimilarity: number;
            };
          }

          const scoredArticles: ScoredArticle[] = allArticles.map((article: ArticleData) => {
            const attrs = article.attributes
            let score = 0
            const matchDetails = {
              authorMatch: false,
              categoryMatches: 0,
              locationMatch: false,
              titleSimilarity: 0
            }

            // 1. Author match (highest weight: 40 points)
            if (Array.isArray(attrs.Authors) && story.authors.length > 0) {
              const articleAuthors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                author.author_name?.data?.attributes?.Name || ''
              ).filter(Boolean)

              const hasAuthorMatch = story.authors.some(storyAuthor =>
                articleAuthors.some(articleAuthor =>
                  articleAuthor.toLowerCase().includes(storyAuthor.name.toLowerCase()) ||
                  storyAuthor.name.toLowerCase().includes(articleAuthor.toLowerCase())
                )
              )

              if (hasAuthorMatch) {
                score += 40
                matchDetails.authorMatch = true
              }
            }

            // 2. Category matches (30 points per matching category, max 60 points)
            if (story.categories && story.categories.length > 0) {
              const articleCategories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string } }) =>
                cat.attributes?.Title || ''
              ).filter(Boolean) || []

              const matchingCategories = story.categories.filter(cat =>
                articleCategories.some(artCat => artCat.toLowerCase() === cat.title.toLowerCase())
              )

              matchDetails.categoryMatches = matchingCategories.length
              score += matchingCategories.length * 30
            }

            // 3. Location match (20 points)
            if (story.location) {
              const articleLocation = attrs.location?.data?.attributes?.name ||
                                     attrs.location_auto_suggestion || ''

              if (articleLocation && story.location.toLowerCase().includes(articleLocation.toLowerCase())) {
                score += 20
                matchDetails.locationMatch = true
              }
            }

            // 4. Title keyword similarity (up to 20 points)
            const currentTitleWords = story.title.toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3) // Only words longer than 3 chars
              .filter(word => !['the', 'and', 'for', 'with', 'from', 'that', 'this', 'their', 'have', 'been'].includes(word))

            const articleTitle = (attrs.Title || '').toLowerCase()
            const matchingWords = currentTitleWords.filter(word => articleTitle.includes(word))

            if (matchingWords.length > 0 && currentTitleWords.length > 0) {
              const titleSimilarity = (matchingWords.length / currentTitleWords.length) * 20
              score += titleSimilarity
              matchDetails.titleSimilarity = titleSimilarity
            }

            return {
              article,
              score,
              matchDetails
            }
          })

          // Sort by score (highest first) and take top 4
          const topRelatedArticles = scoredArticles
            .filter(item => item.score > 0) // Only include articles with some similarity
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)

          if (topRelatedArticles.length > 0) {
            const formattedStories = topRelatedArticles.map(({ article }) => {
              const attrs = article.attributes
              const coverImage = attrs.Cover_image?.data?.attributes?.url

              // Handle Authors - check if it's an array
              let authors = ''
              if (Array.isArray(attrs.Authors)) {
                authors = attrs.Authors.map((author: { author_name?: { data?: { attributes?: { Name?: string } } } }) =>
                  author.author_name?.data?.attributes?.Name || ''
                ).filter(Boolean).join(', ') || ''
              }

              const categories = attrs.categories?.data?.map((cat: { attributes?: { Title?: string; slug?: string } }) => ({
                title: cat.attributes?.Title || '',
                slug: cat.attributes?.slug || ''
              })).filter(cat => cat.title) || []

              const locationName = attrs.location?.data?.attributes?.name || ''
              const locationDistrict = attrs.location?.data?.attributes?.district || ''
              const locationState = attrs.location?.data?.attributes?.state || ''
              const location = [locationName, locationDistrict, locationState].filter(Boolean).join(', ')

              // Get available languages from localizations
              let availableLanguages: Array<{ code: string; name: string; slug: string }> = []

              if (attrs.localizations) {
                // Handle both possible structures of localizations
                const localizationsArray = Array.isArray(attrs.localizations)
                  ? attrs.localizations
                  : attrs.localizations.data || []

                const mappedLocalizations = localizationsArray
                  .filter((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                    const locale = loc.attributes?.locale || loc.locale
                    const slug = loc.attributes?.slug || loc.slug
                    return locale && slug
                  })
                  .map((loc: { attributes?: { locale?: string; slug?: string }; locale?: string; slug?: string }) => {
                    const locale = loc.attributes?.locale || loc.locale || 'en'
                    const slug = loc.attributes?.slug || loc.slug || ''
                    return {
                      code: locale,
                      name: allLanguages.find(l => l.code === locale)?.names[0] || locale.toUpperCase(),
                      slug: slug
                    }
                  })

                // Add current article as first language (assuming current locale)
                availableLanguages = [
                  {
                    code: currentLocale,
                    name: allLanguages.find(l => l.code === currentLocale)?.names[0] || currentLocale.toUpperCase(),
                    slug: attrs.slug || ''
                  },
                  ...mappedLocalizations.filter(loc => loc.code !== currentLocale)
                ]
              }

              return {
                title: attrs.Title || '',
                description: attrs.Strap || '',
                authors,
                imageUrl: coverImage ? `${API_BASE_URL}${coverImage}` : '',
                categories,
                slug: attrs.slug || '',
                location,
                date: attrs.Original_published_date ? formatDate(attrs.Original_published_date) : '',
                availableLanguages: availableLanguages.length > 1 ? availableLanguages : undefined
              }
            })

            setRelatedStories(formattedStories)
          } else {
            setRelatedStories([])
          }
        } else {
          setRelatedStories([])
        }

      } catch (error) {
        console.error('Error fetching related stories:', error)
        setRelatedStories([])
      }
    }

    fetchRelatedStories()
  }, [story, currentLocale])

  // Callback functions for image modal navigation
  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false)
    setSelectedImage(null)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }, [])

  const handleNextImage = useCallback(() => {
    if (allContentImages.length === 0) return

    const nextIndex = (currentImageIndex + 1) % allContentImages.length
    setCurrentImageIndex(nextIndex)
    setSelectedImage(allContentImages[nextIndex])
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }, [allContentImages, currentImageIndex])

  const handlePrevImage = useCallback(() => {
    if (allContentImages.length === 0) return

    const prevIndex = (currentImageIndex - 1 + allContentImages.length) % allContentImages.length
    setCurrentImageIndex(prevIndex)
    setSelectedImage(allContentImages[prevIndex])
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }, [allContentImages, currentImageIndex])

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return

      if (e.key === 'Escape') {
        handleCloseImageModal()
      } else if (e.key === 'ArrowRight') {
        handleNextImage()
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, handleCloseImageModal, handleNextImage, handlePrevImage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${story?.isStudent ? 'border-[#2F80ED]' : 'border-primary-PARI-Red'} mx-auto mb-4`}></div>
          <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Story not found'}</p>
        </div>
      </div>
    )
  }

  console.log('##Rohit_Rocks## Rendering story with isStudent:', story.isStudent)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        url: window.location.href,
      }).catch(() => {})
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 40))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 11))
  }

  const handlePhotoClick = () => {
    setShowPhotos(!showPhotos)
  }

  // const handleAudioToggle = () => {
  //   setIsAudioPlaying(!isAudioPlaying)
  //   // TODO: Implement actual audio playback functionality
  // }

  const handleClose = () => {
    setShowCard(false)
  }

  const handleToggleCard = () => {
    setShowCard(true)
  }

  const handleImageClick = (src: string, alt: string, caption?: string) => {
    // Find the index of the clicked image
    const index = allContentImages.findIndex(img => img.src === src)
    console.log('##Rohit_Rocks## Image clicked:', src)
    console.log('##Rohit_Rocks## Found at index:', index)
    console.log('##Rohit_Rocks## Total images in array:', allContentImages.length)
    console.log('##Rohit_Rocks## All images:', allContentImages)

    if (index !== -1) {
      setCurrentImageIndex(index)
    } else {
      // If image not found in array, add it and set as current
      console.log('##Rohit_Rocks## Image not found in array, adding it')
      setAllContentImages(prev => [...prev, { src, alt, caption }])
      setCurrentImageIndex(allContentImages.length)
    }

    setSelectedImage({ src, alt, caption })
    setShowImageModal(true)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
    setImageAnimating(true)
    setTimeout(() => setImageAnimating(false), 1500) // Animation duration
  }

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleResetZoom = () => {
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageScale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageScale > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      // Scroll up - zoom in
      setImageScale(prev => Math.min(prev + 0.2, 5))
    } else {
      // Scroll down - zoom out
      setImageScale(prev => Math.max(prev - 0.2, 0.5))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global style to force font-size inheritance for article content */}
      <style>{`
        .article-content-text,
        .article-content-text * {
          font-size: inherit !important;
        }
        .article-content-text {
          font-size: ${fontSize}px !important;
        }
      `}</style>

      {/* Reading Progress Line Bar */}

      {/* Sticky Header Bar - Appears while scrolling */}
      <div
        className={`fixed top-0 left-0 w-full bg-white dark:bg-popover border-b border-gray-200 dark:border-gray-700 z-40000 transition-transform duration-300 ${
          showHeaderBar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 md:py-4 flex items-center justify-center gap-12 md:gap-16 relative">
          {/* Audio Play */}
          {/* <button
            onClick={handleAudioToggle}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED] hover:bg-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red hover:bg-primary-PARI-Red'} border-1 py-1 px-3 rounded-full hover:text-white transition-all`}
            title={isAudioPlaying ? "Pause Audio" : "Play Audio"}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 8 11 24 23 16" fill="currentColor" stroke="none"/>
            </svg>
          </button> */}

          {/* Photo/Image */}
          <button
            onClick={handlePhotoClick}
            className={`${
              showPhotos
                ? story.isStudent
                  ? 'text-white bg-[#2F80ED] border-[#2F80ED]'
                  : 'text-white bg-primary-PARI-Red border-primary-PARI-Red'
                : story.isStudent
                  ? 'text-[#2F80ED] border-[#2F80ED]'
                  : 'text-primary-PARI-Red border-primary-PARI-Red'
            } rounded-full p-2 cursor-pointer`}
            title="Toggle Photos"
          >
            <ImageIcon size={28} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red'} rounded-full cursor-pointer`}
            title="Share"
          >
            <FiShare2 size={28} />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className={`${story.isStudent ? 'text-[#2F80ED] border-[#2F80ED]' : 'text-primary-PARI-Red border-primary-PARI-Red'} rounded-full cursor-pointer`}
            title="Print"
          >
           <Printer size={28} />
          </button>

          {/* Font Size Controls */}
          <div className={`flex items-center  gap-2 md:gap-6 ${story.isStudent ? 'border-[#2F80ED]' : 'border-primary-PARI-Red'} rounded-full`}>
            <button
              type="button"
              onClick={() => {
                console.log('##Rohit_Rocks## Decrease font clicked, current:', fontSize)
                decreaseFontSize()
              }}
              className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'}  hover:opacity-70 transition-opacity font-medium cursor-pointer leading-none`}
              style={{ fontSize: '28px' }}
              title="Decrease Font Size"
            >
              −
            </button>
            <span className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} font-medium`} style={{ fontSize: '24px' }}>T</span>
            <button
              type="button"
              onClick={() => {
                console.log('##Rohit_Rocks## Increase font clicked, current:', fontSize)
                increaseFontSize()
              }}
              className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} hover:opacity-70 transition-opacity font-medium cursor-pointer leading-none`}
              style={{ fontSize: '28px' }}
              title="Increase Font Size"
            >
              +
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full ${story.isStudent ? 'bg-[#2F80ED]' : 'bg-primary-PARI-Red'} transition-all duration-150 ease-out`}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full">
        {story.coverImage && (
          <div className="relative w-full md:h-[100vh] h-[50vh]">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover object-center md:rounded-none"
              priority
              unoptimized
            />
          </div>
        )}
      </div>

      {/* White Card Overlay - Separate from content */}
      {showCard && (
        <div className={`relative mx-auto px-4 my-16 md:px-8 ${story.coverImage ? '-mt-32' : ''}`}>
          <div className="bg-white dark:bg-popover rounded-3xl p-[2.5rem]  lg:p-[4rem] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] relative mx-auto max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto"
           
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute md:top-6 top-2 right-2 md:right-6 w-10 h-10 flex items-center justify-center rounded-full border-1 ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} hover:text-white transition-colors`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Location and Date */}
            <div className="flex items-center gap-2 mb-4">
              <h6 className={`${story.isStudent ? ' text-[#2F80ED]' : 'text-primary-PARI-Red'} text-[14px] `}
               
              >
                {story.location || 'SANGUR, PUNJAB'}
              </h6>
              <span className="text-gray-400 dark:text-[#8e8888]">|</span>
              <h6 className="text-grey-300 dark:text-discreet-text text-[14px]"
              >
                {formatDate(story.publishedDate)}
              </h6>
            </div>

            {/* Category Tags */}
            {story.categories && story.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Desktop: Show all categories */}
                <div className="hidden md:contents">
                  {story.categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        router.push(`/articles?types=${category.slug}`)
                      }}
                      className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '100%'
                      }}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>

                {/* Mobile: Show with expand/collapse */}
                <div className="md:hidden contents">
                  {showAllCategories ? (
                    // Show all categories
                    <>
                      {story.categories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(`/articles?types=${category.slug}`)
                          }}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer animate-slide-in-left`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          {category.title}
                        </button>
                      ))}
                      {/* Reset button */}
                      {story.categories.length > 2 && (
                        <button
                          onClick={() => setShowAllCategories(false)}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          -
                        </button>
                      )}
                    </>
                  ) : (
                    // Show only first 2 categories
                    <>
                      {story.categories.slice(0, 2).map((category, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(`/articles?types=${category.slug}`)
                          }}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          {category.title}
                        </button>
                      ))}
                      {/* Show more button */}
                      {story.categories.length > 2 && (
                        <button
                          onClick={() => setShowAllCategories(true)}
                          className={`px-4 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} font-noto-sans rounded-full hover:text-white transition-colors cursor-pointer`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '100%'
                          }}
                        >
                          +{story.categories.length - 2}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-foreground mb-2"
             
            >
              {story.title}
            </h1>

            {/* Subtitle */}
            {story.subtitle && (
              <h2
                className="text-foreground  mb-4"
                
                dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(story.subtitle) }}
              />
            )}

            {/* Divider Line */}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-8 "></div>

            {/* Authors Info - Dynamic */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="grid grid-cols-1 md:flex md:flex-row gap-6 md:gap-12 flex-1">
                {groupedAuthors.map((group, index) => (
                  <div key={index}>
                    <h6 className="text-grey-300 dark:text-discreet-text text-[14px] mb-2"
                    >
                      {group.title || getTranslatedLabel('author', currentLocale)}
                    </h6>
                    <div className="font-noto-sans text-foreground"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '140%'
                      }}
                    >
                      {group.names.map((name, nameIndex) => (
                        <span key={nameIndex}>
                          <button
                            onClick={() => {

                              router.push(`/articles?author=${encodeURIComponent(name)}`)
                            }}
                            className={`transition-colors text-left ${story.isStudent ? 'hover:text-[#2F80ED] dark:hover:text-[#2F80ED]' : 'hover:text-primary-PARI-Red dark:hover:text-primary-PARI-Red'}`}
                          >
                            {name}
                          </button>
                          {nameIndex < group.names.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* See all credits button */}
              <button
                onClick={() => {
                  setShowCreditsModal(true)
                  // Scroll to credits section smoothly
                  setTimeout(() => {
                    const creditsSection = document.getElementById('credits-section')
                    if (creditsSection) {
                      creditsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }}
                className={`w-full md:w-auto md:ml-8 px-6 py-3 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} rounded-full font-noto-sans hover:text-white transition-colors whitespace-nowrap`}
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '100%'
                }}
              >
                {getTranslatedLabel('seeAllCredits', currentLocale)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Card Button - Appears when card is hidden */}
      {!showCard && (
        <div className="flex justify-end items-center max-w-7xl mx-auto px-4 md:px-8 -mt-12 mb-8 relative z-10">
          <button
            onClick={handleToggleCard}
            className="bg-white dark:bg-popover rounded-full shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] hover:shadow-[0px_6px_30px_0px_rgba(0,0,0,0.15)] transition-all duration-300 flex items-center justify-center"
            style={{
              width: '70px',
              height: '70px'
            }}
          >
            <div className={`w-16 h-16 font-bold rounded-full  ${story.isStudent ? 'border-[#2F80ED]' : 'border-primary-PARI-Red'} flex items-center justify-center`}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className={story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'}
              >
                <line x1="20" y1="10" x2="20" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </button>
        </div>
      )}

 
      {/* Main Content - Always visible */}
      <div className="w-full lg:my-16 md:my-12 my-8 mx-auto  md:px-8">
        {story.content && story.content.length > 0 ? (
          <div>
              {(() => {
                // Group consecutive image components together
                const groupedContent: Array<string | ExtendedContentItem | ExtendedContentItem[]> = []
                let currentImageGroup: ExtendedContentItem[] = []

                story.content.forEach((item) => {
                  if (item && typeof item === 'object') {
                    const obj = item as ExtendedContentItem
                    if ('__component' in obj && (obj.__component === 'shared.media' || obj.__component === 'modular-content.media')) {
                      // Add to current image group
                      currentImageGroup.push(obj)
                    } else {
                      // Not an image - flush current group if any
                      if (currentImageGroup.length > 0) {
                        groupedContent.push([...currentImageGroup])
                        currentImageGroup = []
                      }
                      groupedContent.push(obj)
                    }
                  } else {
                    // Not an object - flush current group if any
                    if (currentImageGroup.length > 0) {
                      groupedContent.push([...currentImageGroup])
                      currentImageGroup = []
                    }
                    groupedContent.push(item)
                  }
                })

                // Flush any remaining images
                if (currentImageGroup.length > 0) {
                  groupedContent.push([...currentImageGroup])
                }

                return groupedContent.map((item, index) => {

                  // Handle grouped images (array of image components)
                  if (Array.isArray(item)) {
                    const imageGroup = item
                    const groupImageCount = imageGroup.length

                    // Extract all image data first
                    const allImageData = imageGroup.map(imgObj => extractImageData(imgObj)).filter(Boolean)

                    // For 2 or 4 images: use grid-cols-2
                    if (groupImageCount === 2 || groupImageCount === 4) {
                      return (
                        <div key={`image-group-${index}`} className="my-12 my-8 w-full flex justify-center">
                          <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allImageData.map((imageData, imgIndex) => (
                              <div key={`img-${index}-${imgIndex}`} className="space-y-3">
                                <div
                                  className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                  onClick={() => handleImageClick(imageData!.url, imageData!.alt || 'Article image', imageData!.caption)}
                                >
                                  <Image
                                    src={imageData!.url}
                                    alt={imageData!.alt || 'Article image'}
                                    width={500}
                                    height={400}
                                    className="w-full h-full object-cover md:rounded-lg"
                                    unoptimized
                                  />
                                  {/* Zoom Icon */}
                                  <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn className="w-5 h-5" />
                                  </div>
                                </div>
                                {imageData!.caption && (
                                  <div className="mt-3 px-2">
                                    <div className={`text-sm text-discreet-text `}>
                                      {imageData!.caption}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                    return (
                      <div key={`image-group-${index}`} className="my-12 w-full flex justify-center">
                        <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                          {/* First image - full width */}
                          {allImageData[0] && (
                            <div className="space-y-3">
                              <div
                                className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                onClick={() => handleImageClick(allImageData[0]!.url, allImageData[0]!.alt || 'Article image', allImageData[0]!.caption)}
                              >
                                <Image
                                  src={allImageData[0]!.url}
                                  alt={allImageData[0]!.alt || 'Article image'}
                                  width={allImageData[0]!.width || 1920}
                                  height={allImageData[0]!.height || 1080}
                                  className="w-full h-auto max-h-[600px] object-cover"
                                  unoptimized
                                />
                                {/* Zoom Icon */}
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-5 h-5" />
                                </div>
                              </div>
                              {allImageData[0].caption && (
                                <div className="mt-3">
                                  <p className="text-sm text-discreet-text italic leading-relaxed">
                                    {allImageData[0].caption}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Remaining images in grid-cols-2 */}
                          {allImageData.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {allImageData.slice(1).map((imageData, imgIndex) => (
                                <div key={`img-${index}-${imgIndex + 1}`} className="space-y-3">
                                  <div
                                    className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                    onClick={() => handleImageClick(imageData!.url, imageData!.alt || `Article image ${imgIndex + 2}`, imageData!.caption)}
                                  >
                                    <Image
                                      src={imageData!.url}
                                      alt={imageData!.alt || `Article image ${imgIndex + 2}`}
                                      width={500}
                                      height={400}
                                      className="w-full h-full object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {imageData!.caption && (
                                    <div className="mt-3 px-2">
                                      <div className={`text-sm text-discreet-text`}>
                                        {imageData!.caption}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Handle string content - Skip if showing photos only
                  if (typeof item === 'string' && item.trim().length > 0) {
                  if (showPhotos) return null

                  // Debug: Log string content for this article
                  if (slug === 'in-kuno-park-no-one-gets-the-lions-share' && index < 3) {
                    console.log('##Rohit_Rocks## String content at index', index, ':', item.substring(0, 200))
                    console.log('##Rohit_Rocks## After strip:', stripHtmlCssWithStyledStrong(item).substring(0, 200))
                  }

                  return (
                    <div key={index} className="my-6 max-w-3xl mx-auto px-8 md:px-10 lg:px-16">
                      
                      <div
                        className="article-content-text text-discreet-text leading-relaxed"
                        style={{
                           fontFamily: 'Noto Sans',
                          fontWeight: 400,
                          fontSize: `${fontSize}px`,
                          lineHeight: '170%',
                          letterSpacing: '-3%'
                        }}
                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item) }}
                      />
                    </div>
                  )
                }

                // Handle object content
                if (item && typeof item === 'object') {
                  const obj = item as ExtendedContentItem

                  // Handle Strapi component types
                  if ('__component' in obj) {
                    // Debug: log component type and ALL keys in the object
                    console.log('##Rohit_Rocks## Component type:', obj.__component)
                    console.log('##Rohit_Rocks## Object keys:', Object.keys(obj))
                    console.log('##Rohit_Rocks## Full Data:', JSON.stringify(obj, null, 2))

                    switch (obj.__component) {
                      case 'shared.rich-text':
                      case 'modular-content.text':
                      case 'modular-content.paragraph':
                        // Skip text content if showing photos only
                        if (showPhotos) return null

                        // Try all possible field names for text content
                        const textContent = obj.Paragraph || obj.Text || obj.content || obj.text || obj.Body || obj.body || ''
                        console.log('##Rohit_Rocks## Text content found:', typeof textContent === 'string' ? textContent.substring(0, 100) : 'NOT A STRING')

                        if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
                          // Debug: Log original content for this article
                          if (slug === 'in-kuno-park-no-one-gets-the-lions-share' && index < 3) {
                            console.log('##Rohit_Rocks## RAW HTML from Strapi at index', index, ':', textContent)
                            console.log('##Rohit_Rocks## Original content at index', index, ':', textContent.substring(0, 200))
                          }

                          // Check if content is only stars (asterisks)
                          const strippedContent = stripHtmlCssWithStyledStrong(textContent)

                          // Debug: Log both original and stripped content
                          console.log('##DEBUG## Original HTML:', textContent)
                          console.log('##DEBUG## Stripped HTML:', strippedContent)
                          console.log('##DEBUG## Has strong tag:', strippedContent.includes('<strong>'))

                          const isStarsOnly = /^[\s*]+$/.test(strippedContent)

                          return (
                            <div key={index} className="my-6 max-w-3xl mx-auto px-8 md:px-10 lg:px-16">
                              <style jsx>{`
                                .article-content-text {
                                  font-weight: 400;
                                }
                                .article-content-text :global(p) {
                                  margin-bottom: 1rem;
                                  font-weight: 400;
                                }
                                .article-content-text :global(a) {
                                  color: #B91C1C;
                                  text-decoration: underline;
                                }
                                .article-content-text :global(a:hover) {
                                  color: #991B1B;
                                }
                                .article-content-text :global(strong),
                                .article-content-text :global(b) {
                                  font-weight: 700 !important;
                                }
                                .article-content-text :global(em),
                                .article-content-text :global(i) {
                                  font-style: italic;
                                }
                              `}</style>
                              <div
                                className={`article-content-text text-discreet-text ${isStarsOnly ? 'text-center' : ''}`}
                                style={{
                                  fontFamily: 'Noto Sans',
                                  fontSize: `${fontSize}px`,
                                  lineHeight: '170%',
                                  letterSpacing: '-3%'
                                }}
                                dangerouslySetInnerHTML={{ __html: strippedContent }}
                              />
                            </div>
                          )
                        }
                        return null

                      case 'shared.media':
                      case 'modular-content.media':
                        // Images are now handled in the grouped section above
                        // This case should not be reached as images are filtered out during grouping
                        return null

                      case 'modular-content.single-caption-mul-img':
                        // Debug: log the component data
                        console.log('single-caption-mul-img component:', obj)

                        const multipleImages = extractMultipleImages(obj)
                        console.log('Extracted images:', multipleImages)

                        // Extract shared caption/content from the component
                        const sharedCaption = ('caption' in obj && typeof obj.caption === 'string') ? obj.caption :
                                             ('Caption' in obj && typeof obj.Caption === 'string') ? obj.Caption :
                                             ('content' in obj && typeof obj.content === 'string') ? obj.content : undefined

                        // Extract credits from the component level (if exists)
                        let singleCaptionCredits: string | undefined
                        if ('credits' in obj && obj.credits && typeof obj.credits === 'object') {
                          const creditsObj = obj.credits as Record<string, unknown>
                          if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
                            const creditsData = creditsObj.data as Record<string, unknown>
                            if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
                              const creditsAttrs = creditsData.attributes as Record<string, unknown>
                              if ('Name' in creditsAttrs && typeof creditsAttrs.Name === 'string') {
                                singleCaptionCredits = creditsAttrs.Name
                              }
                            }
                          }
                        }

                        if (multipleImages.length > 0) {
                          const imageCount2 = multipleImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (imageCount2 === 2 || imageCount2 === 4) {
                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multipleImages.map((img, imgIndex) => (
                                      <div key={imgIndex} className="space-y-3">
                                        <div
                                          className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 1}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 1}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shared caption and credits below all images */}
                                  {(sharedCaption || singleCaptionCredits) && (
                                    <div className="mt-3 md:px-10 px-8">
                                      {singleCaptionCredits && (
                                        <p className={`text-sm   mb-1`}>
                                        {singleCaptionCredits}
                                        </p>
                                      )}
                                      {sharedCaption && (
                                        <div
                                          className={`text-sm text-caption `}
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(sharedCaption) }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(multipleImages[0].url, multipleImages[0].alt || 'Image 1', multipleImages[0].caption)}
                                  >
                                    <Image
                                      src={multipleImages[0].url}
                                      alt={multipleImages[0].alt || 'Image 1'}
                                      width={multipleImages[0].width || 1920}
                                      height={multipleImages[0].height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover md:rounded-lg"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {multipleImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multipleImages.slice(1).map((img, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        <div
                                          className="w-full cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 2}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 2}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Shared caption and credits below all images */}
                                {(sharedCaption || singleCaptionCredits) && (
                                  <div className="mt-3 md:px-10 px-8">
                                    {singleCaptionCredits && (
                                      <p className={`text-sm text-primary-PARI-Red  mb-1`}>
                                        {singleCaptionCredits}
                                      </p>
                                    )}
                                    {sharedCaption && (
                                      <div
                                        className={`text-sm text-caption `}
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(sharedCaption) }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.video':
                        // Skip videos if showing photos only
                        if (showPhotos) return null

                        const videoData = extractVideoData(obj)

                        if (videoData) {
                          return (
                            <div key={index} className="my-16">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                <video
                                  src={videoData.url}
                                  controls
                                  className="w-full h-full rounded-lg shadow-md"
                                  poster={videoData.poster}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                              {videoData.caption && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic text-center">
                                  {videoData.caption}
                                </p>
                              )}
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.video-embed-url':
                        // Skip videos if showing photos only
                        if (showPhotos) return null

                        const embedUrl = 'video_embed_url' in obj && typeof obj.video_embed_url === 'string' ? obj.video_embed_url : null
                        const embedCaption = 'Video_caption' in obj && typeof obj.Video_caption === 'string' ? obj.Video_caption : null

                        if (embedUrl) {
                          // Convert YouTube watch URL to embed URL
                          let finalEmbedUrl = embedUrl
                          if (embedUrl.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(embedUrl.split('?')[1])
                            const videoId = urlParams.get('v')
                            if (videoId) {
                              finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          } else if (embedUrl.includes('youtu.be/')) {
                            const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0]
                            if (videoId) {
                              finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          }

                          return (
                            <div key={index} className="my-6">
                              <div className="relative max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto" style={{ aspectRatio: '16/9' }}>
                                <iframe
                                  src={finalEmbedUrl}
                                  className="w-full h-full md:rounded-lg shadow-md"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title="Embedded video"
                                />
                              </div>
                              {embedCaption && (
                                <div
                                  className={`text-sm ${story.isStudent ? 'text-[#2F80ED] dark:text-[#2F80ED]' : 'text-pari-red dark:text-pari-red'} mt-2 italic text-center`}
                                  dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(embedCaption) }}
                                />
                              )}
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.audio-embed-url':
                        // Skip audio if showing photos only
                        if (showPhotos) return null

                        const audioEmbedRaw = 'audio_embed_url' in obj && typeof obj.audio_embed_url === 'string' ? obj.audio_embed_url : null
                        const audioCaption = 'caption' in obj && typeof obj.caption === 'string' ? obj.caption : null
                        const audioContent = 'content' in obj && typeof obj.content === 'string' ? obj.content : null

                        if (audioEmbedRaw) {
                          // Extract src from iframe HTML if it's an iframe string
                          let audioEmbedUrl = audioEmbedRaw
                          if (audioEmbedRaw.includes('<iframe')) {
                            const srcMatch = audioEmbedRaw.match(/src=["']([^"']+)["']/)
                            if (srcMatch && srcMatch[1]) {
                              audioEmbedUrl = srcMatch[1]
                            }
                          }

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                  <iframe
                                    src={audioEmbedUrl}
                                    className="w-full rounded-lg border-0"
                                    height="200"
                                    allow="autoplay"
                                    title="Embedded audio"
                                  />
                                </div>
                                {audioCaption && (
                                  <div
                                    className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic text-center"
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(audioCaption) }}
                                  />
                                )}
                                {audioContent && (
                                  <div
                                    className="mt-3 text-foreground"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(audioContent) }}
                                  />
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.columnar-text':
                        // Skip columnar text if showing photos only
                        if (showPhotos) return null

                        // Extract Content array
                        const columnarContentArray = 'Content' in obj && Array.isArray(obj.Content) ? obj.Content : null

                        console.log('##Rohit_Rocks## Columnar Text - Content Array Length:', columnarContentArray?.length)

                        // Handle single column (when only 1 item in Content array)
                        if (columnarContentArray && columnarContentArray.length === 1) {
                          const singleColumn = columnarContentArray[0] as Record<string, unknown>
                          const singleText = 'Paragraph' in singleColumn && typeof singleColumn.Paragraph === 'string' ? singleColumn.Paragraph : ''

                          console.log('##Rohit_Rocks## Columnar Text (Single) - Text:', singleText.substring(0, 100))

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto px-4">
                                <div className="flex justify-center">
                                  {/* Single Column */}
                                  <div
                                    className="text-foreground columnar-text-content max-w-2xl"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: singleText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // Handle two columns (when 2 or more items in Content array)
                        if (columnarContentArray && columnarContentArray.length >= 2) {
                          const leftColumn = columnarContentArray[0] as Record<string, unknown>
                          const rightColumn = columnarContentArray[1] as Record<string, unknown>

                          const leftText = 'Paragraph' in leftColumn && typeof leftColumn.Paragraph === 'string' ? leftColumn.Paragraph : ''
                          const rightText = 'Paragraph' in rightColumn && typeof rightColumn.Paragraph === 'string' ? rightColumn.Paragraph : ''

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto  px-8 md:px-10 lg:px-16 ">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {/* Left Column */}
                                  <div
                                    className="text-foreground "
                                    
                                    dangerouslySetInnerHTML={{ __html: leftText }}
                                  />

                                  {/* Right Column */}
                                  <div
                                    className="text-foreground "
                                   
                                    dangerouslySetInnerHTML={{ __html: rightText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return null

                      case 'modular-content.single-columnar-text':
                        // Skip single columnar text if showing photos only
                        if (showPhotos) return null

                        // Debug logging
                        console.log('##Rohit_Rocks## Single Columnar Text Component Found:', obj)
                        console.log('##Rohit_Rocks## Has Content?', 'Content' in obj)
                        console.log('##Rohit_Rocks## Content value:', obj.Content)

                        // Extract Content array
                        const singleColumnarContentArray = 'Content' in obj && Array.isArray(obj.Content) ? obj.Content : null

                        console.log('##Rohit_Rocks## Single Columnar Content Array:', singleColumnarContentArray)

                        if (singleColumnarContentArray && singleColumnarContentArray.length >= 1) {
                          const singleColumn = singleColumnarContentArray[0] as Record<string, unknown>
                          const singleText = 'Paragraph' in singleColumn && typeof singleColumn.Paragraph === 'string' ? singleColumn.Paragraph : ''

                          console.log('##Rohit_Rocks## Single Column Data:', singleColumn)
                          console.log('##Rohit_Rocks## Single Text:', singleText)

                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="my-6 max-w-3xl mx-auto px-4">
                                <div className="flex justify-center">
                                  {/* Single Column */}
                                  <div
                                    className="text-foreground columnar-text-content max-w-2xl"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${fontSize}px`,
                                      lineHeight: '170%',
                                      letterSpacing: '-3%'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: singleText }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }

                        console.log('##Rohit_Rocks## Single Columnar Text - No valid content found')
                        return null

                      case 'modular-content.image':
                        if (obj.Image && typeof obj.Image === 'object') {
                          const imgData = obj.Image as Record<string, unknown>

                          // Extract URL from Strapi structure
                          let imgUrl: string | undefined
                          let imgWidth: number | undefined
                          let imgHeight: number | undefined

                          // Check for Strapi media structure (data.attributes.url)
                          if ('data' in imgData && imgData.data && typeof imgData.data === 'object') {
                            const dataObj = imgData.data as Record<string, unknown>
                            if ('attributes' in dataObj && dataObj.attributes && typeof dataObj.attributes === 'object') {
                              const attrs = dataObj.attributes as Record<string, unknown>
                              imgUrl = attrs.url as string | undefined
                              imgWidth = attrs.width as number | undefined
                              imgHeight = attrs.height as number | undefined
                            }
                          }
                          // Fallback to direct URL
                          else if ('url' in imgData && typeof imgData.url === 'string') {
                            imgUrl = imgData.url
                            imgWidth = imgData.width as number | undefined
                            imgHeight = imgData.height as number | undefined
                          }

                          // Extract caption and photographer - try multiple possible field names
                          let imgCaption: string | undefined
                          let imgPhotographer: string | undefined

                          // Try different caption field names
                          if ('Caption' in obj && obj.Caption) {
                            if (typeof obj.Caption === 'string') {
                              imgCaption = obj.Caption
                            } else if (typeof obj.Caption === 'object' && obj.Caption !== null) {
                              // Rich text format - extract text content
                              const captionObj = obj.Caption as Record<string, unknown>
                              if ('text' in captionObj && typeof captionObj.text === 'string') {
                                imgCaption = captionObj.text
                              } else if ('content' in captionObj && typeof captionObj.content === 'string') {
                                imgCaption = captionObj.content
                              } else {
                                // Try to stringify if it's an object
                                imgCaption = JSON.stringify(captionObj)
                              }
                            }
                          } else if ('caption' in obj && typeof obj.caption === 'string') {
                            imgCaption = obj.caption
                          }

                          // Try different photographer field names
                          if ('Photographer' in obj && obj.Photographer) {
                            if (typeof obj.Photographer === 'string') {
                              imgPhotographer = obj.Photographer
                            } else if (typeof obj.Photographer === 'object' && obj.Photographer !== null) {
                              const photogObj = obj.Photographer as Record<string, unknown>
                              if ('data' in photogObj && photogObj.data && typeof photogObj.data === 'object') {
                                const photogData = photogObj.data as Record<string, unknown>
                                if ('attributes' in photogData && photogData.attributes && typeof photogData.attributes === 'object') {
                                  const photogAttrs = photogData.attributes as Record<string, unknown>
                                  imgPhotographer = photogAttrs.Name as string || photogAttrs.name as string
                                }
                              }
                            }
                          } else if ('photographer' in obj && typeof obj.photographer === 'string') {
                            imgPhotographer = obj.photographer
                          } else if ('credits' in obj && obj.credits) {
                            const creditsObj = obj.credits as Record<string, unknown>
                            if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
                              const creditsData = creditsObj.data as Record<string, unknown>
                              if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
                                const creditsAttrs = creditsData.attributes as Record<string, unknown>
                                imgPhotographer = creditsAttrs.Name as string || creditsAttrs.name as string
                              }
                            }
                          }

                          if (imgUrl) {
                            const fullImgUrl = imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`

                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div
                                    className="cursor-pointer relative group"
                                    onClick={() => handleImageClick(fullImgUrl, imgCaption || 'Article image', imgCaption)}
                                  >
                                    <Image
                                      src={fullImgUrl}
                                      alt={imgCaption || 'Article image'}
                                      width={imgWidth || 1920}
                                      height={imgHeight || 1080}
                                      className="md:rounded-lg shadow-md w-full h-auto max-h-[600px] object-cover"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {(imgCaption || imgPhotographer) && (
                                    <div className="mt-3 px-2">
                                      {imgPhotographer && (
                                        <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                           {imgPhotographer}
                                        </p>
                                      )}
                                      {imgCaption && (
                                        <div
                                          className={`text-sm text-caption `}
                                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(imgCaption) }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        }
                        return null

                      case 'modular-content.full-width-image':
                        const fullWidthImageData = extractImageData(obj)

                        if (fullWidthImageData) {
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(fullWidthImageData.url, fullWidthImageData.alt || 'Full width image', fullWidthImageData.caption)}
                                  >
                                    <Image
                                      src={fullWidthImageData.url}
                                      alt={fullWidthImageData.alt || 'Full width image'}
                                      width={fullWidthImageData.width || 1920}
                                      height={fullWidthImageData.height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {fullWidthImageData.caption && (
                                    <div className="mt-3">
                                      <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                        {fullWidthImageData.caption}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.mult-caption-mult-image':
                      case 'modular-content.mult_caption_mult_image':
                        const multCaptionImages = extractMultipleImages(obj)

                        if (multCaptionImages.length > 0) {
                          const imageCount = multCaptionImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (imageCount === 2 || imageCount === 4) {
                            return (
                              <div key={index} className="my-12 w-full flex justify-center">
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {multCaptionImages.map((img, imgIndex) => (
                                    <div key={imgIndex} className="space-y-3">
                                      <div
                                        className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                        onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 1}`, img.caption)}
                                      >
                                        <Image
                                          src={img.url}
                                          alt={img.alt || `Image ${imgIndex + 1}`}
                                          width={500}
                                          height={400}
                                          className="w-full h-full object-cover md:rounded-lg"
                                          unoptimized
                                        />
                                        {/* Zoom Icon */}
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ZoomIn className="w-5 h-5" />
                                        </div>
                                      </div>
                                      {img.caption && (
                                        <div className="mt-3 px-2">
                                          <p className={`text-sm text-caption `}>
                                            {img.caption}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className="my-12 w-full flex justify-center">
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  <div
                                    className="w-full cursor-pointer relative group"
                                    onClick={() => handleImageClick(multCaptionImages[0].url, multCaptionImages[0].alt || 'Image 1', multCaptionImages[0].caption)}
                                  >
                                    <Image
                                      src={multCaptionImages[0].url}
                                      alt={multCaptionImages[0].alt || 'Image 1'}
                                      width={multCaptionImages[0].width || 1920}
                                      height={multCaptionImages[0].height || 1080}
                                      className="w-full h-auto max-h-[600px] object-cover"
                                      unoptimized
                                    />
                                    {/* Zoom Icon */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-5 h-5" />
                                    </div>
                                  </div>
                                  {multCaptionImages[0].caption && (
                                    <div className="mt-3 px-2">
                                      <p className={`text-sm text-caption `}>
                                        {multCaptionImages[0].caption}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {multCaptionImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {multCaptionImages.slice(1).map((img, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        <div
                                          className="w-full h-[300px] md:h-[400px] cursor-pointer relative group"
                                          onClick={() => handleImageClick(img.url, img.alt || `Image ${imgIndex + 2}`, img.caption)}
                                        >
                                          <Image
                                            src={img.url}
                                            alt={img.alt || `Image ${imgIndex + 2}`}
                                            width={500}
                                            height={400}
                                            className="w-full h-full object-cover md:rounded-lg"
                                            unoptimized
                                          />
                                          {/* Zoom Icon */}
                                          <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn className="w-5 h-5" />
                                          </div>
                                        </div>
                                        {img.caption && (
                                          <div className="mt-3 px-2">
                                            <p className={`text-sm text-caption `}>
                                              {img.caption}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.columnar-images-with-text':
                        const columnarImages = extractColumnarImages(obj, currentLocale)

                        if (columnarImages.length > 0) {
                          const columnarImageCount = columnarImages.length

                          // For 2 or 4 images: use grid-cols-2
                          if (columnarImageCount === 2 || columnarImageCount === 4) {
                            return (
                              <div key={index} className={showPhotos ? "mb-16 w-full flex justify-center" : "my-12 w-full flex justify-center"}>
                                <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px]">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {columnarImages.map((item, imgIndex) => (
                                      <div key={imgIndex} className="space-y-3">
                                        {item.image && (
                                          <div
                                            className="w-full h-[500px] md:h-[600px] cursor-pointer relative group"
                                            onClick={() => handleImageClick(item.image!.url, item.image!.alt || `Image ${imgIndex + 1}`, item.caption)}
                                          >
                                            <Image
                                              src={item.image.url}
                                              alt={item.image.alt || `Image ${imgIndex + 1}`}
                                              width={500}
                                              height={400}
                                              className="shadow-md w-full h-full object-cover md:rounded-lg"
                                              unoptimized
                                            />
                                            {/* Zoom Icon */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                              <ZoomIn className="w-5 h-5" />
                                            </div>
                                          </div>
                                        )}

                                        {item.credits && (
                                          <div className={`mt-3 mb-2 md:px-1 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                              {item.credits}
                                            </p>
                                          </div>
                                        )}

                                        {/* Individual caption for each image */}
                                        {item.caption && (
                                          <div className={`mt-1 md:px-1 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <div
                                              className={`text-sm text-caption  leading-relaxed`}
                                              dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.caption) }}
                                            />
                                          </div>
                                        )}

                                        {!showPhotos && item.text && (
                                          <div
                                            className="text-foreground"
                                            style={{
                                              fontFamily: 'Noto Sans',
                                              fontWeight: 400,
                                              fontSize: `${fontSize}px`,
                                              lineHeight: '170%',
                                              letterSpacing: '-3%'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.text) }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          // For 1, 3, 5+ images: first image full width, then grid-cols-2 for remaining
                          return (
                            <div key={index} className={showPhotos ? "mb-8 w-full flex justify-center" : "my-12 w-full flex justify-center"}>
                              <div className="w-full max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] space-y-4">
                                {/* First image - full width */}
                                <div className="space-y-3">
                                  {columnarImages[0].image && (
                                    <div
                                      className="cursor-pointer relative group"
                                      onClick={() => handleImageClick(columnarImages[0].image!.url, columnarImages[0].image!.alt || 'Image 1', columnarImages[0].caption)}
                                    >
                                      <Image
                                        src={columnarImages[0].image.url}
                                        alt={columnarImages[0].image.alt || 'Image 1'}
                                        width={400}
                                        height={600}
                                        className="md:rounded-lg shadow-md w-full h-auto max-h-[600px] object-cover"
                                        unoptimized
                                      />
                                      {/* Zoom Icon */}
                                      <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-5 h-5" />
                                      </div>
                                    </div>
                                  )}

                                  {columnarImages[0].credits && (
                                    <div className={`mt-3 mb-2 md:px-10 px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                      <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                      {columnarImages[0].credits}
                                      </p>
                                    </div>
                                  )}

                                  {/* Individual caption for first image */}
                                  {columnarImages[0].caption && (
                                    <div className={`mt-1 md:px-10  px-8 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                      <div
                                        className={`text-sm text-caption leading-relaxed`}
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(columnarImages[0].caption) }}
                                      />
                                    </div>
                                  )}

                                  {!showPhotos && columnarImages[0].text && (
                                    <div
                                      className="text-foreground"
                                      style={{
                                        fontFamily: 'Noto Sans',
                                        fontWeight: 400,
                                        fontSize: `${fontSize}px`,
                                        lineHeight: '170%',
                                        letterSpacing: '-3%'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(columnarImages[0].text) }}
                                    />
                                  )}
                                </div>

                                {/* Remaining images in grid-cols-2 */}
                                {columnarImages.length > 1 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {columnarImages.slice(1).map((item, imgIndex) => (
                                      <div key={imgIndex + 1} className="space-y-3">
                                        {item.image && (
                                          <div
                                            className="w-full h-[300px] md:h-[400px] cursor-pointer relative group"
                                            onClick={() => handleImageClick(item.image!.url, item.image!.alt || `Image ${imgIndex + 2}`, item.caption)}
                                          >
                                            <Image
                                              src={item.image.url}
                                              alt={item.image.alt || `Image ${imgIndex + 2}`}
                                              width={500}
                                              height={400}
                                              className="shadow-md w-full h-full object-cover md:rounded-lg"
                                              unoptimized
                                            />
                                            {/* Zoom Icon */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                              <ZoomIn className="w-5 h-5" />
                                            </div>
                                          </div>
                                        )}

                                        {item.credits && (
                                          <div className={`mt-3 mb-2 md:px-1 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <p className={`text-sm text-primary-PARI-Red mb-1`}>
                                             {item.credits}
                                            </p>
                                          </div>
                                        )}

                                        {/* Individual caption for each remaining image */}
                                        {item.caption && (
                                          <div className={`mt-1 md:px-1 ${showPhotos ? 'md:px-4 lg:px-8' : ''}`}>
                                            <div
                                              className={`text-sm text-caption  leading-relaxed`}
                                              dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.caption) }}
                                            />
                                          </div>
                                        )}

                                        {!showPhotos && item.text && (
                                          <div
                                            className="text-foreground"
                                            style={{
                                              fontFamily: 'Noto Sans',
                                              fontWeight: 400,
                                              fontSize: `${fontSize}px`,
                                              lineHeight: '170%',
                                              letterSpacing: '-3%'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(item.text) }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.video-with-quote':
                      case 'modular-content.video_with_quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        console.log('##Rohit_Rocks## Video with quote component found:', obj)

                        // Try different field name variations for video URL
                        const videoWithQuoteUrl = ('Video' in obj && typeof obj.Video === 'string' ? obj.Video :
                                                   'video' in obj && typeof obj.video === 'string' ? obj.video :
                                                   'video_embed_url' in obj && typeof obj.video_embed_url === 'string' ? obj.video_embed_url : null)
                        const videoQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null
                        const videoWithQuoteCaption = 'Video_caption' in obj && typeof obj.Video_caption === 'string' ? obj.Video_caption : null

                        console.log('##Rohit_Rocks## Video URL:', videoWithQuoteUrl)
                        console.log('##Rohit_Rocks## Quote text:', videoQuoteText)
                        console.log('##Rohit_Rocks## Caption:', videoWithQuoteCaption)

                        if (videoWithQuoteUrl) {
                          // Convert YouTube watch URL to embed URL
                          let finalVideoUrl = videoWithQuoteUrl
                          if (videoWithQuoteUrl.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(videoWithQuoteUrl.split('?')[1])
                            const videoId = urlParams.get('v')
                            if (videoId) {
                              finalVideoUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          } else if (videoWithQuoteUrl.includes('youtu.be/')) {
                            const videoId = videoWithQuoteUrl.split('youtu.be/')[1]?.split('?')[0]
                            if (videoId) {
                              finalVideoUrl = `https://www.youtube.com/embed/${videoId}`
                            }
                          }

                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Video */}
                                <div className="relative mb-3" style={{ aspectRatio: '16/9' }}>
                                  <iframe
                                    src={finalVideoUrl}
                                    className="w-full h-full rounded-lg shadow-md"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Video with quote"
                                  />
                                </div>

                                {/* Video Caption */}
                                {videoWithQuoteCaption && (
                                  <div className="mb-8">
                                    <p
                                      className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(videoWithQuoteCaption) }}
                                    />
                                  </div>
                                )}

                                {/* Quote with quotation mark */}
                                {videoQuoteText && (
                                  <div className="relative mt-8">
                                    {/* Large quotation mark */}
                                    <div className={`text-8xl font-serif leading-none ${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} mb-4`}>
                                      &ldquo;
                                    </div>
                                    <blockquote
                                      className={`${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'} -mt-12 pl-12`}
                                      style={{
                                        fontFamily: 'Noto Sans',
                                        fontWeight: 400,
                                        fontSize: `${Math.min(fontSize + 3, 21)}px`,
                                        lineHeight: '160%',
                                        letterSpacing: '-0.01em'
                                      }}
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(videoQuoteText) }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.text-quote-image':
                        const quoteImageData = extractImageData(obj)
                        const quoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (quoteImageData || quoteText) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Quote with quotation mark */}
                                {quoteText && (
                                  <div className="relative  my-12 max-w-3xl mx-auto px-8 md:px-10   ">
                                    {/* Large quotation mark */}
                                    <div className={` text-[5rem] leading-0 font-serif text-primary-PARI-Red pt-9  `}>
                                      &ldquo;
                                    </div>
                                    <blockquote
                                      className="quote"
                                      dangerouslySetInnerHTML={{ __html: stripHtmlCssNoParagraphs(quoteText) }}
                                    />
                                  </div>
                                )}

                                {/* Image */}
                                {quoteImageData && (
                                  <div className="space-y-3">
                                    <div
                                      className="w-full cursor-pointer relative group"
                                      onClick={() => handleImageClick(quoteImageData.url, quoteImageData.alt || 'Quote image', quoteImageData.caption)}
                                    >
                                      <Image
                                        src={quoteImageData.url}
                                        alt={quoteImageData.alt || 'Quote image'}
                                        width={quoteImageData.width || 1920}
                                        height={quoteImageData.height || 1080}
                                        className="w-full h-auto max-h-[600px] object-cover md:rounded-lg  shadow-md"
                                        unoptimized
                                      />
                                      {/* Zoom Icon */}
                                      <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-5 h-5" />
                                      </div>
                                    </div>
                                    {quoteImageData.caption && (
                                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                        {quoteImageData.caption}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const simpleQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (simpleQuoteText) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                {/* Quote with quotation mark */}
                                <div className="relative">
                                  {/* Large quotation mark */}
                                  <div className="text-8xl font-serif leading-none quote mb-4">
                                    &ldquo;
                                  </div>
                                  <blockquote
                                    className="quote"
                                   
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(simpleQuoteText) }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.full-width-quote':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const fullWidthQuoteText = 'Quote' in obj && typeof obj.Quote === 'string' ? obj.Quote : null

                        if (fullWidthQuoteText) {
                          return (
                            <>
                              <div key={index} className="my-12 w-full bg-[#FFF8F0] dark:bg-gray-800 py-12 md:py-16">
                                <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto px-6 md:px-8">
                                  {/* Large quotation mark */}
                                  <div className="text-8xl md:text-9xl font-serif leading-none text-primary-PARI-Red mb-6">
                                    &ldquo;
                                  </div>
                                  <blockquote
                                    className="text-primary-PARI-Red -mt-16 md:-mt-20 pl-12 md:pl-16"
                                    style={{
                                      fontFamily: 'Noto Sans',
                                      fontWeight: 400,
                                      fontSize: `${Math.min(fontSize + 6, 24)}px`,
                                      lineHeight: '160%',
                                      letterSpacing: '-0.01em'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(fullWidthQuoteText) }}
                                  />
                                </div>
                              </div>
                              <br />
                            </>
                          )
                        }
                        return null

                      case 'modular-content.anthology-card':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        const anthologyNumber = 'number' in obj && typeof obj.number === 'number' ? obj.number : null
                        const anthologyTitle = 'title' in obj && typeof obj.title === 'string' ? obj.title : null
                        const anthologyDescription = 'description' in obj && typeof obj.description === 'string' ? obj.description : null
                        const anthologyDate = 'date' in obj && typeof obj.date === 'string' ? obj.date : null
                        const anthologyAuthor = 'author' in obj && typeof obj.author === 'string' ? obj.author : null
                        const anthologyLocation = 'location' in obj && typeof obj.location === 'string' ? obj.location : null
                        const anthologySlug = 'slug' in obj && typeof obj.slug === 'string' ? obj.slug : null

                        // Extract image data
                        const anthologyImageData = extractImageData(obj)

                        if (anthologyTitle && anthologySlug) {
                          return (
                            <div key={index} className="my-8">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto">
                                <div className="flex flex-col md:flex-row gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                  {/* Left side - Image and location */}
                                  <div className="flex-shrink-0 w-full md:w-56">
                                    {anthologyImageData && (
                                      <Link href={`/article/${anthologySlug}`}>
                                        <div className="relative w-full h-48 md:h-40 mb-2">
                                          <Image
                                            src={anthologyImageData.url}
                                            alt={anthologyTitle}
                                            fill
                                            className="object-cover rounded-md"
                                          />
                                        </div>
                                      </Link>
                                    )}
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {anthologyTitle}
                                    </div>
                                    {anthologyLocation && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {anthologyLocation}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right side - Content */}
                                  <div className="flex-1">
                                    <Link href={`/article/${anthologySlug}`}>
                                      <h2 className="text-xl md:text-2xl font-bold text-primary-PARI-Red mb-3 hover:underline">
                                        {anthologyNumber && `${anthologyNumber}. `}{anthologyTitle}
                                      </h2>
                                    </Link>

                                    {anthologyDescription && (
                                      <p
                                        className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(anthologyDescription) }}
                                      />
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      {anthologyDate && <span>{anthologyDate}</span>}
                                      {anthologyAuthor && anthologyDate && <span>|</span>}
                                      {anthologyAuthor && (
                                        <span className="text-primary-PARI-Red font-medium">{anthologyAuthor}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null

                      case 'modular-content.page-reference-with-text':
                        // Skip if showing photos only
                        if (showPhotos) return null

                        // Debug log to see what data we're getting
                        console.log('##Rohit_Rocks## page-reference-with-text data:', obj)

                        // Extract text content
                        const pageRefText = 'Text_Content' in obj && typeof obj.Text_Content === 'string' ? obj.Text_Content : null

                        // Extract article number (optional)
                        const pageRefNumber = 'number' in obj && typeof obj.number === 'number' ? obj.number : null

                        // Extract article relation data
                        let pageRefArticle: {
                          title: string
                          slug: string
                          strap?: string
                          imageUrl?: string
                          authors?: string[]
                          date?: string
                          location?: string
                        } | null = null

                        if ('article' in obj && obj.article && typeof obj.article === 'object') {
                          const articleObj = obj.article as Record<string, unknown>

                          if ('data' in articleObj && articleObj.data && typeof articleObj.data === 'object') {
                            const articleData = articleObj.data as Record<string, unknown>

                            if ('attributes' in articleData && articleData.attributes && typeof articleData.attributes === 'object') {
                              const attrs = articleData.attributes as Record<string, unknown>

                              const title = 'Title' in attrs && typeof attrs.Title === 'string' ? attrs.Title : null
                              const slug = 'slug' in attrs && typeof attrs.slug === 'string' ? attrs.slug : null
                              const strap = 'Strap' in attrs && typeof attrs.Strap === 'string' ? attrs.Strap :
                                           ('strap' in attrs && typeof attrs.strap === 'string' ? attrs.strap : undefined)

                              // Extract location
                              let location: string | undefined
                              if ('location' in attrs && attrs.location && typeof attrs.location === 'object') {
                                const locationObj = attrs.location as Record<string, unknown>
                                if ('data' in locationObj && locationObj.data && typeof locationObj.data === 'object') {
                                  const locationData = locationObj.data as Record<string, unknown>
                                  if ('attributes' in locationData && locationData.attributes && typeof locationData.attributes === 'object') {
                                    const locationAttrs = locationData.attributes as Record<string, unknown>
                                    if ('name' in locationAttrs && typeof locationAttrs.name === 'string') {
                                      location = locationAttrs.name
                                    }
                                  }
                                }
                              }

                              // Extract cover image
                              let imageUrl: string | undefined
                              if ('Cover_image' in attrs && attrs.Cover_image && typeof attrs.Cover_image === 'object') {
                                const coverImage = attrs.Cover_image as Record<string, unknown>
                                if ('data' in coverImage && coverImage.data && typeof coverImage.data === 'object') {
                                  const imageData = coverImage.data as Record<string, unknown>
                                  if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
                                    const imageAttrs = imageData.attributes as Record<string, unknown>
                                    if ('url' in imageAttrs && typeof imageAttrs.url === 'string') {
                                      imageUrl = `${API_BASE_URL}${imageAttrs.url}`
                                    }
                                  }
                                }
                              }

                              // Extract authors
                              const authors: string[] = []
                              if ('Authors' in attrs && attrs.Authors && typeof attrs.Authors === 'object') {
                                const authorsObj = attrs.Authors as Record<string, unknown>
                                if ('data' in authorsObj && Array.isArray(authorsObj.data)) {
                                  authorsObj.data.forEach((authorItem: unknown) => {
                                    if (authorItem && typeof authorItem === 'object') {
                                      const authorData = authorItem as Record<string, unknown>
                                      if ('attributes' in authorData && authorData.attributes && typeof authorData.attributes === 'object') {
                                        const authorAttrs = authorData.attributes as Record<string, unknown>
                                        if ('author_name' in authorAttrs && authorAttrs.author_name && typeof authorAttrs.author_name === 'object') {
                                          const authorNameObj = authorAttrs.author_name as Record<string, unknown>
                                          if ('data' in authorNameObj && authorNameObj.data && typeof authorNameObj.data === 'object') {
                                            const authorNameData = authorNameObj.data as Record<string, unknown>
                                            if ('attributes' in authorNameData && authorNameData.attributes && typeof authorNameData.attributes === 'object') {
                                              const authorNameAttrs = authorNameData.attributes as Record<string, unknown>
                                              if ('Name' in authorNameAttrs && typeof authorNameAttrs.Name === 'string') {
                                                authors.push(authorNameAttrs.Name)
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  })
                                }
                              }

                              // Extract date
                              const date = 'Original_published_date' in attrs && typeof attrs.Original_published_date === 'string'
                                ? attrs.Original_published_date
                                : ('original_published_date' in attrs && typeof attrs.original_published_date === 'string'
                                  ? attrs.original_published_date
                                  : undefined)

                              if (title && slug) {
                                pageRefArticle = {
                                  title,
                                  slug,
                                  strap,
                                  imageUrl,
                                  authors: authors.length > 0 ? authors : undefined,
                                  date,
                                  location
                                }
                              }
                            }
                          }
                        }

                        if (pageRefText || pageRefArticle) {
                          return (
                            <div key={index} className="my-16">
                              <div className="max-w-[768px] md:max-w-[768px] lg:max-w-[912px] xl:max-w-[970px] 2xl:max-w-[1016px] mx-auto px-4 md:px-8">
                              

                                {/* Article card - matching the screenshot design */}
                                {pageRefArticle && (
                                  <div className="flex flex-col md:flex-row gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                    {/* Left side - Image, title, and location */}
                                    <div className="flex-shrink-0 w-full md:w-56">
                                      {pageRefArticle.imageUrl && (
                                        <Link href={`/article/${pageRefArticle.slug}`}>
                                          <div className="relative w-full h-48 md:h-40 mb-2">
                                            <Image
                                              src={pageRefArticle.imageUrl}
                                              alt={pageRefArticle.title}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        </Link>
                                      )}
                                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {pageRefArticle.title}
                                      </div>
                                      {pageRefArticle.location && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                          {pageRefArticle.location}
                                        </div>
                                      )}
                                    </div>

                                    {/* Right side - Numbered title, description, date, and author */}
                                    <div className="flex-1">
                                      <Link href={`/article/${pageRefArticle.slug}`}>
                                        <h3 className="text-xl md:text-2xl font-bold text-primary-PARI-Red dark:text-primary-PARI-Red mb-3 hover:underline">
                                          {pageRefNumber && `${pageRefNumber}. `}{pageRefArticle.title}
                                        </h3>
                                      </Link>

                                      {pageRefArticle.strap && (
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-base">
                                          {pageRefArticle.strap}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        {pageRefArticle.date && (
                                          <span>
                                            {new Date(pageRefArticle.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </span>
                                        )}
                                        {pageRefArticle.authors && pageRefArticle.authors.length > 0 && pageRefArticle.date && (
                                          <span>|</span>
                                        )}
                                        {pageRefArticle.authors && pageRefArticle.authors.length > 0 && (
                                          <span className="text-primary-PARI-Red dark:text-primary-PARI-Red font-medium">
                                            {pageRefArticle.authors.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null

                      default:
                        console.log('##Rohit_Rocks## Unhandled component type:', obj.__component, 'Data:', obj)
                        return null
                    }
                  }
                }

                  return null
                })
              })()}
          </div>
        ) : (
          <p>No content available</p>
        )}

        {/* Action Buttons - Photo Story, Share, Print, Text Size */}

      </div>

      {/* Credits Section */}
      {showCreditsModal && (
        <div id="credits-section" className="w-full bg-[#ececec] dark:bg-[#1e1e1e] py-12 md:py-16  md:pb-16">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            {/* Donate Section */}
            <div className="bg-white dark:bg-popover rounded-lg p-6 md:p-8 mb-8 shadow-sm">
              <h3 className={`text-2xl mb-4 ${story.isStudent ? 'text-[#2F80ED]' : 'text-primary-PARI-Red'}`}>
                {getTranslatedLabel('donateToPARI', currentLocale)}
              </h3>

              <p className="text-discreet  mb-6">
                {getTranslatedLabel('donateDisclaimer', currentLocale)}
              </p>

              {/* Donate Button */}
              <button
                onClick={() => router.push('/donate')}
                className={`w-full rounded-full py-4 ${story.isStudent ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/90'} text-white rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2`}
              >
                {getTranslatedLabel('donateToPARI', currentLocale)}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* All Authors - Dynamic - Separate Cards */}
            {groupedAuthors.map((group, groupIndex) => (
              // Create separate card for each author in the group
              group.names.map((name, authorIndex) => {
                const bio = group.bios[authorIndex]
                const email = group.emails[authorIndex]
                const twitter = group.twitters[authorIndex]
                const facebook = group.facebooks[authorIndex]
                const instagram = group.instagrams[authorIndex]
                const linkedin = group.linkedins[authorIndex]

                const hasSocialLinks = email || twitter || facebook || instagram || linkedin

                return (
                  <div
                    key={`${groupIndex}-${authorIndex}`}
                    onClick={() => {
                      router.push(`/articles?author=${encodeURIComponent(name)}`)
                    }}
                    className="bg-white dark:bg-popover rounded-lg p-6 md:p-8 mb-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h6 className="">
                      {group.title || getTranslatedLabel('author', currentLocale)}
                    </h6>
                    <div className={`text-2xl font-bold mb-4 ${story.isStudent ? 'text-[#2F80ED]' : 'text-foreground'}`}>
                      <h3 className='text-2xl '>{name}</h3>
                    </div>

                    {/* Show bio if available */}
                    {bio && (
                      <div className="mb-6">
                        <p
                          className="text-discreet-text leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(bio) }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          router.push(`/articles?author=${encodeURIComponent(name)}`)
                        }}
                        className={`px-6 py-2 border ${story.isStudent ? 'border-[#2F80ED] text-[#2F80ED] hover:bg-[#2F80ED]' : 'border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red'} rounded-full hover:text-white transition-colors text-sm font-medium flex items-center gap-2`}
                      >
                        {getTranslatedLabel('seeMoreStories', currentLocale)}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>

                      {/* Social Media Links - Dynamic from API */}
                      {hasSocialLinks && (
                        <div className="flex gap-3">
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Email"
                            >
                              <FiMail className="w-6 h-6" />
                            </a>
                          )}
                          {instagram && (
                            <a
                              href={instagram}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Instagram"
                            >
                              <FaInstagram className="w-6 h-6" />
                            </a>
                          )}
                          {twitter && (
                            <a
                              href={twitter}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Twitter/X"
                            >
                              <FaXTwitter className="w-6 h-6" />
                            </a>
                          )}
                          {facebook && (
                            <a
                              href={facebook}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Facebook"
                            >
                              <FaFacebookF className="w-6 h-6" />
                            </a>
                          )}
                          {linkedin && (
                            <a
                              href={linkedin}
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="LinkedIn"
                            >
                              <FaLinkedinIn className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ))}
          </div>
        </div>
      )}

      {/* Related Stories Section */}
      {relatedStories.length > 0 && (
        <div className="w-full bg-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="font-noto-sans font-bold text-foreground text-3xl md:text-4xl mb-8">
              Related Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedStories.map((relatedStory, index) => (
                <StoryCard
                  key={index}
                  title={relatedStory.title}
                  authors={relatedStory.authors}
                  imageUrl={relatedStory.imageUrl}
                  categories={relatedStory.categories}
                  slug={relatedStory.slug}
                  location={relatedStory.location}
                  date={relatedStory.date}
                  availableLanguages={relatedStory.availableLanguages}
                  currentLocale={currentLocale}

                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Language Selector - Show only if article has multiple languages */}
      {hasMultipleLanguages && (
        <>
          {/* Mobile Bottom Sheet - Only on Mobile */}
          {showLanguageSelector && availableLanguages.length > 0 && (
            <>
              {/* Backdrop - Only on Mobile */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowLanguageSelector(false)}
              />

              {/* Bottom Sheet Container - Only on Mobile */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-popover rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-2 duration-300 md:hidden">
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 border-b-2 border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Available in {availableLanguages.length} languages
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select your preferred language
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLanguageSelector(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Language Grid */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-1 gap-3">
                    {availableLanguages.map((lang) => {
                      const languageData = allLanguages.find(l => l.code === lang.code)
                      if (!languageData) return null

                      // Use currentArticleLocale (extracted from slug) to check which language is currently being viewed
                      // This matches the behavior of LanguageToggle which uses the site-wide locale
                      const isSelected = currentArticleLocale === lang.code
                      const nativeName = languageData.names[1] || languageData.names[0]
                      const englishName = languageData.names[0]

                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            console.log('##Rohit_Rocks## Mobile - Language changed to:', lang.code, 'with slug:', lang.slug)
                            const newUrl = addLocaleToUrl(`/article/${lang.slug}`)
                            console.log('##Rohit_Rocks## Mobile - Navigating to:', newUrl)
                            router.push(newUrl)
                            setShowLanguageSelector(false)
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? story?.isStudent
                                ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                                : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                              <span className="text-base font-medium">
                                {englishName}
                              </span>
                              {nativeName !== englishName && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  / {nativeName}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${story?.isStudent ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Desktop Modal - Centered */}
          {showLanguageSelector && availableLanguages.length > 0 && (
            <div className="hidden md:block fixed inset-0 md:flex md:items-center md:justify-center z-[60] bg-black/50" onClick={() => setShowLanguageSelector(false)}>
              <div className="bg-white dark:bg-popover rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 w-[90%] max-w-[600px]" onClick={(e) => e.stopPropagation()}>
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Available in {availableLanguages.length} languages
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select your preferred language
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLanguageSelector(false)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Language Grid */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-2 gap-3">
                    {availableLanguages.map((lang) => {
                      const languageData = allLanguages.find(l => l.code === lang.code)
                      if (!languageData) return null

                      // Use currentArticleLocale (extracted from slug) to check which language is currently being viewed
                      // This matches the behavior of LanguageToggle which uses the site-wide locale
                      const isSelected = currentArticleLocale === lang.code
                      const nativeName = languageData.names[1] || languageData.names[0]
                      const englishName = languageData.names[0]

                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            console.log('##Rohit_Rocks## Desktop - Language changed to:', lang.code, 'with slug:', lang.slug)
                            const newUrl = addLocaleToUrl(`/article/${lang.slug}`)
                            console.log('##Rohit_Rocks## Desktop - Navigating to:', newUrl)
                            router.push(newUrl)
                            setShowLanguageSelector(false)
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? story?.isStudent
                                ? 'bg-student-blue/10 text-student-blue border-student-blue shadow-sm'
                                : 'bg-primary-PARI-Red/10 text-primary-PARI-Red border-primary-PARI-Red shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                              <span className="text-base font-medium">
                                {englishName}
                              </span>
                              {nativeName !== englishName && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                 {nativeName}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${story?.isStudent ? 'bg-student-blue' : 'bg-primary-PARI-Red'}`}></div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-6 md:right-8 lg:right-10 z-50">

            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className={`relative h-[50px] w-[90px] sm:h-[55px] sm:w-[95px] md:h-[60px] md:w-[100px] lg:h-[65px] lg:w-[120px] active:outline-none gap-1 border-none rounded-full cursor-pointer ${story?.isStudent ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/80' : 'bg-primary-PARI-Red hover:bg-primary-PARI-Red/80'} text-white transition-all duration-200 ${
                showLanguageSelector ? 'scale-105 shadow-lg' : ''
              } ${
                showAnimation
                  ? `after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:w-[80%] after:h-[105%] after:border-12 ${story?.isStudent ? 'after:border-[#1E5BB8]' : 'after:border-red-700'} after:rounded-full after:animate-ping`
                  : ""
              }`}
            >
              {(() => {
                // Use story.storyLocale instead of currentLocale to show the actual language of the current article
                const displayLocale = story?.storyLocale || currentLocale
                const currentLang = allLanguages.find(l => l.code === displayLocale)
                return currentLang ? (
                  <div className="flex flex-col items-center justify-center gap-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-xs md:text-sm font-bold">{currentLang.displayCode.en}</span>
                      <span className="text-[8px] sm:text-[10px] opacity-50">|</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-bold">{currentLang.displayCode.native}</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] opacity-80 font-normal">
                      {availableLanguages.length} {availableLanguages.length === 1 ? 'language' : 'languages'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-bold">LANG</span>
                )
              })()}
            </Button>
          </div>
        </>
      )}

      {/* Full-Screen Image Modal with Zoom & Pan */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black bg-opacity-98 flex items-center justify-center"
          onClick={(e) => {
            // Only close if clicking the background, not the buttons or image
            if (e.target === e.currentTarget) {
              handleCloseImageModal()
            }
          }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCloseImageModal()
            }}
            className="absolute top-4 right-4 z-[100001] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Previous Image Button - Always show for debugging */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              console.log('##Rohit_Rocks## Previous button clicked!')
              console.log('##Rohit_Rocks## Total images:', allContentImages.length)
              console.log('##Rohit_Rocks## Current index:', currentImageIndex)
              if (allContentImages.length > 1) {
                handlePrevImage()
              } else {
                console.log('##Rohit_Rocks## Cannot navigate - only 1 image')
              }
            }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-[100001] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/40 text-white transition-all shadow-2xl border-2 border-white/50 ${
              allContentImages.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-110'
            }`}
            aria-label="Previous image"
            title={`Previous image (←) - ${allContentImages.length} total images`}
            disabled={allContentImages.length <= 1}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Next Image Button - Always show for debugging */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              console.log('##Rohit_Rocks## Next button clicked!')
              console.log('##Rohit_Rocks## Total images:', allContentImages.length)
              console.log('##Rohit_Rocks## Current index:', currentImageIndex)
              if (allContentImages.length > 1) {
                handleNextImage()
              } else {
                console.log('##Rohit_Rocks## Cannot navigate - only 1 image')
              }
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-[100001] w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/40 text-white transition-all shadow-2xl border-2 border-white/50 ${
              allContentImages.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-110'
            }`}
            aria-label="Next image"
            title={`Next image (→) - ${allContentImages.length} total images`}
            disabled={allContentImages.length <= 1}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-[100000] flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleResetZoom()
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              1:1
            </button>
          </div>

          {/* Image Counter and Zoom Level */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100000] flex flex-col items-center gap-2">
            {allContentImages.length > 1 && (
              <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                {currentImageIndex + 1} / {allContentImages.length}
              </div>
            )}
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              {Math.round(imageScale * 100)}%
            </div>
          </div>

          {/* Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden px-20"
            style={{ pointerEvents: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <style jsx>{`
              @keyframes imageZoomAnimation {
                0% {
                  transform: scale(0.5);
                }
                50% {
                  transform: scale(1);
                }
                100% {
                  transform: scale(1);
                }
              }
            `}</style>
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                pointerEvents: 'auto',
                cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
              className="flex items-center justify-center"
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={0}
                height={0}
                sizes="100vw"
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: imageScale === 1 ? '95vw' : 'none',
                  maxHeight: imageScale === 1 ? '95vh' : 'none',
                  animation: imageAnimating ? 'imageZoomAnimation 1.5s ease-in-out' : 'none',
                }}
                unoptimized
                draggable={false}
              />
            </div>
          </div>

          {/* Image Caption */}
          {(selectedImage.caption || selectedImage.alt) && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg max-w-[90vw] text-center z-[100000]">
              <div
                className="text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: stripHtmlCssWithStyledStrong(selectedImage.caption || selectedImage.alt) }}
              />
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-xs z-[100000] text-center">
            {imageScale > 1 ? (
              <p>Click and drag to pan</p>
            ) : (
              <div>
                <p>Use zoom controls or scroll to zoom</p>
                {allContentImages.length > 1 && (
                  <p className="mt-1">← → arrows or buttons to navigate</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// Helper function to extract multiple images from content items
function extractMultipleImages(paragraph: FilterableContentItem): Array<{
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}> {
  if (!paragraph || typeof paragraph !== 'object') {
    return []
  }

  const obj = paragraph as Record<string, unknown>
  const images: Array<{
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  }> = []

  // Check for Images field (array of images)
  if ('Images' in obj && Array.isArray(obj.Images)) {
    obj.Images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const imgObj = imageItem as Record<string, unknown>
        if ('data' in imgObj && imgObj.data && typeof imgObj.data === 'object') {
          const imageData = imgObj.data as Record<string, unknown>
          if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
            const attrs = imageData.attributes as Record<string, unknown>
            if ('url' in attrs && typeof attrs.url === 'string') {
              images.push({
                url: `${API_BASE_URL}${attrs.url}`,
                alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                width: typeof attrs.width === 'number' ? attrs.width : undefined,
                height: typeof attrs.height === 'number' ? attrs.height : undefined,
              })
            }
          }
        }
      }
    })
  }

  // Check for images field (lowercase) - for single-caption-mul-img component
  if ('images' in obj && Array.isArray(obj.images)) {
    obj.images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const item = imageItem as Record<string, unknown>

        // Check for nested 'image' field (single-caption-mul-img structure)
        if ('image' in item && item.image && typeof item.image === 'object') {
          const imageObj = item.image as Record<string, unknown>

          // Check if image has 'data' wrapper
          if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
            const imageData = imageObj.data as Record<string, unknown>
            if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
              const attrs = imageData.attributes as Record<string, unknown>
              if ('url' in attrs && typeof attrs.url === 'string') {
                images.push({
                  url: `${API_BASE_URL}${attrs.url}`,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                })
              }
            }
          }
        }
        // Fallback: check for direct 'data' field
        else if ('data' in item && item.data && typeof item.data === 'object') {
          const imageData = item.data as Record<string, unknown>
          if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
            const attrs = imageData.attributes as Record<string, unknown>
            if ('url' in attrs && typeof attrs.url === 'string') {
              images.push({
                url: `${API_BASE_URL}${attrs.url}`,
                alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
                width: typeof attrs.width === 'number' ? attrs.width : undefined,
                height: typeof attrs.height === 'number' ? attrs.height : undefined,
              })
            }
          }
        }
      }
    })
  }

  // Check for Caption field (for single-caption-mul-img)
  let sharedCaption: string | undefined
  if ('Caption' in obj && typeof obj.Caption === 'string') {
    sharedCaption = obj.Caption
  }

  // Apply shared caption to all images if they don't have individual captions
  if (sharedCaption && images.length > 0) {
    images.forEach(img => {
      if (!img.caption) {
        img.caption = sharedCaption
      }
    })
  }

  return images
}

// Helper function to extract image data from content items
function extractImageData(paragraph: FilterableContentItem): {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
} | null {
  if (!paragraph || typeof paragraph !== 'object') {
    return null
  }

  const obj = paragraph as Record<string, unknown>

  // First, check for caption at component level (not in media library)
  let componentCaption: string | undefined
  if ('caption' in obj && typeof obj.caption === 'string') {
    componentCaption = obj.caption
  } else if ('Caption' in obj && typeof obj.Caption === 'string') {
    componentCaption = obj.Caption
  }

  // Debug: Log caption extraction
  console.log('##Rohit_Rocks## extractImageData - Component:', obj.__component)
  console.log('##Rohit_Rocks## extractImageData - Component caption:', componentCaption)
  console.log('##Rohit_Rocks## extractImageData - Full object:', obj)

  // Check for direct image properties
  if ('image' in obj && obj.image && typeof obj.image === 'object') {
    const imageObj = obj.image as Record<string, unknown>

    // Check for Strapi media structure
    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const fullUrl = `${API_BASE_URL}${attrs.url}`

          // Use component caption if available, otherwise use media library caption
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)

          return {
            url: fullUrl,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }

    // Check for direct URL in image object
    if ('url' in imageObj && typeof imageObj.url === 'string') {
      return {
        url: imageObj.url.startsWith('http') ? imageObj.url : `${API_BASE_URL}${imageObj.url}`,
        alt: typeof imageObj.alt === 'string' ? imageObj.alt : undefined,
        caption: componentCaption || (typeof imageObj.caption === 'string' ? imageObj.caption : undefined),
      }
    }
  }

  // Check for media field
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for photo field
  if ('photo' in obj && obj.photo && typeof obj.photo === 'object') {
    const photoObj = obj.photo as Record<string, unknown>

    if ('data' in photoObj && photoObj.data && typeof photoObj.data === 'object') {
      const photoData = photoObj.data as Record<string, unknown>
      if ('attributes' in photoData && photoData.attributes && typeof photoData.attributes === 'object') {
        const attrs = photoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Photo field (capitalized)
  if ('Photo' in obj && obj.Photo && typeof obj.Photo === 'object') {
    const photoObj = obj.Photo as Record<string, unknown>

    if ('data' in photoObj && photoObj.data && typeof photoObj.data === 'object') {
      const photoData = photoObj.data as Record<string, unknown>
      if ('attributes' in photoData && photoData.attributes && typeof photoData.attributes === 'object') {
        const attrs = photoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Media field (capitalized)
  if ('Media' in obj && obj.Media && typeof obj.Media === 'object') {
    const mediaObj = obj.Media as Record<string, unknown>

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for Image field (capitalized)
  if ('Image' in obj && obj.Image && typeof obj.Image === 'object') {
    const imageObj = obj.Image as Record<string, unknown>

    if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
      const imageData = imageObj.data as Record<string, unknown>
      if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
        const attrs = imageData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          const finalCaption = componentCaption || (typeof attrs.caption === 'string' ? attrs.caption : undefined)
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
            caption: finalCaption,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }
  }

  // Check for direct URL field
  if ('url' in obj && typeof obj.url === 'string') {
    return {
      url: obj.url.startsWith('http') ? obj.url : `${API_BASE_URL}${obj.url}`,
      alt: typeof obj.alt === 'string' ? obj.alt : undefined,
      caption: componentCaption || (typeof obj.caption === 'string' ? obj.caption : undefined),
    }
  }

  return null
}

// Helper function to extract video data from content items
function extractVideoData(paragraph: FilterableContentItem): {
  url: string;
  poster?: string;
  caption?: string;
  width?: number;
  height?: number;
} | null {
  if (!paragraph || typeof paragraph !== 'object') {
    return null
  }

  const obj = paragraph as Record<string, unknown>

  // Check for direct video properties
  if ('video' in obj && obj.video && typeof obj.video === 'object') {
    const videoObj = obj.video as Record<string, unknown>

    // Check for Strapi media structure
    if ('data' in videoObj && videoObj.data && typeof videoObj.data === 'object') {
      const videoData = videoObj.data as Record<string, unknown>
      if ('attributes' in videoData && videoData.attributes && typeof videoData.attributes === 'object') {
        const attrs = videoData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          return {
            url: `${API_BASE_URL}${attrs.url}`,
            poster: typeof attrs.poster === 'string' ? `${API_BASE_URL}${attrs.poster}` : undefined,
            caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
            width: typeof attrs.width === 'number' ? attrs.width : undefined,
            height: typeof attrs.height === 'number' ? attrs.height : undefined,
          }
        }
      }
    }

    // Check for direct URL in video object
    if ('url' in videoObj && typeof videoObj.url === 'string') {
      return {
        url: videoObj.url.startsWith('http') ? videoObj.url : `${API_BASE_URL}${videoObj.url}`,
        poster: typeof videoObj.poster === 'string' ? videoObj.poster : undefined,
        caption: typeof videoObj.caption === 'string' ? videoObj.caption : undefined,
      }
    }
  }

  // Check for media field that might contain video
  if ('media' in obj && obj.media && typeof obj.media === 'object') {
    const mediaObj = obj.media as Record<string, unknown>

    if ('data' in mediaObj && mediaObj.data && typeof mediaObj.data === 'object') {
      const mediaData = mediaObj.data as Record<string, unknown>
      if ('attributes' in mediaData && mediaData.attributes && typeof mediaData.attributes === 'object') {
        const attrs = mediaData.attributes as Record<string, unknown>
        if ('url' in attrs && typeof attrs.url === 'string') {
          // Check if it's a video file by extension or mime type
          const url = attrs.url as string
          const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(url) ||
                         (typeof attrs.mime === 'string' && attrs.mime.startsWith('video/'))

          if (isVideo) {
            return {
              url: `${API_BASE_URL}${url}`,
              poster: typeof attrs.poster === 'string' ? `${API_BASE_URL}${attrs.poster}` : undefined,
              caption: typeof attrs.caption === 'string' ? attrs.caption : undefined,
              width: typeof attrs.width === 'number' ? attrs.width : undefined,
              height: typeof attrs.height === 'number' ? attrs.height : undefined,
            }
          }
        }
      }
    }
  }

  // Check for YouTube or Vimeo embed URLs
  if ('embed_url' in obj && typeof obj.embed_url === 'string') {
    return {
      url: obj.embed_url,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  // Check for direct video URL field
  if ('video_url' in obj && typeof obj.video_url === 'string') {
    return {
      url: obj.video_url.startsWith('http') ? obj.video_url : `${API_BASE_URL}${obj.video_url}`,
      caption: typeof obj.caption === 'string' ? obj.caption : undefined,
    }
  }

  return null
}

// Helper function to extract columnar images with text
function extractColumnarImages(paragraph: FilterableContentItem, locale: string = 'en'): Array<{
  image?: { url: string; alt?: string; width?: number; height?: number };
  text?: string;
  caption?: string;
  credits?: string;
}> {
  if (!paragraph || typeof paragraph !== 'object') {
    return []
  }

  const obj = paragraph as Record<string, unknown>
  const results: Array<{
    image?: { url: string; alt?: string; width?: number; height?: number };
    text?: string;
    caption?: string;
    credits?: string;
  }> = []

  // Extract shared caption from the component level
  let sharedCaption: string | undefined
  if ('caption' in obj && typeof obj.caption === 'string') {
    sharedCaption = obj.caption
  } else if ('Caption' in obj && typeof obj.Caption === 'string') {
    sharedCaption = obj.Caption
  }



  // Check for columnar_images array (new structure)
  if ('columnar_images' in obj && obj.columnar_images && typeof obj.columnar_images === 'object') {
    const columnarImagesObj = obj.columnar_images as Record<string, unknown>

    if ('data' in columnarImagesObj && Array.isArray(columnarImagesObj.data)) {
      columnarImagesObj.data.forEach((imageItem: unknown) => {
        if (imageItem && typeof imageItem === 'object') {
          const item = imageItem as Record<string, unknown>

          if ('attributes' in item && item.attributes && typeof item.attributes === 'object') {
            const attrs = item.attributes as Record<string, unknown>

            if ('url' in attrs && typeof attrs.url === 'string') {
              const fullColumnarUrl = `${API_BASE_URL}${attrs.url}`

              results.push({
                image: {
                  url: fullColumnarUrl,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                },
                caption: sharedCaption
              })
            }
          }
        }
      })
    }
  }

  // Check for Images array (old structure)
  if (results.length === 0 && 'Images' in obj && Array.isArray(obj.Images)) {
    obj.Images.forEach((imageItem: unknown) => {
      if (imageItem && typeof imageItem === 'object') {
        const item = imageItem as Record<string, unknown>

        const result: {
          image?: { url: string; alt?: string; width?: number; height?: number };
          text?: string;
          caption?: string;
          credits?: string;
        } = {}

        // Extract image (check both 'Image' and 'image')
        const imageField = ('Image' in item && item.Image) || ('image' in item && item.image)

        if (imageField && typeof imageField === 'object') {
          const imageObj = imageField as Record<string, unknown>

          if ('data' in imageObj && imageObj.data && typeof imageObj.data === 'object') {
            const imageData = imageObj.data as Record<string, unknown>

            if ('attributes' in imageData && imageData.attributes && typeof imageData.attributes === 'object') {
              const attrs = imageData.attributes as Record<string, unknown>

              if ('url' in attrs && typeof attrs.url === 'string') {
                const fullColumnarUrl = `${API_BASE_URL}${attrs.url}`

                result.image = {
                  url: fullColumnarUrl,
                  alt: typeof attrs.alternativeText === 'string' ? attrs.alternativeText : undefined,
                  width: typeof attrs.width === 'number' ? attrs.width : undefined,
                  height: typeof attrs.height === 'number' ? attrs.height : undefined,
                }
              }
            }
          }
        }

        // Extract text
        if ('Text' in item && typeof item.Text === 'string') {
          result.text = item.Text
        } else if ('text' in item && typeof item.text === 'string') {
          result.text = item.text
        }

        // Extract caption - check for localized captions first
        // Try caption_[locale] format (e.g., caption_en, caption_hi)
        const localeKey = `caption_${locale}`
        const LocaleKey = `Caption_${locale}`

        if (localeKey in item && typeof item[localeKey] === 'string') {
          result.caption = item[localeKey] as string
        } else if (LocaleKey in item && typeof item[LocaleKey] === 'string') {
          result.caption = item[LocaleKey] as string
        } else if ('Caption' in item && typeof item.Caption === 'string') {
          result.caption = item.Caption
        } else if ('caption' in item && typeof item.caption === 'string') {
          result.caption = item.caption
        }



        // Extract credits (photographer name)
        if ('credits' in item && item.credits && typeof item.credits === 'object') {
          const creditsObj = item.credits as Record<string, unknown>
          if ('data' in creditsObj && creditsObj.data && typeof creditsObj.data === 'object') {
            const creditsData = creditsObj.data as Record<string, unknown>
            if ('attributes' in creditsData && creditsData.attributes && typeof creditsData.attributes === 'object') {
              const creditsAttrs = creditsData.attributes as Record<string, unknown>
              if ('Name' in creditsAttrs && typeof creditsAttrs.Name === 'string') {
                result.credits = creditsAttrs.Name
              }
            }
          }
        }

        if (result.image || result.text) {
          results.push(result)
        }
      }
    })
  }

  return results
}

// Function to fetch story by slug
// Note: Strapi requires locale parameter to search for localized content
async function fetchStoryBySlug(slug: string) {
  try {
    // Extract locale from slug (e.g., "article-name-hi" -> "hi", "article-name-en" -> "en")
    // Common locale codes: en, hi, mr, ta, te, kn, ml, bn, gu/guj, pa, or, as, ur, bho, hne, chh
    // Support both 2-letter (gu) and 3-letter (guj) codes
    const localeMatch = slug.match(/-(en|hi|mr|ta|te|kn|ml|bn|gu|guj|pa|or|as|ur|bho|hne|chh|tam|tel|kan|mal|ben|ori|asm)$/)
    let detectedLocale = localeMatch ? localeMatch[1] : null

    // Normalize 3-letter codes to 2-letter codes
    // Also normalize alternative locale codes to match Strapi configuration
    const localeMap: { [key: string]: string } = {
      'guj': 'gu',
      'tam': 'ta',
      'tel': 'te',
      'kan': 'kn',
      'mal': 'ml',
      'ben': 'bn',
      'ori': 'or',
      'asm': 'as',
      'chh': 'hne'  // Chhattisgarhi: normalize 'chh' to 'hne' (Strapi locale code)
    }

    if (detectedLocale && localeMap[detectedLocale]) {
      detectedLocale = localeMap[detectedLocale]
    }

    const query = {
      filters: {
        slug: {
          $eq: slug
        }
      },
      // Only add locale if detected from slug, otherwise search all locales
      ...(detectedLocale ? { locale: detectedLocale } : {}),
      populate: {
        Cover_image: {
          fields: ['url']
        },
        Authors: {
          populate: {
            author_name: {
              fields: ['Name', 'Bio', 'Description']
            },
            author_role: {
              fields: ['Name']
            }
          }
        },
        categories: {
          fields: ['Title', 'slug']
        },
        location: {
          fields: ['name', 'district', 'state']
        },
        localizations: '*',
        Related_stories: {
          filters: {
            locale: {
              $eq: 'en'
            }
          },
          populate: {
            Cover_image: {
              fields: ['url']
            },
            Authors: {
              populate: {
                author_name: {
                  fields: ['Name']
                }
              }
            },
            categories: {
              fields: ['Title']
            },
            location: {
              fields: ['name', 'district', 'state']
            },
            localizations: {
              fields: ['locale', 'slug']
            }
          },
          fields: ['Title', 'Strap', 'slug', 'Original_published_date', 'locale']
        },
        Modular_Content: {
          populate: {
            // Text component fields
            Text: true,
            text: true,
            Paragraph: true,
            paragraph: true,
            // Image related fields
            image: {
              populate: '*'
            },
            media: {
              populate: '*'
            },
            photo: {
              populate: '*'
            },
            video: {
              populate: '*'
            },
            Images: {
              populate: '*'
            },
            images: {
              populate: '*'
            },
            Photo: {
              populate: '*'
            },
            Media: {
              populate: '*'
            },
            Image: {
              populate: '*'
            },
            columnar_images: {
              populate: '*'
            },
            Columnar_images: {
              populate: '*'
            },
            credits: {
              populate: '*'
            },
            Columnar_text: {
              populate: '*'
            },
            columnar_text: {
              populate: '*'
            },
            Text_columns: {
              populate: '*'
            },
            text_columns: {
              populate: '*'
            },
            Columns: {
              populate: '*'
            },
            columns: {
              populate: '*'
            },
            Left_column: {
              populate: '*'
            },
            left_column: {
              populate: '*'
            },
            Right_column: {
              populate: '*'
            },
            right_column: {
              populate: '*'
            },
            Content: {
              populate: '*'
            },
            content: {
              populate: '*'
            },
            article: {
              populate: {
                Cover_image: {
                  fields: ['url']
                },
                Authors: {
                  populate: {
                    author_name: {
                      fields: ['Name']
                    }
                  }
                }
              },
              fields: ['Title', 'Strap', 'strap', 'slug', 'Original_published_date', 'original_published_date']
            }
          }
        },
      }
    }

    const queryString = qs.stringify(query, { encodeValuesOnly: true })
    const apiUrl = `${BASE_URL}api/articles?${queryString}`

    const response = await axios.get(apiUrl)

    if (!response.data?.data || response.data.data.length === 0) {

      // If we used a locale filter and it failed, try again WITHOUT locale filter
      if (detectedLocale) {
        const retryQuery = {
          filters: {
            slug: {
              $eq: slug
            }
          },
          // No locale filter - search all locales
          populate: query.populate
        }

        const retryQueryString = qs.stringify(retryQuery, { encodeValuesOnly: true })
        const retryApiUrl = `${BASE_URL}api/articles?${retryQueryString}`

        try {
          const retryResponse = await axios.get(retryApiUrl)

          if (retryResponse.data?.data && retryResponse.data.data.length > 0) {
            // Use the retry response instead
            response.data = retryResponse.data
          }
        } catch {
          // Retry request failed
        }
      }

      // If still no data after retry, try partial search
      if (!response.data?.data || response.data.data.length === 0) {
        try {
          const partialQuery = {
            filters: {
              slug: {
                $contains: slug.split('-').slice(0, 3).join('-') // Search first 3 words
              }
            },
            fields: ['slug', 'Title', 'locale'],
            pagination: { limit: 10 }
          }
          const partialQueryString = qs.stringify(partialQuery, { encodeValuesOnly: true })
          const partialUrl = `${BASE_URL}api/articles?${partialQueryString}`

          await axios.get(partialUrl)
        } catch {
          // Partial search also failed
        }

        throw new Error('Story not found')
      }
    }

    const articleData = response.data.data[0] as ExtendedArticleData

    // Format author data - fetch from authors API for complete details
    const authors: Array<{
      name: string;
      title: string;
      bio?: string;
      email?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    }> = []

    // Get story locale first
    const storyLocale = articleData.attributes.locale || 'en'
    console.log('##Rohit_Rocks## Story locale for author fetch:', storyLocale)

    if (articleData.attributes.Authors && Array.isArray(articleData.attributes.Authors)) {
      // Helper function to fetch author details from authors API
      const fetchAuthorDetails = async (authorId: number) => {
        try {
          const authorResponse = await axios.get(`${API_BASE_URL}/v1/api/authors/${authorId}`, {
            params: {
              populate: '*'
            }
          })
          console.log('##Rohit_Rocks## Author details fetched:', authorResponse.data.data.attributes)
          return authorResponse.data.data.attributes
        } catch (error) {
          console.error('##Rohit_Rocks## Error fetching author details:', error)
          return null
        }
      }

      // Helper function to get bio based on locale
      const getBioForLocale = (authorDetails: { [key: string]: string }, locale: string) => {
        // Map locale codes to bio field names
        const bioFieldMap: { [key: string]: string } = {
          'en': 'Bio',
          'hi': 'Bio_hi',
          'mr': 'Bio_mr',
          'bn': 'Bio_bn',
          'ta': 'Bio_ta',
          'te': 'Bio_te',
          'kn': 'Bio_kn',
          'ml': 'Bio_ml',
          'gu': 'Bio_gu',
          'pa': 'Bio_pa',
          'or': 'Bio_or',
          'as': 'Bio_as',
          'ur': 'Bio_ur'
        }

        const bioField = bioFieldMap[locale] || 'Bio'
        const localizedBio = authorDetails[bioField]

        console.log('##Rohit_Rocks## Looking for bio in field:', bioField, 'for locale:', locale)
        console.log('##Rohit_Rocks## Available fields in authorDetails:', Object.keys(authorDetails))
        console.log('##Rohit_Rocks## Found bio in', bioField, ':', localizedBio ? 'Yes' : 'No')
        if (localizedBio) {
          console.log('##Rohit_Rocks## Bio content preview:', localizedBio.substring(0, 50) + '...')
        }

        // Return localized bio if exists, otherwise fallback to English Bio or Description
        const finalBio = localizedBio || authorDetails.Bio || authorDetails.Description || ''
        console.log('##Rohit_Rocks## Final bio being used:', finalBio ? finalBio.substring(0, 50) + '...' : 'No bio found')
        return finalBio
      }

      // Loop through all authors dynamically
      for (const authorItem of articleData.attributes.Authors) {
        let authorName = ''
        let authorRole = ''
        let authorBio = ''
        let authorEmail = ''
        let authorTwitter = ''
        let authorFacebook = ''
        let authorInstagram = ''
        let authorLinkedin = ''

        // Get author name
        if (authorItem?.author_name?.data?.id) {
          const authorDetails = await fetchAuthorDetails(authorItem.author_name.data.id)
          if (authorDetails) {
            authorName = authorDetails.Name || ''
            authorBio = getBioForLocale(authorDetails, storyLocale)
            authorEmail = authorDetails.Email || ''
            authorTwitter = authorDetails.TwitterURL || ''
            authorFacebook = authorDetails.FacebookURL || ''
            authorInstagram = authorDetails.InstagramURL || ''
            authorLinkedin = authorDetails.LinkedinURL || ''
          }
        }

        // Get author role
        if (authorItem?.author_role?.data?.attributes?.Name) {
          authorRole = authorItem.author_role.data.attributes.Name
        }

        // Only add if we have at least a name
        if (authorName) {
          authors.push({
            name: authorName,
            title: authorRole,
            bio: authorBio,
            email: authorEmail,
            twitter: authorTwitter,
            facebook: authorFacebook,
            instagram: authorInstagram,
            linkedin: authorLinkedin
          })
        }
      }
    }

    // Fallback if no authors found
    if (authors.length === 0) {
      authors.push({
        name: 'Unknown Author',
        title: '',
        bio: ''
      })
    }

    // Sort authors by role order
    const sortedAuthors = sortAuthorsByRole(authors)

    // Get cover image

    const coverImageUrl = articleData.attributes.Cover_image?.data?.attributes?.url
      ? `${API_BASE_URL}${articleData.attributes.Cover_image.data.attributes.url}`
      : undefined

    // Get categories with title and slug
    const categories = articleData.attributes.categories?.data?.map(
      cat => ({
        title: cat.attributes.Title || '',
        slug: cat.attributes.slug || ''
      })
    ) || []
    console.log('##Rohit_Rocks## Categories fetched:', categories)

    // Get location
    const location = articleData.attributes.location?.data?.attributes?.name ||
                    articleData.attributes.location_auto_suggestion ||
                    undefined

    // Get available languages from localizations with slugs
    let availableLanguages: Array<{ code: string; slug: string }> = []

    try {
      const localizationsData = articleData.attributes.localizations?.data || []
      const currentLocale = articleData.attributes.locale || 'en'
      const currentSlug = articleData.attributes.slug || slug

      // Build available languages array, filtering out duplicates and empty values
      const localizationLanguages = localizationsData
        .map((loc) => ({
          code: loc.attributes?.locale || '',
          slug: loc.attributes?.slug || ''
        }))
        .filter(lang => lang.code && lang.slug) // Remove empty values

      // Add current language first, then other localizations (avoiding duplicates)
      const filteredLocalizations = localizationLanguages.filter(lang => lang.code !== currentLocale)

      availableLanguages = [
        { code: currentLocale, slug: currentSlug },
        ...filteredLocalizations
      ]
    } catch (error) {
      console.error('Error extracting localizations:', error)
      // Fallback to just current language
      availableLanguages = [{ code: 'en', slug: slug }]
    }

    const finalContent = Array.isArray(articleData.attributes.Modular_Content)
      ? articleData.attributes.Modular_Content
      : []

    // Debug: Log all component types in Modular_Content
    console.log('##Rohit_Rocks## Total Modular_Content items:', finalContent.length)
    finalContent.forEach((item, index) => {
      if (item && typeof item === 'object' && '__component' in item) {
        console.log(`##Rohit_Rocks## Item ${index}: ${item.__component}`)
      }
    })

    const finalTitle = articleData.attributes.Title || "Untitled Story"

    // Extract Related_stories data

    const relatedStoriesData = articleData.attributes.Related_stories?.data || []

    // Extract is_student field
    const isStudent = Boolean(articleData.attributes.is_student)
    console.log('##Rohit_Rocks## API is_student:', articleData.attributes.is_student, '| Boolean:', isStudent)

    // Story locale already extracted earlier for author fetching
    console.log('##Rohit_Rocks## Story locale (final):', storyLocale)

    return {
      title: finalTitle,
      subtitle: articleData.attributes.Strap || articleData.attributes.strap || "",
      publishedDate: articleData.attributes.Original_published_date || new Date().toISOString(),
      authors: sortedAuthors,
      content: finalContent,
      coverImage: coverImageUrl,
      categories,
      location,
      availableLanguages,
      relatedStoriesData,
      isStudent,
      storyLocale
    }
  } catch (error) {
    console.error('Error fetching story:', error)
    throw error
  }
}
