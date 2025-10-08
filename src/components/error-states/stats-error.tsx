'use client';
import { EnhancedErrorState } from './enhanced-error-state';

interface ErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function StatsError({ error, onRetry }: ErrorProps) {
  return (
    <EnhancedErrorState
      error={
        error || new Error('Performance statistics are temporarily unavailable')
      }
      context="statistics loading"
      onRetry={onRetry}
      showDetails={false}
    />
  );
}
