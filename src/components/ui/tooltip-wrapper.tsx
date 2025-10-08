'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  disabled?: boolean;
  className?: string;
  delayDuration?: number;
}

/**
 * A simple wrapper around the shadcn tooltip components for easier usage.
 *
 * @param children - The element that triggers the tooltip
 * @param content - The content to display in the tooltip
 * @param side - Which side of the trigger to show the tooltip (default: "top")
 * @param sideOffset - Distance from the trigger in pixels (default: 4)
 * @param disabled - Whether to disable the tooltip completely
 * @param className - Additional classes for the tooltip content
 * @param delayDuration - Delay before showing tooltip in ms (default: 100)
 */
export function TooltipWrapper({
  children,
  content,
  side = 'top',
  sideOffset = 4,
  disabled = false,
  className,
  delayDuration = 100,
}: TooltipWrapperProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className={className}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
