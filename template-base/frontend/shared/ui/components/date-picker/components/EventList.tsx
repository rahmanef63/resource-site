"use client";

import * as React from 'react';
import type { CalendarEvent } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getEventsForDate, parseDateSafe, calculateDuration } from '../utils';
import { format } from 'date-fns';

// Simple formatDateRange replacement
function formatEventDateRange(from: Date, to: Date): string {
  const sameDay = from.toDateString() === to.toDateString();
  if (sameDay) {
    return `${format(from, 'h:mm a')} - ${format(to, 'h:mm a')}`;
  }
  return `${format(from, 'MMM d, h:mm a')} - ${format(to, 'MMM d, h:mm a')}`;
}

interface EventListProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function EventList({
  events,
  selectedDate,
  onEventClick,
  className,
}: EventListProps) {
  const displayedEvents = selectedDate 
    ? getEventsForDate(events, selectedDate)
    : events;
  
  if (displayedEvents.length === 0) {
    return (
      <div className={cn(
        'border-t px-4 py-6 text-center text-sm text-muted-foreground',
        className
      )}>
        {selectedDate ? 'No events for this date' : 'No events'}
      </div>
    );
  }
  
  return (
    <div className={cn('border-t px-4 py-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          {selectedDate ? (
            selectedDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          ) : (
            'Upcoming Events'
          )}
        </h4>
        {displayedEvents.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {displayedEvents.length} event{displayedEvents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        {displayedEvents.map((event) => {
          const eventStart = parseDateSafe(event.from);
          const eventEnd = parseDateSafe(event.to);
          const duration = calculateDuration(eventStart, eventEnd);
          
          return (
            <button
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={cn(
                'relative rounded-md p-3 text-left transition-colors',
                'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring',
                'after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full',
                event.color && `after:bg-[${event.color}]`,
                !event.color && 'after:bg-primary/70',
                'pl-6'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {event.icon && (
                      <span className="text-base flex-shrink-0">{event.icon}</span>
                    )}
                    <p className="font-medium text-sm truncate">
                      {event.title}
                    </p>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {duration}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                {formatEventDateRange(eventStart, eventEnd)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

EventList.displayName = 'EventList';
