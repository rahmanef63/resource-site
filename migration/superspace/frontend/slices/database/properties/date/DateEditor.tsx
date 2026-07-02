import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { DateCalendar } from './DateCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export const DateEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Convert value to Date
  useEffect(() => {
    if (!value) {
      setSelectedDate(undefined);
      return;
    }
    try {
      const date = new Date(String(value));
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } catch {
      setSelectedDate(undefined);
    }
  }, [value]);

  const handleSelect = (date: Date | Date[] | DateRange | undefined) => {
    if (date instanceof Date) {
      setSelectedDate(date);
      onChange(date.toISOString());
      setOpen(false);
    } else if (!date) {
      setSelectedDate(undefined);
      onChange(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-full justify-start text-left font-normal px-2 text-sm",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
          {selectedDate && (
            <X
              className="ml-auto h-3.5 w-3.5 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DateCalendar
          selected={selectedDate}
          onPick={(d) => handleSelect(d)}
          defaultMonth={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
};
