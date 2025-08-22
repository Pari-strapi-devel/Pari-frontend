import axios from 'axios';
import { BREVO_CONFIG } from '@/config';

// Type for handling axios errors
interface AxiosError {
  response?: {
    status: number;
    data?: {
      code?: string;
      message?: string;
    };
  };
  message?: string;
}

// Helper function to safely cast unknown error to AxiosError
const toAxiosError = (error: unknown): AxiosError => {
  if (typeof error === 'object' && error !== null) {
    return error as AxiosError;
  }
  return { message: 'Unknown error' };
};

export interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    NAME?: string;
    PHONE?: string;
    [key: string]: string | number | boolean | undefined;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoEmailTemplate {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, string | number>;
  replyTo?: {
    email: string;
    name?: string;
  };
}

export interface BrevoResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Check if Brevo is configured
 */
export const isBrevoConfigured = (): boolean => {
  const isConfigured = !!(BREVO_CONFIG.apiKey && BREVO_CONFIG.apiKey.startsWith('xkeysib-'));
  console.log('##Rohit_Rocks## Brevo Configuration Check:', {
    hasApiKey: !!BREVO_CONFIG.apiKey,
    apiKeyPrefix: BREVO_CONFIG.apiKey ? BREVO_CONFIG.apiKey.substring(0, 10) + '...' : 'null',
    isConfigured,
    config: {
      apiUrl: BREVO_CONFIG.apiUrl,
      senderEmail: BREVO_CONFIG.senderEmail,
      senderName: BREVO_CONFIG.senderName,
      listIds: BREVO_CONFIG.listIds
    }
  });
  return isConfigured;
};

/**
 * Create Brevo API headers
 */
const getBrevoHeaders = () => {
  console.log('##Rohit_Rocks## Creating Brevo Headers:', {
    hasApiKey: !!BREVO_CONFIG.apiKey,
    apiKeyLength: BREVO_CONFIG.apiKey?.length || 0
  });

  if (!BREVO_CONFIG.apiKey) {
    console.error('##Rohit_Rocks## Brevo API key is not configured');
    throw new Error('Brevo API key is not configured');
  }

  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'api-key': BREVO_CONFIG.apiKey,
  };

  console.log('##Rohit_Rocks## Headers created successfully:', {
    accept: headers.accept,
    contentType: headers['content-type'],
    hasApiKey: !!headers['api-key']
  });

  return headers;
};

/**
 * Add or update a contact in Brevo
 */
export const addBrevoContact = async (contact: BrevoContact): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Adding Brevo Contact:', {
    email: contact.email,
    attributes: contact.attributes,
    listIds: contact.listIds,
    updateEnabled: contact.updateEnabled,
    timestamp: new Date().toISOString()
  });

  if (!isBrevoConfigured()) {
    console.warn('##Rohit_Rocks## Brevo not configured, simulating contact addition');
    console.warn('Brevo is not configured. Contact subscription simulated.');
    return {
      success: true,
      message: 'Contact subscription simulated (Brevo not configured)',
    };
  }

  const requestPayload = {
    email: contact.email,
    attributes: contact.attributes || {},
    listIds: contact.listIds || [BREVO_CONFIG.listIds.default],
    updateEnabled: contact.updateEnabled !== false,
  };

  console.log('##Rohit_Rocks## Brevo API Request:', {
    url: `${BREVO_CONFIG.apiUrl}/contacts`,
    payload: requestPayload,
    method: 'POST'
  });

  try {
    const response = await axios.post(
      `${BREVO_CONFIG.apiUrl}/contacts`,
      requestPayload,
      {
        headers: getBrevoHeaders(),
      }
    );

    console.log('##Rohit_Rocks## Brevo Contact Creation Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    return {
      success: true,
      message: 'Contact added successfully',
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = toAxiosError(error);

    console.error('##Rohit_Rocks## Brevo Contact Creation Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      fullError: axiosError
    });

    // Handle duplicate contact (already exists)
    if (axiosError.response?.status === 400 && axiosError.response?.data?.code === 'duplicate_parameter') {
      console.log('##Rohit_Rocks## Contact already exists, treating as success');
      return {
        success: true,
        message: 'Contact already exists and was updated',
        data: axiosError.response.data,
      };
    }

    console.error('Brevo contact creation error:', axiosError.response?.data || axiosError.message);
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'Failed to add contact',
    };
  }
};

