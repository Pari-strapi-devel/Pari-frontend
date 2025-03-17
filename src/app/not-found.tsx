import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404: Not Found - PARI',
  description: 'The requested page could not be found',
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-foreground">Not Found</h2>
      <p className="mt-4 text-muted-foreground">Could not find the requested resource</p>
      <Link 
        href="/" 
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Return Home
      </Link>
    </div>
  )
}