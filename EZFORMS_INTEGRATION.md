# EZForms Integration for PARI Project

This document explains how Strapi EZForms has been integrated into your PARI project.

## Overview

EZForms is a Strapi plugin that allows you to easily handle form submissions with automatic spam protection, email notifications, and database storage. This integration provides a seamless way to manage forms in your Next.js frontend.

## Installation

The following package has been installed:
```bash
npm install strapi-plugin-ezforms
```

## Project Structure

The EZForms integration includes the following new files:

```
src/
├── lib/
│   └── ezforms.ts                    # Core EZForms utilities
├── hooks/
│   └── useEZForm.ts                  # React hook for form handling
├── components/
│   └── forms/
│       ├── EZFormWrapper.tsx         # Wrapper component with render props
│       └── SimpleEZForm.tsx          # Example form component
├── app/
│   └── ezforms-demo/
│       └── page.tsx                  # Demo page for testing
└── config/
    └── index.ts                      # Updated with EZForms config
```

## Configuration

### Frontend Configuration

The EZForms API endpoint is configured in `src/config/index.ts`:

```typescript
export const EZFORMS_CONFIG = {
  apiUrl: `${BASE_URL}api/ezforms/submit`,
};
```

### Backend Configuration (Strapi)

You need to configure the EZForms plugin in your Strapi backend. Add this to your `config/plugins.js`:

```javascript
module.exports = {
  // ... other plugins
  ezforms: {
    config: {
      captchaProvider: {
        name: 'none', // or 'recaptcha' for spam protection
      },
      notificationProviders: [
        // Add email notification providers here
        // Example:
        // {
        //   name: 'email',
        //   enabled: true,
        //   config: {
        //     // Email configuration
        //   }
        // }
      ]
    }
  }
};
```

## Usage

### Basic Usage with Hook

```typescript
import { useEZForm } from '@/hooks/useEZForm';

const MyForm = () => {
  const { isSubmitting, isSuccess, error, submitForm } = useEZForm({
    formName: 'Contact Form',
    requiredFields: ['name', 'email'],
    onSuccess: () => console.log('Form submitted successfully!'),
  });

  const handleSubmit = async (formData) => {
    await submitForm(formData);
  };

  // ... rest of component
};
```

### Using the Wrapper Component

```typescript
import { EZFormWrapper } from '@/components/forms/EZFormWrapper';

const MyForm = () => (
  <EZFormWrapper
    formName="My Form"
    requiredFields={['name', 'email']}
    onSuccess={() => console.log('Success!')}
  >
    {({ submitForm, isSubmitting, error, isSuccess }) => (
      <form onSubmit={(e) => {
        e.preventDefault();
        submitForm(formData);
      }}>
        {/* Your form fields */}
      </form>
    )}
  </EZFormWrapper>
);
```

## Updated Components

### Contact Form
The existing contact form (`src/components/contact/ContactForm.tsx`) has been updated to use EZForms with:
- Automatic validation
- Loading states
- Success/error messages
- Form reset on successful submission

### Intern Application Form
The intern application form (`src/app/intern/page.tsx`) now uses EZForms for the final submission with:
- Multi-step form support
- File upload handling (file names stored)
- Comprehensive validation
- User feedback

## Features

### Validation
- Client-side validation for required fields
- Email format validation
- Phone number format validation
- Custom validation rules support

### User Experience
- Loading spinners during submission
- Success messages with customizable text
- Error message display
- Validation error highlighting
- Form reset on successful submission

### Developer Experience
- TypeScript support
- Reusable components
- Flexible render props pattern
- Easy configuration
- Comprehensive error handling

## API Endpoints

Forms submit to the following endpoint:
```
POST /api/ezforms/submit
```

Request format:
```json
{
  "formName": "Contact Form",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello world"
  },
  "token": "optional-captcha-token"
}
```

## Testing

Visit `/ezforms-demo` to test the EZForms integration with sample forms.

## Customization

### Adding Captcha Protection

To add reCAPTCHA protection:

1. Configure reCAPTCHA in your Strapi backend
2. Install a reCAPTCHA library in your frontend
3. Pass the captcha token to `submitForm`:

```typescript
const captchaToken = await getCaptchaToken();
await submitForm(formData, captchaToken);
```

### Email Notifications

Configure email providers in your Strapi backend to automatically send notifications when forms are submitted.

### Custom Styling

All components support custom CSS classes and can be styled to match your design system.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Strapi backend allows requests from your frontend domain
2. **404 Errors**: Verify the EZForms plugin is installed and enabled in Strapi
3. **Validation Errors**: Check that required fields match between frontend and backend

### Debug Mode

Enable debug logging by adding console logs in the EZForms utilities or checking the browser's network tab for API requests.

## Next Steps

1. Configure email notifications in Strapi
2. Add reCAPTCHA for spam protection
3. Customize form styling to match your design
4. Add file upload functionality for forms that need it
5. Set up form submission analytics

## Support

For issues with the EZForms plugin itself, visit:
- [EZForms Documentation](https://ezforms.excl.dev)
- [GitHub Repository](https://github.com/excl-networks/strapi-plugin-ezforms)
