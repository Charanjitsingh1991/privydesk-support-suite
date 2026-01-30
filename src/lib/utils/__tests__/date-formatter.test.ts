import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatTicketDate,
  formatShortDate,
  formatCompactTime,
} from '../date-formatter';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "just now" for times less than a minute ago', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('shows "just now" for times 30 seconds ago', () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
  });

  it('shows "1 minute ago" for exactly 1 minute ago', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('shows minutes ago correctly', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('shows "1 hour ago" for exactly 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
  });

  it('shows hours ago correctly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  it('shows "1 day ago" for exactly 1 day ago', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });

  it('shows days ago correctly', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
  });

  it('uses date-fns for older dates', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoWeeksAgo);
    expect(result).toContain('ago');
  });

  it('handles string dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });
});

describe('formatTicketDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Today at" for today\'s dates', () => {
    const todayMorning = new Date();
    todayMorning.setHours(8, 30, 0, 0);
    expect(formatTicketDate(todayMorning)).toBe('Today at 8:30 AM');
  });

  it('shows "Yesterday" for yesterday dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = formatTicketDate(yesterday);
    expect(result).toContain('Yesterday');
  });

  it('shows full date for older dates', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);
    const result = formatTicketDate(oldDate);
    expect(result).toMatch(/\w+ \d+, \d{4}/); // Match pattern like "Jan 10, 2024"
  });

  it('handles string dates', () => {
    const dateStr = '2024-01-15T10:00:00Z';
    expect(formatTicketDate(dateStr)).toContain('Today');
  });
});

describe('formatShortDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-06-15T00:00:00Z');
    expect(formatShortDate(date)).toBe('Jun 15, 2024');
  });

  it('handles string dates', () => {
    const dateStr = '2024-03-20T00:00:00Z';
    expect(formatShortDate(dateStr)).toBe('Mar 20, 2024');
  });
});

describe('formatCompactTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "now" for times less than a minute ago', () => {
    const now = new Date();
    expect(formatCompactTime(now)).toBe('now');
  });

  it('shows minutes in compact format', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatCompactTime(fiveMinutesAgo)).toBe('5m');
  });

  it('shows hours in compact format', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatCompactTime(threeHoursAgo)).toBe('3h');
  });

  it('shows days in compact format', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatCompactTime(twoDaysAgo)).toBe('2d');
  });

  it('shows month and day for older dates', () => {
    const oldDate = new Date('2023-12-01T12:00:00Z');
    expect(formatCompactTime(oldDate)).toBe('Dec 1');
  });
});
