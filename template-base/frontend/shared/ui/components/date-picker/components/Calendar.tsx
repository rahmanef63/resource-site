"use client";

import * as React from 'react';
import { Calendar as BaseCalendar } from '@/components/ui/calendar';
import type { CalendarProps } from '../types';
import { DEFAULT_THEME, CELL_SIZE_MAP } from '../constants';
import { cn } from '@/lib/utils';
import { CalendarHeader } from './CalendarHeader';
import { CalendarFooter } from './CalendarFooter';
import { TimeSlotPicker } from './TimeSlotPicker';
import { EventList } from './EventList';

/**
 * Reusable Calendar Component
 * 
 * A comprehensive calendar component that supports:
 * - Single, multiple, and range date selection
 * - Time slot selection
 * - Event display
 * - Date presets
 * - Custom badges and modifiers
 * - Responsive design
 * - Accessibility
 * 
 * @example
 * ```tsx
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   showTime
 *   timeSlots={timeSlots}
 * />
 * ```
 */
export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  defaultMonth,
  required = false,
  disabled = false,
  
  // Display Options
  showOutsideDays = true,
  showWeekNumber = false,
  showTime = false,
  showTimezone = false,
  fixedWeeks = false,
  numberOfMonths = 1,
  
  // Navigation
  captionLayout = 'label',
  disableNavigation = false,
  fromDate,
  toDate,
  fromMonth,
  toMonth,
  fromYear,
  toYear,
  
  // Features
  enableTimeSlots = false,
  timeSlots,
  enableEvents = false,
  events = [],
  enablePresets = false,
  presets,
  enableBadges = false,
  badges,
  
  // Modifiers
  modifiers,
  modifiersClassNames,
  modifiersStyles,
  
  // Theme
  theme,
  className,
  
  // Localization
  locale,
  weekStartsOn = 1,
  
  // Footer
  showFooter = false,
  footerContent,
  showContinueButton = false,
  continueButtonText = 'Continue',
  onContinue,
  
  // Callbacks
  onMonthChange,
  onYearChange,
  onDayClick,
  onEventClick,
  onTimeSelect,
  
  // Advanced
  components,
  formatters,
  ...restProps
}: CalendarProps) {
  const [selectedTime, setSelectedTime] = React.useState<string | undefined>();
  const mergedTheme = { ...DEFAULT_THEME, ...theme };
  const cellSize = CELL_SIZE_MAP[mergedTheme.size || 'md'];
  
  const handleTimeSelect = React.useCallback((time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  }, [onTimeSelect]);
  
  const handleContinue = React.useCallback(() => {
    onContinue?.(selected, selectedTime);
  }, [onContinue, selected, selectedTime]);
  
  const wrapperClassName = cn(
    'calendar-wrapper',
    mergedTheme.variant === 'bordered' && 'rounded-lg border shadow-sm',
    mergedTheme.variant === 'shadow' && 'rounded-lg shadow-lg',
    mergedTheme.variant === 'flat' && 'rounded-lg',
    className
  );
  
  const calendarClassName = cn(
    `[--cell-size:${cellSize}]`,
    enableTimeSlots && 'calendar-with-timeslots',
    enableEvents && 'calendar-with-events'
  );
  
  return (
    <div className={wrapperClassName}>
      {enablePresets && presets && (
        <CalendarHeader
          presets={presets}
          selected={selected}
          onSelect={onSelect}
          mode={mode}
        />
      )}
      
      <div className={cn('calendar-content', enableTimeSlots && 'flex')}>
        <div className="calendar-main flex-1">
          <BaseCalendar
            mode={mode as any}
            selected={selected as any}
            onSelect={onSelect as any}
            defaultMonth={defaultMonth}
            required={required}
            disabled={typeof disabled === 'boolean' ? undefined : disabled as any}
            showOutsideDays={showOutsideDays}
            showWeekNumber={showWeekNumber}
            fixedWeeks={fixedWeeks}
            numberOfMonths={numberOfMonths}
            captionLayout={captionLayout}
            disableNavigation={disableNavigation}
            fromDate={fromDate}
            toDate={toDate}
            fromMonth={fromMonth}
            toMonth={toMonth}
            fromYear={fromYear}
            toYear={toYear}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            modifiersStyles={modifiersStyles}
            locale={locale}
            weekStartsOn={weekStartsOn}
            onMonthChange={onMonthChange}
            onDayClick={onDayClick}
            components={components}
            formatters={formatters}
            className={calendarClassName}
            {...restProps}
          />
        </div>
        
        {enableTimeSlots && timeSlots && (
          <TimeSlotPicker
            timeSlots={timeSlots}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
        )}
      </div>
      
      {enableEvents && events.length > 0 && (
        <EventList
          events={events}
          selectedDate={mode === 'single' ? (selected as Date) : undefined}
          onEventClick={onEventClick}
        />
      )}
      
      {(showFooter || showContinueButton || footerContent) && (
        <CalendarFooter
          selected={selected}
          selectedTime={selectedTime}
          mode={mode}
          showContinueButton={showContinueButton}
          continueButtonText={continueButtonText}
          onContinue={handleContinue}
          footerContent={footerContent}
        />
      )}
    </div>
  );
}

Calendar.displayName = 'Calendar';
