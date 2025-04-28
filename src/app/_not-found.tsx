import { Suspense } from 'react';
import Link from 'next/link';

// Separate client component that uses useSearchParams
const ClientContent = () => {
  'use client'
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-2xl font-bold text-foreground">404 - Page Not Found</div>
      <p className="mt-4 text-muted-foreground">The page you are looking for does not exist.</p>
      <Link 
        href="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Return Home
      </Link>
    </div>
  );
}

// Keep the main component as a server component
export default function NotFound() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <ClientContent />
    </Suspense>
  );
}
