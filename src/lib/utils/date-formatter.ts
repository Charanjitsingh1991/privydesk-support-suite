import { formatDistanceToNow, format, isToday, isYesterday, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

/**
 * Format a date as a relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, dateObj);
  const hoursDiff = differenceInHours(now, dateObj);
  const daysDiff = differenceInDays(now, dateObj);

  if (minutesDiff < 1) {
    return 'just now';
  }

  if (minutesDiff < 60) {
    return `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'} ago`;
  }

  if (hoursDiff < 24) {
    return `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'} ago`;
  }

  if (daysDiff < 7) {
    return `${daysDiff} day${daysDiff === 1 ? '' : 's'} ago`;
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date for display in tickets and messages
 */
export function formatTicketDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }

  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date as a short date string
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a date as an ISO string for API requests
 */
export function formatISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Get the time ago in a compact format (e.g., "5m", "2h", "3d")
 */
export function formatCompactTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, dateObj);
  const hoursDiff = differenceInHours(now, dateObj);
  const daysDiff = differenceInDays(now, dateObj);

  if (minutesDiff < 1) {
    return 'now';
  }

  if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  }

  if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  }

  if (daysDiff < 30) {
    return `${daysDiff}d`;
  }

  return format(dateObj, 'MMM d');
}
