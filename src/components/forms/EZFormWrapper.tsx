'use client';

import React, { ReactNode } from 'react';
import { useEZForm, UseEZFormOptions } from '@/hooks/useEZForm';
import { EZFormData } from '@/lib/ezforms';

export interface EZFormWrapperProps extends UseEZFormOptions {
  children: (props: EZFormWrapperChildProps) => ReactNode;
  className?: string;
}

export interface EZFormWrapperChildProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  validationErrors: string[];
  submitForm: (formData: EZFormData, captchaToken?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Wrapper component that provides EZForms functionality to child components
 * Uses render props pattern for maximum flexibility
 */
export const EZFormWrapper: React.FC<EZFormWrapperProps> = ({
  children,
  className,
  ...ezFormOptions
}) => {
  const ezFormProps = useEZForm(ezFormOptions);

  return (
    <div className={className}>
      {children(ezFormProps)}
    </div>
  );
};

/**
 * Success message component
 */
export const FormSuccessMessage: React.FC<{ 
  message?: string;
  className?: string;
}> = ({ 
  message = 'Form submitted successfully!',
  className = 'p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md text-green-800 dark:text-green-200'
}) => (
  <div className={className}>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

/**
 * Error message component
 */
export const FormErrorMessage: React.FC<{ 
  error: string;
  className?: string;
}> = ({ 
  error,
  className = 'p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-200'
}) => (
  <div className={className}>
    <p className="text-sm font-medium">{error}</p>
  </div>
);

/**
 * Validation errors component
 */
export const FormValidationErrors: React.FC<{ 
  errors: string[];
  className?: string;
}> = ({ 
  errors,
  className = 'p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200'
}) => {
  if (errors.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-sm font-medium mb-2">Please fix the following errors:</p>
      <ul className="text-sm list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Loading spinner component
 */
export const FormLoadingSpinner: React.FC<{ 
  className?: string;
}> = ({ 
  className = 'inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'
}) => (
  <div className={className} />
);
