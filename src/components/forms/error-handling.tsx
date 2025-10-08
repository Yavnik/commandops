'use client';
import React from 'react';
import { classifyError } from '@/lib/error-classification';

// Simple Alert components
function Alert({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${className}`} role="alert">
      {children}
    </div>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

interface FormErrorDisplayProps {
  errors: Record<string, string | string[]>;
  field: string;
  className?: string;
}

export function FormErrorDisplay({
  errors,
  field,
  className = '',
}: FormErrorDisplayProps) {
  const fieldErrors = errors[field];

  if (!fieldErrors) return null;

  const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];

  return (
    <div className={`space-y-1 ${className}`}>
      {errorArray.map((error, index) => (
        <p
          key={index}
          className="text-sm text-red-500 flex items-start gap-2"
          role="alert"
          aria-live="polite"
        >
          <span className="text-red-400 mt-0.5 flex-shrink-0">⚠️</span>
          <span>{error}</span>
        </p>
      ))}
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, string | string[]>;
  title?: string;
  className?: string;
  onFieldFocus?: (fieldName: string) => void;
}

export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  onFieldFocus,
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([, error]) => error);

  if (errorEntries.length === 0) return null;

  const totalErrors = errorEntries.reduce((count, [, error]) => {
    return count + (Array.isArray(error) ? error.length : 1);
  }, 0);

  return (
    <Alert className={`border-red-500 bg-red-900/20 ${className}`}>
      <span className="text-red-400">⚠️</span>
      <AlertDescription>
        <div className="space-y-2">
          <p className="text-red-400 font-semibold">
            {title} ({totalErrors} error{totalErrors !== 1 ? 's' : ''})
          </p>
          <ul className="space-y-1 text-sm text-red-300">
            {errorEntries.map(([field, fieldErrors]) => {
              const errorArray = Array.isArray(fieldErrors)
                ? fieldErrors
                : [fieldErrors];
              return errorArray.map((error, index) => (
                <li
                  key={`${field}-${index}`}
                  className="flex items-start gap-2"
                >
                  <span className="text-red-400 mt-0.5">•</span>
                  <button
                    type="button"
                    onClick={() => onFieldFocus?.(field)}
                    className="text-left hover:text-red-200 hover:underline transition-colors"
                  >
                    <span className="font-medium capitalize">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>{' '}
                    {error}
                  </button>
                </li>
              ));
            })}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface ServerActionErrorProps {
  error: unknown;
  context?: string;
  onRetry?: () => void;
  className?: string;
}

export function ServerActionError({
  error,
  context = 'form submission',
  onRetry,
  className = '',
}: ServerActionErrorProps) {
  if (!error) return null;

  const classification = classifyError(error);

  return (
    <Alert className={`border-red-500 bg-red-900/20 ${className}`}>
      <span className="text-red-400">❌</span>
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="text-red-400 font-semibold mb-1">
              {context.charAt(0).toUpperCase() + context.slice(1)} Failed
            </p>
            <p className="text-red-300 text-sm">{classification.userMessage}</p>
          </div>

          {classification.canRetry && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          )}

          {classification.category === 'validation' && (
            <p className="text-red-300 text-xs">
              💡 Please check your input and ensure all required fields are
              filled correctly.
            </p>
          )}

          {classification.category === 'network' && (
            <p className="text-red-300 text-xs">
              💡 Check your internet connection and try again.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface FieldErrorProps {
  error?: string | string[];
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  const errorArray = Array.isArray(error) ? error : [error];

  return (
    <div className={`space-y-1 ${className}`}>
      {errorArray.map((err, index) => (
        <p
          key={index}
          className="text-sm text-red-500 flex items-start gap-2"
          role="alert"
          aria-live="polite"
        >
          <span className="text-red-400 mt-0.5 flex-shrink-0 text-xs">⚠️</span>
          <span>{err}</span>
        </p>
      ))}
    </div>
  );
}

// Hook for enhanced form error handling
export function useFormErrorHandling() {
  const [errors, setErrors] = React.useState<Record<string, string | string[]>>(
    {}
  );
  const [serverError, setServerError] = React.useState<unknown>(null);

  const setFieldError = (field: string, error: string | string[]) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setServerError(null);
  };

  const hasErrors = Object.keys(errors).length > 0 || serverError !== null;

  const focusField = (fieldName: string) => {
    const field = document.querySelector(
      `[name="${fieldName}"], #${fieldName}`
    ) as HTMLElement;
    if (field) {
      field.focus();
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return {
    errors,
    serverError,
    setFieldError,
    clearFieldError,
    setServerError,
    clearAllErrors,
    hasErrors,
    focusField,
  };
}

// Enhanced input wrapper with error handling
interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | string[];
  label?: string;
  required?: boolean;
  helpText?: string;
}

export function EnhancedInput({
  error,
  label,
  required,
  helpText,
  className = '',
  ...props
}: EnhancedInputProps) {
  const hasError = Boolean(error);
  const inputId = props.id || props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-primary-text)]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-md border bg-[var(--color-secondary)] 
          text-[var(--color-primary-text)] placeholder-[var(--color-secondary-text)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
          transition-colors
          ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-highlight)]'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${inputId}-error`
            : helpText
              ? `${inputId}-help`
              : undefined
        }
      />

      {helpText && !hasError && (
        <p
          id={`${inputId}-help`}
          className="text-xs text-[var(--color-secondary-text)]"
        >
          {helpText}
        </p>
      )}

      {hasError && (
        <div id={`${inputId}-error`}>
          <FieldError error={error} />
        </div>
      )}
    </div>
  );
}

// Enhanced textarea wrapper with error handling
interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | string[];
  label?: string;
  required?: boolean;
  helpText?: string;
}

export function EnhancedTextarea({
  error,
  label,
  required,
  helpText,
  className = '',
  ...props
}: EnhancedTextareaProps) {
  const hasError = Boolean(error);
  const textareaId = props.id || props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--color-primary-text)]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        {...props}
        id={textareaId}
        className={`
          w-full px-3 py-2 rounded-md border bg-[var(--color-secondary)] 
          text-[var(--color-primary-text)] placeholder-[var(--color-secondary-text)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
          transition-colors resize-y
          ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-highlight)]'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${textareaId}-error`
            : helpText
              ? `${textareaId}-help`
              : undefined
        }
      />

      {helpText && !hasError && (
        <p
          id={`${textareaId}-help`}
          className="text-xs text-[var(--color-secondary-text)]"
        >
          {helpText}
        </p>
      )}

      {hasError && (
        <div id={`${textareaId}-error`}>
          <FieldError error={error} />
        </div>
      )}
    </div>
  );
}
