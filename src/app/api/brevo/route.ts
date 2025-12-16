import { NextRequest, NextResponse } from 'next/server';

const BREVO_API_KEY = process.env.NEXT_PUBLIC_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Main newsletter list ID - all subscriptions go here
const MAIN_NEWSLETTER_LIST_ID = 50;

// List IDs
const LIST_IDS = {
  newsletter: MAIN_NEWSLETTER_LIST_ID,
  contact: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID || '49'),
  intern: parseInt(process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID || '48'),
  contribute: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTRIBUTE_LIST_ID || '47'),
  donation: parseInt(process.env.NEXT_PUBLIC_BREVO_DONATION_LIST_ID || '46'),
  volunteer: parseInt(process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID || '45'),
};

// Language-specific newsletter list IDs
const LANGUAGE_LIST_IDS: Record<string, number> = {
  'en': 6,
  'english': 6,
  'pa': 52,
  'punjabi': 52,
  'ml': 51,
  'malayalam': 51,
};

// Get language-specific list ID
const getLanguageListId = (language?: string): number | null => {
  if (!language) return null;
  const normalizedLanguage = language.toLowerCase().trim();
  return LANGUAGE_LIST_IDS[normalizedLanguage] || null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('##Rohit_Rocks## Brevo API Route - Action:', action, 'Data:', data);

    if (!BREVO_API_KEY) {
      console.error('##Rohit_Rocks## Brevo API Key not configured');
      return NextResponse.json(
        { success: false, error: 'Brevo not configured' },
        { status: 500 }
      );
    }

    let endpoint = '';
    let payload = {};

    switch (action) {
      case 'addContact':
      case 'newsletter':
      case 'contact':
      case 'intern':
      case 'volunteer':
      case 'donation':
      case 'contribute':
        endpoint = '/contacts';

        // Get list IDs - always include main newsletter list (50) + language-specific list
        let listIds: number[] = [];

        if (data.listIds && Array.isArray(data.listIds)) {
          listIds = data.listIds;
        } else {
          // Get base list ID from action type
          const baseListId = LIST_IDS[action as keyof typeof LIST_IDS] || MAIN_NEWSLETTER_LIST_ID;
          listIds = [baseListId];

          // For newsletter, also add language-specific list if language is provided
          if (action === 'newsletter' || action === 'addContact') {
            const language = data.attributes?.LANGUAGE;
            if (language) {
              const languageListId = getLanguageListId(language);
              // Add language list if it exists and is different from base
              if (languageListId && languageListId !== baseListId && !listIds.includes(languageListId)) {
                listIds.push(languageListId);
              }
            }
          }
        }

        console.log('##Rohit_Rocks## Newsletter List IDs:', listIds, 'Language:', data.attributes?.LANGUAGE);

        payload = {
          email: data.email,
          attributes: data.attributes || {},
          listIds: listIds,
          updateEnabled: true,
        };
        break;

      case 'sendEmail':
        endpoint = '/smtp/email';
        payload = {
          templateId: data.templateId,
          to: data.to,
          params: data.params,
          replyTo: data.replyTo,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    console.log('##Rohit_Rocks## Brevo API Request:', { endpoint, payload });

    const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('##Rohit_Rocks## Brevo API Response:', response.status, responseText);

    // Handle duplicate contact (still a success)
    if (response.status === 400 && responseText.includes('duplicate_parameter')) {
      return NextResponse.json({
        success: true,
        message: 'Contact already exists and was updated',
      });
    }

    if (!response.ok) {
      console.error('##Rohit_Rocks## Brevo API Error:', response.status, responseText);
      return NextResponse.json(
        { success: false, error: `Brevo API error: ${response.status}` },
        { status: response.status }
      );
    }

    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      // Response might be empty for successful contact creation
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully submitted to Brevo',
      data: result,
    });

  } catch (error) {
    console.error('##Rohit_Rocks## Brevo API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

