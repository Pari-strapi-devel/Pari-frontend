# Brevo Email Automation Integration for PARI Project

This document explains how Brevo (formerly Sendinblue) email automation has been integrated into your PARI project.

## Overview

Brevo is a comprehensive email marketing and automation platform that allows you to manage contacts, send transactional emails, and automate email campaigns. This integration provides seamless email automation for form submissions, newsletter subscriptions, and contact management.

## Configuration

### Environment Variables

The following environment variables have been configured in your `.env.local` file:

```bash
# Brevo Email Configuration
NEXT_PUBLIC_BREVO_API_KEY=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

# Brevo Email Settings
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply@pari.org
NEXT_PUBLIC_BREVO_SENDER_NAME=PARI Team

# Brevo List IDs - Each form gets its own list
NEXT_PUBLIC_BREVO_FOOTER_LIST_ID=1
NEXT_PUBLIC_BREVO_CONTACT_LIST_ID=2
NEXT_PUBLIC_BREVO_INTERN_LIST_ID=3
NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID=4
NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID=5
NEXT_PUBLIC_BREVO_DEFAULT_LIST_ID=6
```

### Configuration File

The Brevo configuration is centralized in `src/config/index.ts`:

```typescript
export const BREVO_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_BREVO_API_KEY,
  apiUrl: 'https://api.brevo.com/v3',
  senderEmail: process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'noreply@pari.org',
  senderName: process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || 'PARI Team',
  listIds: {
    footer: parseInt(process.env.NEXT_PUBLIC_BREVO_FOOTER_LIST_ID || '1'),
    contact: parseInt(process.env.NEXT_PUBLIC_BREVO_CONTACT_LIST_ID || '2'),
    intern: parseInt(process.env.NEXT_PUBLIC_BREVO_INTERN_LIST_ID || '3'),
    volunteer: parseInt(process.env.NEXT_PUBLIC_BREVO_VOLUNTEER_LIST_ID || '4'),
    newsletter: parseInt(process.env.NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID || '5'),
    default: parseInt(process.env.NEXT_PUBLIC_BREVO_DEFAULT_LIST_ID || '6'),
  },
};
```

## Project Structure

The Brevo integration includes the following new files:

```
src/
├── lib/
│   └── brevo.ts                 # Core Brevo API functions
├── hooks/
│   └── useBrevo.ts             # React hooks for Brevo integration
├── app/
│   └── brevo-demo/
│       └── page.tsx            # Demo page for testing integration
└── config/
    └── index.ts                # Updated with Brevo configuration
```

## Core Functions

### `src/lib/brevo.ts`

This file contains the core Brevo API functions:

- `addBrevoContact()` - Add or update a contact in Brevo
- `subscribeToNewsletter()` - Subscribe to newsletter
- `addContactFormSubmission()` - Add contact form submission
- `addInternApplication()` - Add intern application
- `addVolunteerApplication()` - Add volunteer application
- `sendBrevoEmail()` - Send transactional emails
- `isBrevoConfigured()` - Check if Brevo is properly configured

### `src/hooks/useBrevo.ts`

React hooks for easy integration:

- `useBrevo()` - General Brevo hook with all functions
- `useNewsletterSubscription()` - Simplified newsletter subscription
- `useContactFormBrevo()` - Contact form specific hook
- `useInternBrevo()` - Intern application specific hook
- `useVolunteerBrevo()` - Volunteer application specific hook

## Usage Examples

### Newsletter Subscription

```typescript
import { useNewsletterSubscription } from '@/hooks/useBrevo';

const NewsletterForm = () => {
  const { subscribe, isLoading, isSuccess, error, reset } = useNewsletterSubscription();

  const handleSubmit = async (email: string, name?: string) => {
    await subscribe(email, name);
  };

  return (
    // Your form JSX
  );
};
```

### Contact Form Integration

```typescript
import { useContactFormBrevo } from '@/hooks/useBrevo';

const ContactForm = () => {
  const { submitForm, isLoading, isSuccess, error } = useContactFormBrevo();

  const handleSubmit = async (formData) => {
    await submitForm(
      formData.email,
      formData.name,
      formData.phone,
      formData.message
    );
  };

  return (
    // Your form JSX
  );
};
```

