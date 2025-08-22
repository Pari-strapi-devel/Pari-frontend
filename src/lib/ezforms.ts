import axios from 'axios';
import { EZFORMS_CONFIG } from '@/config';

export interface EZFormData {
  [key: string]: string | number | boolean | File | null | undefined;
}

export interface EZFormSubmission {
  token?: string; // For captcha token (optional)
  formName?: string; // Optional form name
  formData: EZFormData;
}

export interface EZFormResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

/**
 * Submit form data to Strapi EZForms
 * @param submission - The form submission data
 * @returns Promise with the response
 */
export const submitEZForm = async (submission: EZFormSubmission): Promise<EZFormResponse> => {
  try {
    // Transform to match your API exactly
    const requestPayload = {
      data: {
        name: submission.formData.name as string,
        email: submission.formData.email as string,
        message: submission.formData.message as string
      }
    };

    const response = await axios.post(EZFORMS_CONFIG.apiUrl, requestPayload, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      message: 'Form submitted successfully',
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('EZForms submission error:', error);

    let errorMessage = 'Failed to submit form';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Validate form data before submission
 * @param formData - The form data to validate
 * @param requiredFields - Array of required field names
 * @returns Object with validation result
 */
export const validateFormData = (
  formData: EZFormData,
  requiredFields: string[] = []
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });

  // Validate email format if email field exists
  if (formData.email && typeof formData.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  // Validate phone format if phone field exists
  if (formData.phone && typeof formData.phone === 'string') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize form data by removing empty fields and trimming strings
 * @param formData - The form data to sanitize
 * @returns Sanitized form data
 */
export const sanitizeFormData = (formData: EZFormData): EZFormData => {
  const sanitized: EZFormData = {};

  Object.keys(formData).forEach(key => {
    const value = formData[key];
    
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== '') {
          sanitized[key] = trimmed;
        }
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
};

/**
 * Create a form submission object with proper structure
 * @param formData - The form data
 * @param formName - Optional form name
 * @param token - Optional captcha token
 * @returns Properly structured submission object
 */
export const createFormSubmission = (
  formData: EZFormData,
  formName?: string,
  token?: string
): EZFormSubmission => {
  const submission: EZFormSubmission = {
    formData: sanitizeFormData(formData),
  };

  if (formName) {
    submission.formName = formName;
  }

  if (token) {
    submission.token = token;
  }

  return submission;
};
