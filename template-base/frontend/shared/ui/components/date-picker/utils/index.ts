import { format, isWithinInterval, isSameDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { CalendarEvent, DateBadge } from '../types';

/**
 * Format date range for display
 */
export function formatDateRange(from: Date, to: Date, formatStr = 'PPP'): string {
  if (isSameDay(from, to)) {
    return format(from, formatStr);
  }
  return `${format(from, formatStr)} - ${format(to, formatStr)}`;
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = typeof event.from === 'string' ? new Date(event.from) : event.from;
    const eventEnd = typeof event.to === 'string' ? new Date(event.to) : event.to;
    
    return isWithinInterval(date, { start: eventStart, end: eventEnd }) ||
           isSameDay(date, eventStart) ||
           isSameDay(date, eventEnd);
  });
}

/**
 * Check if date has events
 */
export function hasEvents(events: CalendarEvent[], date: Date): boolean {
  return getEventsForDate(events, date).length > 0;
}

/**
 * Get badge for a specific date
 */
export function getBadgeForDate(badges: DateBadge[], date: Date): DateBadge | undefined {
  return badges.find((badge) => isSameDay(badge.date, date));
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get date presets with actual dates
 */
export function getPresetDates(baseDate: Date = new Date()) {
  return {
    today: baseDate,
    tomorrow: addDays(baseDate, 1),
    nextWeek: addDays(baseDate, 7),
    thisWeek: { from: startOfWeek(baseDate), to: endOfWeek(baseDate) },
    thisMonth: { from: startOfMonth(baseDate), to: endOfMonth(baseDate) },
  };
}

/**
 * Format time to 12-hour format
 */
export function formatTimeTo12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format time to 24-hour format
 */
export function formatTimeTo24Hour(time: string): string {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time;
  
  let [, hours, minutes, period] = match;
  let hour = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Generate time slots
 */
export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 17,
  interval: number = 15
) {
  const slots = [];
  const totalMinutes = (endHour - startHour) * 60;
  const numberOfSlots = Math.floor(totalMinutes / interval);
  
  for (let i = 0; i <= numberOfSlots; i++) {
    const totalMins = i * interval;
    const hour = Math.floor(totalMins / 60) + startHour;
    const minute = totalMins % 60;
    
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      available: true,
    });
  }
  
  return slots;
}

/**
 * Check if date is in range
 */
export function isDateInRange(date: Date, range?: DateRange): boolean {
  if (!range?.from) return false;
  if (!range.to) return isSameDay(date, range.from);
  
  return isWithinInterval(date, { start: range.from, end: range.to }) ||
         isSameDay(date, range.from) ||
         isSameDay(date, range.to);
}

/**
 * Calculate duration between dates
 */
export function calculateDuration(from: Date, to: Date): string {
  const diff = to.getTime() - from.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Parse date string safely
 */
export function parseDateSafe(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  return date;
}
