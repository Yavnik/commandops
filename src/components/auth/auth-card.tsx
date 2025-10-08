'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SystemStatusBar } from '../system-status-bar';
import { SystemStatus } from '../system-status';
import { LiveTime } from '../live-time';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  className,
}: AuthCardProps) {
  return (
    <div className="min-h-screen">
      <SystemStatusBar />
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <Card className={cn('auth-card', className)}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
              {subtitle && (
                <p
                  className="text-sm mt-2"
                  style={{ color: 'var(--color-secondary-text)' }}
                >
                  {subtitle}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <SystemStatus size="sm" />
            <span
              className="text-xs"
              style={{ color: 'var(--color-secondary-text)' }}
            >
              •
            </span>
            <LiveTime size="sm" format="compact" />
          </div>
        </div>
      </div>
    </div>
  );
}
