'use client';
import React, { useState } from 'react';
import { ComponentErrorBoundary } from './error-boundary';
import { classifyError, ErrorRecoveryAction } from '@/lib/error-classification';
import { logError } from '@/lib/error-logger';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { posthogCapture } from '@/lib/posthog-utils';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
  onRetry?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface EnhancedErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
  context?: string;
  showDetails?: boolean;
}

function EnhancedErrorFallback({
  error,
  onRetry,
  context,
  showDetails: forceShowDetails = false,
}: EnhancedErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(forceShowDetails);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  if (!error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">Unknown Error</h3>
        <p className="text-red-300 text-sm mb-3">
          An unexpected error occurred.
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const classification = classifyError(error);
  const colorClass = getColorClass(classification.category);

  const handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    setIsRetrying(true);

    // Track retry attempt
    posthogCapture('error_recovery_attempted', {
      recovery_action: action.action,
      context: context || 'unknown',
      error_message: error.message,
      error_category: classification.category,
    });

    try {
      switch (action.action) {
        case 'retry':
          if (action.handler) {
            await action.handler();
          } else {
            onRetry();
          }
          break;
        case 'refresh':
          window.location.reload();
          break;
        case 'navigate':
          if (action.target === '-1') {
            router.back();
          } else if (action.target) {
            router.push(action.target);
          }
          break;
        case 'contact':
          window.open(
            'mailto:contact@commandops.app?subject=Error Report',
            '_blank'
          );
          break;
        case 'custom':
          if (action.handler) {
            await action.handler();
          }
          break;
      }

      // Track successful recovery
      posthogCapture('error_recovery_success', {
        recovery_action: action.action,
        context: context || 'unknown',
      });
    } catch (actionError) {
      console.error('Recovery action failed:', actionError);

      // Track failed recovery
      posthogCapture('error_recovery_failed', {
        recovery_action: action.action,
        context: context || 'unknown',
        recovery_error:
          actionError instanceof Error
            ? actionError.message
            : String(actionError),
      });

      // Fallback to retry
      onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className={`${colorClass.bg} border ${colorClass.border} rounded-lg p-4 space-y-3`}
    >
      {/* Error Header */}
      <div className="flex items-start gap-3">
        <span
          className="text-lg"
          role="img"
          aria-label={`${classification.category} error`}
        >
          {getErrorIcon(classification.category)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={`${colorClass.text} font-semibold mb-1`}>
            {getErrorTitle(classification.category, context)}
          </h3>
          <p className={`${colorClass.textSecondary} text-sm`}>
            {classification.userMessage}
          </p>
        </div>
        {classification.severity === 'critical' && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-mono">
            CRITICAL
          </span>
        )}
      </div>

      {/* Recovery Actions */}
      {classification.recoveryActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {classification.recoveryActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleRecoveryAction(action)}
              disabled={isRetrying}
              variant={index === 0 ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              {isRetrying && index === 0 ? 'Working...' : action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Details Toggle */}
      {classification.showDetails && (
        <div className="space-y-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className={`${colorClass.textSecondary} text-xs p-0 h-auto hover:${colorClass.text}`}
          >
            {showDetails ? '▼ Hide Details' : '▶ Show Details'}
          </Button>

          {showDetails && (
            <div
              className={`${colorClass.bg} border ${colorClass.border} rounded p-3 text-xs font-mono`}
            >
              <div className="space-y-2">
                {context && (
                  <div>
                    <span className={`${colorClass.text} font-semibold`}>
                      Context:
                    </span>
                    <span className={`${colorClass.textSecondary} ml-2`}>
                      {context}
                    </span>
                  </div>
                )}
                {classification.technicalMessage && (
                  <div>
                    <span className={`${colorClass.text} font-semibold`}>
                      Error:
                    </span>
                    <span className={`${colorClass.textSecondary} ml-2`}>
                      {classification.technicalMessage}
                    </span>
                  </div>
                )}
                <div>
                  <span className={`${colorClass.text} font-semibold`}>
                    Type:
                  </span>
                  <span className={`${colorClass.textSecondary} ml-2`}>
                    {classification.category}
                  </span>
                </div>
                <div>
                  <span className={`${colorClass.text} font-semibold`}>
                    Severity:
                  </span>
                  <span className={`${colorClass.textSecondary} ml-2`}>
                    {classification.severity}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        Error occurred: {classification.userMessage}
        {classification.canRetry && ' You can retry this operation.'}
      </div>
    </div>
  );
}

export function EnhancedErrorBoundary({
  children,
  context,
  onRetry,
  onError,
  showDetails = false,
}: EnhancedErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    const classification = classifyError(error);

    logError({
      component: `EnhancedErrorBoundary${context ? ` (${context})` : ''}`,
      error,
      errorInfo,
    });

    // Track error with PostHog
    posthogCapture('error_boundary_triggered', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      context: context || 'unknown',
      component_stack: errorInfo.componentStack,
      error_category: classification.category,
      error_severity: classification.severity,
      can_retry: classification.canRetry,
    });

    // Call custom error handler
    onError?.(error, errorInfo);
  };

  return (
    <ComponentErrorBoundary
      fallback={props => (
        <EnhancedErrorFallback
          {...props}
          context={context}
          showDetails={showDetails}
        />
      )}
      onRetry={onRetry}
      onError={handleError}
    >
      {children}
    </ComponentErrorBoundary>
  );
}

// Specialized error boundaries for different contexts
export function DataErrorBoundary({
  children,
  context = 'data loading',
}: {
  children: React.ReactNode;
  context?: string;
}) {
  return (
    <EnhancedErrorBoundary context={context}>{children}</EnhancedErrorBoundary>
  );
}

export function FormErrorBoundary({
  children,
  context = 'form submission',
}: {
  children: React.ReactNode;
  context?: string;
}) {
  return (
    <EnhancedErrorBoundary context={context}>{children}</EnhancedErrorBoundary>
  );
}

export function NavigationErrorBoundary({
  children,
  context = 'navigation',
}: {
  children: React.ReactNode;
  context?: string;
}) {
  return (
    <EnhancedErrorBoundary context={context}>{children}</EnhancedErrorBoundary>
  );
}

// Helper functions
function getErrorIcon(category: string): string {
  switch (category) {
    case 'network':
      return '🌐';
    case 'validation':
      return '⚠️';
    case 'authorization':
    case 'authentication':
      return '🔒';
    case 'notFound':
      return '🔍';
    case 'rateLimit':
      return '⏳';
    case 'business':
      return '📋';
    case 'system':
      return '⚙️';
    default:
      return '❌';
  }
}

function getErrorTitle(category: string, context?: string): string {
  const contextSuffix = context ? ` - ${context}` : '';

  switch (category) {
    case 'network':
      return `Connection Error${contextSuffix}`;
    case 'validation':
      return `Validation Error${contextSuffix}`;
    case 'authorization':
      return `Access Denied${contextSuffix}`;
    case 'authentication':
      return `Authentication Required${contextSuffix}`;
    case 'notFound':
      return `Not Found${contextSuffix}`;
    case 'rateLimit':
      return `Rate Limited${contextSuffix}`;
    case 'business':
      return `Operation Error${contextSuffix}`;
    case 'system':
      return `System Error${contextSuffix}`;
    default:
      return `Error${contextSuffix}`;
  }
}

function getColorClass(category: string) {
  switch (category) {
    case 'network':
      return {
        bg: 'bg-blue-900/20',
        border: 'border-blue-500',
        text: 'text-blue-400',
        textSecondary: 'text-blue-300',
      };
    case 'validation':
      return {
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        textSecondary: 'text-yellow-300',
      };
    case 'authorization':
    case 'authentication':
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-500',
        text: 'text-red-400',
        textSecondary: 'text-red-300',
      };
    case 'notFound':
      return {
        bg: 'bg-gray-900/20',
        border: 'border-gray-500',
        text: 'text-gray-400',
        textSecondary: 'text-gray-300',
      };
    case 'rateLimit':
      return {
        bg: 'bg-orange-900/20',
        border: 'border-orange-500',
        text: 'text-orange-400',
        textSecondary: 'text-orange-300',
      };
    case 'business':
      return {
        bg: 'bg-purple-900/20',
        border: 'border-purple-500',
        text: 'text-purple-400',
        textSecondary: 'text-purple-300',
      };
    case 'system':
    default:
      return {
        bg: 'bg-red-900/20',
        border: 'border-red-500',
        text: 'text-red-400',
        textSecondary: 'text-red-300',
      };
  }
}
