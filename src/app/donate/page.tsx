'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiCheck, FiCopy } from 'react-icons/fi'
import { cn } from '@/lib/utils'

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
  amount: string
  customAmount: string
  donationType: 'monthly' | 'yearly' | 'one-time'
  paymentMethod: 'online' | 'cheque' | 'bank-transfer' | 'upi'
  isIndianCitizen: boolean
}

const RAZORPAY_KEY = 'rzp_live_u0qTE80ANbAWR6'

export default function DonatePage() {
  const [formData, setFormData] = useState<DonationFormData>({
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    address: '',
    amount: '500',
    customAmount: '',
    donationType: 'monthly',
    paymentMethod: 'upi',
    isIndianCitizen: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAmountSelect = (amount: string) => {
    setFormData(prev => ({ ...prev, amount, customAmount: '' }))
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, customAmount: value, amount: value ? 'custom' : '500' }))
  }

  const getSelectedAmount = () => {
    return formData.amount === 'custom' ? formData.customAmount : formData.amount
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
        console.log('Payment successful:', response)
        alert('Payment successful! Thank you for your donation.')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone || !formData.panNumber || !formData.address) {
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

    // Generate reference ID for non-online payments
    if (formData.paymentMethod !== 'online') {
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
  }

  const predefinedAmounts = ['500', '1000', '2000']

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className=" mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" style={{
            fontFamily: 'Noto Sans',
            fontWeight: 700,
            fontSize: '49px',
            lineHeight: '112%',
            letterSpacing: '-4%'
          }}>
            Donate to PARI
          </h1>
          <div className="max-w-4xl  text-foreground" style={{
            fontFamily: 'Noto Sans',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '170%',
            letterSpacing: '-3%'
          }}>
            <p>
              We can do this without governments – and will. We can&apos;t do it without you.
            </p>
            <p>
              India is bigger than New Delhi. And people need to know more about the rest of this vast nation.
            </p>
            <p>
              PARI exists to change that. We are a non-profit organisation. We publish under creative commons, 
              and do not charge readers a subscription fee or put-up advertisements. Nothing is behind a paywall 
              and we are completely free-to-access by anyone.
            </p>
          </div>
        </div>
      

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {!showPaymentDetails ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Payment Method Selection */}
                <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Payment Method
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'online', label: 'Online' },
                      { value: 'cheque', label: 'Cheque/DD' },
                      { value: 'bank-transfer', label: 'Bank Transfer' }
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value as 'online' | 'cheque' | 'bank-transfer' }))}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors",
                          formData.paymentMethod === method.value
                            ? "bg-primary-PARI-Red text-white border-primary-PARI-Red"
                            : "bg-background border-border text-foreground hover:border-primary-PARI-Red"
                        )}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donation Type */}
                <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Donation Frequency
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                      { value: 'one-time', label: 'One-time' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, donationType: type.value as 'monthly' | 'yearly' | 'one-time' }))}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors",
                          formData.donationType === type.value
                            ? "bg-primary-PARI-Red text-white border-primary-PARI-Red"
                            : "bg-background border-border text-foreground hover:border-primary-PARI-Red"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div className="relative">
                      <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="text"
                        name="panNumber"
                        placeholder="PAN Number"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-border uppercase rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
                      <textarea
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none resize-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Required as per Government Regulations
                    </p>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isIndianCitizen"
                        name="isIndianCitizen"
                        checked={formData.isIndianCitizen}
                        onChange={handleInputChange}
                        required
                        className="h-4 w-4 text-primary-PARI-Red focus:ring-primary-PARI-Red border-border rounded"
                      />
                      <label htmlFor="isIndianCitizen" className="text-sm text-foreground">
                        I&apos;m a citizen of India
                      </label>
                    </div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Donation Amount
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleAmountSelect(amount)}
                          className={cn(
                            "px-6 py-3 rounded-lg border transition-colors font-medium",
                            formData.amount === amount
                              ? "bg-primary-PARI-Red text-white border-primary-PARI-Red"
                              : "bg-background border-border text-foreground hover:border-primary-PARI-Red"
                          )}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        placeholder="Other amount"
                        value={formData.customAmount}
                        onChange={handleCustomAmountChange}
                        min="1"
                        className="w-full pl-8 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary-PARI-Red focus:border-transparent outline-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !getSelectedAmount()}
                  className="w-full bg-primary-PARI-Red hover:bg-red-700 text-white py-4 text-lg font-medium"
                >
                  {isLoading ? 'Processing...' : `Confirm & Donate ₹${getSelectedAmount()}`}
                </Button>

                <p className="text-sm text-muted-foreground ">
                  At present, we can only accept donations in Indian rupees by Indian citizens.
                  All donations made to the CounterMedia Trust are eligible for exemption under Section 80G of the Income Tax Act, 1961.
                </p>
              </form>
            ) : (
              // Payment Details View
              <div className="space-y-6">
                {formData.paymentMethod === 'cheque' && (
                  <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      You&apos;ve chosen to donate via Cheque/DD
                    </h3>
                    <p className="text-foreground mb-4">
                      Thank you for choosing to donate to The People&apos;s Archive of Rural India.
                    </p>
                    <div className="space-y-3">
                      <p className="text-foreground">
                        <strong>Reference ID:</strong> {referenceId}
                      </p>
                      <p className="text-foreground">
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
                  <div className="bg-card dark:bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      You&apos;ve chosen to donate via Bank Transfer
                    </h3>
                    <p className="text-foreground mb-4">
                      Thank you for choosing to donate to The People&apos;s Archive of Rural India.
                    </p>
                    <div className="space-y-3">
                      <p className="text-foreground">
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

                <Button
                  onClick={() => setShowPaymentDetails(false)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Form
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar with FAQs */}
          <div className="lg:col-span-1">
            <div className="bg-card dark:bg-card rounded-lg p-6 border border-border sticky top-8">
              <h3 className="text-lg font-semibold text-foreground mb-6" style={{
                fontFamily: 'Noto Sans',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '130%',
                letterSpacing: '-4%'
              }}>
                Donate FAQs
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    What is PARI?
                  </h4>
                  <p className="text-muted-foreground text-sm" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}>
                    PARI – People&apos;s Archive of Rural India – is both a living journal and an online archive to record and bring to national focus the labour, livelihoods, languages, art, crafts, histories and diverse cultures of rural Indians.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    How is PARI funded?
                  </h4>
                  <p className="text-muted-foreground text-sm" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}>
                    We are a non-profit organisation. We publish under creative commons, and do not charge readers or put-up advertisements. We guard our independence and receive no direct grants from governments and corporations.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Why we need your regular support?
                  </h4>
                  <p className="text-muted-foreground text-sm" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}>
                    Every PARI story, photograph and film comes from the field, not from opinion writers at desktops. When you give us recurring monthly donations, it helps stabilise our income.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Will my donation be tax-free?
                  </h4>
                  <p className="text-muted-foreground text-sm" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}>
                    All donations to PARI are exempt from tax under 80G of the Income Tax Act. To receive your donation receipt, please make sure you send us your email and PAN details along with the donation.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-4%'
                  }}>
                    Contact us
                  </h4>
                  <p className="text-muted-foreground text-sm" style={{
                    fontFamily: 'Noto Sans',
                    fontWeight: 400,
                    fontSize: '15px',
                    lineHeight: '170%',
                    letterSpacing: '-3%'
                  }}>
                    If you have any queries with regards to donations, please write to{' '}
                    <a href="mailto:donate@ruralindiaonline.org" className="text-primary-PARI-Red hover:underline">
                      donate@ruralindiaonline.org
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div>
          <div className="flex md:px-2 my-6 ">
            <iframe width="1100" height="415" src="https://www.youtube.com/embed/c7mMyZ86JeU" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}
