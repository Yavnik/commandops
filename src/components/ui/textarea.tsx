import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none',
          className
        )}
        style={{
          backgroundColor: 'var(--color-input-bg)',
          borderColor: 'var(--color-input-border)',
          color: 'var(--color-input-text)',
          borderRadius: 'var(--border-radius-md, 0.375rem)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--color-input-border-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--color-input-border)';
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
