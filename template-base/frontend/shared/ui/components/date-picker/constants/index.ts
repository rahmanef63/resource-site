import type { DatePreset, CalendarTheme } from '../types';
import { addDays } from 'date-fns';

/**
 * Default Date Presets
 */
export const DEFAULT_DATE_PRESETS: DatePreset[] = [
  { label: 'Today', value: 0, shortcut: 'T' },
  { label: 'Tomorrow', value: 1, shortcut: 'M' },
  { label: 'In 3 days', value: 3 },
  { label: 'In a week', value: 7, shortcut: 'W' },
  { label: 'In 2 weeks', value: 14 },
  { label: 'In a month', value: 30 },
];

/**
 * Default Time Slots (9 AM - 5 PM, 15 min intervals)
 */
export const DEFAULT_TIME_SLOTS = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour = Math.floor(totalMinutes / 60) + 9;
  const minute = totalMinutes % 60;
  return {
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    available: true,
  };
});

/**
 * Weekend Time Slots (reduced hours)
 */
export const WEEKEND_TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour = Math.floor(totalMinutes / 60) + 10;
  const minute = totalMinutes % 60;
  return {
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    available: true,
  };
});

/**
 * Default Theme
 */
export const DEFAULT_THEME: CalendarTheme = {
  variant: 'bordered',
  size: 'md',
  colorScheme: 'default',
};

/**
 * Cell Size Map
 */
export const CELL_SIZE_MAP = {
  sm: '--spacing(8)',
  md: '--spacing(10)',
  lg: '--spacing(12)',
  xl: '--spacing(14)',
} as const;

/**
 * Common Date Formats
 */
export const DATE_FORMATS = {
  short: { day: 'numeric', month: 'short' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  weekday: { weekday: 'short' },
  monthYear: { month: 'long', year: 'numeric' },
} as const;

/**
 * Timezone Options
 */
export const TIMEZONES = [
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
] as const;
