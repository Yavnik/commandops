/**
 * Utility functions for time formatting and conversion
 */

/**
 * Convert minutes to a human-readable time format
 * @param minutes - Time in minutes
 * @returns Formatted time string (e.g., "1d 2h 30m", "2h 15m", "45m")
 */

// TODO: Use this function in all places where time is shown.
export function formatTime(minutes: number): string {
  if (minutes < 1) return '0m';

  const days = Math.floor(minutes / (24 * 60));
  const remainingMinutes = minutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins}m`);
  }

  return parts.join(' ');
}

/**
 * Convert minutes to time units object
 * @param minutes - Time in minutes
 * @returns Object with days, hours, and minutes
 */
export function convertMinutesToTimeUnits(minutes: number): {
  days: number;
  hours: number;
  minutes: number;
} {
  const days = Math.floor(minutes / (24 * 60));
  const remainingMinutes = minutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  return { days, hours, minutes: mins };
}

/**
 * Convert time units to total minutes
 * @param days - Number of days
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns Total minutes
 */
export function convertTimeUnitsToMinutes(
  days: number,
  hours: number,
  minutes: number
): number {
  return days * 24 * 60 + hours * 60 + minutes;
}

/**
 * Format duration for display, handling null values
 * @param minutes - Time in minutes (can be null)
 * @returns Formatted time string or fallback
 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) {
    return 'Not set';
  }
  return formatTime(minutes);
}
