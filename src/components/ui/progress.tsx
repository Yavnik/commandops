import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-3 w-full overflow-hidden border', className)}
    style={{
      backgroundColor: 'var(--color-secondary, rgba(30, 41, 59, 0.5))',
      borderColor: 'var(--color-border, rgba(6, 182, 212, 0.5))',
      borderRadius: 'var(--border-radius-full, 9999px)',
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-300 ease-in-out"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: `linear-gradient(to right, var(--color-glow, rgb(6, 182, 212)), var(--color-accent-text, rgb(6, 182, 212)))`,
        boxShadow: `var(--color-dialog-shadow, 0 0 15px rgba(6, 182, 212, 0.5))`,
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
