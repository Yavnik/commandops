import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-[44px] w-full border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all placeholder:text-[var(--color-input-placeholder)] mobile-tap-highlight',
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
Input.displayName = 'Input';

export { Input };
