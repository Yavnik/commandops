/**
 * Simple error handling for server actions with PostHog error tracking
 */

import {
  AppError,
  getSafeErrorMessage,
  type ErrorContext,
  ErrorCode,
} from './errors';
import { ZodError } from 'zod';
import { getPostHogServer } from '../../instrumentation';

/**
 * Helper to get error category from error type
 */
function getErrorCategory(error: unknown): string {
  if (error instanceof ZodError) return 'validation';
  if (error instanceof AppError) return 'application';
  if (error instanceof Error) {
    if (error.message.includes('fetch')) return 'network';
    if (
      error.message.includes('database') ||
      error.message.includes('Database')
    )
      return 'database';
    if (error.message.includes('auth') || error.message.includes('Auth'))
      return 'authentication';
  }
  return 'system';
}

/**
 * Helper to get error code from AppError or infer from error type
 */
function getErrorCode(error: unknown): string {
  if (error instanceof AppError) return error.code;
  if (error instanceof ZodError) return ErrorCode.VALIDATION_FAILED;
  return ErrorCode.INTERNAL_ERROR;
}

/**
 * Simple wrapper for server actions
 * Converts validation errors to user-friendly messages and tracks errors with PostHog
 */
export async function safeServerAction<T>(
  operation: () => Promise<T>,
  context?: {
    action?: string;
    resource?: string;
    userId?: string;
    additionalData?: Record<string, unknown>;
  }
): Promise<T> {
  try {
    const result = await operation();

    return result;
  } catch (error) {
    // Track error with PostHog
    const posthog = getPostHogServer();
    if (posthog) {
      try {
        const errorCategory = getErrorCategory(error);
        const errorCode = getErrorCode(error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        const properties = {
          error_category: errorCategory,
          error_code: errorCode,
          error_message: errorMessage,
          action: context?.action || 'unknown_server_action',
          resource: context?.resource,
          user_id: context?.userId,
          is_app_error: error instanceof AppError,
          is_validation_error: error instanceof ZodError,
          severity: error instanceof AppError ? error.severity : 'medium',
          stack_trace: error instanceof Error ? error.stack : undefined,
          ...context?.additionalData,
        };

        // Use capture for error tracking with proper properties
        posthog.capture({
          distinctId: context?.userId || 'anonymous',
          event: '$exception',
          properties: {
            ...properties,
            $exception_message: errorMessage,
            $exception_type: error?.constructor?.name || 'Error',
            $exception_handled: true,
          },
        });
      } catch (trackingError) {
        // Don't let tracking errors break the application
        console.error('Failed to track error with PostHog:', trackingError);
      }
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const userMessage = firstIssue?.message || 'Invalid input';
      throw new Error(userMessage);
    }

    // Handle our custom AppErrors
    if (error instanceof AppError) {
      throw new Error(error.getUserMessage());
    }

    // Handle any other errors
    if (error instanceof Error) {
      throw new Error(getSafeErrorMessage(error));
    }

    // Fallback
    throw new Error('Something went wrong. Please try again.');
  }
}

// Helper to create error context from common server action parameters
export function createErrorContext(
  userId?: string,
  action?: string,
  resource?: string,
  additionalData?: Record<string, unknown>
): ErrorContext {
  return {
    userId,
    action,
    resource,
    metadata: additionalData,
  };
}
