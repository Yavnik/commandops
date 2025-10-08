'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onDateChange?: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
  locale?: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface PresetDateRange {
  from: Date;
  to: Date;
}

interface Preset {
  name: string;
  label: string;
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(part => parseInt(part, 10));
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date;
  } else {
    return dateInput;
  }
};

// Define presets
const PRESETS: Preset[] = [
  { name: 'today', label: 'Today' },
  { name: 'yesterday', label: 'Yesterday' },
  { name: 'last7', label: 'Last 7 days' },
  { name: 'last14', label: 'Last 14 days' },
  { name: 'last30', label: 'Last 30 days' },
  { name: 'thisWeek', label: 'This Week' },
  { name: 'lastWeek', label: 'Last Week' },
  { name: 'thisMonth', label: 'This Month' },
  { name: 'lastMonth', label: 'Last Month' },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateChange,
  className,
  align = 'end',
  locale = 'en-US',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const range = useMemo<DateRange>(
    () => ({
      from: startDate ? getDateAdjustedForTimezone(startDate) : undefined,
      to: endDate ? getDateAdjustedForTimezone(endDate) : undefined,
    }),
    [startDate, endDate]
  );

  const [tempRange, setTempRange] = useState<DateRange>(range);

  useEffect(() => {
    setTempRange(range);
  }, [range]);

  const openedRangeRef = useRef<DateRange | undefined>(undefined);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(
    undefined
  );

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getPresetRange = (presetName: string): PresetDateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName);
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`);
    const from = new Date();
    const to = new Date();
    const first = from.getDate() - from.getDay();

    switch (preset.name) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last14':
        from.setDate(from.getDate() - 13);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last30':
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        from.setDate(first);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay());
        to.setDate(to.getDate() - to.getDay() - 1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0);
        to.setHours(23, 59, 59, 999);
        break;
    }

    return { from, to };
  };

  const setPreset = (preset: string): void => {
    const newRange = getPresetRange(preset);
    setTempRange(newRange);
  };

  const checkPreset = useCallback((): void => {
    if (!range.from) {
      setSelectedPreset(undefined);
      return;
    }

    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name);

      const normalizedRangeFrom = new Date(range.from);
      normalizedRangeFrom.setHours(0, 0, 0, 0);
      const normalizedPresetFrom = new Date(presetRange.from);
      normalizedPresetFrom.setHours(0, 0, 0, 0);

      const normalizedRangeTo = range.to ? new Date(range.to) : undefined;
      normalizedRangeTo?.setHours(0, 0, 0, 0);
      const normalizedPresetTo = presetRange.to
        ? new Date(presetRange.to)
        : undefined;
      normalizedPresetTo?.setHours(0, 0, 0, 0);

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo?.getTime() === normalizedPresetTo?.getTime()
      ) {
        setSelectedPreset(preset.name);
        return;
      }
    }

    setSelectedPreset(undefined);
  }, [range]);

  useEffect(() => {
    checkPreset();
  }, [checkPreset]);

  const PresetButton = ({
    preset,
    label,
    isSelected,
  }: {
    preset: string;
    label: string;
    isSelected: boolean;
  }): React.ReactElement => (
    <Button
      className={cn(isSelected && 'pointer-events-none')}
      variant="ghost"
      onClick={() => {
        setPreset(preset);
      }}
    >
      <>
        <span className={cn('pr-2 opacity-0', isSelected && 'opacity-70')}>
          <CheckIcon className="w-4 h-4" />
        </span>
        {label}
      </>
    </Button>
  );

  useEffect(() => {
    if (isOpen) {
      openedRangeRef.current = range;
    }
  }, [isOpen, range]);

  const formatDateRange = () => {
    if (!range.from) {
      return 'Date Range';
    }

    // If only one date or start date equals end date (compare dates only, not times)
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
      return formatDate(range.from, locale);
    }

    // If range, format based on same month/year
    const fromYear = range.from.getFullYear();
    const toYear = range.to.getFullYear();
    const fromMonth = range.from.getMonth();
    const toMonth = range.to.getMonth();

    if (fromYear === toYear && fromMonth === toMonth) {
      // Same month: "July 10 - 20, 2025"
      return `${range.from.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
      })} - ${range.to.getDate()}, ${fromYear}`;
    } else if (fromYear === toYear) {
      // Same year: "July 20 - Aug 15, 2025"
      return `${range.from.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      })} - ${range.to.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      })}, ${fromYear}`;
    } else {
      // Different years: "July 20 2025 - April 10 2026"
      return `${range.from.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} - ${range.to.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
  };

  return (
    <>
      <Popover
        modal={true}
        open={isOpen}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              // Match Input/SelectTrigger styling exactly
              'flex min-h-[44px] w-full items-center justify-between border px-3 py-2 text-sm ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-accent-text focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
              'justify-start text-left font-normal',
              'min-w-[160px] max-w-[260px] w-auto', // Responsive width classes
              !range.from && !range.to && 'text-muted-foreground',
              className // This will override with h-9 when passed from quest-filters
            )}
            style={{
              borderColor: 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-input-text)',
              borderRadius: 'var(--border-radius-md, 0.375rem)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor =
                'var(--color-input-border-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-input-border)';
            }}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{formatDateRange()}</span>
            </div>
            <div className="ml-2 shrink-0">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4 opacity-50" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              )}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className="w-auto p-0"
          style={{
            backgroundColor: 'var(--color-dialog-bg)',
            border: '1px solid var(--color-dialog-border)',
            boxShadow: 'var(--color-dialog-shadow)',
            borderRadius: '0.75rem',
          }}
        >
          <div className="flex p-4">
            <div className="flex">
              <div className="flex flex-col">
                {isSmallScreen && (
                  <Select
                    defaultValue={selectedPreset}
                    onValueChange={value => {
                      setPreset(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px] mx-auto mb-2">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESETS.map(preset => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div>
                  <Calendar
                    mode="range"
                    onSelect={(
                      value: { from?: Date; to?: Date } | undefined
                    ) => {
                      if (value?.from != null) {
                        setTempRange({ from: value.from, to: value?.to });
                      }
                    }}
                    selected={tempRange}
                    numberOfMonths={isSmallScreen ? 1 : 2}
                    defaultMonth={
                      new Date(
                        new Date().setMonth(
                          new Date().getMonth() - (isSmallScreen ? 0 : 1)
                        )
                      )
                    }
                    style={{
                      backgroundColor: 'var(--color-dialog-bg)',
                      borderRadius: '0.75rem',
                    }}
                    classNames={{
                      range_start: 'border-2 rounded-md',
                      range_end: 'border-2 rounded-md',
                    }}
                    styles={{
                      range_start: { borderColor: 'var(--color-text)' },
                      range_end: { borderColor: 'var(--color-text)' },
                    }}
                  />
                </div>
              </div>
            </div>
            {!isSmallScreen && (
              <div className="flex flex-col items-end gap-1 pr-2 pl-6 pb-6">
                <div className="flex w-full flex-col items-end gap-1 pr-2 pl-6 pb-6">
                  {PRESETS.map(preset => (
                    <PresetButton
                      key={preset.name}
                      preset={preset.name}
                      label={preset.label}
                      isSelected={selectedPreset === preset.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 py-2 pr-4">
            <Button
              onClick={() => {
                setTempRange(range);
                setIsOpen(false);
              }}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDateChange?.(tempRange.from, tempRange.to);
                setIsOpen(false);
              }}
            >
              Update
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
