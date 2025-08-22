'use client';

import React from 'react';
import { SimpleEZForm } from '@/components/forms/SimpleEZForm';

export default function EZFormsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            EZForms Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            This page demonstrates the EZForms integration with your PARI project. 
            Forms submitted here will be processed by Strapi EZForms plugin.
          </p>
        </div>

        {/* Demo Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Simple Contact Form */}
          <SimpleEZForm
            formName="Demo Contact Form"
            title="Contact Form Demo"
            description="Test the basic contact form functionality."
          />

          {/* Newsletter Signup Form */}
          <SimpleEZForm
            formName="Newsletter Signup"
            title="Newsletter Demo"
            description="Test newsletter subscription form."
          />
        </div>

        {/* Information Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            About EZForms Integration
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Features Included:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Automatic form validation</li>
              <li>Spam protection (configurable)</li>
              <li>Email notifications (configurable)</li>
              <li>Database storage of form submissions</li>
              <li>Loading states and error handling</li>
              <li>Success/error message display</li>
              <li>Dark mode support</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Configuration:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-6">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {`// In your Strapi config/plugins.js
ezforms: {
  config: {
    captchaProvider: {
      name: 'none', // or 'recaptcha'
    },
    notificationProviders: [
      // Configure email providers here
    ]
  }
}`}
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              API Endpoint:
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Forms submit to: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                {process.env.NODE_ENV === 'development' 
                  ? 'https://beta.ruralindiaonline.org/v1/api/ezforms/submit'
                  : 'Your Strapi URL/api/ezforms/submit'
                }
              </code>
            </p>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Usage in Components:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {`import { EZFormWrapper } from '@/components/forms/EZFormWrapper';

<EZFormWrapper
  formName="My Form"
  requiredFields={['name', 'email']}
  onSuccess={() => console.log('Success!')}
>
  {({ submitForm, isSubmitting, error }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      submitForm(formData);
    }}>
      {/* Your form fields */}
    </form>
  )}
</EZFormWrapper>`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