/**
 * Subscribe to newsletter (footer form)
 */
export const subscribeToNewsletter = async (email: string, name?: string): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Newsletter Subscription:', {
    email,
    name,
    listIds: [BREVO_CONFIG.listIds.newsletter, BREVO_CONFIG.listIds.footer],
    timestamp: new Date().toISOString()
  });

  const contact: BrevoContact = {
    email,
    attributes: name ? { NAME: name } : {},
    listIds: [BREVO_CONFIG.listIds.newsletter, BREVO_CONFIG.listIds.footer],
  };

  console.log('##Rohit_Rocks## Newsletter Contact Object:', contact);
  const result = await addBrevoContact(contact);
  console.log('##Rohit_Rocks## Newsletter Subscription Result:', result);

  return result;
};

/**
 * Add contact form submission to Brevo
 */
export const addContactFormSubmission = async (
  email: string,
  name: string,
  phone?: string,
  message?: string
): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Contact Form Submission:', {
    email,
    name,
    phone,
    messageLength: message?.length || 0,
    listId: BREVO_CONFIG.listIds.contact,
    timestamp: new Date().toISOString()
  });

  const contact: BrevoContact = {
    email,
    attributes: {
      NAME: name,
      PHONE: phone,
      LAST_MESSAGE: message?.substring(0, 250), // Limit message length
    },
    listIds: [BREVO_CONFIG.listIds.contact],
  };

  console.log('##Rohit_Rocks## Contact Form Contact Object:', contact);
  const result = await addBrevoContact(contact);
  console.log('##Rohit_Rocks## Contact Form Submission Result:', result);

  return result;
};

/**
 * Add intern application to Brevo
 */
export const addInternApplication = async (
  email: string,
  fullName: string,
  phone?: string,
  collegeName?: string,
  course?: string
): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Intern Application:', {
    email,
    fullName,
    phone,
    collegeName,
    course,
    listId: BREVO_CONFIG.listIds.intern,
    timestamp: new Date().toISOString()
  });

  const contact: BrevoContact = {
    email,
    attributes: {
      NAME: fullName,
      PHONE: phone,
      COLLEGE: collegeName,
      COURSE: course,
    },
    listIds: [BREVO_CONFIG.listIds.intern],
  };

  console.log('##Rohit_Rocks## Intern Application Contact Object:', contact);
  const result = await addBrevoContact(contact);
  console.log('##Rohit_Rocks## Intern Application Result:', result);

  return result;
};

/**
 * Add volunteer application to Brevo
 */
export const addVolunteerApplication = async (
  email: string,
  fullName: string,
  phone?: string,
  skills?: string
): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Volunteer Application:', {
    email,
    fullName,
    phone,
    skillsLength: skills?.length || 0,
    listId: BREVO_CONFIG.listIds.volunteer,
    timestamp: new Date().toISOString()
  });

  const contact: BrevoContact = {
    email,
    attributes: {
      NAME: fullName,
      PHONE: phone,
      SKILLS: skills?.substring(0, 250),
    },
    listIds: [BREVO_CONFIG.listIds.volunteer],
  };

  console.log('##Rohit_Rocks## Volunteer Application Contact Object:', contact);
  const result = await addBrevoContact(contact);
  console.log('##Rohit_Rocks## Volunteer Application Result:', result);

  return result;
};

/**
 * Send transactional email using Brevo template
 */
