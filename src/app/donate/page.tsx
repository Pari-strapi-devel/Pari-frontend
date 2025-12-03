'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiCheck, FiCopy } from 'react-icons/fi'
import axios from 'axios'
import { useDonationBrevo } from '@/hooks/useBrevo'
import { LanguageToggle } from '@/components/layout/header/LanguageToggle'
import { useLocale } from '@/lib/locale'

// Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
}

interface RazorpayFailureResponse {
  error: RazorpayError;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    vpa?: string; // UPI Virtual Payment Address
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
  };
  config?: {
    display?: {
      blocks?: Record<string, {
        name: string;
        instruments: Array<{ method: string }>;
      }>;
      hide?: Array<{ method: string }>;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: RazorpayFailureResponse) => void): void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface DonationFormData {
  fullName: string
  email: string
  phone: string
  panNumber: string
  address: string
  city: string
  state: string
  pincode: string
  amount: string
  customAmount: string
  donationType: 'monthly' | 'yearly' | 'one-time'
  paymentMethod: 'online' | 'cheque' | 'bank-transfer' | 'upi' | ''
  isIndianCitizen: boolean
  agreeToTerms: boolean
}

interface SubmissionData {
  firstName: string
  lastName: string
  email: string
  phone: string
  panNumber: string
  addressLine1: string
  addressLine2: string
  country: string
  city: string
  state: string
  pincode: string
  isIndianCitizen: boolean
  paymentMethod: string
  donationMethods: string
  donationType: string
  amount: string
  referenceId: string
  agreeToTerms: boolean
}

interface FAQ {
  id: number
  Question: string
  Answer: string
}

// DonatePageData interface removed - donate-page endpoint doesn't exist in API
// Using PageContentData from pages API instead

interface PageContentData {
  id: number
  attributes: {
    PageTitle?: string
    Strap?: string
    VideoURL?: string
    Content?: string
    FAQs?: FAQ[]
    FAQTitle?: string | null
    locale?: string
    localizations?: {
      data: Array<{
        id: number
        attributes: {
          locale: string
        }
      }>
    }
  }
}

// Location data interfaces (India only)
interface State {
  id: number
  name: string
  iso2: string
}

interface District {
  id: number
  name: string
}

const RAZORPAY_KEY = 'rzp_live_u0qTE80ANbAWR6'

// Fallback Indian states data
const fallbackIndianStates: State[] = [
  { id: 1, name: 'Andhra Pradesh', iso2: 'AP' },
  { id: 2, name: 'Arunachal Pradesh', iso2: 'AR' },
  { id: 3, name: 'Assam', iso2: 'AS' },
  { id: 4, name: 'Bihar', iso2: 'BR' },
  { id: 5, name: 'Chhattisgarh', iso2: 'CT' },
  { id: 6, name: 'Goa', iso2: 'GA' },
  { id: 7, name: 'Gujarat', iso2: 'GJ' },
  { id: 8, name: 'Haryana', iso2: 'HR' },
  { id: 9, name: 'Himachal Pradesh', iso2: 'HP' },
  { id: 10, name: 'Jammu and Kashmir', iso2: 'JK' },
  { id: 11, name: 'Jharkhand', iso2: 'JH' },
  { id: 12, name: 'Karnataka', iso2: 'KA' },
  { id: 13, name: 'Kerala', iso2: 'KL' },
  { id: 14, name: 'Madhya Pradesh', iso2: 'MP' },
  { id: 15, name: 'Maharashtra', iso2: 'MH' },
  { id: 16, name: 'Manipur', iso2: 'MN' },
  { id: 17, name: 'Meghalaya', iso2: 'ML' },
  { id: 18, name: 'Mizoram', iso2: 'MZ' },
  { id: 19, name: 'Nagaland', iso2: 'NL' },
  { id: 20, name: 'Odisha', iso2: 'OR' },
  { id: 21, name: 'Punjab', iso2: 'PB' },
  { id: 22, name: 'Rajasthan', iso2: 'RJ' },
  { id: 23, name: 'Sikkim', iso2: 'SK' },
  { id: 24, name: 'Tamil Nadu', iso2: 'TN' },
  { id: 25, name: 'Telangana', iso2: 'TG' },
  { id: 26, name: 'Tripura', iso2: 'TR' },
  { id: 27, name: 'Uttar Pradesh', iso2: 'UP' },
  { id: 28, name: 'Uttarakhand', iso2: 'UT' },
  { id: 29, name: 'West Bengal', iso2: 'WB' }
]

