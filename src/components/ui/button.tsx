import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-button-default-bg text-button-default-text border border-button-default-border hover:bg-accent-text/30 hover:shadow-[0_0_15px_var(--color-glow)] active:bg-accent-text/40 active:scale-95 active:brightness-110 md:active:scale-100',
        critical:
          'bg-danger/20 text-danger border border-danger/50 hover:bg-danger/30 hover:shadow-[0_0_15px_var(--color-danger)] active:bg-danger/40 active:scale-95 active:brightness-110 md:active:scale-100',
        success:
          'bg-success/20 text-success border border-success/50 hover:bg-success/30 hover:shadow-[0_0_15px_var(--color-success)] active:bg-success/40 active:scale-95 active:brightness-110 md:active:scale-100',
        warning:
          'bg-warning/20 text-warning border border-warning/50 hover:bg-warning/30 hover:shadow-[0_0_15px_var(--color-warning)] active:bg-warning/40 active:scale-95 active:brightness-110 md:active:scale-100',
        ghost:
          'text-ghost-button-text hover:text-ghost-button-hover hover:bg-accent-text/10 active:bg-accent-text/20 active:scale-95 md:active:scale-100',
        'input-like':
          'bg-input-bg text-input-text border border-input-border hover:border-[var(--color-input-border-hover)]',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        link: 'text-accent-text underline-offset-4 hover:underline hover:text-accent-text/80 active:text-accent-text/60',
      },
      size: {
        default: 'min-h-[44px] px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          borderRadius: 'var(--border-radius-sm, 0.125rem)',
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
