import { ContactForm } from '@/components/contact/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact PARI | People\'s Archive of Rural India',
  description: 'Get in touch with the PARI team. Share your thoughts, ask questions, or contribute to our mission of documenting rural India.',
}

export default function ContactPage() {
  return <ContactForm />
}