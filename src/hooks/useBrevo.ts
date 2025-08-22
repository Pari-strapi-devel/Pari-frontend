import { useState, useCallback } from 'react';
import {
  addBrevoContact,
  subscribeToNewsletter,
  addContactFormSubmission,
  addInternApplication,
  addVolunteerApplication,
  sendBrevoEmail,
  isBrevoConfigured,
  type BrevoContact,
  type BrevoEmailTemplate,
  type BrevoResponse,
} from '@/lib/brevo';

export interface UseBrevoState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface UseBrevoActions {
  addContact: (contact: BrevoContact) => Promise<BrevoResponse>;
  subscribeNewsletter: (email: string, name?: string) => Promise<BrevoResponse>;
  submitContactForm: (email: string, name: string, phone?: string, message?: string) => Promise<BrevoResponse>;
  submitInternForm: (email: string, fullName: string, phone?: string, collegeName?: string, course?: string) => Promise<BrevoResponse>;
  submitVolunteerForm: (email: string, fullName: string, phone?: string, skills?: string) => Promise<BrevoResponse>;
  sendEmail: (emailData: BrevoEmailTemplate) => Promise<BrevoResponse>;
  reset: () => void;
  isConfigured: boolean;
}

export type UseBrevoReturn = UseBrevoState & UseBrevoActions;

/**
 * React hook for Brevo email automation
 */
export const useBrevo = (): UseBrevoReturn => {
  const [state, setState] = useState<UseBrevoState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  const executeBrevoAction = useCallback(async (
    action: () => Promise<BrevoResponse>
  ): Promise<BrevoResponse> => {
    console.log('##Rohit_Rocks## useBrevo Hook - Executing Action:', {
      timestamp: new Date().toISOString(),
      currentState: state
    });

    setState(prev => ({ ...prev, isLoading: true, error: null, isSuccess: false }));

    try {
      console.log('##Rohit_Rocks## useBrevo Hook - Calling Brevo Action');
      const result = await action();

      console.log('##Rohit_Rocks## useBrevo Hook - Action Result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        hasData: !!result.data
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: result.success,
        error: result.success ? null : (result.error || 'Operation failed'),
      }));

      if (result.success) {
        console.log('##Rohit_Rocks## useBrevo Hook - Action Successful');
      } else {
        console.error('##Rohit_Rocks## useBrevo Hook - Action Failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('##Rohit_Rocks## useBrevo Hook - Exception Caught:', {
        error,
        errorMessage,
        errorType: typeof error
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      console.log('##Rohit_Rocks## useBrevo Hook - Action Complete');
    }
  }, [state]);

  const addContact = useCallback(async (contact: BrevoContact): Promise<BrevoResponse> => {
    return executeBrevoAction(() => addBrevoContact(contact));
  }, [executeBrevoAction]);

  const subscribeNewsletter = useCallback(async (email: string, name?: string): Promise<BrevoResponse> => {
    return executeBrevoAction(() => subscribeToNewsletter(email, name));
  }, [executeBrevoAction]);

  const submitContactForm = useCallback(async (
    email: string,
    name: string,
    phone?: string,
    message?: string
  ): Promise<BrevoResponse> => {
    return executeBrevoAction(() => addContactFormSubmission(email, name, phone, message));
  }, [executeBrevoAction]);

  const submitInternForm = useCallback(async (
    email: string,
    fullName: string,
    phone?: string,
    collegeName?: string,
    course?: string
  ): Promise<BrevoResponse> => {
    return executeBrevoAction(() => addInternApplication(email, fullName, phone, collegeName, course));
  }, [executeBrevoAction]);

  const submitVolunteerForm = useCallback(async (
    email: string,
    fullName: string,
    phone?: string,
    skills?: string
  ): Promise<BrevoResponse> => {
    return executeBrevoAction(() => addVolunteerApplication(email, fullName, phone, skills));
  }, [executeBrevoAction]);

  const sendEmail = useCallback(async (emailData: BrevoEmailTemplate): Promise<BrevoResponse> => {
    return executeBrevoAction(() => sendBrevoEmail(emailData));
  }, [executeBrevoAction]);

  return {
    // State
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    error: state.error,
    
    // Actions
    addContact,
    subscribeNewsletter,
    submitContactForm,
    submitInternForm,
    submitVolunteerForm,
    sendEmail,
    reset,
    
    // Configuration
    isConfigured: isBrevoConfigured(),
  };
};

/**
 * Hook specifically for newsletter subscription (simplified)
 */
export const useNewsletterSubscription = () => {
  const { subscribeNewsletter, isLoading, isSuccess, error, reset } = useBrevo();

  const subscribe = useCallback(async (email: string, name?: string) => {
    const result = await subscribeNewsletter(email, name);
    return result;
  }, [subscribeNewsletter]);

  return {
    subscribe,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook specifically for contact form submissions
 */
export const useContactFormBrevo = () => {
  const { submitContactForm, isLoading, isSuccess, error, reset } = useBrevo();

  const submitForm = useCallback(async (
    email: string,
    name: string,
    phone?: string,
    message?: string
  ) => {
    const result = await submitContactForm(email, name, phone, message);
    return result;
  }, [submitContactForm]);

  return {
    submitForm,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook specifically for intern applications
 */
export const useInternBrevo = () => {
  const { submitInternForm, isLoading, isSuccess, error, reset } = useBrevo();

  const submitApplication = useCallback(async (
    email: string,
    fullName: string,
    phone?: string,
    collegeName?: string,
    course?: string
  ) => {
    const result = await submitInternForm(email, fullName, phone, collegeName, course);
    return result;
  }, [submitInternForm]);

  return {
    submitApplication,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};

/**
 * Hook specifically for volunteer applications
 */
export const useVolunteerBrevo = () => {
  const { submitVolunteerForm, isLoading, isSuccess, error, reset } = useBrevo();

  const submitApplication = useCallback(async (
    email: string,
    fullName: string,
    phone?: string,
    skills?: string
  ) => {
    const result = await submitVolunteerForm(email, fullName, phone, skills);
    return result;
  }, [submitVolunteerForm]);

  return {
    submitApplication,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};
