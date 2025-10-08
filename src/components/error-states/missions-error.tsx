'use client';
import { EnhancedErrorState } from './enhanced-error-state';

interface ErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function MissionsError({ error, onRetry }: ErrorProps) {
  return (
    <EnhancedErrorState
      error={error || new Error('Mission data could not be loaded')}
      context="mission loading"
      onRetry={onRetry}
      showDetails={false}
    />
  );
}
