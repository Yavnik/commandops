import { classifyError, ErrorCategory } from './error-classification';
import {
  showToast,
  showErrorToast as baseShowErrorToast,
} from './toast-helper';

export interface ToastAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface EnhancedToastOptions {
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  errorType?: ErrorCategory;
  canRetry?: boolean;
  onRetry?: () => void | Promise<void>;
  context?: string;
}

// Enhanced error toast that automatically classifies errors and provides appropriate actions
export function showEnhancedErrorToast(
  error: unknown,
  options: EnhancedToastOptions = {}
) {
  const classification = classifyError(error);
  const {
    duration = classification.severity === 'critical' ? 0 : 5000, // Critical errors persist
    persistent = classification.severity === 'critical',
    context,
    onRetry,
  } = options;

  // Build actions based on error classification
  const actions: ToastAction[] = [];

  // Add retry action if the error can be retried
  if (classification.canRetry && onRetry) {
    actions.push({
      label: 'Retry',
      action: onRetry,
      variant: 'default',
    });
  }

  // Add specific recovery actions based on error type
  classification.recoveryActions.forEach(recoveryAction => {
    if (recoveryAction.action === 'retry' && onRetry) {
      // Already handled above
      return;
    }

    if (recoveryAction.action === 'refresh') {
      actions.push({
        label: recoveryAction.label,
        action: () => window.location.reload(),
        variant: 'outline',
      });
    }

    if (recoveryAction.action === 'navigate' && recoveryAction.target) {
      actions.push({
        label: recoveryAction.label,
        action: () => {
          if (recoveryAction.target === '-1') {
            window.history.back();
          } else if (recoveryAction.target) {
            window.location.href = recoveryAction.target;
          }
        },
        variant: 'outline',
      });
    }

    if (recoveryAction.action === 'contact') {
      actions.push({
        label: recoveryAction.label,
        action: () => {
          window.open(
            'mailto:support@example.com?subject=Error Report',
            '_blank'
          );
        },
        variant: 'outline',
      });
    }

    if (recoveryAction.handler) {
      actions.push({
        label: recoveryAction.label,
        action: recoveryAction.handler,
        variant: 'outline',
      });
    }
  });

  // Add custom actions from options
  if (options.actions) {
    actions.push(...options.actions);
  }

  const message = buildErrorMessage(classification, context);

  // Use enhanced toast if we have actions, otherwise fallback to basic toast
  if (actions.length > 0) {
    showActionToast(message, 'error', {
      duration,
      persistent,
      actions,
      errorType: classification.category,
    });
  } else {
    baseShowErrorToast(message, duration);
  }
}

// Enhanced success toast with optional actions
export function showEnhancedSuccessToast(
  message: string,
  options: Omit<EnhancedToastOptions, 'errorType' | 'canRetry' | 'onRetry'> = {}
) {
  const { duration = 3000, actions = [] } = options;

  if (actions.length > 0) {
    showActionToast(message, 'success', {
      duration,
      actions,
    });
  } else {
    showToast(message, 'success', duration);
  }
}

// Enhanced info toast with optional actions
export function showEnhancedInfoToast(
  message: string,
  options: Omit<EnhancedToastOptions, 'errorType' | 'canRetry' | 'onRetry'> = {}
) {
  const { duration = 4000, actions = [] } = options;

  if (actions.length > 0) {
    showActionToast(message, 'info', {
      duration,
      actions,
    });
  } else {
    showToast(message, 'info', duration);
  }
}

// Warning toast for validation and business logic errors
export function showWarningToast(
  message: string,
  options: Omit<EnhancedToastOptions, 'errorType' | 'canRetry' | 'onRetry'> = {}
) {
  const { duration = 4000, actions = [] } = options;

  if (actions.length > 0) {
    showActionToast(message, 'warning', {
      duration,
      actions,
    });
  } else {
    // Fallback to error toast for warning (existing toast system doesn't have warning)
    showToast(message, 'error', duration);
  }
}

// Internal function to show toast with actions
function showActionToast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  options: {
    duration?: number;
    persistent?: boolean;
    actions?: ToastAction[];
    errorType?: ErrorCategory;
  }
) {
  // For now, we'll enhance the message with action hints and use the basic toast
  // This will be fully implemented when we enhance the toast UI component

  let enhancedMessage = message;

  if (options.actions && options.actions.length > 0) {
    const actionLabels = options.actions.map(action => action.label).join(', ');
    enhancedMessage = `${message} (Actions: ${actionLabels})`;
  }

  // Add error type context
  if (options.errorType) {
    enhancedMessage = `[${options.errorType.toUpperCase()}] ${enhancedMessage}`;
  }

  const toastType = type === 'warning' ? 'error' : type;
  const duration = options.persistent ? 0 : options.duration || 3000;

  showToast(enhancedMessage, toastType, duration);
}

// Helper function to build contextual error messages
function buildErrorMessage(
  classification: ReturnType<typeof classifyError>,
  context?: string
): string {
  let message = classification.userMessage;

  if (context) {
    message = `${context}: ${message}`;
  }

  // Add severity indicator for critical errors
  if (classification.severity === 'critical') {
    message = `🚨 CRITICAL: ${message}`;
  }

  return message;
}

// Convenience functions for common error scenarios
export function showNetworkErrorToast(onRetry?: () => void) {
  showEnhancedErrorToast(new TypeError('fetch failed'), {
    context: 'Network',
    onRetry,
  });
}

export function showValidationErrorToast(message: string, onFix?: () => void) {
  showWarningToast(message, {
    context: 'Validation',
    actions: onFix ? [{ label: 'Fix', action: onFix }] : [],
  });
}

export function showAuthErrorToast() {
  showEnhancedErrorToast(new Error('Authentication required'), {
    context: 'Authentication',
  });
}

export function showOperationSuccessToast(
  operation: string,
  onUndo?: () => void
) {
  showEnhancedSuccessToast(`${operation} completed successfully`, {
    actions: onUndo
      ? [{ label: 'Undo', action: onUndo, variant: 'outline' }]
      : [],
  });
}

// Export enhanced versions as default error toast functions
export const showErrorToast = showEnhancedErrorToast;
export const showSuccessToast = showEnhancedSuccessToast;
export const showInfoToast = showEnhancedInfoToast;
