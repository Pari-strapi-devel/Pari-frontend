'use client';

import React, { useState } from 'react';
import { EZFormWrapper, FormSuccessMessage, FormErrorMessage, FormValidationErrors, FormLoadingSpinner } from './EZFormWrapper';

interface SimpleFormData {
  name: string;
  email: string;
  message: string;
  [key: string]: string | number | boolean | File | null | undefined;
}

interface SimpleEZFormProps {
  formName?: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Simple example form component using EZForms
 * This demonstrates how to create a basic form with EZForms integration
 */
export const SimpleEZForm: React.FC<SimpleEZFormProps> = ({
  formName = 'Simple Contact Form',
  title = 'Get in Touch',
  description = 'Send us a message and we\'ll get back to you.',
  className = 'max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'
}) => {
  const [formData, setFormData] = useState<SimpleFormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>

      <EZFormWrapper
        formName={formName}
        requiredFields={['name', 'email', 'message']}
        onSuccess={resetForm}
      >
        {({ isSubmitting, isSuccess, error, validationErrors, submitForm }) => (
          <>
            {/* Success Message */}
            {isSuccess && (
              <FormSuccessMessage 
                message="Thank you! Your message has been sent successfully."
                className="mb-4"
              />
            )}

            {/* Error Message */}
            {error && (
              <FormErrorMessage 
                error={error}
                className="mb-4"
              />
            )}

            {/* Validation Errors */}
            <FormValidationErrors 
              errors={validationErrors}
              className="mb-4"
            />

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await submitForm(formData);
              }}
              className="space-y-4"
            >
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your message..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-PARI-Red text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FormLoadingSpinner className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </>
        )}
      </EZFormWrapper>
    </div>
  );
};