export const sendBrevoEmail = async (emailData: BrevoEmailTemplate): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Sending Brevo Email:', {
    templateId: emailData.templateId,
    to: emailData.to,
    params: emailData.params,
    replyTo: emailData.replyTo,
    timestamp: new Date().toISOString()
  });

  if (!isBrevoConfigured()) {
    console.warn('##Rohit_Rocks## Brevo not configured, simulating email sending');
    console.warn('Brevo is not configured. Email sending simulated.');
    return {
      success: true,
      message: 'Email sending simulated (Brevo not configured)',
    };
  }

  const requestPayload = {
    templateId: emailData.templateId,
    to: emailData.to,
    params: emailData.params || {},
    replyTo: emailData.replyTo || {
      email: BREVO_CONFIG.senderEmail,
      name: BREVO_CONFIG.senderName,
    },
  };

  console.log('##Rohit_Rocks## Email API Request:', {
    url: `${BREVO_CONFIG.apiUrl}/smtp/email`,
    payload: requestPayload,
    method: 'POST'
  });

  try {
    const response = await axios.post(
      `${BREVO_CONFIG.apiUrl}/smtp/email`,
      requestPayload,
      {
        headers: getBrevoHeaders(),
      }
    );

    console.log('##Rohit_Rocks## Email Sending Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    return {
      success: true,
      message: 'Email sent successfully',
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = toAxiosError(error);

    console.error('##Rohit_Rocks## Email Sending Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      fullError: axiosError
    });

    console.error('Brevo email sending error:', axiosError.response?.data || axiosError.message);
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'Failed to send email',
    };
  }
};

/**
 * Get contact lists from Brevo
 */
export const getBrevoLists = async (): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Getting Brevo Lists:', {
    timestamp: new Date().toISOString()
  });

  if (!isBrevoConfigured()) {
    console.warn('##Rohit_Rocks## Brevo not configured for lists fetch');
    return {
      success: false,
      error: 'Brevo is not configured',
    };
  }

  console.log('##Rohit_Rocks## Lists API Request:', {
    url: `${BREVO_CONFIG.apiUrl}/contacts/lists`,
    method: 'GET'
  });

  try {
    const response = await axios.get(
      `${BREVO_CONFIG.apiUrl}/contacts/lists`,
      {
        headers: getBrevoHeaders(),
      }
    );

    console.log('##Rohit_Rocks## Lists Fetch Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = toAxiosError(error);

    console.error('##Rohit_Rocks## Lists Fetch Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      fullError: axiosError
    });

    console.error('Brevo lists fetch error:', axiosError.response?.data || axiosError.message);
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'Failed to fetch lists',
    };
  }
};

/**
 * Remove contact from Brevo
 */
export const removeBrevoContact = async (email: string): Promise<BrevoResponse> => {
  console.log('##Rohit_Rocks## Removing Brevo Contact:', {
    email,
    timestamp: new Date().toISOString()
  });

  if (!isBrevoConfigured()) {
    console.warn('##Rohit_Rocks## Brevo not configured, simulating contact removal');
    return {
      success: true,
      message: 'Contact removal simulated (Brevo not configured)',
    };
  }

  const deleteUrl = `${BREVO_CONFIG.apiUrl}/contacts/${encodeURIComponent(email)}`;
  console.log('##Rohit_Rocks## Contact Removal API Request:', {
    url: deleteUrl,
    method: 'DELETE',
    encodedEmail: encodeURIComponent(email)
  });

  try {
    const response = await axios.delete(
      deleteUrl,
      {
        headers: getBrevoHeaders(),
      }
    );

    console.log('##Rohit_Rocks## Contact Removal Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return {
      success: true,
      message: 'Contact removed successfully',
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = toAxiosError(error);

    console.error('##Rohit_Rocks## Contact Removal Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: axiosError.message,
      fullError: axiosError
    });

    console.error('Brevo contact removal error:', axiosError.response?.data || axiosError.message);
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.message || 'Failed to remove contact',
    };
  }
};