function DonatePageContent() {
  const { language: currentLocale } = useLocale()
  console.log('##Rohit_Rocks## DonatePageContent component rendered with locale:', currentLocale)
  const [fontClass, setFontClass] = useState('font-noto')

  const [formData, setFormData] = useState<DonationFormData>({
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amount: '500',
    customAmount: '',
    donationType: 'monthly',
    paymentMethod: '',
    isIndianCitizen: true,
    agreeToTerms: true
  })

  // apiData removed - not needed since donate-page endpoint doesn't exist
  const [pageData, setPageData] = useState<PageContentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Location data state (India only)
  const [states, setStates] = useState<State[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  // Brevo integration for donation form
  const { submitForm: submitToBrevo } = useDonationBrevo()

  // Text direction helper function
  const getTextDirection = (locale: string) => {
    return ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr'
  }

  const textDirection = getTextDirection(currentLocale)

  // Set font based on language
  useEffect(() => {
    console.log('##Rohit_Rocks## Language changed to:', currentLocale)
    switch (currentLocale) {
      case 'hi':
      case 'mr':
        console.log('##Rohit_Rocks## Setting font to Devanagari for:', currentLocale)
        setFontClass('font-noto-devanagari')
        break
      case 'te':
        console.log('##Rohit_Rocks## Setting font to Telugu')
        setFontClass('font-noto-telugu')
        break
      case 'ta':
        console.log('##Rohit_Rocks## Setting font to Tamil')
        setFontClass('font-noto-tamil')
        break
      case 'gu':
        console.log('##Rohit_Rocks## Setting font to Gujarati')
        setFontClass('font-noto-gujarati')
        break
      case 'kn':
        console.log('##Rohit_Rocks## Setting font to Kannada')
        setFontClass('font-noto-kannada')
        break
      case 'ml':
        console.log('##Rohit_Rocks## Setting font to Malayalam')
        setFontClass('font-noto-malayalam')
        break
      case 'pa':
        console.log('##Rohit_Rocks## Setting font to Gurmukhi')
        setFontClass('font-noto-gurmukhi')
        break
      case 'bn':
        console.log('##Rohit_Rocks## Setting font to Bengali')
        setFontClass('font-noto-bengali')
        break
      case 'or':
        console.log('##Rohit_Rocks## Setting font to Oriya')
        setFontClass('font-noto-oriya')
        break
      case 'as':
        console.log('##Rohit_Rocks## Setting font to Bengali for Assamese')
        setFontClass('font-noto-bengali') // Using Bengali for Assamese as fallback
        break
      case 'ur':
        console.log('##Rohit_Rocks## Setting font to default for Urdu')
        setFontClass('font-noto') // Using default for Urdu as fallback
        break
      default:
        console.log('##Rohit_Rocks## Setting font to default for:', currentLocale)
        setFontClass('font-noto')
        break
    }
  }, [currentLocale])

  // Fetch donate page data from page-donate endpoint
  const fetchDonatePageData = useCallback(async () => {
    console.log('##Rohit_Rocks## Fetching donate page content for locale:', currentLocale)

    let pageDataLoaded = false

    // Try to fetch the requested locale first
    if (!pageDataLoaded) {
      try {
        const url = `https://merge.ruralindiaonline.org/v1/api/page-donate?populate=*&locale=${currentLocale}`
        console.log('##Rohit_Rocks## Fetching from URL:', url)

        const response = await axios.get<{ data: PageContentData; meta: Record<string, unknown> }>(url)

        if (response.data.data) {
          console.log('##Rohit_Rocks## Donate page data loaded:', {
            PageTitle: response.data.data.attributes.PageTitle,
            Strap: response.data.data.attributes.Strap,
            FAQsCount: response.data.data.attributes.FAQs?.length || 0,
            FAQTitle: response.data.data.attributes.FAQTitle,
            locale: response.data.data.attributes.locale || currentLocale,
            requestedLocale: currentLocale
          })
          setPageData(response.data.data)
          pageDataLoaded = true
        }
      } catch {
        console.log('##Rohit_Rocks## Locale', currentLocale, 'not available (404 or unpublished in Strapi)')
      }
    }

    // If the requested locale failed, fall back to English
    if (!pageDataLoaded && currentLocale !== 'en') {
      try {
        console.log('##Rohit_Rocks## Falling back to English...')
        const fallbackUrl = `https://merge.ruralindiaonline.org/v1/api/page-donate?populate=*&locale=en`
        const fallbackResponse = await axios.get<{ data: PageContentData; meta: Record<string, unknown> }>(fallbackUrl)

        if (fallbackResponse.data.data) {
          console.log('##Rohit_Rocks## Loaded English fallback content')
          setPageData(fallbackResponse.data.data)
          pageDataLoaded = true
        }
      } catch (fallbackError) {
        console.error('##Rohit_Rocks## Fallback to English also failed:', fallbackError)
      }
    }

    if (!pageDataLoaded) {
      console.error('##Rohit_Rocks## Failed to load donate page data for any locale')
    }
  }, [currentLocale])

  // Fetch page content data (keeping for compatibility, but using fetchDonatePageData instead)
  const fetchPageContentData = useCallback(async () => {
    // This function is now handled by fetchDonatePageData
    console.log('##Rohit_Rocks## fetchPageContentData called, but using fetchDonatePageData instead')
  }, [])

  // Fetch Indian states data
  const fetchIndianStates = useCallback(async () => {
    console.log('##Rohit_Rocks## Starting to fetch Indian states...')
    setLoadingStates(true)
    setStates([])
    setDistricts([])

    try {
      const response = await axios.get('https://api.countrystatecity.in/v1/countries/IN/states', {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      })

      console.log('##Rohit_Rocks## States API Response:', response.data)

      if (response.data && response.data.length > 0) {
        const stateData = response.data.map((state: { id: number, name: string, iso2: string }) => ({
          id: state.id,
          name: state.name,
          iso2: state.iso2
        })).sort((a: State, b: State) => a.name.localeCompare(b.name))

        console.log('##Rohit_Rocks## Processed state data:', stateData)
        setStates(stateData)
      } else {
        console.log('##Rohit_Rocks## No states data received, using fallback')
        setStates(fallbackIndianStates)
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching Indian states, using fallback:', error)
      setStates(fallbackIndianStates)
    } finally {
      setLoadingStates(false)
    }
  }, [])

  // Fetch districts/cities data
  const fetchDistricts = async (countryCode: string, stateCode: string) => {
    console.log('##Rohit_Rocks## Fetching districts for:', countryCode, stateCode)
    setLoadingDistricts(true)
    setDistricts([])

    try {
      const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      })

      console.log('##Rohit_Rocks## Districts API Response:', response.data)

      if (response.data && response.data.length > 0) {
        const cityData = response.data.map((city: { id: number, name: string }, index: number) => ({
          id: city.id || index + 1,
          name: city.name
        })).sort((a: District, b: District) => a.name.localeCompare(b.name))

        console.log('##Rohit_Rocks## Processed city data:', cityData)
        setDistricts(cityData)
      } else {
        console.log('##Rohit_Rocks## No cities data received')
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error fetching districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  // Since we're only dealing with India, we don't need this helper function anymore
  // All states and cities will be for India only

  // Load Razorpay script (only once)
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Fetch data when language changes
  useEffect(() => {
    // Fetch donate page data
    fetchDonatePageData()

    // Fetch page content data
    fetchPageContentData()

    // Fetch Indian states data (only once, not language dependent)
    if (states.length === 0) {
      fetchIndianStates()
    }
  }, [currentLocale, fetchDonatePageData, fetchPageContentData, fetchIndianStates, states.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      // Handle location changes for India
      if (name === 'state') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          city: '' // Reset city when state changes
        }))

        setDistricts([])

        // Fetch districts if state is selected (India only)
        if (value) {
          const selectedState = states.find(s => s.iso2 === value)
          if (selectedState) {
            fetchDistricts('IN', value) // Always use 'IN' for India
          }
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    }
  }



  const getSelectedAmount = () => {
    const amount = formData.amount || '500' // Default to 500 if no amount is set
    console.log('##Rohit_Rocks## getSelectedAmount:', amount)
    return amount
  }

  const generateReferenceId = () => {
    return 'PARI-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11).toUpperCase()
  }

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '')
    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    return /^[6-9]\d{9}$/.test(cleanPhone)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleRazorpayPayment = () => {
    const amount = parseInt(getSelectedAmount()) * 100 // Convert to paise

    // Validate amount
    if (isNaN(amount) || amount < 100) { // Minimum 1 rupee
      alert('Please enter a valid amount (minimum ₹1)')
      return
    }

    // Format phone number properly for UPI
    const cleanPhone = formData.phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone

    console.log('Payment details:', {
      originalPhone: formData.phone,
      cleanPhone: cleanPhone,
      formattedPhone: formattedPhone,
      amount: amount,
      name: formData.fullName,
      email: formData.email
    })

    const options = {
      key: RAZORPAY_KEY,
      amount: amount,
      currency: 'INR',
      
      name: 'CounterMedia Trust',
      description: `${formData.donationType.charAt(0).toUpperCase() + formData.donationType.slice(1)} donation to PARI`,
      image: 'https://ruralindiaonline.org/favicon.ico',
      handler: function (response: RazorpayResponse) {
      
        setShowPaymentDetails(true)
        setReferenceId(response.razorpay_payment_id)
        setIsLoading(false)
        // Here you would typically send the payment details to your backend
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formattedPhone,
       
      },
      notes: {
        address: formData.address,
        pan_number: formData.panNumber,
        donation_type: formData.donationType
      },
      theme: {
        color: '#B82929'
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed')
          setIsLoading(false)
        },
        confirm_close: true,
        escape: true,
        animation: true
      },
      retry: {
        enabled: true,
        max_count: 3
      }
    }
console.log('Razorpay options:', options)
    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', function (response: RazorpayFailureResponse) {
      console.error('Payment failed:', response.error)

      // Handle specific UPI errors
      if (response.error.code === 'BAD_REQUEST_ERROR' && response.error.description.includes('UPI')) {
        alert('UPI Error: Please check your UPI ID or try a different payment method. Make sure your phone number is correct.')
      } else if (response.error.description.includes('invalid')) {
        alert('Invalid details: Please check your phone number and try again.')
      } else {
        alert(`Payment failed: ${response.error.description}`)
      }

      setIsLoading(false)
    })

    rzp.open()
  }

  // Submit form data to API
  const submitFormData = async (formDataToSubmit: SubmissionData) => {
    try {
      console.log('##Rohit_Rocks## Submitting form data:', formDataToSubmit)

      const response = await fetch('https://merge.ruralindiaonline.org/v1/api/donate-submits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formDataToSubmit
        })
      })

      const result = await response.json()
      console.log('##Rohit_Rocks## API Response:', result)

      if (response.ok) {
        console.log('##Rohit_Rocks## Form submitted successfully')
        // Don't reset form here, let the payment details show first
        // Form will be reset when user goes back to form
      } else {
        throw new Error(result.message || 'Failed to submit form')
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('##Rohit_Rocks## Form submission started')
    console.log('##Rohit_Rocks## Form data:', formData)
    console.log('##Rohit_Rocks## Payment method at submission:', formData.paymentMethod)

    // Validate terms of service agreement
    if (!formData.agreeToTerms) {
      alert('You must agree to PARI\'s terms of service to proceed with your donation')
      setIsLoading(false)
      return
    }

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone || !formData.panNumber || !formData.address || !formData.state || !formData.city || !formData.pincode || !formData.paymentMethod) {
      console.log('##Rohit_Rocks## Validation failed - missing required fields')
      alert('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    // Validate phone number for UPI payments
    if (formData.paymentMethod === 'online' && !validatePhoneNumber(formData.phone)) {
      alert('Please enter a valid Indian mobile number (10 digits starting with 6-9)')
      setIsLoading(false)
      return
    }

    // Validate amount
    const amount = getSelectedAmount()
    if (!amount || parseInt(amount) < 1) {
      alert('Please enter a valid donation amount (minimum ₹1)')
      setIsLoading(false)
      return
    }

    // Prepare form data for API submission
    const [firstName, ...lastNameParts] = formData.fullName.split(' ')
    const lastName = lastNameParts.join(' ')
    const [addressLine1, addressLine2] = formData.address.split('\n')

    // Get full names for state and city
    const selectedState = states.find(s => s.iso2 === formData.state)

    console.log('##Rohit_Rocks## Payment method value:', formData.paymentMethod)

    const submissionData: SubmissionData = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: formData.email,
      phone: formData.phone,
      panNumber: formData.panNumber,
      addressLine1: addressLine1 || '',
      addressLine2: addressLine2 || '',
      country: 'India', // Always India for this form
      city: formData.city,
      state: selectedState?.name || formData.state,
      pincode: formData.pincode,
      isIndianCitizen: formData.isIndianCitizen,
      paymentMethod: formData.paymentMethod,
      donationMethods: formData.paymentMethod, // Same as paymentMethod for API compatibility
      donationType: formData.donationType,
      amount: amount,
      referenceId: generateReferenceId(),
      agreeToTerms: formData.agreeToTerms
    }

    console.log('##Rohit_Rocks## Submission data:', submissionData)

    try {
      // Submit form data to API
      await submitFormData(submissionData)

      // Also submit to Brevo for email automation
      try {
        console.log('##Rohit_Rocks## Submitting to Brevo for donation tracking')
        await submitToBrevo(
          formData.email,
          formData.fullName,
          formData.phone || undefined,
          amount,
          formData.donationType
        )
        console.log('##Rohit_Rocks## Brevo donation submission successful')
      } catch (brevoError) {
        console.error('##Rohit_Rocks## Brevo donation submission error:', brevoError)
        // Don't fail the whole process if Brevo fails
      }

      // Show payment details for non-online payments
      if (formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque') {
        const refId = generateReferenceId()
        setReferenceId(refId)
        setShowPaymentDetails(true)
        setIsLoading(false)
        return
      }

      // Handle online payment with Razorpay
      if (window.Razorpay) {
        try {
          handleRazorpayPayment()
        } catch (error) {
          console.error('Error initializing payment:', error)
          alert('Error initializing payment. Please try again.')
          setIsLoading(false)
        }
      } else {
        alert('Payment gateway is not available. Please try again later.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('##Rohit_Rocks## Error in form submission:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-background dark:bg-background ${fontClass}`} dir={textDirection}>
      {/* Add floating language button */}
      <LanguageToggle />

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className=" text-foreground mb-6" >
                {pageData?.attributes?.PageTitle || 'Donate to PARI'}
              </h1>
              <h2 className=" text-discreet-text mb-2" >
                {pageData?.attributes?.Strap || 'We can do this without governments – and will. We can\'t do it without you.'}
              </h2>
            </div>

            {/* Video or Image */}
            {pageData?.attributes?.VideoURL ? (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <iframe
                  src={pageData.attributes.VideoURL.replace('watch?v=', 'embed/')}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="PARI Donation Video"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Rural India Image</span>
              </div>
            )}

            {/* Main Content Text */}
            <div className="space-y-6">
              {pageData?.attributes?.Content && (
                <div
                  className="text-discreet-text prose prose-p:text-discreet-text"
                  style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}
                  dangerouslySetInnerHTML={{ __html: pageData.attributes.Content }}
                />
              )}
            </div>

            {/* The PARI Fellow Programme Section */}
          

            {/* FAQs Section */}
            {pageData?.attributes?.FAQs && pageData.attributes.FAQs.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground" style={{
                  fontFamily: 'Noto Sans',
                  fontWeight: 700,
                  fontSize: '24px',
                  lineHeight: '130%',
                  letterSpacing: '-4%'
                }}>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {pageData.attributes.FAQs.map((faq: FAQ) => (
                    <div key={faq.id} className="border-b border-border pb-4">
                      <h3 className="font-semibold text-foreground mb-2" style={{
                        fontFamily: 'Noto Sans',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '130%',
                        letterSpacing: '-3%'
                      }}>
                        {faq.Question}
                      </h3>
                      <div
                        className="text-discreet-text prose prose-p:text-discreet-text prose-a:text-primary-PARI-Red"
                        style={{
                          fontFamily: 'Noto Sans',
                          fontWeight: 400,
                          fontSize: '15px',
                          lineHeight: '170%',
                          letterSpacing: '-3%'
                        }}
                        dangerouslySetInnerHTML={{ __html: faq.Answer }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* Right Column - Donation Form */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-popover p-8 rounded-2xl border border-gray-300 dark:border-border h-fit sticky top-8 shadow-xl" style={{ boxShadow: '0px 4px 20px 0px rgba(0,0,0,0.1)' }}>
            <div className="space-y-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4" style={{
              fontFamily: 'Noto Sans',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '130%',
              letterSpacing: '-4%'
            }}>
              Donate form
            </h4>
            <p className="text-gray-600 dark:text-muted-foreground mb-6" style={{
              fontFamily: 'Noto Sans',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '170%',
              letterSpacing: '-3%'
            }}>
              We need your support
            </p>

            {!showPaymentDetails ? (
              <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="First Name"
                      value={formData.fullName.split(' ')[0] || ''}
                      onChange={(e) => {
                        const lastName = formData.fullName.split(' ').slice(1).join(' ')
                        setFormData(prev => ({ ...prev, fullName: `${e.target.value} ${lastName}`.trim() }))
                      }}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.fullName.split(' ').slice(1).join(' ')}
                    onChange={(e) => {
                      const firstName = formData.fullName.split(' ')[0] || ''
                      setFormData(prev => ({ ...prev, fullName: `${firstName} ${e.target.value}`.trim() }))
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                </div>

                {/* PAN Number */}
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-PARI-Red h-4 w-4" />
                  <input
                    type="text"
                    name="panNumber"
                    placeholder="PAN Number"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border uppercase rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* Address Fields */}
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-primary-PARI-Red h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={formData.address.split('\n')[0] || ''}
                    onChange={(e) => {
                      const lines = formData.address.split('\n')
                      lines[0] = e.target.value
                      setFormData(prev => ({ ...prev, address: lines.join('\n') }))
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-primary-PARI-Red h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={formData.address.split('\n')[1] || ''}
                    onChange={(e) => {
                      const lines = formData.address.split('\n')
                      lines[1] = e.target.value
                      setFormData(prev => ({ ...prev, address: lines.join('\n') }))
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* State, City, Pincode */}
                <div className="grid grid-cols-3 gap-4">
                  {/* State dropdown */}
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={loadingStates}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">
                      {loadingStates ? 'Loading states...' : 'State'}
                    </option>
                    {states.map((state) => (
                      <option key={state.id} value={state.iso2}>
                        {state.name}
                      </option>
                    ))}
                  </select>

                  {/* City dropdown */}
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loadingDistricts || !formData.state.trim()}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23B82929' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <option value="">
                      {loadingDistricts ? 'Loading cities...' : 'City'}
                    </option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                  {/* Pincode */}
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                  />
                </div>

                {/* Citizen Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isIndianCitizen"
                    name="isIndianCitizen"
                    checked={formData.isIndianCitizen}
                    onChange={handleInputChange}
                    required
                    className="h-4 w-4 accent-primary-PARI-Red focus:ring-2 focus:ring-primary-PARI-Red border-gray-300 dark:border-border rounded"
                  />
                  <label htmlFor="isIndianCitizen" className="text-sm text-gray-900 dark:text-foreground">
                    I am a citizen of India
                  </label>
                </div>

                {/* Donation Method */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-muted-foreground">
                    How would you prefer to donate? *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'online', label: 'Online' },
                      { value: 'bank-transfer', label: 'Bank Transfer' },
                      { value: 'cheque', label: 'Cheque / DD' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={() => {
                            console.log('##Rohit_Rocks## Payment method selected:', method.value)
                            setFormData(prev => ({ ...prev, paymentMethod: method.value as 'online' | 'cheque' | 'bank-transfer' | 'upi' | '' }))
                          }}
                          required
                          className="h-4 w-4 accent-primary-PARI-Red focus:ring-2 focus:ring-primary-PARI-Red border-gray-300 dark:border-border"
                        />
                        <span className="text-sm text-gray-900 dark:text-muted-foreground">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Donation Amount - Only show when online payment is selected */}
                {formData.paymentMethod === 'online' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600 dark:text-muted-foreground">
                      Donation Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-muted-foreground text-sm"
                    />
                  </div>
                )}

                {/* Terms of Service Agreement */}
                {formData.paymentMethod !== '' && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="h-4 w-4 text-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                        I agree to PARI&apos;s{' '}
                        <a href="https://ruralindiaonline.org/termsofservices" target="_blank" rel="noopener noreferrer" className="text-primary-PARI-Red hover:underline">
                          terms of service
                        </a>
                      </label>
                    </div>
                  </div>
                )}

                {/* Submit Button - Always show when payment method is selected */}
                {formData.paymentMethod !== '' && (
                  <button
                    type="submit"
                    disabled={isLoading || !formData.agreeToTerms}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      !formData.agreeToTerms
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-primary-PARI-Red text-white hover:bg-primary-PARI-Red/90'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Confirm details'}
                  </button>
                )}




              </form>

              {/* Disclaimer inside form container */}
              <div className=" p-4 rounded-lg bg-popover mt-6 border border-border dark:border-borderline">
                <p className="text-sm text-discreet-text dark:text-muted-foreground">
                  At present, we can only accept donations in Indian rupees by Indian citizens. All donations made to the CounterMedia Trust are eligible for exemption under Section 80G of the Income Tax Act, 1961. Here is a copy of our{' '}
                  <a href="#" className="text-primary-PARI-Red hover:underline font-medium">exemption certificate</a>.
                </p>
              </div>
              </div>
            ) : (
              // Payment Details View
              <div className="space-y-6">
                {/* Success message for online payments */}
                {formData.paymentMethod === 'online' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Payment Successful!
                      </h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Thank you for your donation to The People&apos;s Archive of Rural India.
                    </p>
                    <div className="space-y-2">
                      <p className="text-green-700 dark:text-green-300">
                        <strong>Payment ID:</strong> {referenceId}
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        <strong>Amount:</strong> ₹{formData.amount}
                      </p>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'cheque' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Form Submitted Successfully!
                      </h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      Thank you for choosing to donate to The People&apos;s Archive of Rural India via Cheque/DD.
                    </p>
                    <div className="space-y-3">
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Reference ID:</strong> {referenceId}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Make your cheque to <strong>&quot;CounterMedia Trust&quot;</strong> and send it to us by courier/post along with the above reference ID.
                      </p>
                      <div className="bg-background p-4 rounded-lg border">
                        <p className="font-semibold text-foreground mb-2">Send by courier/post to:</p>
                        <p className="text-foreground">
                          CounterMedia Trust c/o P. Sainath<br />
                          27/43 Sagar Sangam, Bandra Reclamation<br />
                          Bandra West, Mumbai - 400050<br />
                          Maharashtra, India
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'bank-transfer' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Form Submitted Successfully!
                      </h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Thank you for choosing to donate to The People&apos;s Archive of Rural India via Bank Transfer.
                    </p>
                    <div className="space-y-3">
                      <p className="text-green-700 dark:text-green-300">
                        <strong>Reference ID:</strong> {referenceId}
                      </p>
                      <div className="bg-background p-4 rounded-lg border space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">PAYABLE TO:</span>
                          <div className="flex items-center gap-2">
                            <span>CounterMedia Trust</span>
                            <button
                              onClick={() => copyToClipboard('CounterMedia Trust', 'payable')}
                              className="text-primary-PARI-Red hover:text-red-700"
                            >
                              {copiedField === 'payable' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-semibold">BANK AND BRANCH:</span>
                          <div className="flex items-center gap-2">
                            <span>HDFC Bank, Aundh</span>
                            <button
                              onClick={() => copyToClipboard('HDFC Bank, Aundh', 'bank')}
                              className="text-primary-PARI-Red hover:text-red-700"
                            >
                              {copiedField === 'bank' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-semibold">ACCOUNT NUMBER:</span>
                          <div className="flex items-center gap-2">
                            <span>50100091804541</span>
                            <button
                              onClick={() => copyToClipboard('50100091804541', 'account')}
                              className="text-primary-PARI-Red hover:text-red-700"
                            >
                              {copiedField === 'account' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-semibold">IFSC CODE:</span>
                          <div className="flex items-center gap-2">
                            <span>HDFC0000052</span>
                            <button
                              onClick={() => copyToClipboard('HDFC0000052', 'ifsc')}
                              className="text-primary-PARI-Red hover:text-red-700"
                            >
                              {copiedField === 'ifsc' ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowPaymentDetails(false)
                    // Reset form when going back
                    setFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      panNumber: '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: '',
                      amount: '500',
                      customAmount: '',
                      donationType: 'monthly',
                      paymentMethod: '',
                      isIndianCitizen: true,
                      agreeToTerms: true
                    })
                  }}
                  className="w-full border-2 border-primary-PARI-Red text-primary-PARI-Red hover:bg-primary-PARI-Red hover:text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                >
                  Back to Form
                </button>
              </div>
            )}
            </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DonatePageContent />
    </Suspense>
  )
}
