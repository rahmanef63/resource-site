/**
 * DatePicker Component
 * 
 * A simple wrapper around Calendar for date picking in forms and inputs.
 * Provides popover-based date selection with optional time and presets.
 */

"use client";

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '../components/Calendar';
import type { CalendarProps, CalendarMode } from '../types';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DatePickerProps extends Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'> {
  mode?: CalendarMode;
  value?: Date | Date[] | DateRange;
  onChange?: (date: Date | Date[] | DateRange | undefined) => void;
  placeholder?: string;
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

export function DatePicker({
  mode = 'single',
  value,
  onChange,
  placeholder = 'Pick a date',
  triggerClassName,
  align = 'start',
  disabled = false,
  ...calendarProps
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const formatDisplay = () => {
    if (!value) return placeholder;
    
    if (mode === 'single' && value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    
    if (mode === 'range') {
      const range = value as DateRange;
      if (range.from && range.to) {
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
      }
      if (range.from) {
        return range.from.toLocaleDateString();
      }
    }
    
    if (mode === 'multiple' && Array.isArray(value)) {
      return `${value.length} date${value.length !== 1 ? 's' : ''} selected`;
    }
    
    return placeholder;
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            triggerClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode={mode}
          selected={value}
          onSelect={(newValue: Date | Date[] | DateRange | undefined) => {
            onChange?.(newValue);
            if (mode === 'single' && newValue) {
              setOpen(false);
            }
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = 'DatePicker';
