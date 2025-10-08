/**
 * Centralized error handling system for the Command Ops application
 * Addresses CV-002 security vulnerability by preventing information disclosure
 */

// Error codes for consistent error identification
export enum ErrorCode {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED = 'AUTH_001',
  ACCESS_DENIED = 'AUTH_002',
  SESSION_EXPIRED = 'AUTH_003',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_001',
  INVALID_INPUT = 'VALIDATION_002',
  MISSING_REQUIRED_FIELD = 'VALIDATION_003',

  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_001',
  RESOURCE_CONFLICT = 'BUSINESS_002',
  OPERATION_NOT_ALLOWED = 'BUSINESS_003',

  // Resource Management
  RESOURCE_NOT_FOUND = 'RESOURCE_001',
  RESOURCE_UNAVAILABLE = 'RESOURCE_002',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  QUOTA_EXCEEDED = 'RATE_002',

  // System
  INTERNAL_ERROR = 'SYSTEM_001',
  DATABASE_ERROR = 'SYSTEM_002',
  EXTERNAL_SERVICE_ERROR = 'SYSTEM_003',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error context for logging and debugging
export interface ErrorContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

// Base application error class
export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly severity: ErrorSeverity;
  abstract readonly userMessage: string;

  readonly timestamp: Date;
  readonly context: ErrorContext;

  constructor(message: string, context: ErrorContext = {}) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
  }

  // Get user-safe message (never expose internal details)
  getUserMessage(): string {
    return this.userMessage;
  }

  // Get detailed error info for logging (server-side only)
  getLogInfo() {
    return {
      code: this.code,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

// Authentication and Authorization Errors
export class AuthenticationError extends AppError {
  readonly code = ErrorCode.AUTHENTICATION_REQUIRED;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'Please sign in to continue';

  constructor(context: ErrorContext = {}) {
    super('Authentication required', context);
  }
}

export class AuthorizationError extends AppError {
  readonly code = ErrorCode.ACCESS_DENIED;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'Access denied';

  constructor(context: ErrorContext = {}) {
    super('Access denied', context);
  }
}

export class SessionExpiredError extends AppError {
  readonly code = ErrorCode.SESSION_EXPIRED;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'Your session has expired. Please sign in again';

  constructor(context: ErrorContext = {}) {
    super('Session expired', context);
  }
}

// Validation Errors
export class ValidationError extends AppError {
  readonly code = ErrorCode.VALIDATION_FAILED;
  readonly severity = ErrorSeverity.LOW;
  readonly userMessage: string;

  constructor(userMessage: string, context: ErrorContext = {}) {
    super(`Validation failed: ${userMessage}`, context);
    this.userMessage = userMessage;
  }
}

export class InvalidInputError extends AppError {
  readonly code = ErrorCode.INVALID_INPUT;
  readonly severity = ErrorSeverity.LOW;
  readonly userMessage: string;

  constructor(
    userMessage: string = 'Invalid input provided',
    context: ErrorContext = {}
  ) {
    super(`Invalid input: ${userMessage}`, context);
    this.userMessage = userMessage;
  }
}

// Business Logic Errors
export class BusinessLogicError extends AppError {
  readonly code = ErrorCode.BUSINESS_RULE_VIOLATION;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage: string;

  constructor(userMessage: string, context: ErrorContext = {}) {
    super(`Business rule violation: ${userMessage}`, context);
    this.userMessage = userMessage;
  }
}

export class ResourceConflictError extends AppError {
  readonly code = ErrorCode.RESOURCE_CONFLICT;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'This operation conflicts with existing data';

  constructor(context: ErrorContext = {}) {
    super('Resource conflict detected', context);
  }
}

// Resource Management Errors
export class NotFoundError extends AppError {
  readonly code = ErrorCode.RESOURCE_NOT_FOUND;
  readonly severity = ErrorSeverity.LOW;
  readonly userMessage = 'Resource not found';

  constructor(context: ErrorContext = {}) {
    super('Resource not found', context);
  }
}

export class ResourceUnavailableError extends AppError {
  readonly code = ErrorCode.RESOURCE_UNAVAILABLE;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'Resource temporarily unavailable';

  constructor(context: ErrorContext = {}) {
    super('Resource unavailable', context);
  }
}

// Rate Limiting Errors
export class RateLimitError extends AppError {
  readonly code = ErrorCode.RATE_LIMIT_EXCEEDED;
  readonly severity = ErrorSeverity.MEDIUM;
  readonly userMessage = 'Too many requests. Please wait and try again';

  constructor(context: ErrorContext = {}) {
    super('Rate limit exceeded', context);
  }
}

// System Errors
export class InternalError extends AppError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly severity = ErrorSeverity.HIGH;
  readonly userMessage = 'Something went wrong. Please try again';

  constructor(originalError?: Error, context: ErrorContext = {}) {
    super(
      originalError
        ? `Internal error: ${originalError.message}`
        : 'Internal error',
      context
    );
  }
}

export class DatabaseError extends AppError {
  readonly code = ErrorCode.DATABASE_ERROR;
  readonly severity = ErrorSeverity.HIGH;
  readonly userMessage = 'Data operation failed. Please try again';

  constructor(originalError?: Error, context: ErrorContext = {}) {
    super(
      originalError
        ? `Database error: ${originalError.message}`
        : 'Database error',
      context
    );
  }
}

// Error logging utility
export function logError(
  error: AppError | Error,
  additionalContext?: Record<string, unknown>
) {
  const logData =
    error instanceof AppError
      ? { ...error.getLogInfo(), ...additionalContext }
      : {
          message: error.message,
          stack: error.stack,
          timestamp: new Date(),
          ...additionalContext,
        };

  // In production, this would send to proper logging service
  console.error('[ERROR]', logData);
}

// Helper to check if error is user-facing
export function isUserFacingError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Helper to get safe error message for client
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.getUserMessage();
  }

  // For any non-AppError, return generic message to prevent information disclosure
  return 'Something went wrong. Please try again';
}

// Error classification for monitoring
export function classifyError(error: unknown): {
  type: 'app_error' | 'system_error' | 'unknown';
  severity: ErrorSeverity;
  code?: ErrorCode;
} {
  if (error instanceof AppError) {
    return {
      type: 'app_error',
      severity: error.severity,
      code: error.code,
    };
  }

  // System errors are high severity by default
  return {
    type: error instanceof Error ? 'system_error' : 'unknown',
    severity: ErrorSeverity.HIGH,
  };
}
