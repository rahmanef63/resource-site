/**
 * Calendar Configuration
 * 
 * Default settings and configurations for the Calendar component system.
 */

import type { CalendarConfig } from '../types';
import { DEFAULT_DATE_PRESETS, DEFAULT_TIME_SLOTS, DEFAULT_THEME } from '../constants';

/**
 * Default Calendar Configuration
 */
export const defaultCalendarConfig: Partial<CalendarConfig> = {
  // Display
  showOutsideDays: true,
  showWeekNumber: false,
  fixedWeeks: false,
  numberOfMonths: 1,
  
  // Navigation
  captionLayout: 'label',
  disableNavigation: false,
  
  // Localization
  weekStartsOn: 1, // Monday
  
  // Theme
  theme: DEFAULT_THEME,
  
  // Features
  enableTimeSlots: false,
  enableEvents: false,
  enablePresets: false,
  enableBadges: false,
  
  // Footer
  showFooter: false,
  showContinueButton: false,
  continueButtonText: 'Continue',
};

/**
 * Database Field Date Picker Config
 */
export const databaseDatePickerConfig: Partial<CalendarConfig> = {
  ...defaultCalendarConfig,
  theme: {
    variant: 'bordered',
    size: 'sm',
    colorScheme: 'default',
  },
  enablePresets: true,
  presets: DEFAULT_DATE_PRESETS.slice(0, 5), // First 5 presets
};

/**
 * Hospitality Booking Config
 */
export const hospitalityBookingConfig: Partial<CalendarConfig> = {
  ...defaultCalendarConfig,
  theme: {
    variant: 'shadow',
    size: 'lg',
    colorScheme: 'primary',
  },
  enableTimeSlots: true,
  timeSlots: DEFAULT_TIME_SLOTS,
  showFooter: true,
  showContinueButton: true,
  continueButtonText: 'Book Appointment',
};

/**
 * Payroll Period Selector Config
 */
export const payrollPeriodConfig: Partial<CalendarConfig> = {
  ...defaultCalendarConfig,
  theme: {
    variant: 'bordered',
    size: 'md',
    colorScheme: 'default',
  },
  numberOfMonths: 2,
  enablePresets: true,
  presets: [
    { label: 'This Month', value: 0 },
    { label: 'Last Month', value: -30 },
    { label: 'This Quarter', value: 0 },
    { label: 'This Year', value: 0 },
  ],
  showFooter: true,
  showContinueButton: true,
  continueButtonText: 'Generate Report',
};

/**
 * Timeline/Project View Config
 */
export const timelineViewConfig: Partial<CalendarConfig> = {
  ...defaultCalendarConfig,
  theme: {
    variant: 'flat',
    size: 'md',
    colorScheme: 'default',
  },
  enableEvents: true,
  showFooter: true,
};

/**
 * Meeting Scheduler Config
 */
export const meetingSchedulerConfig: Partial<CalendarConfig> = {
  ...defaultCalendarConfig,
  theme: {
    variant: 'bordered',
    size: 'lg',
    colorScheme: 'default',
  },
  enableTimeSlots: true,
  timeSlots: DEFAULT_TIME_SLOTS,
  enablePresets: true,
  presets: DEFAULT_DATE_PRESETS,
  showFooter: true,
  showContinueButton: true,
  continueButtonText: 'Schedule Meeting',
};

/**
 * Get config by use case
 */
export function getCalendarConfig(useCase: 'database' | 'hospitality' | 'payroll' | 'timeline' | 'meeting'): Partial<CalendarConfig> {
  switch (useCase) {
    case 'database':
      return databaseDatePickerConfig;
    case 'hospitality':
      return hospitalityBookingConfig;
    case 'payroll':
      return payrollPeriodConfig;
    case 'timeline':
      return timelineViewConfig;
    case 'meeting':
      return meetingSchedulerConfig;
    default:
      return defaultCalendarConfig;
  }
}
