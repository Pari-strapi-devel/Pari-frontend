// Base URL for API endpoints
// Use environment variable if available, otherwise fallback to beta URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://beta.ruralindiaonline.org'

export const BASE_URL = `${API_BASE}/v1/`;
export const IMAGE_URL = `${API_BASE}/v1/`;

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
    footer: parseInt(process.env.NEXT_PUBLIC_BREVO_FOOTER_LIST_ID || '7'),
    contact: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID || '8'),
    intern: parseInt(process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID || '9'),
    volunteer: parseInt(process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID || '10'),
    newsletter: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID || '7'),
    default: parseInt(process.env.NEXT_PUBLIC_BREVO_DEFAULT_LIST_ID || '6'),
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
    NEXT_PUBLIC_BREVO_FOOTER_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_FOOTER_LIST_ID,
    NEXT_PUBLIC_BREVO_CONTACT_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID,
    NEXT_PUBLIC_BREVO_INTERN_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID,
    NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID,
    NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID,
    NEXT_PUBLIC_BREVO_DEFAULT_LIST_ID: !!process.env.NEXT_PUBLIC_BREVO_DEFAULT_LIST_ID,
  },
  timestamp: new Date().toISOString()
});
