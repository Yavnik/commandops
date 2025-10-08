'use client';

import { Component, ReactNode } from 'react';
import { classifyError } from '@/lib/error-classification';
import { Button } from './ui/button';
import { posthogCapture } from '@/lib/posthog-utils';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const classification = classifyError(error);
    posthogCapture('global_error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      category: classification?.category || 'unknown',
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-red-400 font-semibold text-lg mb-2">
              Application Error
            </h2>
            <p className="text-red-300 text-sm mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
