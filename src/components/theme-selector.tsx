'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { posthogCapture } from '@/lib/posthog-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, Moon, Target } from 'lucide-react';

const themes = [
  {
    value: 'default',
    label: 'Default',
    icon: Monitor,
    description: 'Cyan-themed futuristic interface',
  },
  {
    value: 'nightops',
    label: 'Night Ops',
    icon: Moon,
    description: 'Tactical dark operations theme',
  },
  {
    value: 'cscz',
    label: 'CS:CZ',
    icon: Target,
    description: 'Counter-Strike: Condition Zero retro military theme',
  },
];

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current theme data
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className="w-auto h-9 px-3 min-w-32 border animate-pulse"
        style={{
          backgroundColor: 'var(--color-input-bg)',
          borderColor: 'var(--color-input-border)',
          borderRadius: 'var(--border-radius-md, 0.375rem)',
        }}
      />
    );
  }

  const handleThemeChange = (newTheme: string) => {
    const previousTheme = theme;
    posthogCapture('theme_changed', {
      previous_theme: previousTheme,
      new_theme: newTheme,
    });
    setTheme(newTheme);
  };

  return (
    <Select value={theme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-auto h-9 px-3 min-w-20 sm:min-w-32">
        <SelectValue placeholder="Select theme">
          <div className="flex items-center justify-start gap-2">
            <CurrentIcon className="h-4 w-4 hidden sm:block" />
            <span>{currentTheme.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {themes.map(themeOption => {
          const Icon = themeOption.icon;
          return (
            <SelectItem key={themeOption.value} value={themeOption.value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{themeOption.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
