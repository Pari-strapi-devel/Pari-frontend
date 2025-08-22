'use client';

import React, { useState } from 'react';
import { useBrevo, useNewsletterSubscription } from '@/hooks/useBrevo';


const BrevoDemo = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // Newsletter subscription hook
  const { 
    subscribe, 
    isLoading: isSubscribing, 
    isSuccess: subscribeSuccess, 
    error: subscribeError,
    reset: resetSubscribe 
  } = useNewsletterSubscription();

  // General Brevo hook
  const { 
    submitContactForm, 
    isLoading: isSubmittingContact, 
    isSuccess: contactSuccess, 
    error: contactError,
    reset: resetContact,
    isConfigured 
  } = useBrevo();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    console.log('##Rohit_Rocks## Brevo Demo - Newsletter Submit:', {
      email: email.trim(),
      name: name.trim() || undefined,
      timestamp: new Date().toISOString()
    });

    const result = await subscribe(email.trim(), name.trim() || undefined);
    console.log('##Rohit_Rocks## Brevo Demo - Newsletter Result:', result);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    console.log('##Rohit_Rocks## Brevo Demo - Contact Submit:', {
      email: email.trim(),
      name: name.trim(),
      hasPhone: !!phone.trim(),
      hasMessage: !!message.trim(),
      timestamp: new Date().toISOString()
    });

    const result = await submitContactForm(
      email.trim(),
      name.trim(),
      phone.trim() || undefined,
      message.trim() || undefined
    );
    console.log('##Rohit_Rocks## Brevo Demo - Contact Result:', result);
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPhone('');
    setMessage('');
    resetSubscribe();
    resetContact();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Brevo Integration Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Test the Brevo email automation integration
          </p>
          
          {/* Configuration Status */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isConfigured 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
          }`}>
            {isConfigured ? '✅ Brevo is configured' : '❌ Brevo is not configured'}
          </div>
          
          {!isConfigured && (
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Brevo API key is not configured. Forms will simulate submissions in development mode.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Newsletter Subscription Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Newsletter Subscription
            </h2>
            
            {subscribeSuccess && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200">
                Successfully subscribed to newsletter!
              </div>
            )}
            
            {subscribeError && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200">
                {subscribeError}
              </div>
            )}

            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                  required
                  disabled={isSubscribing}
                />
              </div>
              
              <div>
                <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="newsletter-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                  disabled={isSubscribing}
                />
              </div>

              <button
                type="submit"
                disabled={isSubscribing || !email.trim()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe to Newsletter'}
              </button>
            </form>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Form
            </h2>
            
            {contactSuccess && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200">
                Contact form submitted successfully!
              </div>
            )}
            
            {contactError && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200">
                {contactError}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                  required
                  disabled={isSubmittingContact}
                />
              </div>
              
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="contact-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                  required
                  disabled={isSubmittingContact}
                />
              </div>
              
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your phone number"
                  disabled={isSubmittingContact}
                />
              </div>
              
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your message"
                  disabled={isSubmittingContact}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingContact || !email.trim() || !name.trim()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingContact ? 'Submitting...' : 'Submit Contact Form'}
              </button>
            </form>
          </div>
        </div>

        {/* Reset Button */}
        <div className="text-center mt-8">
          <button
            onClick={resetForm}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset All Forms
          </button>
        </div>

        {/* Information Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            About Brevo Integration
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This demo showcases the Brevo email automation integration for the PARI project. 
              The integration includes:
            </p>
            
            <ul className="text-gray-600 dark:text-gray-300 mb-6">
              <li>Newsletter subscription management</li>
              <li>Contact form submissions</li>
              <li>Intern application tracking</li>
              <li>Volunteer application tracking</li>
              <li>Automatic email list management</li>
              <li>Error handling and user feedback</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Configuration:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-6">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {`// Environment Variables
NEXT_PUBLIC_BREVO_API_KEY=xkeysib-your-api-key-here
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply@pari.org
NEXT_PUBLIC_BREVO_SENDER_NAME=PARI Team
NEXT_PUBLIC_BREVO_NEWSLETTER_LIST_ID=5`}
              </code>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Usage in Components:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {`import { useNewsletterSubscription } from '@/hooks/useBrevo';

const { subscribe, isLoading, isSuccess, error } = useNewsletterSubscription();

await subscribe('user@example.com', 'User Name');`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrevoDemo;
