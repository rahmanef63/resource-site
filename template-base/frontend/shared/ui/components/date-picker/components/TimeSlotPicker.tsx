"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TimeSlot } from '../types';
import { cn } from '@/lib/utils';
import { formatTimeTo12Hour } from '../utils';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  use12Hour?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  timeSlots,
  selectedTime,
  onTimeSelect,
  use12Hour = false,
  className,
}: TimeSlotPickerProps) {
  return (
    <div className={cn(
      'border-t md:border-t-0 md:border-l w-full md:w-48',
      className
    )}>
      <ScrollArea className="h-72 md:h-full">
        <div className="flex flex-col gap-2 p-4">
          {timeSlots.map((slot) => {
            const displayTime = use12Hour ? formatTimeTo12Hour(slot.time) : slot.time;
            const isSelected = selectedTime === slot.time;
            const isDisabled = slot.available === false || slot.booked;
            
            return (
              <Button
                key={slot.time}
                variant={isSelected ? 'default' : 'outline'}
                disabled={isDisabled}
                onClick={() => onTimeSelect(slot.time)}
                className={cn(
                  'w-full justify-start shadow-none',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  slot.booked && 'line-through'
                )}
              >
                {slot.label || displayTime}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

TimeSlotPicker.displayName = 'TimeSlotPicker';