### Intern Application Integration

```typescript
import { useInternBrevo } from '@/hooks/useBrevo';

const InternForm = () => {
  const { submitApplication, isLoading, isSuccess, error } = useInternBrevo();

  const handleSubmit = async (formData) => {
    await submitApplication(
      formData.email,
      formData.fullName,
      formData.phone,
      formData.collegeName,
      formData.course
    );
  };

  return (
    // Your form JSX
  );
};
```

## Integrated Components

The following components have been updated with Brevo integration:

### 1. Footer Newsletter Subscription
- **File**: `src/components/layout/footer/Footer.tsx`
- **Functionality**: Newsletter subscription with success/error feedback
- **List**: Newsletter list (ID: 5)

### 2. Contact Form
- **File**: `src/components/contact/ContactForm.tsx`
- **Functionality**: Contact form submissions with Brevo automation
- **List**: Contact list (ID: 2)

### 3. Intern Application
- **File**: `src/app/intern/page.tsx`
- **Functionality**: Intern application tracking
- **List**: Intern list (ID: 3)

### 4. Volunteer Application
- **File**: `src/app/volunteer/page.tsx`
- **Functionality**: Volunteer application tracking
- **List**: Volunteer list (ID: 4)

## Features

### Contact Management
- Automatic contact creation and updates
- Custom attributes for different form types
- List segmentation for different purposes
- Duplicate contact handling

### Email Automation
- Transactional email sending
- Template-based emails
- Automatic list management
- Error handling and retry logic

### User Experience
- Loading states during submission
- Success/error message display
- Form validation integration
- Graceful fallback when Brevo is not configured

### Developer Experience
- TypeScript support throughout
- Comprehensive error handling
- Reusable hooks and utilities
- Easy configuration management
- Development mode simulation

## API Endpoints

Brevo integration uses the following API endpoints:

- `POST https://api.brevo.com/v3/contacts` - Create/update contacts
- `POST https://api.brevo.com/v3/smtp/email` - Send transactional emails
- `GET https://api.brevo.com/v3/contacts/lists` - Get contact lists
- `DELETE https://api.brevo.com/v3/contacts/{email}` - Remove contacts

## Testing

### Demo Page
Visit `/brevo-demo` to test the Brevo integration with sample forms.

### Development Mode
When Brevo is not configured (missing API key), the integration will:
- Log simulation messages to console
- Return success responses for testing
- Display appropriate user feedback

## Error Handling

The integration includes comprehensive error handling:

- **Network errors**: Automatic retry and user feedback
- **API errors**: Specific error messages from Brevo API
- **Validation errors**: Client-side validation before submission
- **Configuration errors**: Graceful fallback when not configured

## Security Considerations

- API key is stored in environment variables
- Client-side validation prevents malicious submissions
- Rate limiting handled by Brevo API
- CORS configuration required for production

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key in Brevo dashboard
   - Check environment variable spelling
   - Restart development server after changes

2. **Contacts Not Being Added**
   - Check list IDs in Brevo dashboard
   - Verify email format validation
   - Check browser network tab for API errors

3. **CORS Errors**
   - Ensure domain is whitelisted in Brevo settings
   - Check API key permissions

### Debug Mode

Enable debug logging by checking the browser console for:
- API request/response logs
- Configuration status messages
- Error details and stack traces

## Next Steps

1. **Set up email templates** in Brevo dashboard for automated responses
2. **Configure automation workflows** for different form types
3. **Set up email campaigns** for newsletter subscribers
4. **Monitor analytics** in Brevo dashboard
5. **Customize email content** based on form data

## Support

For issues with the Brevo integration:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test with the demo page at `/brevo-demo`
4. Check Brevo API documentation for specific errors
5. Review the integration code in `src/lib/brevo.ts`

## API Documentation

- [Brevo API Documentation](https://developers.brevo.com/)
- [Brevo Contact Management](https://developers.brevo.com/docs/contacts)
- [Brevo Transactional Emails](https://developers.brevo.com/docs/send-a-transactional-email)
