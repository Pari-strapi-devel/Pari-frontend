import ContactForm from '../../components/contact/ContactForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Contact PARI | People\'s Archive of Rural India',
  description: 'Get in touch with the PARI team. Share your thoughts, ask questions, or contribute to our mission of documenting rural India.',
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-PARI-Red mx-auto mb-4"></div>
          <p>Loading contact form...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  )
}