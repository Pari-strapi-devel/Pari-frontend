import { useState, useCallback } from 'react';
import { 
  submitEZForm, 
  validateFormData, 
  createFormSubmission,
  EZFormData,
  EZFormResponse 
} from '@/lib/ezforms';

export interface UseEZFormOptions {
  formName?: string;
  requiredFields?: string[];
  onSuccess?: (response: EZFormResponse) => void;
  onError?: (error: string) => void;
  validateOnSubmit?: boolean;
}

export interface UseEZFormReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  validationErrors: string[];
  submitForm: (formData: EZFormData, captchaToken?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for handling EZForms submissions
 * @param options - Configuration options for the form
 * @returns Form state and submission functions
 */
export const useEZForm = (options: UseEZFormOptions = {}): UseEZFormReturn => {
  const {
    formName,
    requiredFields = [],
    onSuccess,
    onError,
    validateOnSubmit = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
    setValidationErrors([]);
  }, []);

  const submitForm = useCallback(async (formData: EZFormData, captchaToken?: string) => {
    // Reset previous state
    setError(null);
    setValidationErrors([]);
    setIsSuccess(false);

    // Validate form data if enabled
    if (validateOnSubmit) {
      const validation = validateFormData(formData, requiredFields);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        onError?.(validation.errors.join(', '));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create submission object
      const submission = createFormSubmission(formData, formName, captchaToken);
      
      // Submit form
      const response = await submitEZForm(submission);

      if (response.success) {
        setIsSuccess(true);
        onSuccess?.(response);
      } else {
        setError(response.message || 'Form submission failed');
        onError?.(response.message || 'Form submission failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formName, requiredFields, onSuccess, onError, validateOnSubmit]);

  return {
    isSubmitting,
    isSuccess,
    error,
    validationErrors,
    submitForm,
    reset,
  };
};
