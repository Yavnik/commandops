'use client';
import { EnhancedErrorState } from './enhanced-error-state';

interface ErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function QuestsError({ error, onRetry }: ErrorProps) {
  return (
    <EnhancedErrorState
      error={
        error || new Error('Unable to load quest board. Your progress is safe.')
      }
      context="quest board loading"
      onRetry={onRetry}
      showDetails={false}
    />
  );
}
