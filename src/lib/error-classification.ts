import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  BusinessLogicError,
  InternalError,
} from './errors';

export type ErrorCategory =
  | 'network'
  | 'validation'
  | 'authorization'
  | 'authentication'
  | 'notFound'
  | 'rateLimit'
  | 'business'
  | 'system'
  | 'unknown';

export interface ErrorClassification {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage?: string;
  recoveryActions: ErrorRecoveryAction[];
  canRetry: boolean;
  showDetails: boolean;
}

export interface ErrorRecoveryAction {
  label: string;
  action: 'retry' | 'refresh' | 'navigate' | 'contact' | 'custom';
  target?: string;
  handler?: () => void;
}

export function classifyError(error: unknown): ErrorClassification {
  // Handle AppError instances with proper classification
  if (error instanceof AppError) {
    return classifyAppError(error);
  }

  // Handle errors that lost their prototype chain (server/client boundary)
  // Check if it looks like a validation error based on message content
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const validationKeywords = [
      'required',
      'invalid',
      'must be',
      'too long',
      'too short',
      'minimum',
      'maximum',
      'email',
      'password',
      'invalid input',
    ];

    if (validationKeywords.some(keyword => message.includes(keyword))) {
      return {
        category: 'validation',
        severity: 'low',
        userMessage: error.message,
        technicalMessage: error.message,
        recoveryActions: [{ label: 'Fix Input', action: 'custom' }],
        canRetry: true,
        showDetails: true,
      };
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      category: 'network',
      severity: 'medium',
      userMessage:
        'Network connection issue. Please check your internet connection.',
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Retry', action: 'retry' },
        { label: 'Refresh Page', action: 'refresh' },
      ],
      canRetry: true,
      showDetails: false,
    };
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    return {
      category: 'system',
      severity: 'medium',
      userMessage: 'Something went wrong. Please try again.',
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Retry', action: 'retry' },
        { label: 'Refresh Page', action: 'refresh' },
      ],
      canRetry: true,
      showDetails: true,
    };
  }

  // Fallback for unknown errors
  return {
    category: 'unknown',
    severity: 'medium',
    userMessage: 'An unexpected error occurred. Please try again.',
    recoveryActions: [
      { label: 'Retry', action: 'retry' },
      { label: 'Refresh Page', action: 'refresh' },
    ],
    canRetry: true,
    showDetails: false,
  };
}

function classifyAppError(error: AppError): ErrorClassification {
  if (error instanceof AuthenticationError) {
    return {
      category: 'authentication',
      severity: 'high',
      userMessage: 'Please sign in to continue.',
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Sign In', action: 'navigate', target: '/signin' },
      ],
      canRetry: false,
      showDetails: false,
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      category: 'authorization',
      severity: 'high',
      userMessage: "Access denied. You don't have permission for this action.",
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Go Back', action: 'navigate', target: '-1' },
        { label: 'Dashboard', action: 'navigate', target: '/dashboard' },
      ],
      canRetry: false,
      showDetails: false,
    };
  }

  if (error instanceof ValidationError) {
    return {
      category: 'validation',
      severity: 'low',
      userMessage: error.getUserMessage(),
      technicalMessage: error.message,
      recoveryActions: [{ label: 'Fix Input', action: 'custom' }],
      canRetry: true,
      showDetails: true,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      category: 'notFound',
      severity: 'medium',
      userMessage: 'The requested resource was not found.',
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Go Back', action: 'navigate', target: '-1' },
        { label: 'Dashboard', action: 'navigate', target: '/dashboard' },
      ],
      canRetry: false,
      showDetails: false,
    };
  }

  if (error instanceof RateLimitError) {
    return {
      category: 'rateLimit',
      severity: 'medium',
      userMessage:
        'Too many requests. Please wait a moment before trying again.',
      technicalMessage: error.message,
      recoveryActions: [{ label: 'Wait and Retry', action: 'retry' }],
      canRetry: true,
      showDetails: false,
    };
  }

  if (error instanceof BusinessLogicError) {
    return {
      category: 'business',
      severity: 'medium',
      userMessage: error.getUserMessage(),
      technicalMessage: error.message,
      recoveryActions: [{ label: 'Try Again', action: 'retry' }],
      canRetry: true,
      showDetails: true,
    };
  }

  if (error instanceof InternalError) {
    return {
      category: 'system',
      severity: 'critical',
      userMessage: 'A system error occurred. Our team has been notified.',
      technicalMessage: error.message,
      recoveryActions: [
        { label: 'Retry', action: 'retry' },
        { label: 'Contact Support', action: 'contact' },
      ],
      canRetry: true,
      showDetails: true,
    };
  }

  // Default AppError handling
  return {
    category: 'system',
    severity: 'medium',
    userMessage: error.getUserMessage(),
    technicalMessage: error.message,
    recoveryActions: [{ label: 'Retry', action: 'retry' }],
    canRetry: true,
    showDetails: true,
  };
}

export function getErrorIcon(category: ErrorCategory): string {
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

export function getErrorColor(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'blue';
    case 'validation':
      return 'yellow';
    case 'authorization':
    case 'authentication':
      return 'red';
    case 'notFound':
      return 'gray';
    case 'rateLimit':
      return 'orange';
    case 'business':
      return 'purple';
    case 'system':
      return 'red';
    default:
      return 'red';
  }
}
