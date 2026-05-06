import { useState, useCallback, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import type { CalendarMode, CalendarEvent } from '../types';

/**
 * Hook for managing calendar state
 */
export function useCalendar(
  mode: CalendarMode = 'single',
  initialValue?: Date | Date[] | DateRange
) {
  const [selected, setSelected] = useState<Date | Date[] | DateRange | undefined>(initialValue);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const handleSelect = useCallback((newValue: Date | Date[] | DateRange | undefined) => {
    setSelected(newValue);
  }, []);
  
  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);
  
  const clear = useCallback(() => {
    setSelected(undefined);
  }, []);
  
  return {
    selected,
    currentMonth,
    handleSelect,
    handleMonthChange,
    setSelected,
    setCurrentMonth,
    clear,
  };
}

/**
 * Hook for time selection
 */
export function useTimeSlots(
  initialTime?: string,
  bookedTimes: string[] = []
) {
  const [selectedTime, setSelectedTime] = useState<string | undefined>(initialTime);
  
  const isTimeBooked = useCallback((time: string) => {
    return bookedTimes.includes(time);
  }, [bookedTimes]);
  
  const isTimeSelected = useCallback((time: string) => {
    return selectedTime === time;
  }, [selectedTime]);
  
  const clearTime = useCallback(() => {
    setSelectedTime(undefined);
  }, []);
  
  return {
    selectedTime,
    setSelectedTime,
    isTimeBooked,
    isTimeSelected,
    clearTime,
  };
}

/**
 * Hook for managing calendar events
 */
export function useCalendarEvents(events: CalendarEvent[] = []) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter((event) => {
      const eventStart = typeof event.from === 'string' ? new Date(event.from) : event.from;
      const eventEnd = typeof event.to === 'string' ? new Date(event.to) : event.to;
      
      return (
        date >= eventStart && date <= eventEnd
      );
    });
  }, [events]);
  
  const hasEventsOnDate = useCallback((date: Date) => {
    return getEventsForDate(date).length > 0;
  }, [getEventsForDate]);
  
  return {
    selectedEvent,
    setSelectedEvent,
    getEventsForDate,
    hasEventsOnDate,
  };
}

/**
 * Hook for date range picker
 */
export function useDateRange(
  initialRange?: DateRange,
  options?: {
    minDays?: number;
    maxDays?: number;
  }
) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  
  const isValidRange = useMemo(() => {
    if (!range?.from || !range?.to) return true;
    
    const diffDays = Math.ceil(
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (options?.minDays && diffDays < options.minDays) return false;
    if (options?.maxDays && diffDays > options.maxDays) return false;
    
    return true;
  }, [range, options]);
  
  const clearRange = useCallback(() => {
    setRange(undefined);
  }, []);
  
  const setFromDate = useCallback((date: Date | undefined) => {
    setRange((prev) => ({ from: date, to: prev?.to }));
  }, []);
  
  const setToDate = useCallback((date: Date | undefined) => {
    setRange((prev) => ({ from: prev?.from, to: date }));
  }, []);
  
  return {
    range,
    setRange,
    isValidRange,
    clearRange,
    setFromDate,
    setToDate,
  };
}

/**
 * Hook for keyboard shortcuts
 */
export function useCalendarShortcuts(callbacks: {
  onToday?: () => void;
  onClear?: () => void;
  onNextMonth?: () => void;
  onPrevMonth?: () => void;
}) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 't':
          event.preventDefault();
          callbacks.onToday?.();
          break;
        case 'k':
          event.preventDefault();
          callbacks.onClear?.();
          break;
      }
    }
    
    if (event.key === 'ArrowRight' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      callbacks.onNextMonth?.();
    }
    
    if (event.key === 'ArrowLeft' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      callbacks.onPrevMonth?.();
    }
  }, [callbacks]);
  
  return { handleKeyPress };
}
