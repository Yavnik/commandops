'use client';
import { EnhancedErrorState } from './enhanced-error-state';

interface ErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function ArchiveError({ error, onRetry }: ErrorProps) {
  return (
    <EnhancedErrorState
      error={
        error ||
        new Error(
          'Unable to load archive data. Your operational history is safe.'
        )
      }
      context="archive loading"
      onRetry={onRetry}
      showDetails={false}
    />
  );
}
