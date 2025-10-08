import { posthogCaptureException } from '@/lib/posthog-utils';

interface ErrorLogEntry {
  timestamp: string;
  userId?: string;
  component: string;
  error: Error;
  errorInfo?: React.ErrorInfo;
  userAgent: string;
  url: string;
}

export function logError(
  entry: Omit<ErrorLogEntry, 'timestamp' | 'userAgent' | 'url'>
) {
  const logEntry: ErrorLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', logEntry);
  }

  // Send to PostHog for error tracking
  try {
    posthogCaptureException(entry.error, {
      component: entry.component,
      user_id: entry.userId,
      error_category: 'client_component',
      error_message: entry.error.message,
      error_name: entry.error.name,
      error_stack: entry.error.stack,
      user_agent: logEntry.userAgent,
      url: logEntry.url,
      timestamp: logEntry.timestamp,
      // React-specific error info
      ...(entry.errorInfo && {
        react_error_info: {
          componentStack: entry.errorInfo.componentStack,
        },
      }),
    });
  } catch (trackingError) {
    // Don't let tracking errors break the application
    console.error('Failed to track error with PostHog:', trackingError);
  }
}
