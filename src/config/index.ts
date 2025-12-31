import { API_BASE_URL } from '@/utils/constants';

// Base URL for API endpoints
export const BASE_URL = `${API_BASE_URL}/v1/`;
export const IMAGE_URL = `${API_BASE_URL}/v1/`;

// Production site URL
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ruralindiaonline.org';

// EZForms configuration
export const EZFORMS_CONFIG = {
  apiUrl: `${BASE_URL}api/get-in-touch-models`,
  // Alternative endpoint if your Strapi doesn't use /api/ prefix
  // apiUrl: `${BASE_URL}ezforms/submit`,
};

// Brevo configuration
export const BREVO_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_BREVO_API_KEY,
  apiUrl: 'https://api.brevo.com/v3',
  senderEmail: process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'noreply@pari.org',
  senderName: process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || 'PARI Team',
  listIds: {
    newsletter: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID || '50'),
    contact: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID || '49'),
    intern: parseInt(process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID || '48'),
    contribute: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTRIBUTE_LIST_ID || '47'),
    donation: parseInt(process.env.NEXT_PUBLIC_BREVO_DONATION_LIST_ID || '46'),
    volunteer: parseInt(process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID || '45'),
    footer: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID || '50'), // Use newsletter for footer
    default: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID || '50'), // Use newsletter as default
    // Language-specific newsletter lists
    newsletterEnglish: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_ENGLISH_LIST_ID || '6', 10),
    newsletterPunjabi: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_PUNJABI_LIST_ID || '52', 10),
    newsletterMalayalam: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_MALAYALAM_LIST_ID || '51', 10),
    newsletterHindi: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_HINDI_LIST_ID || '50', 10),
    newsletterMarathi: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_MARATHI_LIST_ID || '50', 10),
    newsletterTelugu: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_TELUGU_LIST_ID || '50', 10),
    newsletterTamil: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_TAMIL_LIST_ID || '50', 10),
    newsletterUrdu: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_URDU_LIST_ID || '50', 10),
    newsletterBengali: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_BENGALI_LIST_ID || '50', 10),
    newsletterOdiya: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_ODIYA_LIST_ID || '50', 10),
    newsletterKannada: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_KANNADA_LIST_ID || '50', 10),
  },
};

// Debug log for Brevo configuration on load
console.log('##Rohit_Rocks## Brevo Config Loaded:', {
  hasApiKey: !!BREVO_CONFIG.apiKey,
  apiKeyPrefix: BREVO_CONFIG.apiKey ? BREVO_CONFIG.apiKey.substring(0, 10) + '...' : 'null',
  apiUrl: BREVO_CONFIG.apiUrl,
  senderEmail: BREVO_CONFIG.senderEmail,
  senderName: BREVO_CONFIG.senderName,
  listIds: BREVO_CONFIG.listIds,
  envVars: {
    NEXT_PUBLIC_BREVO_API_KEY: !!process.env.NEXT_PUBLIC_BREVO_API_KEY,
    NEXT_PUBLIC_BREVO_SENDER_EMAIL: !!process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL,
    NEXT_PUBLIC_BREVO_SENDER_NAME: !!process.env.NEXT_PUBLIC_BREVO_SENDER_NAME,
    NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID,
    NEXT_PUBLIC_BREVO_CONTACT_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID,
    NEXT_PUBLIC_BREVO_INTERN_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID,
    NEXT_PUBLIC_BREVO_CONTRIBUTE_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_CONTRIBUTE_LIST_ID,
    NEXT_PUBLIC_BREVO_DONATION_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_DONATION_LIST_ID,
    NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID,
  },
  timestamp: new Date().toISOString()
});
