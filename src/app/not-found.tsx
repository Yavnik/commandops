'use client';
import Link from 'next/link';
import { NavigationErrorBoundary } from '@/components/error-boundary-enhanced';

function NotFoundContent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-destructive">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Mission Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The requested coordinates do not exist in our command grid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Return to Command Ops
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <NavigationErrorBoundary context="not found page">
      <NotFoundContent />
    </NavigationErrorBoundary>
  );
}
