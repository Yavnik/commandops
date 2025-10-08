'use client';
import React, { useState } from 'react';
import { classifyError } from '@/lib/error-classification';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EnhancedErrorStateProps {
  error?: Error | unknown;
  context?: string;
  onRetry?: () => void | Promise<void>;
  onReport?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function EnhancedErrorState({
  error,
  context = 'operation',
  onRetry,
  onReport,
  showDetails: forceShowDetails = false,
  className = '',
}: EnhancedErrorStateProps) {
  const [showDetails, setShowDetails] = useState(forceShowDetails);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();

  if (!error) {
    return (
      <div
        className={`bg-gray-900/20 border border-gray-500 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">❓</span>
          <div>
            <h3 className="text-gray-400 font-semibold mb-1">
              No Error Information
            </h3>
            <p className="text-gray-300 text-sm">No error details available.</p>
          </div>
        </div>
      </div>
    );
  }

  const classification = classifyError(error);
  const colorClass = getErrorColorClass(classification.category);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRecoveryAction = async (action: {
    action: string;
    handler?: () => void;
    target?: string;
  }) => {
    try {
      switch (action.action) {
        case 'retry':
          if (action.handler) {
            await action.handler();
          } else {
            await handleRetry();
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
            'mailto:support@example.com?subject=Error Report',
            '_blank'
          );
          break;
        case 'custom':
          if (action.handler) {
            await action.handler();
          }
          break;
      }
    } catch (actionError) {
      console.error('Recovery action failed:', actionError);
    }
  };

  return (
    <div
      className={`${colorClass.bg} border ${colorClass.border} rounded-lg p-4 space-y-3 ${className}`}
    >
      {/* Error Header */}
      <div className="flex items-start gap-3">
        <span
          className="text-lg flex-shrink-0"
          role="img"
          aria-label={`${classification.category} error`}
        >
          {getErrorIcon(classification.category)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={`${colorClass.text} font-semibold mb-1`}>
            {getErrorTitle(classification.category, context)}
          </h3>
          <p className={`${colorClass.textSecondary} text-sm leading-relaxed`}>
            {classification.userMessage}
          </p>
          {classification.severity === 'critical' && (
            <div className="mt-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-mono">
                CRITICAL ERROR
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recovery Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Primary retry action */}
        {classification.canRetry && onRetry && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="sm"
            className="text-xs"
            aria-label={`Retry ${context} operation`}
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}

        {/* Additional recovery actions */}
        {classification.recoveryActions.slice(0, 3).map((action, index) => (
          <Button
            key={index}
            onClick={() => handleRecoveryAction(action)}
            variant="outline"
            size="sm"
            className="text-xs"
            aria-label={`${action.label} for ${context} error`}
          >
            {action.label}
          </Button>
        ))}

        {/* Show more actions if available */}
        {classification.recoveryActions.length > 3 && (
          <Button
            onClick={() => setShowDetails(true)}
            variant="ghost"
            size="sm"
            className={`text-xs ${colorClass.textSecondary} hover:${colorClass.text}`}
            aria-label="Show more recovery options"
          >
            +{classification.recoveryActions.length - 3} more
          </Button>
        )}

        {/* Report error button */}
        {onReport && (
          <Button
            onClick={onReport}
            variant="ghost"
            size="sm"
            className={`text-xs ${colorClass.textSecondary} hover:${colorClass.text}`}
            aria-label="Report this error to support"
          >
            Report Issue
          </Button>
        )}
      </div>

      {/* Details Section */}
      {classification.showDetails && (
        <div className="space-y-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className={`${colorClass.textSecondary} text-xs p-0 h-auto hover:${colorClass.text}`}
            aria-expanded={showDetails}
            aria-controls="error-details"
            aria-label={
              showDetails
                ? 'Hide technical error details'
                : 'Show technical error details'
            }
          >
            {showDetails ? '▼ Hide Details' : '▶ Show Details'}
          </Button>

          {showDetails && (
            <div id="error-details" className="space-y-3">
              {/* Technical Details */}
              <div
                className={`${colorClass.bg} border ${colorClass.border} rounded p-3 text-xs font-mono space-y-2`}
                role="region"
                aria-label="Technical error details"
              >
                {context && (
                  <div className="flex">
                    <span
                      className={`${colorClass.text} font-semibold min-w-[60px]`}
                    >
                      Context:
                    </span>
                    <span className={`${colorClass.textSecondary} ml-2`}>
                      {context}
                    </span>
                  </div>
                )}
                {classification.technicalMessage && (
                  <div className="flex">
                    <span
                      className={`${colorClass.text} font-semibold min-w-[60px]`}
                    >
                      Error:
                    </span>
                    <span
                      className={`${colorClass.textSecondary} ml-2 break-all`}
                    >
                      {classification.technicalMessage}
                    </span>
                  </div>
                )}
                <div className="flex">
                  <span
                    className={`${colorClass.text} font-semibold min-w-[60px]`}
                  >
                    Type:
                  </span>
                  <span className={`${colorClass.textSecondary} ml-2`}>
                    {classification.category}
                  </span>
                </div>
                <div className="flex">
                  <span
                    className={`${colorClass.text} font-semibold min-w-[60px]`}
                  >
                    Severity:
                  </span>
                  <span
                    className={`${colorClass.textSecondary} ml-2 capitalize`}
                  >
                    {classification.severity}
                  </span>
                </div>
              </div>

              {/* Enhanced Help Text */}
              <div
                className={`${colorClass.textSecondary} text-xs leading-relaxed space-y-2`}
                role="region"
                aria-label="Troubleshooting guidance"
              >
                <div>
                  <strong className={`${colorClass.text} block mb-1`}>
                    Troubleshooting:
                  </strong>
                  {getHelpText(classification.category)}
                </div>

                {/* Additional context-aware suggestions */}
                {getContextualSuggestions(classification.category, context).map(
                  (suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span
                        className={`${colorClass.text} mt-0.5 flex-shrink-0`}
                      >
                        •
                      </span>
                      <span>{suggestion}</span>
                    </div>
                  )
                )}

                {/* When to contact support */}
                {classification.severity === 'high' ||
                  (classification.severity === 'critical' && (
                    <div className="pt-2 border-t border-current/20">
                      <strong className={`${colorClass.text} block mb-1`}>
                        Need help?
                      </strong>
                      Contact support if this error persists or if you need
                      immediate assistance.
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        {classification.category} error in {context}:{' '}
        {classification.userMessage}
        {classification.canRetry && ' You can retry this operation.'}
      </div>
    </div>
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

function getErrorTitle(category: string, context: string): string {
  switch (category) {
    case 'network':
      return `Connection Issue`;
    case 'validation':
      return `Input Validation Error`;
    case 'authorization':
      return `Access Denied`;
    case 'authentication':
      return `Authentication Required`;
    case 'notFound':
      return `Resource Not Found`;
    case 'rateLimit':
      return `Rate Limit Exceeded`;
    case 'business':
      return `Operation Failed`;
    case 'system':
      return `System Error`;
    default:
      return `Error in ${context}`;
  }
}

function getHelpText(category: string): string {
  switch (category) {
    case 'network':
      return "This usually happens when there's a problem with your internet connection or our servers are temporarily unavailable.";
    case 'validation':
      return 'Please check your input and ensure all required fields are filled out correctly.';
    case 'authorization':
      return "You don't have permission to perform this action. Contact your administrator if you believe this is incorrect.";
    case 'authentication':
      return 'Your session may have expired. Please sign in again to continue.';
    case 'notFound':
      return 'The requested resource could not be found. It may have been moved or deleted.';
    case 'rateLimit':
      return "You've made too many requests in a short time. Please wait a moment before trying again.";
    case 'business':
      return "This operation couldn't be completed due to business rules or current system state.";
    case 'system':
      return 'An unexpected system error occurred. Our team has been notified and is working on a fix.';
    default:
      return 'If this problem persists, please contact support for assistance.';
  }
}

function getContextualSuggestions(category: string, context: string): string[] {
  const baseContext = context.toLowerCase();

  switch (category) {
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        baseContext.includes('mission') || baseContext.includes('quest')
          ? 'Your data is automatically saved and will sync when connection is restored'
          : 'Any unsaved changes may be lost',
      ];
    case 'validation':
      if (baseContext.includes('form') || baseContext.includes('input')) {
        return [
          'Check for required fields marked with *',
          'Ensure email addresses are properly formatted',
          'Verify date formats match the expected pattern',
        ];
      }
      return [
        'Review all input fields for errors',
        'Make sure required information is provided',
      ];
    case 'authorization':
      return [
        baseContext.includes('mission')
          ? 'You may not have access to this mission'
          : 'Check your account permissions',
        'Try signing out and back in',
        'Contact your administrator if access is needed',
      ];
    case 'authentication':
      return [
        'Click "Sign In" to log back in',
        'Check if your account is active',
        'Clear browser cookies if issues persist',
      ];
    case 'notFound':
      if (baseContext.includes('mission')) {
        return [
          'The mission may have been archived or deleted',
          'Check the Archive section for moved missions',
          'Verify you have the correct mission ID',
        ];
      }
      if (baseContext.includes('quest')) {
        return [
          'The quest may have been completed or removed',
          'Check if the quest was moved to another mission',
          'Try searching for the quest by name',
        ];
      }
      return [
        'The item may have been moved or deleted',
        'Try navigating back and refreshing',
        'Use the search function to locate the item',
      ];
    case 'rateLimit':
      return [
        'Wait 30-60 seconds before trying again',
        'Reduce the frequency of your requests',
        'Consider batching multiple operations together',
      ];
    case 'business':
      if (baseContext.includes('mission')) {
        return [
          'Check if the mission is in the correct state',
          'Ensure all prerequisites are met',
          'Verify mission deadlines and constraints',
        ];
      }
      return [
        'Check if prerequisites are satisfied',
        'Verify the operation is allowed in current state',
        'Review any business rules or constraints',
      ];
    case 'system':
      return [
        'Try the operation again in a few minutes',
        'Check system status if available',
        'Save any important work before retrying',
      ];
    default:
      return [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the issue continues',
      ];
  }
}

function getErrorColorClass(category: string) {
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
