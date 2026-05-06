import type { DateRange } from 'react-day-picker';

/**
 * Calendar Mode Types
 */
export type CalendarMode = 'single' | 'multiple' | 'range';

/**
 * Calendar View Types
 */
export type CalendarView = 'day' | 'month' | 'year';

/**
 * Time Slot Configuration
 */
export interface TimeSlot {
  time: string;
  available?: boolean;
  booked?: boolean;
  label?: string;
}

/**
 * Event for Calendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  from: Date | string;
  to: Date | string;
  color?: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Date Preset Configuration
 */
export interface DatePreset {
  label: string;
  value: number | Date | DateRange;
  shortcut?: string;
}

/**
 * Calendar Theme Configuration
 */
export interface CalendarTheme {
  variant?: 'default' | 'bordered' | 'shadow' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'default' | 'primary' | 'secondary' | 'accent';
}

/**
 * Price/Badge Configuration for dates
 */
export interface DateBadge {
  date: Date;
  label: string;
  color?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

/**
 * Calendar Configuration
 */
export interface CalendarConfig {
  // Display Options
  showOutsideDays?: boolean;
  showWeekNumber?: boolean;
  showTime?: boolean;
  showTimezone?: boolean;
  fixedWeeks?: boolean;
  numberOfMonths?: number;
  
  // Navigation
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
  disableNavigation?: boolean;
  fromDate?: Date;
  toDate?: Date;
  fromMonth?: Date;
  toMonth?: Date;
  fromYear?: number;
  toYear?: number;
  
  // Features
  enableTimeSlots?: boolean;
  timeSlots?: TimeSlot[];
  enableEvents?: boolean;
  events?: CalendarEvent[];
  enablePresets?: boolean;
  presets?: DatePreset[];
  enableBadges?: boolean;
  badges?: DateBadge[];
  
  // Modifiers
  disabled?: Date[] | ((date: Date) => boolean) | { before?: Date; after?: Date; dayOfWeek?: number[] };
  modifiers?: Record<string, Date[] | ((date: Date) => boolean)>;
  modifiersClassNames?: Record<string, string>;
  modifiersStyles?: Record<string, React.CSSProperties>;
  
  // Theme
  theme?: CalendarTheme;
  className?: string;
  
  // Localization
  locale?: any; // Locale from date-fns
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  // Footer
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  showContinueButton?: boolean;
  continueButtonText?: string;
  onContinue?: (date: Date | Date[] | DateRange | undefined, time?: string) => void;
}

/**
 * Main Calendar Props
 */
export interface CalendarProps extends Omit<CalendarConfig, 'disabled'> {
  mode?: CalendarMode;
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | Date[] | DateRange | undefined) => void;
  defaultMonth?: Date;
  required?: boolean;
  disabled?: boolean | Date[] | ((date: Date) => boolean) | { before?: Date; after?: Date; dayOfWeek?: number[] };
  
  // Callbacks
  onMonthChange?: (month: Date) => void;
  onYearChange?: (year: number) => void;
  onDayClick?: (date: Date, modifiers: Record<string, boolean>) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSelect?: (time: string) => void;
  
  // Advanced
  components?: Record<string, React.ComponentType<any>>;
  formatters?: Record<string, (date: Date) => string>;
}

/**
 * Calendar Context Type
 */
export interface CalendarContextValue {
  mode: CalendarMode;
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | Date[] | DateRange | undefined) => void;
  config: CalendarConfig;
  selectedTime?: string;
  setSelectedTime?: (time: string) => void;
}
