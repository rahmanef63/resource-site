/**
 * Calendar Component Library
 * 
 * A comprehensive, reusable calendar system for database views, documents,
 * timeline features, hospitality, payroll, and more.
 * 
 * @module Calendar
 */

export { Calendar } from './components/Calendar';
export { CalendarHeader } from './components/CalendarHeader';
export { CalendarFooter } from './components/CalendarFooter';
export { TimeSlotPicker } from './components/TimeSlotPicker';
export { EventList } from './components/EventList';
export { DatePicker } from './lib/DatePicker';

// Hooks
export {
  useCalendar,
  useTimeSlots,
  useCalendarEvents,
  useDateRange,
  useCalendarShortcuts,
} from './hooks';

// Utils
export {
  formatDateRange,
  getEventsForDate,
  hasEvents,
  getBadgeForDate,
  isWeekend,
  getPresetDates,
  formatTimeTo12Hour,
  formatTimeTo24Hour,
  generateTimeSlots,
  isDateInRange,
  calculateDuration,
  parseDateSafe,
} from './utils';

// Constants
export {
  DEFAULT_DATE_PRESETS,
  DEFAULT_TIME_SLOTS,
  WEEKEND_TIME_SLOTS,
  DEFAULT_THEME,
  CELL_SIZE_MAP,
  DATE_FORMATS,
  TIMEZONES,
} from './constants';

// Config
export {
  defaultCalendarConfig,
  databaseDatePickerConfig,
  hospitalityBookingConfig,
  payrollPeriodConfig,
  timelineViewConfig,
  meetingSchedulerConfig,
  getCalendarConfig,
} from './config';

// Types
export type {
  CalendarMode,
  CalendarView,
  TimeSlot,
  CalendarEvent,
  DatePreset,
  CalendarTheme,
  DateBadge,
  CalendarConfig,
  CalendarProps,
  CalendarContextValue,
} from './types';
