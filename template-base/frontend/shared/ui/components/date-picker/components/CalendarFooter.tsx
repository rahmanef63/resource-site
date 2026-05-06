"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { CalendarMode } from '../types';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface CalendarFooterProps {
  selected?: Date | Date[] | DateRange;
  selectedTime?: string;
  mode: CalendarMode;
  showContinueButton?: boolean;
  continueButtonText?: string;
  onContinue?: () => void;
  footerContent?: React.ReactNode;
}

export function CalendarFooter({
  selected,
  selectedTime,
  mode,
  showContinueButton,
  continueButtonText = 'Continue',
  onContinue,
  footerContent,
}: CalendarFooterProps) {
  const formatSelectedDate = () => {
    if (!selected) return 'No date selected';
    
    if (mode === 'single' && selected instanceof Date) {
      return selected.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    
    if (mode === 'range') {
      const range = selected as DateRange;
      if (range.from && range.to) {
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
      }
      if (range.from) {
        return range.from.toLocaleDateString();
      }
    }
    
    if (mode === 'multiple' && Array.isArray(selected)) {
      return `${selected.length} date${selected.length !== 1 ? 's' : ''} selected`;
    }
    
    return 'Select a date';
  };
  
  const isDisabled = () => {
    if (!selected) return true;
    
    if (mode === 'single') return !selected;
    if (mode === 'range') {
      const range = selected as DateRange;
      return !range.from || !range.to;
    }
    if (mode === 'multiple') return !Array.isArray(selected) || selected.length === 0;
    
    return false;
  };
  
  return (
    <div className="flex flex-col gap-4 border-t px-4 py-3 md:flex-row md:items-center">
      {footerContent || (
        <div className="text-sm flex-1">
          <span className="font-medium">{formatSelectedDate()}</span>
          {selectedTime && (
            <span className="text-muted-foreground ml-2">
              at {selectedTime}
            </span>
          )}
        </div>
      )}
      
      {showContinueButton && (
        <Button
          disabled={isDisabled()}
          onClick={onContinue}
          className={cn('w-full md:w-auto md:ml-auto')}
          variant="default"
        >
          {continueButtonText}
        </Button>
      )}
    </div>
  );
}

CalendarFooter.displayName = 'CalendarFooter';
