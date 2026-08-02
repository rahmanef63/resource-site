"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { DatePreset, CalendarMode } from '../types';
import type { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  presets: DatePreset[];
  selected?: Date | Date[] | DateRange;
  onSelect?: (date: Date | Date[] | DateRange | undefined) => void;
  mode: CalendarMode;
}

export function CalendarHeader({ presets, selected, onSelect, mode }: CalendarHeaderProps) {
  const handlePresetClick = (preset: DatePreset) => {
    if (typeof preset.value === 'number') {
      // Days offset from today
      const newDate = addDays(new Date(), preset.value);
      if (mode === 'single') {
        onSelect?.(newDate);
      } else if (mode === 'range') {
        onSelect?.({ from: newDate, to: newDate } as DateRange);
      }
    } else if (preset.value instanceof Date) {
      onSelect?.(preset.value);
    } else {
      // DateRange
      onSelect?.(preset.value as DateRange);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 border-b px-4 py-3">
      {presets.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={cn(
            'flex-1 min-w-[100px]',
            preset.shortcut && 'relative'
          )}
          onClick={() => handlePresetClick(preset)}
        >
          {preset.label}
          {preset.shortcut && (
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              {preset.shortcut}
            </kbd>
          )}
        </Button>
      ))}
    </div>
  );
}

CalendarHeader.displayName = 'CalendarHeader';
