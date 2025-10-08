'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { enUS } from 'date-fns/locale/en-US';

interface LiveTimeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  format?: 'full' | 'time-only' | 'compact' | 'dual';
  showLocal?: boolean;
  layout?: 'horizontal' | 'vertical';
  hideSeconds?: boolean;
}

export function LiveTime({
  className = '',
  size = 'md',
  format: timeFormat = 'full',
  showLocal = false,
  layout = 'horizontal',
  hideSeconds = false,
}: LiveTimeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [localTimezone, setLocalTimezone] = useState<string>('UTC');

  useEffect(() => {
    setMounted(true);

    // Get user's local timezone
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTimezone(timezone);
    } catch {
      console.warn('Unable to detect timezone, falling back to UTC');
      setLocalTimezone('UTC');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getTimezoneAbbr = (timezone: string): string => {
    if (timezone === 'UTC') return 'UTC';

    try {
      const abbreviation = formatInTimeZone(new Date(), timezone, 'zzzz', {
        locale: enUS,
      })
        .split(' ')
        .map(e => e.slice(0, 1))
        .join('');
      return abbreviation;
    } catch {
      return 'Local';
    }
  };

  const formatTime = (time: Date, timezone: string = 'UTC') => {
    const timePattern = hideSeconds ? 'HH:mm' : 'HH:mm:ss';
    const timePatternWithLabel = hideSeconds ? "HH:mm 'UTC'" : "HH:mm:ss 'UTC'";

    if (timezone === 'UTC') {
      // Get actual UTC time
      const utcTime = toZonedTime(time, 'UTC');
      switch (timeFormat) {
        case 'time-only':
          return format(utcTime, timePattern);
        case 'compact':
          return format(utcTime, timePatternWithLabel);
        case 'dual':
          return format(utcTime, timePattern);
        case 'full':
        default:
          return format(utcTime, timePatternWithLabel);
      }
    } else {
      // Format local time using date-fns-tz
      const localTime = toZonedTime(time, timezone);
      switch (timeFormat) {
        case 'dual':
          return format(localTime, timePattern);
        default:
          return format(localTime, timePattern);
      }
    }
  };

  if (!mounted) {
    return (
      <div
        className={`font-mono ${textSizes[size]} ${className}`}
        style={{
          color: 'var(--color-accent-text, rgb(6, 182, 212))',
        }}
      >
        {hideSeconds ? '00:00 UTC' : '00:00:00 UTC'}
      </div>
    );
  }

  // Dual time display with both UTC and local
  if (timeFormat === 'dual' && showLocal) {
    const utcTime = formatTime(currentTime, 'UTC');
    const localTime = formatTime(currentTime, localTimezone);
    const localAbbr = getTimezoneAbbr(localTimezone);

    if (layout === 'vertical') {
      return (
        <div
          className={`font-mono ${textSizes[size]} ${className}`}
          style={{
            color: 'var(--color-accent-text, rgb(6, 182, 212))',
          }}
        >
          <div className="flex flex-col">
            <div>{utcTime} UTC</div>
            <div>
              {localTime} {localAbbr}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          className={`font-mono ${textSizes[size]} ${className}`}
          style={{
            color: 'var(--color-accent-text, rgb(6, 182, 212))',
          }}
        >
          {utcTime} UTC • {localTime} {localAbbr}
        </div>
      );
    }
  }

  // Single time display (existing behavior)
  return (
    <div
      className={`font-mono ${textSizes[size]} ${className}`}
      style={{
        color: 'var(--color-accent-text, rgb(6, 182, 212))',
      }}
    >
      {formatTime(currentTime)}
    </div>
  );
}
